FROM amazon/aws-lambda-nodejs:14 as base

WORKDIR /${LAMBDA_TASK_ROOT}
# Override at build time for desired NODE_ENV
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

COPY ./package.json ./package-lock.json ./
RUN npm ci --only=prod

FROM base AS build

COPY . .
RUN npm ci
RUN npm run build

FROM base AS final

COPY --from=build /${LAMBDA_TASK_ROOT}/build /${LAMBDA_TASK_ROOT}/build
CMD [ "index.lambdaHandler" ]
