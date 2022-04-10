# Chis-Botjs

Chis-Botjs is a *much needed* remake of [Chis-bot](https://github.com/Chrisae9/chis-bot).  

Due to the [instability](https://gist.github.com/Rapptz/4a2f62751b9600a31a0d3c78100287f1) of Discord.py and the addition of [Discord Slash Commands](https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ#:~:text=Slash%20Commands%20are%20the%20new,command%20right%20the%20first%20time.), I have decided to shift the development to [Discord.js](https://discord.js.org/#/docs/discord.js/stable/general/welcome). 

## Key Features

- Easy to use Development/Production environment
- Scalable command structure
- Robust game plan interface with persistent data on reboot
- Game server orchestration leveraging [Discord Role Permissions](https://support.discord.com/hc/en-us/articles/214836687-Role-Management-101)


## Dependencies

### Production
- docker
- docker-compose

Create a `.env-prod` file using [.env-sample](./.sample-env) as a template.

```bash
docker-compose up -f docker-compose.prod.yaml
```

### Development
- Node.js >=16.0.0
- VS Code (recommended)
  -  docker-extension

## Installation

Create a `.env` file using [.env-sample](./.sample-env) as a template.

```bash
docker-compose up
```

*More Information at [chis.dev](https://chis.dev/chis-botjs/).*
