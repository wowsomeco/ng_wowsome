# ng_wowsome
Angular Typescript Extensions consists of components, wrappers, directives, services, as well as other stuffs that can speed up our development time. 

## Getting Started
Right now it acts as a git submodule. It is still WIP for now. I will publish it as an npm package later once stable. For now, simply execute inside your Angular project:

```console
git submodule add https://github.com/wowsomeco/ng_wowsome
```

Then import the module in your app.module.ts e.g. 

```typescript
import { WowsomeModule } from 'src/wowsome/wowsome.module';

@NgModule({
  declarations: [...],
  imports: [
    ...,
    WowsomeModule
  ],
  providers: [...],
  bootstrap: [AppComponent]
})
export class AppModule { }
```
