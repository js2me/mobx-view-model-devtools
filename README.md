# mobx-view-model-devtools   
## WIP   

Test:  
```html
<script
  crossOrigin="anonymous"
  src="//unpkg.com/mobx-view-model-devtools/index.global.js"
></script>
```

Connect non `mobx-view-model` things:   

```js
ViewModelDevtools.connectExtra({ foo: 'bar' });
```

Connect `mobx-view-model` store:  

```js
ViewModelDevtools.connect(viewModelStore);
```