### str-esc

Utility to escape entities in string

Can also split/join strings with respect of escaping


```js
    import {EscapeService} from './build';

    const svc = new EscapeService('%');
    svc.encode('100% Y-m-d', ['Y', 'm', 'd']);

```
