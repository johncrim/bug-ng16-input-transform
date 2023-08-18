# Ng16StandaloneLib

Created with:

```ps1
yarn dlx --package @angular/cli ng new ng16-standalone-lib --standalone --package-manager=yarn --create-application=false --minimal --commit=false

# Check for upgrade latest
yarn ng update @angular/core @angular/cli @angular/common
yarn upgrade-interactive

# Add library
yarn ng g library ui-components -p ui --project-root libs/ui-components --standalone
```
