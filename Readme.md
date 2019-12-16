### str-esc

Utility to escape entities in string

Can also split/join strings with respect of escaping


#### Example

```js
    // import {EscapeService} from 'str-esc';
    const {EscapeService} = require('str-esc');

    let svc = new EscapeService('%');
    svc.encode('100% Y-m-d', ['Y', 'm', 'd']); // '100%% %Y-%m-%d'

    svc = new EscapeService();
    svc.split(', ', 'a, b\\, c, d');    // ['a', 'b, c', 'd']
    svc.join(', ', ['a', 'b, c', 'd']); // 'a, b\\, c, d'
```
