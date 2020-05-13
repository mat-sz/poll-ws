# poll-ws

WebSockets server for [poll-web](https://github.com/mat-sz/poll-web).

More details about the project are available in the [poll-web](https://github.com/mat-sz/poll-web) repository.

## Installation

Run `yarn install`, `yarn build` and then simply run `yarn start`. For development you can also run poll-ws with live reload, `yarn dev`.

## Configuration

`dotenv-flow` is used to manage the configuration.

The following variables are used for the configuration:

| Variable   | Default value | Description            |
| ---------- | ------------- | ---------------------- |
| `APP_HOST` | `127.0.0.1`   | IP address to bind to. |
| `APP_PORT` | `5000`        | Port to bind to.       |
