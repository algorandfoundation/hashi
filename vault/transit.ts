import * as fs from 'fs';
import axios from 'axios'

axios.get('http://localhost:8200/v1/sys/init').then(async (res) => {
    if(!res.data.initialized) throw new Error('vault is not initialized')

    // fetch root token
    const rootToken: string = JSON.parse(fs.readFileSync('vault-seal-keys.json').toString()).root_token

    // list mounts
    const mounts = await axios.get('http://localhost:8200/v1/sys/mounts', {
        headers: {
            'X-Vault-Token': rootToken
        }
    })
    console.log(`mounts : ${JSON.stringify(mounts.data)}`)

    // mount transit engine through POST
    const mountTransitEngine = await axios.post('http://localhost:8200/v1/sys/mounts/transit', {
        type: 'transit',
        config: {
            force_no_cache: true
        }
    }, {
        headers: {
            'X-Vault-Token': rootToken
        }
    })

    // log mount response
    console.log(`mount transit engine : ${JSON.stringify(mountTransitEngine.data)}`)
}
).catch((err) => {
    console.log(`err : ${JSON.stringify(err)}`)
})
