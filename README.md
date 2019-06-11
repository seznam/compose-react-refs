# Compose react refs

A simple utility for composing two or more
[react refs](https://reactjs.org/docs/refs-and-the-dom.html) (ref objects and
callbacks are both supported and can be mixed) into a single callback ref.

## Usage

```typescript jsx
import * as React from 'react'
import composeRefs from '@seznam/compose-react-refs'

export default React.forwardRef((props, externalRef) => {
  const myRef = React.useRef(null)
  
  React.useEffect(() => {
    myRef.current.focus()
  })

  return <input {...props} ref={composeRefs(myRef, externalRef)}/>
})
```

The refs will be updated in the order in which they were provided.
