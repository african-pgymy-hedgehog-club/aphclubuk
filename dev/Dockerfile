FROM node:8.0.0

ENV NODE_ENV development

# Add files
RUN mkdir app
WORKDIR app

RUN npm i -g nodemon

CMD ["nodemon" , "-e", "js", "--ignore",  "node_modules", "--ignore", "public/js", "--ignore", "models/design", "-L", "./bin/www"]

