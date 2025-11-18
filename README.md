# mobx-view-model-devtools   
## WIP   

Test:  
```html
<script
  crossOrigin="anonymous"
  src="//unpkg.com/mobx-view-model-devtools/auto.global.js"
></script>
```
Other case:   
```html
<script>
    fetch('//unpkg.com/mobx-view-model-devtools/auto.global.js').then(async response => {
        const script = await response.text();
        const scriptElement = document.createElement('script');
        scriptElement.innerHTML = script;
        document.head.appendChild(scriptElement);
    })
</script>
```

Connect non `mobx-view-model` things:   

```js
ViewModelDevtools.connectExtras({ foo: 'bar' });
```

Connect `mobx-view-model` store:  

```js
ViewModelDevtools.connect(viewModelStore);
```