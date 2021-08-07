const defaultExpiresIn = 3600 * 1000 // 1 hour
console.log(process.env.REDIS_PORT, 'Port')
module.exports = {
  useRedis: process.env.NODE_ENV !== 'test',
  desirabilityScoresSegment: {
    name: 'desirablityScores',
    expiresIn: defaultExpiresIn
  },
  redisCatboxOptions: {
    host: process.env.REDIS_HOSTNAME,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    partition: process.env.REDIS_PARTITION,
    tls: process.env.NODE_ENV === 'production' ? {} : undefined
  }
}
