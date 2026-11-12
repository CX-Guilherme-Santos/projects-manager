# API for local development with Docker Compose (see compose.yaml at the repo root).
# Production runs on Heroku with buildpacks, not with this image.
ARG RUBY_VERSION=4.0.6
FROM ruby:${RUBY_VERSION}-slim

RUN apt-get update -qq \
  && apt-get install --no-install-recommends -y build-essential libpq-dev libyaml-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV RAILS_ENV=development \
    BUNDLE_PATH=/usr/local/bundle

COPY Gemfile Gemfile.lock .ruby-version ./
RUN bundle install

COPY . .

EXPOSE 3000

# db:prepare creates the database, loads the schema and runs the seeds on the first
# start; afterwards it only applies pending migrations
CMD ["sh", "-c", "bin/rails db:prepare && exec bin/rails server -b 0.0.0.0 -p 3000"]
