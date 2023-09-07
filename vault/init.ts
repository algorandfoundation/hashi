import * as fs from "fs";
import axios from 'axios'

// log command arguments
console.log(`args : ${process.argv}`)

// arg of index 2 is the path to store the vault seal keys
const vaultSealKeysPath: string = process.argv[2]

// init vault POST request
axios.post('http://localhost:8200/v1/sys/init', {
  secret_shares: 1,
  secret_threshold: 1
}).then(async (result) => {
  fs.writeFileSync("vault-seal-keys.json", JSON.stringify(result.data));
    
  var keys = result.data.keys;
  // set token for all following requests
  const token: string = result.data.root_token;
  console.log(`token : ${token}`)

  // unseal vault server
  const unsealResult = await axios.post('http://localhost:8200/v1/sys/unseal', {
    secret_shares: 1,
    key: keys[0]
  }, {
    headers: {
      'X-Vault-Token': token
    }
  });

  // check if unsealed
  if(unsealResult.data.sealed) throw new Error('vault is not unsealed')

  // notify success
  console.log(`vault is unsealed`)
}).catch(err => {
  console.log(`failed to init. Trying to unseal if already initialized...`)

  // trying to unseal
  const firstKey: string = JSON.parse(fs.readFileSync('vault-seal-keys.json').toString()).keys[0]

  axios.post('http://localhost:8200/v1/sys/unseal', {
    secret_shares: 1,
    key: firstKey
  }).then(async (result) => {
    // check if unsealed
    if(result.data.sealed) throw new Error('vault is not unsealed')

    // notify success
    console.log(`vault is unsealed`)
  }).catch(err => {
    console.error(err)
  })
})