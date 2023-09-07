import { sha512_256 } from "js-sha512"
import { Encoder } from "../encoder.role"
import * as msgpack from "algo-msgpack-with-bigint"
import base32 from "hi-base32"
import { Injectable, Logger } from "@nestjs/common"
import { PayTransaction } from "./algorand.transaction.pay"

const ALGORAND_PUBLIC_KEY_BYTE_LENGTH = 32
const ALGORAND_ADDRESS_BYTE_LENGTH = 36
const ALGORAND_CHECKSUM_BYTE_LENGTH = 4
const ALGORAND_ADDRESS_LENGTH = 58
const HASH_BYTES_LENGTH = 32
export const MALFORMED_ADDRESS_ERROR_MSG = "Malformed address"
export const ALGORAND_ADDRESS_BAD_CHECKSUM_ERROR_MSG = "Bad checksum"

@Injectable()
export class AlgorandEncoder extends Encoder {
	/**
	 * decodeAddress takes an Algorand address in string form and decodes it into a Uint8Array.
	 * @param address - an Algorand address with checksum.
	 * @returns the decoded form of the address's public key and checksum
	 */
	decodeAddress(address: string): Uint8Array {
		if (typeof address !== "string" || address.length !== ALGORAND_ADDRESS_LENGTH) throw new Error(MALFORMED_ADDRESS_ERROR_MSG)

		// try to decode
		const decoded = base32.decode.asBytes(address.toString())

		// Find publickey and checksum
		const pk = new Uint8Array(decoded.slice(0, ALGORAND_ADDRESS_BYTE_LENGTH - ALGORAND_CHECKSUM_BYTE_LENGTH))
		const cs = new Uint8Array(decoded.slice(ALGORAND_PUBLIC_KEY_BYTE_LENGTH, ALGORAND_ADDRESS_BYTE_LENGTH))

		// Compute checksum
		const checksum = sha512_256.array(pk).slice(HASH_BYTES_LENGTH - ALGORAND_CHECKSUM_BYTE_LENGTH, HASH_BYTES_LENGTH)

		// Check if the checksum and the address are equal
		if (checksum.length !== cs.length || !Array.from(checksum).every((val, i) => val === cs[i])) {
			throw new Error(ALGORAND_ADDRESS_BAD_CHECKSUM_ERROR_MSG)
		}

		return pk
	}
	/**
	 *
	 */
	encodeAddress(publicKey: Buffer): string {
		const keyHash: string = sha512_256.create().update(publicKey).hex()

		// last 4 bytes of the hash
		const checksum: string = keyHash.slice(-8)

		return base32.encode(Encoder.ConcatArrays(publicKey, Buffer.from(checksum, "hex"))).slice(0, 58)
	}

	/**
	 * 
	 * @param txn 
	 * @returns 
	 */
	encodeSignedTransaction(txn: object): Uint8Array {
		const encodedTxn: Uint8Array = new Uint8Array(msgpack.encode(txn, { sortKeys: true }))
		return encodedTxn
	}

	/**
	 *
	 * @param txn
	 */
	encodeTransaction(tx: any): Uint8Array {
		// [TAG] [AMT] .... [NOTE] [RCV] [SND] [] [TYPE]
		const encoded: Uint8Array = msgpack.encode(tx, { sortKeys: true })

		// tag
		const TAG: Buffer = Buffer.from("TX")

		// concat tag + encoded
		const encodedTx: Uint8Array = Encoder.ConcatArrays(TAG, encoded)
		Logger.debug(Buffer.from(encodedTx).toString("hex"), "AlgorandEncoder.encodeTransaction, data")

		return encodedTx
	}

	/**
	 *
	 * @param txn
	 * @returns
	 */
	decodeTransaction(encoded: Uint8Array): object | Error {
		const TAG: Buffer = Buffer.from("TX")
		const tagBytes: number = TAG.byteLength

		// remove tag Bytes for the tag and decode the rest
		const decoded: object = msgpack.decode(encoded.slice(tagBytes)) as object
		return decoded as PayTransaction
	}

	/**
	 *
	 * @param txn
	 * @returns
	 */
	decodeSignedTransaction(encoded: Uint8Array): object | Error {
		const decoded: object = msgpack.decode(encoded) as object
		return decoded as object
	}
}
