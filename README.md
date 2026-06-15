# MarvelRivalsCoach

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.10.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## GitHub Setup

After cloning the repository, install dependencies:

```powershell
npm.cmd install
```

Create a local environment file from the safe example:

```powershell
Copy-Item .env.example .env
```

The `.env` file is ignored by Git and should contain only local or deployment-specific values. Do not commit real API keys, tokens, passwords, or private deployment settings.

The SQLite database is also ignored by Git. Recreate it locally after cloning:

```powershell
npm.cmd run content:update
```

For normal development:

```powershell
npm.cmd start
```

For a production build:

```powershell
npm.cmd run build
```

Files that should stay out of GitHub include:

- `.env` and `.env.*`
- `data/*.db`
- `node_modules/`
- `dist/`
- `.angular/`
- `tmp-*`
- local dev logs

## Content Update Scripts

Run these commands from this project folder:

```powershell
cd e:\repos\angular\marvel-rivals-coach\marvel-rivals-coach
```

Refresh generated hero playstyle text from the current SQLite data:

```powershell
npm.cmd run refresh:playstyles
```

Pull current hero data from Fandom into SQLite:

```powershell
npm.cmd run sync:heroes
```

Rebuild the SQLite database from local mock JSON seed files:

```powershell
npm.cmd run db:seed
```

Run the full content refresh pipeline:

```powershell
npm.cmd run content:update
```

Typical hero-content refresh:

```powershell
npm.cmd run sync:heroes
npm.cmd run refresh:playstyles
```

Restart the dev server after updating the database so the app reads the latest `.db` content.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
