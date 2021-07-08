FROM amazon/aws-lambda-nodejs:14

COPY ./package.json ./package-lock.json ./

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN npm install --only=prod

COPY . .

CMD [ "index-split-sites.lambdaHandler" ]