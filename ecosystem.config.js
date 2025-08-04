module.exports = {
    apps: [
      {
        name: 'cartera-castigada-api',
        script: './server.js', // <-- cambia esto si tu entrada es server.js
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
  
        env: {
          NODE_ENV: 'development',
        },
  
        env_development: {
          NODE_ENV: 'development',
        },
  
        env_production: {
          NODE_ENV: 'production',
        },
      },
    ],
  };
  