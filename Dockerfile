FROM node:8.0.0

# Add files
RUN mkdir app
WORKDIR app

ADD bin bin
ADD controllers controllers
ADD models models
ADD public public
ADD routes routes
ADD views views
ADD app.js ./
ADD package.json ./
ADD render.js ./
ADD certs certs

RUN sed -e 's/\"env\"\: \"dev\"/\"env\"\: \"production\"/' -i package.json

# Install packages
RUN npm install

CMD ["node", "./bin/www"]
