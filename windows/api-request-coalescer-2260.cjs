'use strict';
/** Deduplicate concurrent identical TMDB requests without turning failures into cached successes. */
class RequestCoalescer {
 constructor(max=128){this.inFlight=new Map();this.max=max;}
 run(key,loader){
  if(this.inFlight.has(key))return this.inFlight.get(key);
  if(this.inFlight.size>=this.max)return Promise.reject(Error('Too many simultaneous catalog requests'));
  const request=Promise.resolve().then(loader);
  this.inFlight.set(key,request);
  // Register cleanup on both resolve and reject; no unhandled rejection from finally.
  request.then(()=>{if(this.inFlight.get(key)===request)this.inFlight.delete(key);},
               ()=>{if(this.inFlight.get(key)===request)this.inFlight.delete(key);});
  return request;
 }
 size(){return this.inFlight.size;}
}
module.exports={RequestCoalescer};
