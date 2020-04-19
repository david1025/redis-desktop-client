import net from 'net'
import Redis from 'ioredis'
const Client = require('ssh2').Client

export function connectRedis (config, resolve, errResolve) {
  if (config.ssh) {
    const conn = new Client()
    conn.on('ready', () => {
      const server = net.createServer(function (sock) {
        conn.forwardOut(sock.remoteAddress, sock.remotePort, config.host, config.port, (err, stream) => {
          if (err) {
            sock.end()
          } else {
            sock.pipe(stream).pipe(sock)
          }
        })
      }).listen(0, function () {
        console.log(server)
        console.log(server.address())
        createRedisClient(config, resolve, { host: '127.0.0.1', port: server.address().port })
      })
    }).on('error', err => {
      errResolve(err)
    })
    try {
      const sshConfig = {
        host: config.sshHost,
        port: config.sshPort,
        username: config.sshUser
      }
      if (config.sshKey) {
        conn.connect(Object.assign(sshConfig, {
          privateKey: config.sshKey,
          passphrase: config.sshKeyPassphrase
        }))
      } else {
        console.log('###############')
        conn.connect(Object.assign(sshConfig, {
          password: config.sshPassword
        }))
      }
    } catch (err) {
      errResolve(err)
    }
  } else {
    createRedisClient(config, resolve)
  }
}

function createRedisClient (config, resolve, override) {
  if (config.ssl) {
    config.tls = {
      rejectUnauthorized: false
    }
    if (config.tlsca) config.tls.ca = config.tlsca
    if (config.tlskey) config.tls.key = config.tlskey
    if (config.tlscert) config.tls.cert = config.tlscert
  }
  const port = config.port
  const host = config.host
  const options = {
    connectTimeout: 3000,
    retryStrategy: (times) => { return this.retryStragety(times, { host, port }) },
    enableReadyCheck: false,
    connectionName: config.connectionName ? config.connectionName : null,
    password: config.password
  }

  const clusterOptions = {
    enableReadyCheck: false,
    redisOptions: options
  }

  const redis = config.cluster
    ? new Redis.Cluster([{ port: port, host: host }], clusterOptions)
    : new Redis(Object.assign({}, config, override, {
      retryStrategy () {
        return false
      }
    }))
  console.log(redis)
  resolve(redis)
}
