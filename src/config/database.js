module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'docker',
  database: 'fastfeet',
  define: {
    timestramps: true,
    underscored: true,
    underscoredAll: true,
  },
};
