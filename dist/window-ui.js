"use strict";var XRAYWindowUI=(()=>{var w1=Object.create;var lm=Object.defineProperty;var C1=Object.getOwnPropertyDescriptor;var k1=Object.getOwnPropertyNames;var A1=Object.getPrototypeOf,R1=Object.prototype.hasOwnProperty;var T=(e,t,a)=>()=>{if(a)throw a[0];try{return e&&(t=e(e=0)),t}catch(o){throw a=[o],o}};var ua=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(a){throw t=0,a}};var M1=(e,t,a,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of k1(t))!R1.call(e,r)&&r!==a&&lm(e,r,{get:()=>t[r],enumerable:!(o=C1(t,r))||o.enumerable});return e};var _=(e,t,a)=>(a=e!=null?w1(A1(e)):{},M1(t||!e||!e.__esModule?lm(a,"default",{value:e,enumerable:!0}):a,e));var ym=ua(Me=>{"use strict";function Qf(e,t){var a=e.length;e.push(t);e:for(;0<a;){var o=a-1>>>1,r=e[o];if(0<Is(r,t))e[o]=t,e[a]=r,a=o;else break e}}function Ia(e){return e.length===0?null:e[0]}function vs(e){if(e.length===0)return null;var t=e[0],a=e.pop();if(a!==t){e[0]=a;e:for(var o=0,r=e.length,n=r>>>1;o<n;){var l=2*(o+1)-1,s=e[l],i=l+1,f=e[i];if(0>Is(s,a))i<r&&0>Is(f,s)?(e[o]=f,e[i]=a,o=i):(e[o]=s,e[l]=a,o=l);else if(i<r&&0>Is(f,a))e[o]=f,e[i]=a,o=i;else break e}}return t}function Is(e,t){var a=e.sortIndex-t.sortIndex;return a!==0?a:e.id-t.id}Me.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(sm=performance,Me.unstable_now=function(){return sm.now()}):(jf=Date,im=jf.now(),Me.unstable_now=function(){return jf.now()-im});var sm,jf,im,Ea=[],io=[],T1=1,Kt=null,mt=3,Kf=!1,Vn=!1,Yn=!1,Zf=!1,um=typeof setTimeout=="function"?setTimeout:null,dm=typeof clearTimeout=="function"?clearTimeout:null,fm=typeof setImmediate<"u"?setImmediate:null;function bs(e){for(var t=Ia(io);t!==null;){if(t.callback===null)vs(io);else if(t.startTime<=e)vs(io),t.sortIndex=t.expirationTime,Qf(Ea,t);else break;t=Ia(io)}}function Wf(e){if(Yn=!1,bs(e),!Vn)if(Ia(Ea)!==null)Vn=!0,Or||(Or=!0,Br());else{var t=Ia(io);t!==null&&$f(Wf,t.startTime-e)}}var Or=!1,Qn=-1,pm=5,mm=-1;function xm(){return Zf?!0:!(Me.unstable_now()-mm<pm)}function Vf(){if(Zf=!1,Or){var e=Me.unstable_now();mm=e;var t=!0;try{e:{Vn=!1,Yn&&(Yn=!1,dm(Qn),Qn=-1),Kf=!0;var a=mt;try{t:{for(bs(e),Kt=Ia(Ea);Kt!==null&&!(Kt.expirationTime>e&&xm());){var o=Kt.callback;if(typeof o=="function"){Kt.callback=null,mt=Kt.priorityLevel;var r=o(Kt.expirationTime<=e);if(e=Me.unstable_now(),typeof r=="function"){Kt.callback=r,bs(e),t=!0;break t}Kt===Ia(Ea)&&vs(Ea),bs(e)}else vs(Ea);Kt=Ia(Ea)}if(Kt!==null)t=!0;else{var n=Ia(io);n!==null&&$f(Wf,n.startTime-e),t=!1}}break e}finally{Kt=null,mt=a,Kf=!1}t=void 0}}finally{t?Br():Or=!1}}}var Br;typeof fm=="function"?Br=function(){fm(Vf)}:typeof MessageChannel<"u"?(Yf=new MessageChannel,cm=Yf.port2,Yf.port1.onmessage=Vf,Br=function(){cm.postMessage(null)}):Br=function(){um(Vf,0)};var Yf,cm;function $f(e,t){Qn=um(function(){e(Me.unstable_now())},t)}Me.unstable_IdlePriority=5;Me.unstable_ImmediatePriority=1;Me.unstable_LowPriority=4;Me.unstable_NormalPriority=3;Me.unstable_Profiling=null;Me.unstable_UserBlockingPriority=2;Me.unstable_cancelCallback=function(e){e.callback=null};Me.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):pm=0<e?Math.floor(1e3/e):5};Me.unstable_getCurrentPriorityLevel=function(){return mt};Me.unstable_next=function(e){switch(mt){case 1:case 2:case 3:var t=3;break;default:t=mt}var a=mt;mt=t;try{return e()}finally{mt=a}};Me.unstable_requestPaint=function(){Zf=!0};Me.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var a=mt;mt=e;try{return t()}finally{mt=a}};Me.unstable_scheduleCallback=function(e,t,a){var o=Me.unstable_now();switch(typeof a=="object"&&a!==null?(a=a.delay,a=typeof a=="number"&&0<a?o+a:o):a=o,e){case 1:var r=-1;break;case 2:r=250;break;case 5:r=1073741823;break;case 4:r=1e4;break;default:r=5e3}return r=a+r,e={id:T1++,callback:t,priorityLevel:e,startTime:a,expirationTime:r,sortIndex:-1},a>o?(e.sortIndex=a,Qf(io,e),Ia(Ea)===null&&e===Ia(io)&&(Yn?(dm(Qn),Qn=-1):Yn=!0,$f(Wf,a-o))):(e.sortIndex=r,Qf(Ea,e),Vn||Kf||(Vn=!0,Or||(Or=!0,Br()))),e};Me.unstable_shouldYield=xm;Me.unstable_wrapCallback=function(e){var t=mt;return function(){var a=mt;mt=t;try{return e.apply(this,arguments)}finally{mt=a}}}});var hm=ua((UR,gm)=>{"use strict";gm.exports=ym()});var Tm=ua(V=>{"use strict";var tc=Symbol.for("react.transitional.element"),E1=Symbol.for("react.portal"),F1=Symbol.for("react.fragment"),D1=Symbol.for("react.strict_mode"),N1=Symbol.for("react.profiler"),B1=Symbol.for("react.consumer"),O1=Symbol.for("react.context"),L1=Symbol.for("react.forward_ref"),z1=Symbol.for("react.suspense"),H1=Symbol.for("react.memo"),wm=Symbol.for("react.lazy"),_1=Symbol.for("react.activity"),Im=Symbol.iterator;function P1(e){return e===null||typeof e!="object"?null:(e=Im&&e[Im]||e["@@iterator"],typeof e=="function"?e:null)}var Cm={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},km=Object.assign,Am={};function zr(e,t,a){this.props=e,this.context=t,this.refs=Am,this.updater=a||Cm}zr.prototype.isReactComponent={};zr.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};zr.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Rm(){}Rm.prototype=zr.prototype;function ac(e,t,a){this.props=e,this.context=t,this.refs=Am,this.updater=a||Cm}var oc=ac.prototype=new Rm;oc.constructor=ac;km(oc,zr.prototype);oc.isPureReactComponent=!0;var bm=Array.isArray;function ec(){}var Se={H:null,A:null,T:null,S:null},Mm=Object.prototype.hasOwnProperty;function rc(e,t,a){var o=a.ref;return{$$typeof:tc,type:e,key:t,ref:o!==void 0?o:null,props:a}}function q1(e,t){return rc(e.type,t,e.props)}function nc(e){return typeof e=="object"&&e!==null&&e.$$typeof===tc}function U1(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(a){return t[a]})}var vm=/\/+/g;function Jf(e,t){return typeof e=="object"&&e!==null&&e.key!=null?U1(""+e.key):t.toString(36)}function X1(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(ec,ec):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function Lr(e,t,a,o,r){var n=typeof e;(n==="undefined"||n==="boolean")&&(e=null);var l=!1;if(e===null)l=!0;else switch(n){case"bigint":case"string":case"number":l=!0;break;case"object":switch(e.$$typeof){case tc:case E1:l=!0;break;case wm:return l=e._init,Lr(l(e._payload),t,a,o,r)}}if(l)return r=r(e),l=o===""?"."+Jf(e,0):o,bm(r)?(a="",l!=null&&(a=l.replace(vm,"$&/")+"/"),Lr(r,t,a,"",function(f){return f})):r!=null&&(nc(r)&&(r=q1(r,a+(r.key==null||e&&e.key===r.key?"":(""+r.key).replace(vm,"$&/")+"/")+l)),t.push(r)),1;l=0;var s=o===""?".":o+":";if(bm(e))for(var i=0;i<e.length;i++)o=e[i],n=s+Jf(o,i),l+=Lr(o,t,a,n,r);else if(i=P1(e),typeof i=="function")for(e=i.call(e),i=0;!(o=e.next()).done;)o=o.value,n=s+Jf(o,i++),l+=Lr(o,t,a,n,r);else if(n==="object"){if(typeof e.then=="function")return Lr(X1(e),t,a,o,r);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return l}function Ss(e,t,a){if(e==null)return e;var o=[],r=0;return Lr(e,o,"","",function(n){return t.call(a,n,r++)}),o}function G1(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(a){(e._status===0||e._status===-1)&&(e._status=1,e._result=a)},function(a){(e._status===0||e._status===-1)&&(e._status=2,e._result=a)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var Sm=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},j1={map:Ss,forEach:function(e,t,a){Ss(e,function(){t.apply(this,arguments)},a)},count:function(e){var t=0;return Ss(e,function(){t++}),t},toArray:function(e){return Ss(e,function(t){return t})||[]},only:function(e){if(!nc(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};V.Activity=_1;V.Children=j1;V.Component=zr;V.Fragment=F1;V.Profiler=N1;V.PureComponent=ac;V.StrictMode=D1;V.Suspense=z1;V.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Se;V.__COMPILER_RUNTIME={__proto__:null,c:function(e){return Se.H.useMemoCache(e)}};V.cache=function(e){return function(){return e.apply(null,arguments)}};V.cacheSignal=function(){return null};V.cloneElement=function(e,t,a){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var o=km({},e.props),r=e.key;if(t!=null)for(n in t.key!==void 0&&(r=""+t.key),t)!Mm.call(t,n)||n==="key"||n==="__self"||n==="__source"||n==="ref"&&t.ref===void 0||(o[n]=t[n]);var n=arguments.length-2;if(n===1)o.children=a;else if(1<n){for(var l=Array(n),s=0;s<n;s++)l[s]=arguments[s+2];o.children=l}return rc(e.type,r,o)};V.createContext=function(e){return e={$$typeof:O1,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:B1,_context:e},e};V.createElement=function(e,t,a){var o,r={},n=null;if(t!=null)for(o in t.key!==void 0&&(n=""+t.key),t)Mm.call(t,o)&&o!=="key"&&o!=="__self"&&o!=="__source"&&(r[o]=t[o]);var l=arguments.length-2;if(l===1)r.children=a;else if(1<l){for(var s=Array(l),i=0;i<l;i++)s[i]=arguments[i+2];r.children=s}if(e&&e.defaultProps)for(o in l=e.defaultProps,l)r[o]===void 0&&(r[o]=l[o]);return rc(e,n,r)};V.createRef=function(){return{current:null}};V.forwardRef=function(e){return{$$typeof:L1,render:e}};V.isValidElement=nc;V.lazy=function(e){return{$$typeof:wm,_payload:{_status:-1,_result:e},_init:G1}};V.memo=function(e,t){return{$$typeof:H1,type:e,compare:t===void 0?null:t}};V.startTransition=function(e){var t=Se.T,a={};Se.T=a;try{var o=e(),r=Se.S;r!==null&&r(a,o),typeof o=="object"&&o!==null&&typeof o.then=="function"&&o.then(ec,Sm)}catch(n){Sm(n)}finally{t!==null&&a.types!==null&&(t.types=a.types),Se.T=t}};V.unstable_useCacheRefresh=function(){return Se.H.useCacheRefresh()};V.use=function(e){return Se.H.use(e)};V.useActionState=function(e,t,a){return Se.H.useActionState(e,t,a)};V.useCallback=function(e,t){return Se.H.useCallback(e,t)};V.useContext=function(e){return Se.H.useContext(e)};V.useDebugValue=function(){};V.useDeferredValue=function(e,t){return Se.H.useDeferredValue(e,t)};V.useEffect=function(e,t){return Se.H.useEffect(e,t)};V.useEffectEvent=function(e){return Se.H.useEffectEvent(e)};V.useId=function(){return Se.H.useId()};V.useImperativeHandle=function(e,t,a){return Se.H.useImperativeHandle(e,t,a)};V.useInsertionEffect=function(e,t){return Se.H.useInsertionEffect(e,t)};V.useLayoutEffect=function(e,t){return Se.H.useLayoutEffect(e,t)};V.useMemo=function(e,t){return Se.H.useMemo(e,t)};V.useOptimistic=function(e,t){return Se.H.useOptimistic(e,t)};V.useReducer=function(e,t,a){return Se.H.useReducer(e,t,a)};V.useRef=function(e){return Se.H.useRef(e)};V.useState=function(e){return Se.H.useState(e)};V.useSyncExternalStore=function(e,t,a){return Se.H.useSyncExternalStore(e,t,a)};V.useTransition=function(){return Se.H.useTransition()};V.version="19.2.6"});var ze=ua((GR,Em)=>{"use strict";Em.exports=Tm()});var Dm=ua(It=>{"use strict";var V1=ze();function Fm(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function fo(){}var ht={d:{f:fo,r:function(){throw Error(Fm(522))},D:fo,C:fo,L:fo,m:fo,X:fo,S:fo,M:fo},p:0,findDOMNode:null},Y1=Symbol.for("react.portal");function Q1(e,t,a){var o=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Y1,key:o==null?null:""+o,children:e,containerInfo:t,implementation:a}}var Kn=V1.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function ws(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}It.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=ht;It.createPortal=function(e,t){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(Fm(299));return Q1(e,t,null,a)};It.flushSync=function(e){var t=Kn.T,a=ht.p;try{if(Kn.T=null,ht.p=2,e)return e()}finally{Kn.T=t,ht.p=a,ht.d.f()}};It.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,ht.d.C(e,t))};It.prefetchDNS=function(e){typeof e=="string"&&ht.d.D(e)};It.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var a=t.as,o=ws(a,t.crossOrigin),r=typeof t.integrity=="string"?t.integrity:void 0,n=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;a==="style"?ht.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:o,integrity:r,fetchPriority:n}):a==="script"&&ht.d.X(e,{crossOrigin:o,integrity:r,fetchPriority:n,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};It.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var a=ws(t.as,t.crossOrigin);ht.d.M(e,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0})}}else t==null&&ht.d.M(e)};It.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var a=t.as,o=ws(a,t.crossOrigin);ht.d.L(e,a,{crossOrigin:o,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};It.preloadModule=function(e,t){if(typeof e=="string")if(t){var a=ws(t.as,t.crossOrigin);ht.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0})}else ht.d.m(e)};It.requestFormReset=function(e){ht.d.r(e)};It.unstable_batchedUpdates=function(e,t){return e(t)};It.useFormState=function(e,t,a){return Kn.H.useFormState(e,t,a)};It.useFormStatus=function(){return Kn.H.useHostTransitionStatus()};It.version="19.2.6"});var lc=ua((VR,Bm)=>{"use strict";function Nm(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Nm)}catch(e){console.error(e)}}Nm(),Bm.exports=Dm()});var Vh=ua(Qi=>{"use strict";var Ke=hm(),ly=ze(),K1=lc();function F(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function sy(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Ol(e){var t=e,a=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,(t.flags&4098)!==0&&(a=t.return),e=t.return;while(e)}return t.tag===3?a:null}function iy(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function fy(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Om(e){if(Ol(e)!==e)throw Error(F(188))}function Z1(e){var t=e.alternate;if(!t){if(t=Ol(e),t===null)throw Error(F(188));return t!==e?null:e}for(var a=e,o=t;;){var r=a.return;if(r===null)break;var n=r.alternate;if(n===null){if(o=r.return,o!==null){a=o;continue}break}if(r.child===n.child){for(n=r.child;n;){if(n===a)return Om(r),e;if(n===o)return Om(r),t;n=n.sibling}throw Error(F(188))}if(a.return!==o.return)a=r,o=n;else{for(var l=!1,s=r.child;s;){if(s===a){l=!0,a=r,o=n;break}if(s===o){l=!0,o=r,a=n;break}s=s.sibling}if(!l){for(s=n.child;s;){if(s===a){l=!0,a=n,o=r;break}if(s===o){l=!0,o=n,a=r;break}s=s.sibling}if(!l)throw Error(F(189))}}if(a.alternate!==o)throw Error(F(190))}if(a.tag!==3)throw Error(F(188));return a.stateNode.current===a?e:t}function cy(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=cy(e),t!==null)return t;e=e.sibling}return null}var ke=Object.assign,W1=Symbol.for("react.element"),Cs=Symbol.for("react.transitional.element"),ol=Symbol.for("react.portal"),Xr=Symbol.for("react.fragment"),uy=Symbol.for("react.strict_mode"),Pc=Symbol.for("react.profiler"),dy=Symbol.for("react.consumer"),Ha=Symbol.for("react.context"),Ou=Symbol.for("react.forward_ref"),qc=Symbol.for("react.suspense"),Uc=Symbol.for("react.suspense_list"),Lu=Symbol.for("react.memo"),co=Symbol.for("react.lazy"),Xc=Symbol.for("react.activity"),$1=Symbol.for("react.memo_cache_sentinel"),Lm=Symbol.iterator;function Zn(e){return e===null||typeof e!="object"?null:(e=Lm&&e[Lm]||e["@@iterator"],typeof e=="function"?e:null)}var J1=Symbol.for("react.client.reference");function Gc(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===J1?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Xr:return"Fragment";case Pc:return"Profiler";case uy:return"StrictMode";case qc:return"Suspense";case Uc:return"SuspenseList";case Xc:return"Activity"}if(typeof e=="object")switch(e.$$typeof){case ol:return"Portal";case Ha:return e.displayName||"Context";case dy:return(e._context.displayName||"Context")+".Consumer";case Ou:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Lu:return t=e.displayName||null,t!==null?t:Gc(e.type)||"Memo";case co:t=e._payload,e=e._init;try{return Gc(e(t))}catch{}}return null}var rl=Array.isArray,G=ly.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ce=K1.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,tr={pending:!1,data:null,method:null,action:null},jc=[],Gr=-1;function Ca(e){return{current:e}}function at(e){0>Gr||(e.current=jc[Gr],jc[Gr]=null,Gr--)}function Ie(e,t){Gr++,jc[Gr]=e.current,e.current=t}var wa=Ca(null),vl=Ca(null),So=Ca(null),oi=Ca(null);function ri(e,t){switch(Ie(So,t),Ie(vl,e),Ie(wa,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?Xx(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=Xx(t),e=Dh(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}at(wa),Ie(wa,e)}function fn(){at(wa),at(vl),at(So)}function Vc(e){e.memoizedState!==null&&Ie(oi,e);var t=wa.current,a=Dh(t,e.type);t!==a&&(Ie(vl,e),Ie(wa,a))}function ni(e){vl.current===e&&(at(wa),at(vl)),oi.current===e&&(at(oi),Dl._currentValue=tr)}var sc,zm;function Wo(e){if(sc===void 0)try{throw Error()}catch(a){var t=a.stack.trim().match(/\n( *(at )?)/);sc=t&&t[1]||"",zm=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+sc+e+zm}var ic=!1;function fc(e,t){if(!e||ic)return"";ic=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var o={DetermineComponentFrameRoot:function(){try{if(t){var x=function(){throw Error()};if(Object.defineProperty(x.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(x,[])}catch(p){var u=p}Reflect.construct(e,[],x)}else{try{x.call()}catch(p){u=p}e.call(x.prototype)}}else{try{throw Error()}catch(p){u=p}(x=e())&&typeof x.catch=="function"&&x.catch(function(){})}}catch(p){if(p&&u&&typeof p.stack=="string")return[p.stack,u.stack]}return[null,null]}};o.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var r=Object.getOwnPropertyDescriptor(o.DetermineComponentFrameRoot,"name");r&&r.configurable&&Object.defineProperty(o.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var n=o.DetermineComponentFrameRoot(),l=n[0],s=n[1];if(l&&s){var i=l.split(`
`),f=s.split(`
`);for(r=o=0;o<i.length&&!i[o].includes("DetermineComponentFrameRoot");)o++;for(;r<f.length&&!f[r].includes("DetermineComponentFrameRoot");)r++;if(o===i.length||r===f.length)for(o=i.length-1,r=f.length-1;1<=o&&0<=r&&i[o]!==f[r];)r--;for(;1<=o&&0<=r;o--,r--)if(i[o]!==f[r]){if(o!==1||r!==1)do if(o--,r--,0>r||i[o]!==f[r]){var d=`
`+i[o].replace(" at new "," at ");return e.displayName&&d.includes("<anonymous>")&&(d=d.replace("<anonymous>",e.displayName)),d}while(1<=o&&0<=r);break}}}finally{ic=!1,Error.prepareStackTrace=a}return(a=e?e.displayName||e.name:"")?Wo(a):""}function eS(e,t){switch(e.tag){case 26:case 27:case 5:return Wo(e.type);case 16:return Wo("Lazy");case 13:return e.child!==t&&t!==null?Wo("Suspense Fallback"):Wo("Suspense");case 19:return Wo("SuspenseList");case 0:case 15:return fc(e.type,!1);case 11:return fc(e.type.render,!1);case 1:return fc(e.type,!0);case 31:return Wo("Activity");default:return""}}function Hm(e){try{var t="",a=null;do t+=eS(e,a),a=e,e=e.return;while(e);return t}catch(o){return`
Error generating stack: `+o.message+`
`+o.stack}}var Yc=Object.prototype.hasOwnProperty,zu=Ke.unstable_scheduleCallback,cc=Ke.unstable_cancelCallback,tS=Ke.unstable_shouldYield,aS=Ke.unstable_requestPaint,zt=Ke.unstable_now,oS=Ke.unstable_getCurrentPriorityLevel,py=Ke.unstable_ImmediatePriority,my=Ke.unstable_UserBlockingPriority,li=Ke.unstable_NormalPriority,rS=Ke.unstable_LowPriority,xy=Ke.unstable_IdlePriority,nS=Ke.log,lS=Ke.unstable_setDisableYieldValue,Ll=null,Ht=null;function go(e){if(typeof nS=="function"&&lS(e),Ht&&typeof Ht.setStrictMode=="function")try{Ht.setStrictMode(Ll,e)}catch{}}var _t=Math.clz32?Math.clz32:fS,sS=Math.log,iS=Math.LN2;function fS(e){return e>>>=0,e===0?32:31-(sS(e)/iS|0)|0}var ks=256,As=262144,Rs=4194304;function $o(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&261888;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function Di(e,t,a){var o=e.pendingLanes;if(o===0)return 0;var r=0,n=e.suspendedLanes,l=e.pingedLanes;e=e.warmLanes;var s=o&134217727;return s!==0?(o=s&~n,o!==0?r=$o(o):(l&=s,l!==0?r=$o(l):a||(a=s&~e,a!==0&&(r=$o(a))))):(s=o&~n,s!==0?r=$o(s):l!==0?r=$o(l):a||(a=o&~e,a!==0&&(r=$o(a)))),r===0?0:t!==0&&t!==r&&(t&n)===0&&(n=r&-r,a=t&-t,n>=a||n===32&&(a&4194048)!==0)?t:r}function zl(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function cS(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function yy(){var e=Rs;return Rs<<=1,(Rs&62914560)===0&&(Rs=4194304),e}function uc(e){for(var t=[],a=0;31>a;a++)t.push(e);return t}function Hl(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function uS(e,t,a,o,r,n){var l=e.pendingLanes;e.pendingLanes=a,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=a,e.entangledLanes&=a,e.errorRecoveryDisabledLanes&=a,e.shellSuspendCounter=0;var s=e.entanglements,i=e.expirationTimes,f=e.hiddenUpdates;for(a=l&~a;0<a;){var d=31-_t(a),x=1<<d;s[d]=0,i[d]=-1;var u=f[d];if(u!==null)for(f[d]=null,d=0;d<u.length;d++){var p=u[d];p!==null&&(p.lane&=-536870913)}a&=~x}o!==0&&gy(e,o,0),n!==0&&r===0&&e.tag!==0&&(e.suspendedLanes|=n&~(l&~t))}function gy(e,t,a){e.pendingLanes|=t,e.suspendedLanes&=~t;var o=31-_t(t);e.entangledLanes|=t,e.entanglements[o]=e.entanglements[o]|1073741824|a&261930}function hy(e,t){var a=e.entangledLanes|=t;for(e=e.entanglements;a;){var o=31-_t(a),r=1<<o;r&t|e[o]&t&&(e[o]|=t),a&=~r}}function Iy(e,t){var a=t&-t;return a=(a&42)!==0?1:Hu(a),(a&(e.suspendedLanes|t))!==0?0:a}function Hu(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function _u(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function by(){var e=ce.p;return e!==0?e:(e=window.event,e===void 0?32:Xh(e.type))}function _m(e,t){var a=ce.p;try{return ce.p=e,t()}finally{ce.p=a}}var Oo=Math.random().toString(36).slice(2),lt="__reactFiber$"+Oo,Rt="__reactProps$"+Oo,bn="__reactContainer$"+Oo,Qc="__reactEvents$"+Oo,dS="__reactListeners$"+Oo,pS="__reactHandles$"+Oo,Pm="__reactResources$"+Oo,_l="__reactMarker$"+Oo;function Pu(e){delete e[lt],delete e[Rt],delete e[Qc],delete e[dS],delete e[pS]}function jr(e){var t=e[lt];if(t)return t;for(var a=e.parentNode;a;){if(t=a[bn]||a[lt]){if(a=t.alternate,t.child!==null||a!==null&&a.child!==null)for(e=Qx(e);e!==null;){if(a=e[lt])return a;e=Qx(e)}return t}e=a,a=e.parentNode}return null}function vn(e){if(e=e[lt]||e[bn]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function nl(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(F(33))}function tn(e){var t=e[Pm];return t||(t=e[Pm]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function tt(e){e[_l]=!0}var vy=new Set,Sy={};function ur(e,t){cn(e,t),cn(e+"Capture",t)}function cn(e,t){for(Sy[e]=t,e=0;e<t.length;e++)vy.add(t[e])}var mS=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),qm={},Um={};function xS(e){return Yc.call(Um,e)?!0:Yc.call(qm,e)?!1:mS.test(e)?Um[e]=!0:(qm[e]=!0,!1)}function Us(e,t,a){if(xS(t))if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var o=t.toLowerCase().slice(0,5);if(o!=="data-"&&o!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,""+a)}}function Ms(e,t,a){if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,""+a)}}function Fa(e,t,a,o){if(o===null)e.removeAttribute(a);else{switch(typeof o){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(a);return}e.setAttributeNS(t,a,""+o)}}function Wt(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function wy(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function yS(e,t,a){var o=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof o<"u"&&typeof o.get=="function"&&typeof o.set=="function"){var r=o.get,n=o.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return r.call(this)},set:function(l){a=""+l,n.call(this,l)}}),Object.defineProperty(e,t,{enumerable:o.enumerable}),{getValue:function(){return a},setValue:function(l){a=""+l},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Kc(e){if(!e._valueTracker){var t=wy(e)?"checked":"value";e._valueTracker=yS(e,t,""+e[t])}}function Cy(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var a=t.getValue(),o="";return e&&(o=wy(e)?e.checked?"true":"false":e.value),e=o,e!==a?(t.setValue(e),!0):!1}function si(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}var gS=/[\n"\\]/g;function ea(e){return e.replace(gS,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function Zc(e,t,a,o,r,n,l,s){e.name="",l!=null&&typeof l!="function"&&typeof l!="symbol"&&typeof l!="boolean"?e.type=l:e.removeAttribute("type"),t!=null?l==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+Wt(t)):e.value!==""+Wt(t)&&(e.value=""+Wt(t)):l!=="submit"&&l!=="reset"||e.removeAttribute("value"),t!=null?Wc(e,l,Wt(t)):a!=null?Wc(e,l,Wt(a)):o!=null&&e.removeAttribute("value"),r==null&&n!=null&&(e.defaultChecked=!!n),r!=null&&(e.checked=r&&typeof r!="function"&&typeof r!="symbol"),s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"?e.name=""+Wt(s):e.removeAttribute("name")}function ky(e,t,a,o,r,n,l,s){if(n!=null&&typeof n!="function"&&typeof n!="symbol"&&typeof n!="boolean"&&(e.type=n),t!=null||a!=null){if(!(n!=="submit"&&n!=="reset"||t!=null)){Kc(e);return}a=a!=null?""+Wt(a):"",t=t!=null?""+Wt(t):a,s||t===e.value||(e.value=t),e.defaultValue=t}o=o??r,o=typeof o!="function"&&typeof o!="symbol"&&!!o,e.checked=s?e.checked:!!o,e.defaultChecked=!!o,l!=null&&typeof l!="function"&&typeof l!="symbol"&&typeof l!="boolean"&&(e.name=l),Kc(e)}function Wc(e,t,a){t==="number"&&si(e.ownerDocument)===e||e.defaultValue===""+a||(e.defaultValue=""+a)}function an(e,t,a,o){if(e=e.options,t){t={};for(var r=0;r<a.length;r++)t["$"+a[r]]=!0;for(a=0;a<e.length;a++)r=t.hasOwnProperty("$"+e[a].value),e[a].selected!==r&&(e[a].selected=r),r&&o&&(e[a].defaultSelected=!0)}else{for(a=""+Wt(a),t=null,r=0;r<e.length;r++){if(e[r].value===a){e[r].selected=!0,o&&(e[r].defaultSelected=!0);return}t!==null||e[r].disabled||(t=e[r])}t!==null&&(t.selected=!0)}}function Ay(e,t,a){if(t!=null&&(t=""+Wt(t),t!==e.value&&(e.value=t),a==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=a!=null?""+Wt(a):""}function Ry(e,t,a,o){if(t==null){if(o!=null){if(a!=null)throw Error(F(92));if(rl(o)){if(1<o.length)throw Error(F(93));o=o[0]}a=o}a==null&&(a=""),t=a}a=Wt(t),e.defaultValue=a,o=e.textContent,o===a&&o!==""&&o!==null&&(e.value=o),Kc(e)}function un(e,t){if(t){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=t;return}}e.textContent=t}var hS=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function Xm(e,t,a){var o=t.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?o?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":o?e.setProperty(t,a):typeof a!="number"||a===0||hS.has(t)?t==="float"?e.cssFloat=a:e[t]=(""+a).trim():e[t]=a+"px"}function My(e,t,a){if(t!=null&&typeof t!="object")throw Error(F(62));if(e=e.style,a!=null){for(var o in a)!a.hasOwnProperty(o)||t!=null&&t.hasOwnProperty(o)||(o.indexOf("--")===0?e.setProperty(o,""):o==="float"?e.cssFloat="":e[o]="");for(var r in t)o=t[r],t.hasOwnProperty(r)&&a[r]!==o&&Xm(e,r,o)}else for(var n in t)t.hasOwnProperty(n)&&Xm(e,n,t[n])}function qu(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var IS=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),bS=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Xs(e){return bS.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function _a(){}var $c=null;function Uu(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Vr=null,on=null;function Gm(e){var t=vn(e);if(t&&(e=t.stateNode)){var a=e[Rt]||null;e:switch(e=t.stateNode,t.type){case"input":if(Zc(e,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),t=a.name,a.type==="radio"&&t!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+ea(""+t)+'"][type="radio"]'),t=0;t<a.length;t++){var o=a[t];if(o!==e&&o.form===e.form){var r=o[Rt]||null;if(!r)throw Error(F(90));Zc(o,r.value,r.defaultValue,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name)}}for(t=0;t<a.length;t++)o=a[t],o.form===e.form&&Cy(o)}break e;case"textarea":Ay(e,a.value,a.defaultValue);break e;case"select":t=a.value,t!=null&&an(e,!!a.multiple,t,!1)}}}var dc=!1;function Ty(e,t,a){if(dc)return e(t,a);dc=!0;try{var o=e(t);return o}finally{if(dc=!1,(Vr!==null||on!==null)&&(Gi(),Vr&&(t=Vr,e=on,on=Vr=null,Gm(t),e)))for(t=0;t<e.length;t++)Gm(e[t])}}function Sl(e,t){var a=e.stateNode;if(a===null)return null;var o=a[Rt]||null;if(o===null)return null;a=o[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(o=!o.disabled)||(e=e.type,o=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!o;break e;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(F(231,t,typeof a));return a}var Ga=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Jc=!1;if(Ga)try{Hr={},Object.defineProperty(Hr,"passive",{get:function(){Jc=!0}}),window.addEventListener("test",Hr,Hr),window.removeEventListener("test",Hr,Hr)}catch{Jc=!1}var Hr,ho=null,Xu=null,Gs=null;function Ey(){if(Gs)return Gs;var e,t=Xu,a=t.length,o,r="value"in ho?ho.value:ho.textContent,n=r.length;for(e=0;e<a&&t[e]===r[e];e++);var l=a-e;for(o=1;o<=l&&t[a-o]===r[n-o];o++);return Gs=r.slice(e,1<o?1-o:void 0)}function js(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Ts(){return!0}function jm(){return!1}function Mt(e){function t(a,o,r,n,l){this._reactName=a,this._targetInst=r,this.type=o,this.nativeEvent=n,this.target=l,this.currentTarget=null;for(var s in e)e.hasOwnProperty(s)&&(a=e[s],this[s]=a?a(n):n[s]);return this.isDefaultPrevented=(n.defaultPrevented!=null?n.defaultPrevented:n.returnValue===!1)?Ts:jm,this.isPropagationStopped=jm,this}return ke(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=Ts)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=Ts)},persist:function(){},isPersistent:Ts}),t}var dr={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Ni=Mt(dr),Pl=ke({},dr,{view:0,detail:0}),vS=Mt(Pl),pc,mc,Wn,Bi=ke({},Pl,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Gu,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==Wn&&(Wn&&e.type==="mousemove"?(pc=e.screenX-Wn.screenX,mc=e.screenY-Wn.screenY):mc=pc=0,Wn=e),pc)},movementY:function(e){return"movementY"in e?e.movementY:mc}}),Vm=Mt(Bi),SS=ke({},Bi,{dataTransfer:0}),wS=Mt(SS),CS=ke({},Pl,{relatedTarget:0}),xc=Mt(CS),kS=ke({},dr,{animationName:0,elapsedTime:0,pseudoElement:0}),AS=Mt(kS),RS=ke({},dr,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),MS=Mt(RS),TS=ke({},dr,{data:0}),Ym=Mt(TS),ES={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},FS={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},DS={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function NS(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=DS[e])?!!t[e]:!1}function Gu(){return NS}var BS=ke({},Pl,{key:function(e){if(e.key){var t=ES[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=js(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?FS[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Gu,charCode:function(e){return e.type==="keypress"?js(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?js(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),OS=Mt(BS),LS=ke({},Bi,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Qm=Mt(LS),zS=ke({},Pl,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Gu}),HS=Mt(zS),_S=ke({},dr,{propertyName:0,elapsedTime:0,pseudoElement:0}),PS=Mt(_S),qS=ke({},Bi,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),US=Mt(qS),XS=ke({},dr,{newState:0,oldState:0}),GS=Mt(XS),jS=[9,13,27,32],ju=Ga&&"CompositionEvent"in window,il=null;Ga&&"documentMode"in document&&(il=document.documentMode);var VS=Ga&&"TextEvent"in window&&!il,Fy=Ga&&(!ju||il&&8<il&&11>=il),Km=" ",Zm=!1;function Dy(e,t){switch(e){case"keyup":return jS.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Ny(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Yr=!1;function YS(e,t){switch(e){case"compositionend":return Ny(t);case"keypress":return t.which!==32?null:(Zm=!0,Km);case"textInput":return e=t.data,e===Km&&Zm?null:e;default:return null}}function QS(e,t){if(Yr)return e==="compositionend"||!ju&&Dy(e,t)?(e=Ey(),Gs=Xu=ho=null,Yr=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Fy&&t.locale!=="ko"?null:t.data;default:return null}}var KS={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Wm(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!KS[e.type]:t==="textarea"}function By(e,t,a,o){Vr?on?on.push(o):on=[o]:Vr=o,t=ki(t,"onChange"),0<t.length&&(a=new Ni("onChange","change",null,a,o),e.push({event:a,listeners:t}))}var fl=null,wl=null;function ZS(e){Th(e,0)}function Oi(e){var t=nl(e);if(Cy(t))return e}function $m(e,t){if(e==="change")return t}var Oy=!1;Ga&&(Ga?(Fs="oninput"in document,Fs||(yc=document.createElement("div"),yc.setAttribute("oninput","return;"),Fs=typeof yc.oninput=="function"),Es=Fs):Es=!1,Oy=Es&&(!document.documentMode||9<document.documentMode));var Es,Fs,yc;function Jm(){fl&&(fl.detachEvent("onpropertychange",Ly),wl=fl=null)}function Ly(e){if(e.propertyName==="value"&&Oi(wl)){var t=[];By(t,wl,e,Uu(e)),Ty(ZS,t)}}function WS(e,t,a){e==="focusin"?(Jm(),fl=t,wl=a,fl.attachEvent("onpropertychange",Ly)):e==="focusout"&&Jm()}function $S(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return Oi(wl)}function JS(e,t){if(e==="click")return Oi(t)}function ew(e,t){if(e==="input"||e==="change")return Oi(t)}function tw(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var qt=typeof Object.is=="function"?Object.is:tw;function Cl(e,t){if(qt(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var a=Object.keys(e),o=Object.keys(t);if(a.length!==o.length)return!1;for(o=0;o<a.length;o++){var r=a[o];if(!Yc.call(t,r)||!qt(e[r],t[r]))return!1}return!0}function ex(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function tx(e,t){var a=ex(e);e=0;for(var o;a;){if(a.nodeType===3){if(o=e+a.textContent.length,e<=t&&o>=t)return{node:a,offset:t-e};e=o}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=ex(a)}}function zy(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?zy(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Hy(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=si(e.document);t instanceof e.HTMLIFrameElement;){try{var a=typeof t.contentWindow.location.href=="string"}catch{a=!1}if(a)e=t.contentWindow;else break;t=si(e.document)}return t}function Vu(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var aw=Ga&&"documentMode"in document&&11>=document.documentMode,Qr=null,eu=null,cl=null,tu=!1;function ax(e,t,a){var o=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;tu||Qr==null||Qr!==si(o)||(o=Qr,"selectionStart"in o&&Vu(o)?o={start:o.selectionStart,end:o.selectionEnd}:(o=(o.ownerDocument&&o.ownerDocument.defaultView||window).getSelection(),o={anchorNode:o.anchorNode,anchorOffset:o.anchorOffset,focusNode:o.focusNode,focusOffset:o.focusOffset}),cl&&Cl(cl,o)||(cl=o,o=ki(eu,"onSelect"),0<o.length&&(t=new Ni("onSelect","select",null,t,a),e.push({event:t,listeners:o}),t.target=Qr)))}function Zo(e,t){var a={};return a[e.toLowerCase()]=t.toLowerCase(),a["Webkit"+e]="webkit"+t,a["Moz"+e]="moz"+t,a}var Kr={animationend:Zo("Animation","AnimationEnd"),animationiteration:Zo("Animation","AnimationIteration"),animationstart:Zo("Animation","AnimationStart"),transitionrun:Zo("Transition","TransitionRun"),transitionstart:Zo("Transition","TransitionStart"),transitioncancel:Zo("Transition","TransitionCancel"),transitionend:Zo("Transition","TransitionEnd")},gc={},_y={};Ga&&(_y=document.createElement("div").style,"AnimationEvent"in window||(delete Kr.animationend.animation,delete Kr.animationiteration.animation,delete Kr.animationstart.animation),"TransitionEvent"in window||delete Kr.transitionend.transition);function pr(e){if(gc[e])return gc[e];if(!Kr[e])return e;var t=Kr[e],a;for(a in t)if(t.hasOwnProperty(a)&&a in _y)return gc[e]=t[a];return e}var Py=pr("animationend"),qy=pr("animationiteration"),Uy=pr("animationstart"),ow=pr("transitionrun"),rw=pr("transitionstart"),nw=pr("transitioncancel"),Xy=pr("transitionend"),Gy=new Map,au="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");au.push("scrollEnd");function ma(e,t){Gy.set(e,t),ur(t,[e])}var ii=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},Zt=[],Zr=0,Yu=0;function Li(){for(var e=Zr,t=Yu=Zr=0;t<e;){var a=Zt[t];Zt[t++]=null;var o=Zt[t];Zt[t++]=null;var r=Zt[t];Zt[t++]=null;var n=Zt[t];if(Zt[t++]=null,o!==null&&r!==null){var l=o.pending;l===null?r.next=r:(r.next=l.next,l.next=r),o.pending=r}n!==0&&jy(a,r,n)}}function zi(e,t,a,o){Zt[Zr++]=e,Zt[Zr++]=t,Zt[Zr++]=a,Zt[Zr++]=o,Yu|=o,e.lanes|=o,e=e.alternate,e!==null&&(e.lanes|=o)}function Qu(e,t,a,o){return zi(e,t,a,o),fi(e)}function mr(e,t){return zi(e,null,null,t),fi(e)}function jy(e,t,a){e.lanes|=a;var o=e.alternate;o!==null&&(o.lanes|=a);for(var r=!1,n=e.return;n!==null;)n.childLanes|=a,o=n.alternate,o!==null&&(o.childLanes|=a),n.tag===22&&(e=n.stateNode,e===null||e._visibility&1||(r=!0)),e=n,n=n.return;return e.tag===3?(n=e.stateNode,r&&t!==null&&(r=31-_t(a),e=n.hiddenUpdates,o=e[r],o===null?e[r]=[t]:o.push(t),t.lane=a|536870912),n):null}function fi(e){if(50<Il)throw Il=0,wu=null,Error(F(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var Wr={};function lw(e,t,a,o){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=o,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Ot(e,t,a,o){return new lw(e,t,a,o)}function Ku(e){return e=e.prototype,!(!e||!e.isReactComponent)}function qa(e,t){var a=e.alternate;return a===null?(a=Ot(e.tag,t,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=t,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&65011712,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,t=e.dependencies,a.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a.refCleanup=e.refCleanup,a}function Vy(e,t){e.flags&=65011714;var a=e.alternate;return a===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=a.childLanes,e.lanes=a.lanes,e.child=a.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,e.updateQueue=a.updateQueue,e.type=a.type,t=a.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function Vs(e,t,a,o,r,n){var l=0;if(o=e,typeof e=="function")Ku(e)&&(l=1);else if(typeof e=="string")l=fC(e,a,wa.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(e){case Xc:return e=Ot(31,a,t,r),e.elementType=Xc,e.lanes=n,e;case Xr:return ar(a.children,r,n,t);case uy:l=8,r|=24;break;case Pc:return e=Ot(12,a,t,r|2),e.elementType=Pc,e.lanes=n,e;case qc:return e=Ot(13,a,t,r),e.elementType=qc,e.lanes=n,e;case Uc:return e=Ot(19,a,t,r),e.elementType=Uc,e.lanes=n,e;default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case Ha:l=10;break e;case dy:l=9;break e;case Ou:l=11;break e;case Lu:l=14;break e;case co:l=16,o=null;break e}l=29,a=Error(F(130,e===null?"null":typeof e,"")),o=null}return t=Ot(l,a,t,r),t.elementType=e,t.type=o,t.lanes=n,t}function ar(e,t,a,o){return e=Ot(7,e,o,t),e.lanes=a,e}function hc(e,t,a){return e=Ot(6,e,null,t),e.lanes=a,e}function Yy(e){var t=Ot(18,null,null,0);return t.stateNode=e,t}function Ic(e,t,a){return t=Ot(4,e.children!==null?e.children:[],e.key,t),t.lanes=a,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var ox=new WeakMap;function ta(e,t){if(typeof e=="object"&&e!==null){var a=ox.get(e);return a!==void 0?a:(t={value:e,source:t,stack:Hm(t)},ox.set(e,t),t)}return{value:e,source:t,stack:Hm(t)}}var $r=[],Jr=0,ci=null,kl=0,$t=[],Jt=0,Fo=null,ba=1,va="";function La(e,t){$r[Jr++]=kl,$r[Jr++]=ci,ci=e,kl=t}function Qy(e,t,a){$t[Jt++]=ba,$t[Jt++]=va,$t[Jt++]=Fo,Fo=e;var o=ba;e=va;var r=32-_t(o)-1;o&=~(1<<r),a+=1;var n=32-_t(t)+r;if(30<n){var l=r-r%5;n=(o&(1<<l)-1).toString(32),o>>=l,r-=l,ba=1<<32-_t(t)+r|a<<r|o,va=n+e}else ba=1<<n|a<<r|o,va=e}function Zu(e){e.return!==null&&(La(e,1),Qy(e,1,0))}function Wu(e){for(;e===ci;)ci=$r[--Jr],$r[Jr]=null,kl=$r[--Jr],$r[Jr]=null;for(;e===Fo;)Fo=$t[--Jt],$t[Jt]=null,va=$t[--Jt],$t[Jt]=null,ba=$t[--Jt],$t[Jt]=null}function Ky(e,t){$t[Jt++]=ba,$t[Jt++]=va,$t[Jt++]=Fo,ba=t.id,va=t.overflow,Fo=e}var st=null,Ce=null,re=!1,wo=null,aa=!1,ou=Error(F(519));function Do(e){var t=Error(F(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Al(ta(t,e)),ou}function rx(e){var t=e.stateNode,a=e.type,o=e.memoizedProps;switch(t[lt]=e,t[Rt]=o,a){case"dialog":te("cancel",t),te("close",t);break;case"iframe":case"object":case"embed":te("load",t);break;case"video":case"audio":for(a=0;a<El.length;a++)te(El[a],t);break;case"source":te("error",t);break;case"img":case"image":case"link":te("error",t),te("load",t);break;case"details":te("toggle",t);break;case"input":te("invalid",t),ky(t,o.value,o.defaultValue,o.checked,o.defaultChecked,o.type,o.name,!0);break;case"select":te("invalid",t);break;case"textarea":te("invalid",t),Ry(t,o.value,o.defaultValue,o.children)}a=o.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||t.textContent===""+a||o.suppressHydrationWarning===!0||Fh(t.textContent,a)?(o.popover!=null&&(te("beforetoggle",t),te("toggle",t)),o.onScroll!=null&&te("scroll",t),o.onScrollEnd!=null&&te("scrollend",t),o.onClick!=null&&(t.onclick=_a),t=!0):t=!1,t||Do(e,!0)}function nx(e){for(st=e.return;st;)switch(st.tag){case 5:case 31:case 13:aa=!1;return;case 27:case 3:aa=!0;return;default:st=st.return}}function _r(e){if(e!==st)return!1;if(!re)return nx(e),re=!0,!1;var t=e.tag,a;if((a=t!==3&&t!==27)&&((a=t===5)&&(a=e.type,a=!(a!=="form"&&a!=="button")||Mu(e.type,e.memoizedProps)),a=!a),a&&Ce&&Do(e),nx(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(F(317));Ce=Yx(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(F(317));Ce=Yx(e)}else t===27?(t=Ce,Lo(e.type)?(e=Du,Du=null,Ce=e):Ce=t):Ce=st?ra(e.stateNode.nextSibling):null;return!0}function lr(){Ce=st=null,re=!1}function bc(){var e=wo;return e!==null&&(kt===null?kt=e:kt.push.apply(kt,e),wo=null),e}function Al(e){wo===null?wo=[e]:wo.push(e)}var ru=Ca(null),xr=null,Pa=null;function po(e,t,a){Ie(ru,t._currentValue),t._currentValue=a}function Ua(e){e._currentValue=ru.current,at(ru)}function nu(e,t,a){for(;e!==null;){var o=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,o!==null&&(o.childLanes|=t)):o!==null&&(o.childLanes&t)!==t&&(o.childLanes|=t),e===a)break;e=e.return}}function lu(e,t,a,o){var r=e.child;for(r!==null&&(r.return=e);r!==null;){var n=r.dependencies;if(n!==null){var l=r.child;n=n.firstContext;e:for(;n!==null;){var s=n;n=r;for(var i=0;i<t.length;i++)if(s.context===t[i]){n.lanes|=a,s=n.alternate,s!==null&&(s.lanes|=a),nu(n.return,a,e),o||(l=null);break e}n=s.next}}else if(r.tag===18){if(l=r.return,l===null)throw Error(F(341));l.lanes|=a,n=l.alternate,n!==null&&(n.lanes|=a),nu(l,a,e),l=null}else l=r.child;if(l!==null)l.return=r;else for(l=r;l!==null;){if(l===e){l=null;break}if(r=l.sibling,r!==null){r.return=l.return,l=r;break}l=l.return}r=l}}function Sn(e,t,a,o){e=null;for(var r=t,n=!1;r!==null;){if(!n){if((r.flags&524288)!==0)n=!0;else if((r.flags&262144)!==0)break}if(r.tag===10){var l=r.alternate;if(l===null)throw Error(F(387));if(l=l.memoizedProps,l!==null){var s=r.type;qt(r.pendingProps.value,l.value)||(e!==null?e.push(s):e=[s])}}else if(r===oi.current){if(l=r.alternate,l===null)throw Error(F(387));l.memoizedState.memoizedState!==r.memoizedState.memoizedState&&(e!==null?e.push(Dl):e=[Dl])}r=r.return}e!==null&&lu(t,e,a,o),t.flags|=262144}function ui(e){for(e=e.firstContext;e!==null;){if(!qt(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function sr(e){xr=e,Pa=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function it(e){return Zy(xr,e)}function Ds(e,t){return xr===null&&sr(e),Zy(e,t)}function Zy(e,t){var a=t._currentValue;if(t={context:t,memoizedValue:a,next:null},Pa===null){if(e===null)throw Error(F(308));Pa=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else Pa=Pa.next=t;return a}var sw=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(a,o){e.push(o)}};this.abort=function(){t.aborted=!0,e.forEach(function(a){return a()})}},iw=Ke.unstable_scheduleCallback,fw=Ke.unstable_NormalPriority,Ve={$$typeof:Ha,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function $u(){return{controller:new sw,data:new Map,refCount:0}}function ql(e){e.refCount--,e.refCount===0&&iw(fw,function(){e.controller.abort()})}var ul=null,su=0,dn=0,rn=null;function cw(e,t){if(ul===null){var a=ul=[];su=0,dn=wd(),rn={status:"pending",value:void 0,then:function(o){a.push(o)}}}return su++,t.then(lx,lx),t}function lx(){if(--su===0&&ul!==null){rn!==null&&(rn.status="fulfilled");var e=ul;ul=null,dn=0,rn=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function uw(e,t){var a=[],o={status:"pending",value:null,reason:null,then:function(r){a.push(r)}};return e.then(function(){o.status="fulfilled",o.value=t;for(var r=0;r<a.length;r++)(0,a[r])(t)},function(r){for(o.status="rejected",o.reason=r,r=0;r<a.length;r++)(0,a[r])(void 0)}),o}var sx=G.S;G.S=function(e,t){ch=zt(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&cw(e,t),sx!==null&&sx(e,t)};var or=Ca(null);function Ju(){var e=or.current;return e!==null?e:he.pooledCache}function Ys(e,t){t===null?Ie(or,or.current):Ie(or,t.pool)}function Wy(){var e=Ju();return e===null?null:{parent:Ve._currentValue,pool:e}}var wn=Error(F(460)),ed=Error(F(474)),Hi=Error(F(542)),di={then:function(){}};function ix(e){return e=e.status,e==="fulfilled"||e==="rejected"}function $y(e,t,a){switch(a=e[a],a===void 0?e.push(t):a!==t&&(t.then(_a,_a),t=a),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,cx(e),e;default:if(typeof t.status=="string")t.then(_a,_a);else{if(e=he,e!==null&&100<e.shellSuspendCounter)throw Error(F(482));e=t,e.status="pending",e.then(function(o){if(t.status==="pending"){var r=t;r.status="fulfilled",r.value=o}},function(o){if(t.status==="pending"){var r=t;r.status="rejected",r.reason=o}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,cx(e),e}throw rr=t,wn}}function Jo(e){try{var t=e._init;return t(e._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(rr=a,wn):a}}var rr=null;function fx(){if(rr===null)throw Error(F(459));var e=rr;return rr=null,e}function cx(e){if(e===wn||e===Hi)throw Error(F(483))}var nn=null,Rl=0;function Ns(e){var t=Rl;return Rl+=1,nn===null&&(nn=[]),$y(nn,e,t)}function $n(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function Bs(e,t){throw t.$$typeof===W1?Error(F(525)):(e=Object.prototype.toString.call(t),Error(F(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function Jy(e){function t(y,c){if(e){var m=y.deletions;m===null?(y.deletions=[c],y.flags|=16):m.push(c)}}function a(y,c){if(!e)return null;for(;c!==null;)t(y,c),c=c.sibling;return null}function o(y){for(var c=new Map;y!==null;)y.key!==null?c.set(y.key,y):c.set(y.index,y),y=y.sibling;return c}function r(y,c){return y=qa(y,c),y.index=0,y.sibling=null,y}function n(y,c,m){return y.index=m,e?(m=y.alternate,m!==null?(m=m.index,m<c?(y.flags|=67108866,c):m):(y.flags|=67108866,c)):(y.flags|=1048576,c)}function l(y){return e&&y.alternate===null&&(y.flags|=67108866),y}function s(y,c,m,g){return c===null||c.tag!==6?(c=hc(m,y.mode,g),c.return=y,c):(c=r(c,m),c.return=y,c)}function i(y,c,m,g){var k=m.type;return k===Xr?d(y,c,m.props.children,g,m.key):c!==null&&(c.elementType===k||typeof k=="object"&&k!==null&&k.$$typeof===co&&Jo(k)===c.type)?(c=r(c,m.props),$n(c,m),c.return=y,c):(c=Vs(m.type,m.key,m.props,null,y.mode,g),$n(c,m),c.return=y,c)}function f(y,c,m,g){return c===null||c.tag!==4||c.stateNode.containerInfo!==m.containerInfo||c.stateNode.implementation!==m.implementation?(c=Ic(m,y.mode,g),c.return=y,c):(c=r(c,m.children||[]),c.return=y,c)}function d(y,c,m,g,k){return c===null||c.tag!==7?(c=ar(m,y.mode,g,k),c.return=y,c):(c=r(c,m),c.return=y,c)}function x(y,c,m){if(typeof c=="string"&&c!==""||typeof c=="number"||typeof c=="bigint")return c=hc(""+c,y.mode,m),c.return=y,c;if(typeof c=="object"&&c!==null){switch(c.$$typeof){case Cs:return m=Vs(c.type,c.key,c.props,null,y.mode,m),$n(m,c),m.return=y,m;case ol:return c=Ic(c,y.mode,m),c.return=y,c;case co:return c=Jo(c),x(y,c,m)}if(rl(c)||Zn(c))return c=ar(c,y.mode,m,null),c.return=y,c;if(typeof c.then=="function")return x(y,Ns(c),m);if(c.$$typeof===Ha)return x(y,Ds(y,c),m);Bs(y,c)}return null}function u(y,c,m,g){var k=c!==null?c.key:null;if(typeof m=="string"&&m!==""||typeof m=="number"||typeof m=="bigint")return k!==null?null:s(y,c,""+m,g);if(typeof m=="object"&&m!==null){switch(m.$$typeof){case Cs:return m.key===k?i(y,c,m,g):null;case ol:return m.key===k?f(y,c,m,g):null;case co:return m=Jo(m),u(y,c,m,g)}if(rl(m)||Zn(m))return k!==null?null:d(y,c,m,g,null);if(typeof m.then=="function")return u(y,c,Ns(m),g);if(m.$$typeof===Ha)return u(y,c,Ds(y,m),g);Bs(y,m)}return null}function p(y,c,m,g,k){if(typeof g=="string"&&g!==""||typeof g=="number"||typeof g=="bigint")return y=y.get(m)||null,s(c,y,""+g,k);if(typeof g=="object"&&g!==null){switch(g.$$typeof){case Cs:return y=y.get(g.key===null?m:g.key)||null,i(c,y,g,k);case ol:return y=y.get(g.key===null?m:g.key)||null,f(c,y,g,k);case co:return g=Jo(g),p(y,c,m,g,k)}if(rl(g)||Zn(g))return y=y.get(m)||null,d(c,y,g,k,null);if(typeof g.then=="function")return p(y,c,m,Ns(g),k);if(g.$$typeof===Ha)return p(y,c,m,Ds(c,g),k);Bs(c,g)}return null}function v(y,c,m,g){for(var k=null,N=null,b=c,D=c=0,S=null;b!==null&&D<m.length;D++){b.index>D?(S=b,b=null):S=b.sibling;var P=u(y,b,m[D],g);if(P===null){b===null&&(b=S);break}e&&b&&P.alternate===null&&t(y,b),c=n(P,c,D),N===null?k=P:N.sibling=P,N=P,b=S}if(D===m.length)return a(y,b),re&&La(y,D),k;if(b===null){for(;D<m.length;D++)b=x(y,m[D],g),b!==null&&(c=n(b,c,D),N===null?k=b:N.sibling=b,N=b);return re&&La(y,D),k}for(b=o(b);D<m.length;D++)S=p(b,y,D,m[D],g),S!==null&&(e&&S.alternate!==null&&b.delete(S.key===null?D:S.key),c=n(S,c,D),N===null?k=S:N.sibling=S,N=S);return e&&b.forEach(function(le){return t(y,le)}),re&&La(y,D),k}function w(y,c,m,g){if(m==null)throw Error(F(151));for(var k=null,N=null,b=c,D=c=0,S=null,P=m.next();b!==null&&!P.done;D++,P=m.next()){b.index>D?(S=b,b=null):S=b.sibling;var le=u(y,b,P.value,g);if(le===null){b===null&&(b=S);break}e&&b&&le.alternate===null&&t(y,b),c=n(le,c,D),N===null?k=le:N.sibling=le,N=le,b=S}if(P.done)return a(y,b),re&&La(y,D),k;if(b===null){for(;!P.done;D++,P=m.next())P=x(y,P.value,g),P!==null&&(c=n(P,c,D),N===null?k=P:N.sibling=P,N=P);return re&&La(y,D),k}for(b=o(b);!P.done;D++,P=m.next())P=p(b,y,D,P.value,g),P!==null&&(e&&P.alternate!==null&&b.delete(P.key===null?D:P.key),c=n(P,c,D),N===null?k=P:N.sibling=P,N=P);return e&&b.forEach(function(dt){return t(y,dt)}),re&&La(y,D),k}function E(y,c,m,g){if(typeof m=="object"&&m!==null&&m.type===Xr&&m.key===null&&(m=m.props.children),typeof m=="object"&&m!==null){switch(m.$$typeof){case Cs:e:{for(var k=m.key;c!==null;){if(c.key===k){if(k=m.type,k===Xr){if(c.tag===7){a(y,c.sibling),g=r(c,m.props.children),g.return=y,y=g;break e}}else if(c.elementType===k||typeof k=="object"&&k!==null&&k.$$typeof===co&&Jo(k)===c.type){a(y,c.sibling),g=r(c,m.props),$n(g,m),g.return=y,y=g;break e}a(y,c);break}else t(y,c);c=c.sibling}m.type===Xr?(g=ar(m.props.children,y.mode,g,m.key),g.return=y,y=g):(g=Vs(m.type,m.key,m.props,null,y.mode,g),$n(g,m),g.return=y,y=g)}return l(y);case ol:e:{for(k=m.key;c!==null;){if(c.key===k)if(c.tag===4&&c.stateNode.containerInfo===m.containerInfo&&c.stateNode.implementation===m.implementation){a(y,c.sibling),g=r(c,m.children||[]),g.return=y,y=g;break e}else{a(y,c);break}else t(y,c);c=c.sibling}g=Ic(m,y.mode,g),g.return=y,y=g}return l(y);case co:return m=Jo(m),E(y,c,m,g)}if(rl(m))return v(y,c,m,g);if(Zn(m)){if(k=Zn(m),typeof k!="function")throw Error(F(150));return m=k.call(m),w(y,c,m,g)}if(typeof m.then=="function")return E(y,c,Ns(m),g);if(m.$$typeof===Ha)return E(y,c,Ds(y,m),g);Bs(y,m)}return typeof m=="string"&&m!==""||typeof m=="number"||typeof m=="bigint"?(m=""+m,c!==null&&c.tag===6?(a(y,c.sibling),g=r(c,m),g.return=y,y=g):(a(y,c),g=hc(m,y.mode,g),g.return=y,y=g),l(y)):a(y,c)}return function(y,c,m,g){try{Rl=0;var k=E(y,c,m,g);return nn=null,k}catch(b){if(b===wn||b===Hi)throw b;var N=Ot(29,b,null,y.mode);return N.lanes=g,N.return=y,N}}}var ir=Jy(!0),eg=Jy(!1),uo=!1;function td(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function iu(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function Co(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function ko(e,t,a){var o=e.updateQueue;if(o===null)return null;if(o=o.shared,(fe&2)!==0){var r=o.pending;return r===null?t.next=t:(t.next=r.next,r.next=t),o.pending=t,t=fi(e),jy(e,null,a),t}return zi(e,o,t,a),fi(e)}function dl(e,t,a){if(t=t.updateQueue,t!==null&&(t=t.shared,(a&4194048)!==0)){var o=t.lanes;o&=e.pendingLanes,a|=o,t.lanes=a,hy(e,a)}}function vc(e,t){var a=e.updateQueue,o=e.alternate;if(o!==null&&(o=o.updateQueue,a===o)){var r=null,n=null;if(a=a.firstBaseUpdate,a!==null){do{var l={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};n===null?r=n=l:n=n.next=l,a=a.next}while(a!==null);n===null?r=n=t:n=n.next=t}else r=n=t;a={baseState:o.baseState,firstBaseUpdate:r,lastBaseUpdate:n,shared:o.shared,callbacks:o.callbacks},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=t:e.next=t,a.lastBaseUpdate=t}var fu=!1;function pl(){if(fu){var e=rn;if(e!==null)throw e}}function ml(e,t,a,o){fu=!1;var r=e.updateQueue;uo=!1;var n=r.firstBaseUpdate,l=r.lastBaseUpdate,s=r.shared.pending;if(s!==null){r.shared.pending=null;var i=s,f=i.next;i.next=null,l===null?n=f:l.next=f,l=i;var d=e.alternate;d!==null&&(d=d.updateQueue,s=d.lastBaseUpdate,s!==l&&(s===null?d.firstBaseUpdate=f:s.next=f,d.lastBaseUpdate=i))}if(n!==null){var x=r.baseState;l=0,d=f=i=null,s=n;do{var u=s.lane&-536870913,p=u!==s.lane;if(p?(oe&u)===u:(o&u)===u){u!==0&&u===dn&&(fu=!0),d!==null&&(d=d.next={lane:0,tag:s.tag,payload:s.payload,callback:null,next:null});e:{var v=e,w=s;u=t;var E=a;switch(w.tag){case 1:if(v=w.payload,typeof v=="function"){x=v.call(E,x,u);break e}x=v;break e;case 3:v.flags=v.flags&-65537|128;case 0:if(v=w.payload,u=typeof v=="function"?v.call(E,x,u):v,u==null)break e;x=ke({},x,u);break e;case 2:uo=!0}}u=s.callback,u!==null&&(e.flags|=64,p&&(e.flags|=8192),p=r.callbacks,p===null?r.callbacks=[u]:p.push(u))}else p={lane:u,tag:s.tag,payload:s.payload,callback:s.callback,next:null},d===null?(f=d=p,i=x):d=d.next=p,l|=u;if(s=s.next,s===null){if(s=r.shared.pending,s===null)break;p=s,s=p.next,p.next=null,r.lastBaseUpdate=p,r.shared.pending=null}}while(!0);d===null&&(i=x),r.baseState=i,r.firstBaseUpdate=f,r.lastBaseUpdate=d,n===null&&(r.shared.lanes=0),Bo|=l,e.lanes=l,e.memoizedState=x}}function tg(e,t){if(typeof e!="function")throw Error(F(191,e));e.call(t)}function ag(e,t){var a=e.callbacks;if(a!==null)for(e.callbacks=null,e=0;e<a.length;e++)tg(a[e],t)}var pn=Ca(null),pi=Ca(0);function ux(e,t){e=Qa,Ie(pi,e),Ie(pn,t),Qa=e|t.baseLanes}function cu(){Ie(pi,Qa),Ie(pn,pn.current)}function ad(){Qa=pi.current,at(pn),at(pi)}var Ut=Ca(null),oa=null;function mo(e){var t=e.alternate;Ie(He,He.current&1),Ie(Ut,e),oa===null&&(t===null||pn.current!==null||t.memoizedState!==null)&&(oa=e)}function uu(e){Ie(He,He.current),Ie(Ut,e),oa===null&&(oa=e)}function og(e){e.tag===22?(Ie(He,He.current),Ie(Ut,e),oa===null&&(oa=e)):xo(e)}function xo(){Ie(He,He.current),Ie(Ut,Ut.current)}function Bt(e){at(Ut),oa===e&&(oa=null),at(He)}var He=Ca(0);function mi(e){for(var t=e;t!==null;){if(t.tag===13){var a=t.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||Eu(a)||Fu(a)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder==="forwards"||t.memoizedProps.revealOrder==="backwards"||t.memoizedProps.revealOrder==="unstable_legacy-backwards"||t.memoizedProps.revealOrder==="together")){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var ja=0,Q=null,ye=null,Ge=null,xi=!1,ln=!1,fr=!1,yi=0,Ml=0,sn=null,dw=0;function Ne(){throw Error(F(321))}function od(e,t){if(t===null)return!1;for(var a=0;a<t.length&&a<e.length;a++)if(!qt(e[a],t[a]))return!1;return!0}function rd(e,t,a,o,r,n){return ja=n,Q=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,G.H=e===null||e.memoizedState===null?Bg:xd,fr=!1,n=a(o,r),fr=!1,ln&&(n=ng(t,a,o,r)),rg(e),n}function rg(e){G.H=Tl;var t=ye!==null&&ye.next!==null;if(ja=0,Ge=ye=Q=null,xi=!1,Ml=0,sn=null,t)throw Error(F(300));e===null||Ye||(e=e.dependencies,e!==null&&ui(e)&&(Ye=!0))}function ng(e,t,a,o){Q=e;var r=0;do{if(ln&&(sn=null),Ml=0,ln=!1,25<=r)throw Error(F(301));if(r+=1,Ge=ye=null,e.updateQueue!=null){var n=e.updateQueue;n.lastEffect=null,n.events=null,n.stores=null,n.memoCache!=null&&(n.memoCache.index=0)}G.H=Og,n=t(a,o)}while(ln);return n}function pw(){var e=G.H,t=e.useState()[0];return t=typeof t.then=="function"?Ul(t):t,e=e.useState()[0],(ye!==null?ye.memoizedState:null)!==e&&(Q.flags|=1024),t}function nd(){var e=yi!==0;return yi=0,e}function ld(e,t,a){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a}function sd(e){if(xi){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}xi=!1}ja=0,Ge=ye=Q=null,ln=!1,Ml=yi=0,sn=null}function bt(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Ge===null?Q.memoizedState=Ge=e:Ge=Ge.next=e,Ge}function _e(){if(ye===null){var e=Q.alternate;e=e!==null?e.memoizedState:null}else e=ye.next;var t=Ge===null?Q.memoizedState:Ge.next;if(t!==null)Ge=t,ye=e;else{if(e===null)throw Q.alternate===null?Error(F(467)):Error(F(310));ye=e,e={memoizedState:ye.memoizedState,baseState:ye.baseState,baseQueue:ye.baseQueue,queue:ye.queue,next:null},Ge===null?Q.memoizedState=Ge=e:Ge=Ge.next=e}return Ge}function _i(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Ul(e){var t=Ml;return Ml+=1,sn===null&&(sn=[]),e=$y(sn,e,t),t=Q,(Ge===null?t.memoizedState:Ge.next)===null&&(t=t.alternate,G.H=t===null||t.memoizedState===null?Bg:xd),e}function Pi(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return Ul(e);if(e.$$typeof===Ha)return it(e)}throw Error(F(438,String(e)))}function id(e){var t=null,a=Q.updateQueue;if(a!==null&&(t=a.memoCache),t==null){var o=Q.alternate;o!==null&&(o=o.updateQueue,o!==null&&(o=o.memoCache,o!=null&&(t={data:o.data.map(function(r){return r.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),a===null&&(a=_i(),Q.updateQueue=a),a.memoCache=t,a=t.data[t.index],a===void 0)for(a=t.data[t.index]=Array(e),o=0;o<e;o++)a[o]=$1;return t.index++,a}function Va(e,t){return typeof t=="function"?t(e):t}function Qs(e){var t=_e();return fd(t,ye,e)}function fd(e,t,a){var o=e.queue;if(o===null)throw Error(F(311));o.lastRenderedReducer=a;var r=e.baseQueue,n=o.pending;if(n!==null){if(r!==null){var l=r.next;r.next=n.next,n.next=l}t.baseQueue=r=n,o.pending=null}if(n=e.baseState,r===null)e.memoizedState=n;else{t=r.next;var s=l=null,i=null,f=t,d=!1;do{var x=f.lane&-536870913;if(x!==f.lane?(oe&x)===x:(ja&x)===x){var u=f.revertLane;if(u===0)i!==null&&(i=i.next={lane:0,revertLane:0,gesture:null,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null}),x===dn&&(d=!0);else if((ja&u)===u){f=f.next,u===dn&&(d=!0);continue}else x={lane:0,revertLane:f.revertLane,gesture:null,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null},i===null?(s=i=x,l=n):i=i.next=x,Q.lanes|=u,Bo|=u;x=f.action,fr&&a(n,x),n=f.hasEagerState?f.eagerState:a(n,x)}else u={lane:x,revertLane:f.revertLane,gesture:f.gesture,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null},i===null?(s=i=u,l=n):i=i.next=u,Q.lanes|=x,Bo|=x;f=f.next}while(f!==null&&f!==t);if(i===null?l=n:i.next=s,!qt(n,e.memoizedState)&&(Ye=!0,d&&(a=rn,a!==null)))throw a;e.memoizedState=n,e.baseState=l,e.baseQueue=i,o.lastRenderedState=n}return r===null&&(o.lanes=0),[e.memoizedState,o.dispatch]}function Sc(e){var t=_e(),a=t.queue;if(a===null)throw Error(F(311));a.lastRenderedReducer=e;var o=a.dispatch,r=a.pending,n=t.memoizedState;if(r!==null){a.pending=null;var l=r=r.next;do n=e(n,l.action),l=l.next;while(l!==r);qt(n,t.memoizedState)||(Ye=!0),t.memoizedState=n,t.baseQueue===null&&(t.baseState=n),a.lastRenderedState=n}return[n,o]}function lg(e,t,a){var o=Q,r=_e(),n=re;if(n){if(a===void 0)throw Error(F(407));a=a()}else a=t();var l=!qt((ye||r).memoizedState,a);if(l&&(r.memoizedState=a,Ye=!0),r=r.queue,cd(fg.bind(null,o,r,e),[e]),r.getSnapshot!==t||l||Ge!==null&&Ge.memoizedState.tag&1){if(o.flags|=2048,mn(9,{destroy:void 0},ig.bind(null,o,r,a,t),null),he===null)throw Error(F(349));n||(ja&127)!==0||sg(o,t,a)}return a}function sg(e,t,a){e.flags|=16384,e={getSnapshot:t,value:a},t=Q.updateQueue,t===null?(t=_i(),Q.updateQueue=t,t.stores=[e]):(a=t.stores,a===null?t.stores=[e]:a.push(e))}function ig(e,t,a,o){t.value=a,t.getSnapshot=o,cg(t)&&ug(e)}function fg(e,t,a){return a(function(){cg(t)&&ug(e)})}function cg(e){var t=e.getSnapshot;e=e.value;try{var a=t();return!qt(e,a)}catch{return!0}}function ug(e){var t=mr(e,2);t!==null&&At(t,e,2)}function du(e){var t=bt();if(typeof e=="function"){var a=e;if(e=a(),fr){go(!0);try{a()}finally{go(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Va,lastRenderedState:e},t}function dg(e,t,a,o){return e.baseState=a,fd(e,ye,typeof o=="function"?o:Va)}function mw(e,t,a,o,r){if(Ui(e))throw Error(F(485));if(e=t.action,e!==null){var n={payload:r,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(l){n.listeners.push(l)}};G.T!==null?a(!0):n.isTransition=!1,o(n),a=t.pending,a===null?(n.next=t.pending=n,pg(t,n)):(n.next=a.next,t.pending=a.next=n)}}function pg(e,t){var a=t.action,o=t.payload,r=e.state;if(t.isTransition){var n=G.T,l={};G.T=l;try{var s=a(r,o),i=G.S;i!==null&&i(l,s),dx(e,t,s)}catch(f){pu(e,t,f)}finally{n!==null&&l.types!==null&&(n.types=l.types),G.T=n}}else try{n=a(r,o),dx(e,t,n)}catch(f){pu(e,t,f)}}function dx(e,t,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(o){px(e,t,o)},function(o){return pu(e,t,o)}):px(e,t,a)}function px(e,t,a){t.status="fulfilled",t.value=a,mg(t),e.state=a,t=e.pending,t!==null&&(a=t.next,a===t?e.pending=null:(a=a.next,t.next=a,pg(e,a)))}function pu(e,t,a){var o=e.pending;if(e.pending=null,o!==null){o=o.next;do t.status="rejected",t.reason=a,mg(t),t=t.next;while(t!==o)}e.action=null}function mg(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function xg(e,t){return t}function mx(e,t){if(re){var a=he.formState;if(a!==null){e:{var o=Q;if(re){if(Ce){t:{for(var r=Ce,n=aa;r.nodeType!==8;){if(!n){r=null;break t}if(r=ra(r.nextSibling),r===null){r=null;break t}}n=r.data,r=n==="F!"||n==="F"?r:null}if(r){Ce=ra(r.nextSibling),o=r.data==="F!";break e}}Do(o)}o=!1}o&&(t=a[0])}}return a=bt(),a.memoizedState=a.baseState=t,o={pending:null,lanes:0,dispatch:null,lastRenderedReducer:xg,lastRenderedState:t},a.queue=o,a=Fg.bind(null,Q,o),o.dispatch=a,o=du(!1),n=md.bind(null,Q,!1,o.queue),o=bt(),r={state:t,dispatch:null,action:e,pending:null},o.queue=r,a=mw.bind(null,Q,r,n,a),r.dispatch=a,o.memoizedState=e,[t,a,!1]}function xx(e){var t=_e();return yg(t,ye,e)}function yg(e,t,a){if(t=fd(e,t,xg)[0],e=Qs(Va)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var o=Ul(t)}catch(l){throw l===wn?Hi:l}else o=t;t=_e();var r=t.queue,n=r.dispatch;return a!==t.memoizedState&&(Q.flags|=2048,mn(9,{destroy:void 0},xw.bind(null,r,a),null)),[o,n,e]}function xw(e,t){e.action=t}function yx(e){var t=_e(),a=ye;if(a!==null)return yg(t,a,e);_e(),t=t.memoizedState,a=_e();var o=a.queue.dispatch;return a.memoizedState=e,[t,o,!1]}function mn(e,t,a,o){return e={tag:e,create:a,deps:o,inst:t,next:null},t=Q.updateQueue,t===null&&(t=_i(),Q.updateQueue=t),a=t.lastEffect,a===null?t.lastEffect=e.next=e:(o=a.next,a.next=e,e.next=o,t.lastEffect=e),e}function gg(){return _e().memoizedState}function Ks(e,t,a,o){var r=bt();Q.flags|=e,r.memoizedState=mn(1|t,{destroy:void 0},a,o===void 0?null:o)}function qi(e,t,a,o){var r=_e();o=o===void 0?null:o;var n=r.memoizedState.inst;ye!==null&&o!==null&&od(o,ye.memoizedState.deps)?r.memoizedState=mn(t,n,a,o):(Q.flags|=e,r.memoizedState=mn(1|t,n,a,o))}function gx(e,t){Ks(8390656,8,e,t)}function cd(e,t){qi(2048,8,e,t)}function yw(e){Q.flags|=4;var t=Q.updateQueue;if(t===null)t=_i(),Q.updateQueue=t,t.events=[e];else{var a=t.events;a===null?t.events=[e]:a.push(e)}}function hg(e){var t=_e().memoizedState;return yw({ref:t,nextImpl:e}),function(){if((fe&2)!==0)throw Error(F(440));return t.impl.apply(void 0,arguments)}}function Ig(e,t){return qi(4,2,e,t)}function bg(e,t){return qi(4,4,e,t)}function vg(e,t){if(typeof t=="function"){e=e();var a=t(e);return function(){typeof a=="function"?a():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Sg(e,t,a){a=a!=null?a.concat([e]):null,qi(4,4,vg.bind(null,t,e),a)}function ud(){}function wg(e,t){var a=_e();t=t===void 0?null:t;var o=a.memoizedState;return t!==null&&od(t,o[1])?o[0]:(a.memoizedState=[e,t],e)}function Cg(e,t){var a=_e();t=t===void 0?null:t;var o=a.memoizedState;if(t!==null&&od(t,o[1]))return o[0];if(o=e(),fr){go(!0);try{e()}finally{go(!1)}}return a.memoizedState=[o,t],o}function dd(e,t,a){return a===void 0||(ja&1073741824)!==0&&(oe&261930)===0?e.memoizedState=t:(e.memoizedState=a,e=dh(),Q.lanes|=e,Bo|=e,a)}function kg(e,t,a,o){return qt(a,t)?a:pn.current!==null?(e=dd(e,a,o),qt(e,t)||(Ye=!0),e):(ja&42)===0||(ja&1073741824)!==0&&(oe&261930)===0?(Ye=!0,e.memoizedState=a):(e=dh(),Q.lanes|=e,Bo|=e,t)}function Ag(e,t,a,o,r){var n=ce.p;ce.p=n!==0&&8>n?n:8;var l=G.T,s={};G.T=s,md(e,!1,t,a);try{var i=r(),f=G.S;if(f!==null&&f(s,i),i!==null&&typeof i=="object"&&typeof i.then=="function"){var d=uw(i,o);xl(e,t,d,Pt(e))}else xl(e,t,o,Pt(e))}catch(x){xl(e,t,{then:function(){},status:"rejected",reason:x},Pt())}finally{ce.p=n,l!==null&&s.types!==null&&(l.types=s.types),G.T=l}}function gw(){}function mu(e,t,a,o){if(e.tag!==5)throw Error(F(476));var r=Rg(e).queue;Ag(e,r,t,tr,a===null?gw:function(){return Mg(e),a(o)})}function Rg(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:tr,baseState:tr,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Va,lastRenderedState:tr},next:null};var a={};return t.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Va,lastRenderedState:a},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function Mg(e){var t=Rg(e);t.next===null&&(t=e.alternate.memoizedState),xl(e,t.next.queue,{},Pt())}function pd(){return it(Dl)}function Tg(){return _e().memoizedState}function Eg(){return _e().memoizedState}function hw(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var a=Pt();e=Co(a);var o=ko(t,e,a);o!==null&&(At(o,t,a),dl(o,t,a)),t={cache:$u()},e.payload=t;return}t=t.return}}function Iw(e,t,a){var o=Pt();a={lane:o,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},Ui(e)?Dg(t,a):(a=Qu(e,t,a,o),a!==null&&(At(a,e,o),Ng(a,t,o)))}function Fg(e,t,a){var o=Pt();xl(e,t,a,o)}function xl(e,t,a,o){var r={lane:o,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(Ui(e))Dg(t,r);else{var n=e.alternate;if(e.lanes===0&&(n===null||n.lanes===0)&&(n=t.lastRenderedReducer,n!==null))try{var l=t.lastRenderedState,s=n(l,a);if(r.hasEagerState=!0,r.eagerState=s,qt(s,l))return zi(e,t,r,0),he===null&&Li(),!1}catch{}if(a=Qu(e,t,r,o),a!==null)return At(a,e,o),Ng(a,t,o),!0}return!1}function md(e,t,a,o){if(o={lane:2,revertLane:wd(),gesture:null,action:o,hasEagerState:!1,eagerState:null,next:null},Ui(e)){if(t)throw Error(F(479))}else t=Qu(e,a,o,2),t!==null&&At(t,e,2)}function Ui(e){var t=e.alternate;return e===Q||t!==null&&t===Q}function Dg(e,t){ln=xi=!0;var a=e.pending;a===null?t.next=t:(t.next=a.next,a.next=t),e.pending=t}function Ng(e,t,a){if((a&4194048)!==0){var o=t.lanes;o&=e.pendingLanes,a|=o,t.lanes=a,hy(e,a)}}var Tl={readContext:it,use:Pi,useCallback:Ne,useContext:Ne,useEffect:Ne,useImperativeHandle:Ne,useLayoutEffect:Ne,useInsertionEffect:Ne,useMemo:Ne,useReducer:Ne,useRef:Ne,useState:Ne,useDebugValue:Ne,useDeferredValue:Ne,useTransition:Ne,useSyncExternalStore:Ne,useId:Ne,useHostTransitionStatus:Ne,useFormState:Ne,useActionState:Ne,useOptimistic:Ne,useMemoCache:Ne,useCacheRefresh:Ne};Tl.useEffectEvent=Ne;var Bg={readContext:it,use:Pi,useCallback:function(e,t){return bt().memoizedState=[e,t===void 0?null:t],e},useContext:it,useEffect:gx,useImperativeHandle:function(e,t,a){a=a!=null?a.concat([e]):null,Ks(4194308,4,vg.bind(null,t,e),a)},useLayoutEffect:function(e,t){return Ks(4194308,4,e,t)},useInsertionEffect:function(e,t){Ks(4,2,e,t)},useMemo:function(e,t){var a=bt();t=t===void 0?null:t;var o=e();if(fr){go(!0);try{e()}finally{go(!1)}}return a.memoizedState=[o,t],o},useReducer:function(e,t,a){var o=bt();if(a!==void 0){var r=a(t);if(fr){go(!0);try{a(t)}finally{go(!1)}}}else r=t;return o.memoizedState=o.baseState=r,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:r},o.queue=e,e=e.dispatch=Iw.bind(null,Q,e),[o.memoizedState,e]},useRef:function(e){var t=bt();return e={current:e},t.memoizedState=e},useState:function(e){e=du(e);var t=e.queue,a=Fg.bind(null,Q,t);return t.dispatch=a,[e.memoizedState,a]},useDebugValue:ud,useDeferredValue:function(e,t){var a=bt();return dd(a,e,t)},useTransition:function(){var e=du(!1);return e=Ag.bind(null,Q,e.queue,!0,!1),bt().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,a){var o=Q,r=bt();if(re){if(a===void 0)throw Error(F(407));a=a()}else{if(a=t(),he===null)throw Error(F(349));(oe&127)!==0||sg(o,t,a)}r.memoizedState=a;var n={value:a,getSnapshot:t};return r.queue=n,gx(fg.bind(null,o,n,e),[e]),o.flags|=2048,mn(9,{destroy:void 0},ig.bind(null,o,n,a,t),null),a},useId:function(){var e=bt(),t=he.identifierPrefix;if(re){var a=va,o=ba;a=(o&~(1<<32-_t(o)-1)).toString(32)+a,t="_"+t+"R_"+a,a=yi++,0<a&&(t+="H"+a.toString(32)),t+="_"}else a=dw++,t="_"+t+"r_"+a.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:pd,useFormState:mx,useActionState:mx,useOptimistic:function(e){var t=bt();t.memoizedState=t.baseState=e;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=a,t=md.bind(null,Q,!0,a),a.dispatch=t,[e,t]},useMemoCache:id,useCacheRefresh:function(){return bt().memoizedState=hw.bind(null,Q)},useEffectEvent:function(e){var t=bt(),a={impl:e};return t.memoizedState=a,function(){if((fe&2)!==0)throw Error(F(440));return a.impl.apply(void 0,arguments)}}},xd={readContext:it,use:Pi,useCallback:wg,useContext:it,useEffect:cd,useImperativeHandle:Sg,useInsertionEffect:Ig,useLayoutEffect:bg,useMemo:Cg,useReducer:Qs,useRef:gg,useState:function(){return Qs(Va)},useDebugValue:ud,useDeferredValue:function(e,t){var a=_e();return kg(a,ye.memoizedState,e,t)},useTransition:function(){var e=Qs(Va)[0],t=_e().memoizedState;return[typeof e=="boolean"?e:Ul(e),t]},useSyncExternalStore:lg,useId:Tg,useHostTransitionStatus:pd,useFormState:xx,useActionState:xx,useOptimistic:function(e,t){var a=_e();return dg(a,ye,e,t)},useMemoCache:id,useCacheRefresh:Eg};xd.useEffectEvent=hg;var Og={readContext:it,use:Pi,useCallback:wg,useContext:it,useEffect:cd,useImperativeHandle:Sg,useInsertionEffect:Ig,useLayoutEffect:bg,useMemo:Cg,useReducer:Sc,useRef:gg,useState:function(){return Sc(Va)},useDebugValue:ud,useDeferredValue:function(e,t){var a=_e();return ye===null?dd(a,e,t):kg(a,ye.memoizedState,e,t)},useTransition:function(){var e=Sc(Va)[0],t=_e().memoizedState;return[typeof e=="boolean"?e:Ul(e),t]},useSyncExternalStore:lg,useId:Tg,useHostTransitionStatus:pd,useFormState:yx,useActionState:yx,useOptimistic:function(e,t){var a=_e();return ye!==null?dg(a,ye,e,t):(a.baseState=e,[e,a.queue.dispatch])},useMemoCache:id,useCacheRefresh:Eg};Og.useEffectEvent=hg;function wc(e,t,a,o){t=e.memoizedState,a=a(o,t),a=a==null?t:ke({},t,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var xu={enqueueSetState:function(e,t,a){e=e._reactInternals;var o=Pt(),r=Co(o);r.payload=t,a!=null&&(r.callback=a),t=ko(e,r,o),t!==null&&(At(t,e,o),dl(t,e,o))},enqueueReplaceState:function(e,t,a){e=e._reactInternals;var o=Pt(),r=Co(o);r.tag=1,r.payload=t,a!=null&&(r.callback=a),t=ko(e,r,o),t!==null&&(At(t,e,o),dl(t,e,o))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var a=Pt(),o=Co(a);o.tag=2,t!=null&&(o.callback=t),t=ko(e,o,a),t!==null&&(At(t,e,a),dl(t,e,a))}};function hx(e,t,a,o,r,n,l){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(o,n,l):t.prototype&&t.prototype.isPureReactComponent?!Cl(a,o)||!Cl(r,n):!0}function Ix(e,t,a,o){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(a,o),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(a,o),t.state!==e&&xu.enqueueReplaceState(t,t.state,null)}function cr(e,t){var a=t;if("ref"in t){a={};for(var o in t)o!=="ref"&&(a[o]=t[o])}if(e=e.defaultProps){a===t&&(a=ke({},a));for(var r in e)a[r]===void 0&&(a[r]=e[r])}return a}function Lg(e){ii(e)}function zg(e){console.error(e)}function Hg(e){ii(e)}function gi(e,t){try{var a=e.onUncaughtError;a(t.value,{componentStack:t.stack})}catch(o){setTimeout(function(){throw o})}}function bx(e,t,a){try{var o=e.onCaughtError;o(a.value,{componentStack:a.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(r){setTimeout(function(){throw r})}}function yu(e,t,a){return a=Co(a),a.tag=3,a.payload={element:null},a.callback=function(){gi(e,t)},a}function _g(e){return e=Co(e),e.tag=3,e}function Pg(e,t,a,o){var r=a.type.getDerivedStateFromError;if(typeof r=="function"){var n=o.value;e.payload=function(){return r(n)},e.callback=function(){bx(t,a,o)}}var l=a.stateNode;l!==null&&typeof l.componentDidCatch=="function"&&(e.callback=function(){bx(t,a,o),typeof r!="function"&&(Ao===null?Ao=new Set([this]):Ao.add(this));var s=o.stack;this.componentDidCatch(o.value,{componentStack:s!==null?s:""})})}function bw(e,t,a,o,r){if(a.flags|=32768,o!==null&&typeof o=="object"&&typeof o.then=="function"){if(t=a.alternate,t!==null&&Sn(t,a,r,!0),a=Ut.current,a!==null){switch(a.tag){case 31:case 13:return oa===null?Si():a.alternate===null&&Be===0&&(Be=3),a.flags&=-257,a.flags|=65536,a.lanes=r,o===di?a.flags|=16384:(t=a.updateQueue,t===null?a.updateQueue=new Set([o]):t.add(o),Bc(e,o,r)),!1;case 22:return a.flags|=65536,o===di?a.flags|=16384:(t=a.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([o])},a.updateQueue=t):(a=t.retryQueue,a===null?t.retryQueue=new Set([o]):a.add(o)),Bc(e,o,r)),!1}throw Error(F(435,a.tag))}return Bc(e,o,r),Si(),!1}if(re)return t=Ut.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=r,o!==ou&&(e=Error(F(422),{cause:o}),Al(ta(e,a)))):(o!==ou&&(t=Error(F(423),{cause:o}),Al(ta(t,a))),e=e.current.alternate,e.flags|=65536,r&=-r,e.lanes|=r,o=ta(o,a),r=yu(e.stateNode,o,r),vc(e,r),Be!==4&&(Be=2)),!1;var n=Error(F(520),{cause:o});if(n=ta(n,a),hl===null?hl=[n]:hl.push(n),Be!==4&&(Be=2),t===null)return!0;o=ta(o,a),a=t;do{switch(a.tag){case 3:return a.flags|=65536,e=r&-r,a.lanes|=e,e=yu(a.stateNode,o,e),vc(a,e),!1;case 1:if(t=a.type,n=a.stateNode,(a.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||n!==null&&typeof n.componentDidCatch=="function"&&(Ao===null||!Ao.has(n))))return a.flags|=65536,r&=-r,a.lanes|=r,r=_g(r),Pg(r,e,a,o),vc(a,r),!1}a=a.return}while(a!==null);return!1}var yd=Error(F(461)),Ye=!1;function nt(e,t,a,o){t.child=e===null?eg(t,null,a,o):ir(t,e.child,a,o)}function vx(e,t,a,o,r){a=a.render;var n=t.ref;if("ref"in o){var l={};for(var s in o)s!=="ref"&&(l[s]=o[s])}else l=o;return sr(t),o=rd(e,t,a,l,n,r),s=nd(),e!==null&&!Ye?(ld(e,t,r),Ya(e,t,r)):(re&&s&&Zu(t),t.flags|=1,nt(e,t,o,r),t.child)}function Sx(e,t,a,o,r){if(e===null){var n=a.type;return typeof n=="function"&&!Ku(n)&&n.defaultProps===void 0&&a.compare===null?(t.tag=15,t.type=n,qg(e,t,n,o,r)):(e=Vs(a.type,null,o,t,t.mode,r),e.ref=t.ref,e.return=t,t.child=e)}if(n=e.child,!gd(e,r)){var l=n.memoizedProps;if(a=a.compare,a=a!==null?a:Cl,a(l,o)&&e.ref===t.ref)return Ya(e,t,r)}return t.flags|=1,e=qa(n,o),e.ref=t.ref,e.return=t,t.child=e}function qg(e,t,a,o,r){if(e!==null){var n=e.memoizedProps;if(Cl(n,o)&&e.ref===t.ref)if(Ye=!1,t.pendingProps=o=n,gd(e,r))(e.flags&131072)!==0&&(Ye=!0);else return t.lanes=e.lanes,Ya(e,t,r)}return gu(e,t,a,o,r)}function Ug(e,t,a,o){var r=o.children,n=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),o.mode==="hidden"){if((t.flags&128)!==0){if(n=n!==null?n.baseLanes|a:a,e!==null){for(o=t.child=e.child,r=0;o!==null;)r=r|o.lanes|o.childLanes,o=o.sibling;o=r&~n}else o=0,t.child=null;return wx(e,t,n,a,o)}if((a&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&Ys(t,n!==null?n.cachePool:null),n!==null?ux(t,n):cu(),og(t);else return o=t.lanes=536870912,wx(e,t,n!==null?n.baseLanes|a:a,a,o)}else n!==null?(Ys(t,n.cachePool),ux(t,n),xo(t),t.memoizedState=null):(e!==null&&Ys(t,null),cu(),xo(t));return nt(e,t,r,a),t.child}function ll(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function wx(e,t,a,o,r){var n=Ju();return n=n===null?null:{parent:Ve._currentValue,pool:n},t.memoizedState={baseLanes:a,cachePool:n},e!==null&&Ys(t,null),cu(),og(t),e!==null&&Sn(e,t,o,!0),t.childLanes=r,null}function Zs(e,t){return t=hi({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function Cx(e,t,a){return ir(t,e.child,null,a),e=Zs(t,t.pendingProps),e.flags|=2,Bt(t),t.memoizedState=null,e}function vw(e,t,a){var o=t.pendingProps,r=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(re){if(o.mode==="hidden")return e=Zs(t,o),t.lanes=536870912,ll(null,e);if(uu(t),(e=Ce)?(e=Bh(e,aa),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Fo!==null?{id:ba,overflow:va}:null,retryLane:536870912,hydrationErrors:null},a=Yy(e),a.return=t,t.child=a,st=t,Ce=null)):e=null,e===null)throw Do(t);return t.lanes=536870912,null}return Zs(t,o)}var n=e.memoizedState;if(n!==null){var l=n.dehydrated;if(uu(t),r)if(t.flags&256)t.flags&=-257,t=Cx(e,t,a);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(F(558));else if(Ye||Sn(e,t,a,!1),r=(a&e.childLanes)!==0,Ye||r){if(o=he,o!==null&&(l=Iy(o,a),l!==0&&l!==n.retryLane))throw n.retryLane=l,mr(e,l),At(o,e,l),yd;Si(),t=Cx(e,t,a)}else e=n.treeContext,Ce=ra(l.nextSibling),st=t,re=!0,wo=null,aa=!1,e!==null&&Ky(t,e),t=Zs(t,o),t.flags|=4096;return t}return e=qa(e.child,{mode:o.mode,children:o.children}),e.ref=t.ref,t.child=e,e.return=t,e}function Ws(e,t){var a=t.ref;if(a===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(F(284));(e===null||e.ref!==a)&&(t.flags|=4194816)}}function gu(e,t,a,o,r){return sr(t),a=rd(e,t,a,o,void 0,r),o=nd(),e!==null&&!Ye?(ld(e,t,r),Ya(e,t,r)):(re&&o&&Zu(t),t.flags|=1,nt(e,t,a,r),t.child)}function kx(e,t,a,o,r,n){return sr(t),t.updateQueue=null,a=ng(t,o,a,r),rg(e),o=nd(),e!==null&&!Ye?(ld(e,t,n),Ya(e,t,n)):(re&&o&&Zu(t),t.flags|=1,nt(e,t,a,n),t.child)}function Ax(e,t,a,o,r){if(sr(t),t.stateNode===null){var n=Wr,l=a.contextType;typeof l=="object"&&l!==null&&(n=it(l)),n=new a(o,n),t.memoizedState=n.state!==null&&n.state!==void 0?n.state:null,n.updater=xu,t.stateNode=n,n._reactInternals=t,n=t.stateNode,n.props=o,n.state=t.memoizedState,n.refs={},td(t),l=a.contextType,n.context=typeof l=="object"&&l!==null?it(l):Wr,n.state=t.memoizedState,l=a.getDerivedStateFromProps,typeof l=="function"&&(wc(t,a,l,o),n.state=t.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof n.getSnapshotBeforeUpdate=="function"||typeof n.UNSAFE_componentWillMount!="function"&&typeof n.componentWillMount!="function"||(l=n.state,typeof n.componentWillMount=="function"&&n.componentWillMount(),typeof n.UNSAFE_componentWillMount=="function"&&n.UNSAFE_componentWillMount(),l!==n.state&&xu.enqueueReplaceState(n,n.state,null),ml(t,o,n,r),pl(),n.state=t.memoizedState),typeof n.componentDidMount=="function"&&(t.flags|=4194308),o=!0}else if(e===null){n=t.stateNode;var s=t.memoizedProps,i=cr(a,s);n.props=i;var f=n.context,d=a.contextType;l=Wr,typeof d=="object"&&d!==null&&(l=it(d));var x=a.getDerivedStateFromProps;d=typeof x=="function"||typeof n.getSnapshotBeforeUpdate=="function",s=t.pendingProps!==s,d||typeof n.UNSAFE_componentWillReceiveProps!="function"&&typeof n.componentWillReceiveProps!="function"||(s||f!==l)&&Ix(t,n,o,l),uo=!1;var u=t.memoizedState;n.state=u,ml(t,o,n,r),pl(),f=t.memoizedState,s||u!==f||uo?(typeof x=="function"&&(wc(t,a,x,o),f=t.memoizedState),(i=uo||hx(t,a,i,o,u,f,l))?(d||typeof n.UNSAFE_componentWillMount!="function"&&typeof n.componentWillMount!="function"||(typeof n.componentWillMount=="function"&&n.componentWillMount(),typeof n.UNSAFE_componentWillMount=="function"&&n.UNSAFE_componentWillMount()),typeof n.componentDidMount=="function"&&(t.flags|=4194308)):(typeof n.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=o,t.memoizedState=f),n.props=o,n.state=f,n.context=l,o=i):(typeof n.componentDidMount=="function"&&(t.flags|=4194308),o=!1)}else{n=t.stateNode,iu(e,t),l=t.memoizedProps,d=cr(a,l),n.props=d,x=t.pendingProps,u=n.context,f=a.contextType,i=Wr,typeof f=="object"&&f!==null&&(i=it(f)),s=a.getDerivedStateFromProps,(f=typeof s=="function"||typeof n.getSnapshotBeforeUpdate=="function")||typeof n.UNSAFE_componentWillReceiveProps!="function"&&typeof n.componentWillReceiveProps!="function"||(l!==x||u!==i)&&Ix(t,n,o,i),uo=!1,u=t.memoizedState,n.state=u,ml(t,o,n,r),pl();var p=t.memoizedState;l!==x||u!==p||uo||e!==null&&e.dependencies!==null&&ui(e.dependencies)?(typeof s=="function"&&(wc(t,a,s,o),p=t.memoizedState),(d=uo||hx(t,a,d,o,u,p,i)||e!==null&&e.dependencies!==null&&ui(e.dependencies))?(f||typeof n.UNSAFE_componentWillUpdate!="function"&&typeof n.componentWillUpdate!="function"||(typeof n.componentWillUpdate=="function"&&n.componentWillUpdate(o,p,i),typeof n.UNSAFE_componentWillUpdate=="function"&&n.UNSAFE_componentWillUpdate(o,p,i)),typeof n.componentDidUpdate=="function"&&(t.flags|=4),typeof n.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof n.componentDidUpdate!="function"||l===e.memoizedProps&&u===e.memoizedState||(t.flags|=4),typeof n.getSnapshotBeforeUpdate!="function"||l===e.memoizedProps&&u===e.memoizedState||(t.flags|=1024),t.memoizedProps=o,t.memoizedState=p),n.props=o,n.state=p,n.context=i,o=d):(typeof n.componentDidUpdate!="function"||l===e.memoizedProps&&u===e.memoizedState||(t.flags|=4),typeof n.getSnapshotBeforeUpdate!="function"||l===e.memoizedProps&&u===e.memoizedState||(t.flags|=1024),o=!1)}return n=o,Ws(e,t),o=(t.flags&128)!==0,n||o?(n=t.stateNode,a=o&&typeof a.getDerivedStateFromError!="function"?null:n.render(),t.flags|=1,e!==null&&o?(t.child=ir(t,e.child,null,r),t.child=ir(t,null,a,r)):nt(e,t,a,r),t.memoizedState=n.state,e=t.child):e=Ya(e,t,r),e}function Rx(e,t,a,o){return lr(),t.flags|=256,nt(e,t,a,o),t.child}var Cc={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function kc(e){return{baseLanes:e,cachePool:Wy()}}function Ac(e,t,a){return e=e!==null?e.childLanes&~a:0,t&&(e|=Lt),e}function Xg(e,t,a){var o=t.pendingProps,r=!1,n=(t.flags&128)!==0,l;if((l=n)||(l=e!==null&&e.memoizedState===null?!1:(He.current&2)!==0),l&&(r=!0,t.flags&=-129),l=(t.flags&32)!==0,t.flags&=-33,e===null){if(re){if(r?mo(t):xo(t),(e=Ce)?(e=Bh(e,aa),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Fo!==null?{id:ba,overflow:va}:null,retryLane:536870912,hydrationErrors:null},a=Yy(e),a.return=t,t.child=a,st=t,Ce=null)):e=null,e===null)throw Do(t);return Fu(e)?t.lanes=32:t.lanes=536870912,null}var s=o.children;return o=o.fallback,r?(xo(t),r=t.mode,s=hi({mode:"hidden",children:s},r),o=ar(o,r,a,null),s.return=t,o.return=t,s.sibling=o,t.child=s,o=t.child,o.memoizedState=kc(a),o.childLanes=Ac(e,l,a),t.memoizedState=Cc,ll(null,o)):(mo(t),hu(t,s))}var i=e.memoizedState;if(i!==null&&(s=i.dehydrated,s!==null)){if(n)t.flags&256?(mo(t),t.flags&=-257,t=Rc(e,t,a)):t.memoizedState!==null?(xo(t),t.child=e.child,t.flags|=128,t=null):(xo(t),s=o.fallback,r=t.mode,o=hi({mode:"visible",children:o.children},r),s=ar(s,r,a,null),s.flags|=2,o.return=t,s.return=t,o.sibling=s,t.child=o,ir(t,e.child,null,a),o=t.child,o.memoizedState=kc(a),o.childLanes=Ac(e,l,a),t.memoizedState=Cc,t=ll(null,o));else if(mo(t),Fu(s)){if(l=s.nextSibling&&s.nextSibling.dataset,l)var f=l.dgst;l=f,o=Error(F(419)),o.stack="",o.digest=l,Al({value:o,source:null,stack:null}),t=Rc(e,t,a)}else if(Ye||Sn(e,t,a,!1),l=(a&e.childLanes)!==0,Ye||l){if(l=he,l!==null&&(o=Iy(l,a),o!==0&&o!==i.retryLane))throw i.retryLane=o,mr(e,o),At(l,e,o),yd;Eu(s)||Si(),t=Rc(e,t,a)}else Eu(s)?(t.flags|=192,t.child=e.child,t=null):(e=i.treeContext,Ce=ra(s.nextSibling),st=t,re=!0,wo=null,aa=!1,e!==null&&Ky(t,e),t=hu(t,o.children),t.flags|=4096);return t}return r?(xo(t),s=o.fallback,r=t.mode,i=e.child,f=i.sibling,o=qa(i,{mode:"hidden",children:o.children}),o.subtreeFlags=i.subtreeFlags&65011712,f!==null?s=qa(f,s):(s=ar(s,r,a,null),s.flags|=2),s.return=t,o.return=t,o.sibling=s,t.child=o,ll(null,o),o=t.child,s=e.child.memoizedState,s===null?s=kc(a):(r=s.cachePool,r!==null?(i=Ve._currentValue,r=r.parent!==i?{parent:i,pool:i}:r):r=Wy(),s={baseLanes:s.baseLanes|a,cachePool:r}),o.memoizedState=s,o.childLanes=Ac(e,l,a),t.memoizedState=Cc,ll(e.child,o)):(mo(t),a=e.child,e=a.sibling,a=qa(a,{mode:"visible",children:o.children}),a.return=t,a.sibling=null,e!==null&&(l=t.deletions,l===null?(t.deletions=[e],t.flags|=16):l.push(e)),t.child=a,t.memoizedState=null,a)}function hu(e,t){return t=hi({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function hi(e,t){return e=Ot(22,e,null,t),e.lanes=0,e}function Rc(e,t,a){return ir(t,e.child,null,a),e=hu(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Mx(e,t,a){e.lanes|=t;var o=e.alternate;o!==null&&(o.lanes|=t),nu(e.return,t,a)}function Mc(e,t,a,o,r,n){var l=e.memoizedState;l===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:o,tail:a,tailMode:r,treeForkCount:n}:(l.isBackwards=t,l.rendering=null,l.renderingStartTime=0,l.last=o,l.tail=a,l.tailMode=r,l.treeForkCount=n)}function Gg(e,t,a){var o=t.pendingProps,r=o.revealOrder,n=o.tail;o=o.children;var l=He.current,s=(l&2)!==0;if(s?(l=l&1|2,t.flags|=128):l&=1,Ie(He,l),nt(e,t,o,a),o=re?kl:0,!s&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Mx(e,a,t);else if(e.tag===19)Mx(e,a,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(r){case"forwards":for(a=t.child,r=null;a!==null;)e=a.alternate,e!==null&&mi(e)===null&&(r=a),a=a.sibling;a=r,a===null?(r=t.child,t.child=null):(r=a.sibling,a.sibling=null),Mc(t,!1,r,a,n,o);break;case"backwards":case"unstable_legacy-backwards":for(a=null,r=t.child,t.child=null;r!==null;){if(e=r.alternate,e!==null&&mi(e)===null){t.child=r;break}e=r.sibling,r.sibling=a,a=r,r=e}Mc(t,!0,a,null,n,o);break;case"together":Mc(t,!1,null,null,void 0,o);break;default:t.memoizedState=null}return t.child}function Ya(e,t,a){if(e!==null&&(t.dependencies=e.dependencies),Bo|=t.lanes,(a&t.childLanes)===0)if(e!==null){if(Sn(e,t,a,!1),(a&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(F(153));if(t.child!==null){for(e=t.child,a=qa(e,e.pendingProps),t.child=a,a.return=t;e.sibling!==null;)e=e.sibling,a=a.sibling=qa(e,e.pendingProps),a.return=t;a.sibling=null}return t.child}function gd(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&ui(e)))}function Sw(e,t,a){switch(t.tag){case 3:ri(t,t.stateNode.containerInfo),po(t,Ve,e.memoizedState.cache),lr();break;case 27:case 5:Vc(t);break;case 4:ri(t,t.stateNode.containerInfo);break;case 10:po(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,uu(t),null;break;case 13:var o=t.memoizedState;if(o!==null)return o.dehydrated!==null?(mo(t),t.flags|=128,null):(a&t.child.childLanes)!==0?Xg(e,t,a):(mo(t),e=Ya(e,t,a),e!==null?e.sibling:null);mo(t);break;case 19:var r=(e.flags&128)!==0;if(o=(a&t.childLanes)!==0,o||(Sn(e,t,a,!1),o=(a&t.childLanes)!==0),r){if(o)return Gg(e,t,a);t.flags|=128}if(r=t.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),Ie(He,He.current),o)break;return null;case 22:return t.lanes=0,Ug(e,t,a,t.pendingProps);case 24:po(t,Ve,e.memoizedState.cache)}return Ya(e,t,a)}function jg(e,t,a){if(e!==null)if(e.memoizedProps!==t.pendingProps)Ye=!0;else{if(!gd(e,a)&&(t.flags&128)===0)return Ye=!1,Sw(e,t,a);Ye=(e.flags&131072)!==0}else Ye=!1,re&&(t.flags&1048576)!==0&&Qy(t,kl,t.index);switch(t.lanes=0,t.tag){case 16:e:{var o=t.pendingProps;if(e=Jo(t.elementType),t.type=e,typeof e=="function")Ku(e)?(o=cr(e,o),t.tag=1,t=Ax(null,t,e,o,a)):(t.tag=0,t=gu(null,t,e,o,a));else{if(e!=null){var r=e.$$typeof;if(r===Ou){t.tag=11,t=vx(null,t,e,o,a);break e}else if(r===Lu){t.tag=14,t=Sx(null,t,e,o,a);break e}}throw t=Gc(e)||e,Error(F(306,t,""))}}return t;case 0:return gu(e,t,t.type,t.pendingProps,a);case 1:return o=t.type,r=cr(o,t.pendingProps),Ax(e,t,o,r,a);case 3:e:{if(ri(t,t.stateNode.containerInfo),e===null)throw Error(F(387));o=t.pendingProps;var n=t.memoizedState;r=n.element,iu(e,t),ml(t,o,null,a);var l=t.memoizedState;if(o=l.cache,po(t,Ve,o),o!==n.cache&&lu(t,[Ve],a,!0),pl(),o=l.element,n.isDehydrated)if(n={element:o,isDehydrated:!1,cache:l.cache},t.updateQueue.baseState=n,t.memoizedState=n,t.flags&256){t=Rx(e,t,o,a);break e}else if(o!==r){r=ta(Error(F(424)),t),Al(r),t=Rx(e,t,o,a);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,Ce=ra(e.firstChild),st=t,re=!0,wo=null,aa=!0,a=eg(t,null,o,a),t.child=a;a;)a.flags=a.flags&-3|4096,a=a.sibling;else{if(lr(),o===r){t=Ya(e,t,a);break e}nt(e,t,o,a)}t=t.child}return t;case 26:return Ws(e,t),e===null?(a=Zx(t.type,null,t.pendingProps,null))?t.memoizedState=a:re||(a=t.type,e=t.pendingProps,o=Ai(So.current).createElement(a),o[lt]=t,o[Rt]=e,ft(o,a,e),tt(o),t.stateNode=o):t.memoizedState=Zx(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return Vc(t),e===null&&re&&(o=t.stateNode=Oh(t.type,t.pendingProps,So.current),st=t,aa=!0,r=Ce,Lo(t.type)?(Du=r,Ce=ra(o.firstChild)):Ce=r),nt(e,t,t.pendingProps.children,a),Ws(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&re&&((r=o=Ce)&&(o=Zw(o,t.type,t.pendingProps,aa),o!==null?(t.stateNode=o,st=t,Ce=ra(o.firstChild),aa=!1,r=!0):r=!1),r||Do(t)),Vc(t),r=t.type,n=t.pendingProps,l=e!==null?e.memoizedProps:null,o=n.children,Mu(r,n)?o=null:l!==null&&Mu(r,l)&&(t.flags|=32),t.memoizedState!==null&&(r=rd(e,t,pw,null,null,a),Dl._currentValue=r),Ws(e,t),nt(e,t,o,a),t.child;case 6:return e===null&&re&&((e=a=Ce)&&(a=Ww(a,t.pendingProps,aa),a!==null?(t.stateNode=a,st=t,Ce=null,e=!0):e=!1),e||Do(t)),null;case 13:return Xg(e,t,a);case 4:return ri(t,t.stateNode.containerInfo),o=t.pendingProps,e===null?t.child=ir(t,null,o,a):nt(e,t,o,a),t.child;case 11:return vx(e,t,t.type,t.pendingProps,a);case 7:return nt(e,t,t.pendingProps,a),t.child;case 8:return nt(e,t,t.pendingProps.children,a),t.child;case 12:return nt(e,t,t.pendingProps.children,a),t.child;case 10:return o=t.pendingProps,po(t,t.type,o.value),nt(e,t,o.children,a),t.child;case 9:return r=t.type._context,o=t.pendingProps.children,sr(t),r=it(r),o=o(r),t.flags|=1,nt(e,t,o,a),t.child;case 14:return Sx(e,t,t.type,t.pendingProps,a);case 15:return qg(e,t,t.type,t.pendingProps,a);case 19:return Gg(e,t,a);case 31:return vw(e,t,a);case 22:return Ug(e,t,a,t.pendingProps);case 24:return sr(t),o=it(Ve),e===null?(r=Ju(),r===null&&(r=he,n=$u(),r.pooledCache=n,n.refCount++,n!==null&&(r.pooledCacheLanes|=a),r=n),t.memoizedState={parent:o,cache:r},td(t),po(t,Ve,r)):((e.lanes&a)!==0&&(iu(e,t),ml(t,null,null,a),pl()),r=e.memoizedState,n=t.memoizedState,r.parent!==o?(r={parent:o,cache:o},t.memoizedState=r,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=r),po(t,Ve,o)):(o=n.cache,po(t,Ve,o),o!==r.cache&&lu(t,[Ve],a,!0))),nt(e,t,t.pendingProps.children,a),t.child;case 29:throw t.pendingProps}throw Error(F(156,t.tag))}function Da(e){e.flags|=4}function Tc(e,t,a,o,r){if((t=(e.mode&32)!==0)&&(t=!1),t){if(e.flags|=16777216,(r&335544128)===r)if(e.stateNode.complete)e.flags|=8192;else if(xh())e.flags|=8192;else throw rr=di,ed}else e.flags&=-16777217}function Tx(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!Hh(t))if(xh())e.flags|=8192;else throw rr=di,ed}function Os(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?yy():536870912,e.lanes|=t,xn|=t)}function Jn(e,t){if(!re)switch(e.tailMode){case"hidden":t=e.tail;for(var a=null;t!==null;)t.alternate!==null&&(a=t),t=t.sibling;a===null?e.tail=null:a.sibling=null;break;case"collapsed":a=e.tail;for(var o=null;a!==null;)a.alternate!==null&&(o=a),a=a.sibling;o===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:o.sibling=null}}function we(e){var t=e.alternate!==null&&e.alternate.child===e.child,a=0,o=0;if(t)for(var r=e.child;r!==null;)a|=r.lanes|r.childLanes,o|=r.subtreeFlags&65011712,o|=r.flags&65011712,r.return=e,r=r.sibling;else for(r=e.child;r!==null;)a|=r.lanes|r.childLanes,o|=r.subtreeFlags,o|=r.flags,r.return=e,r=r.sibling;return e.subtreeFlags|=o,e.childLanes=a,t}function ww(e,t,a){var o=t.pendingProps;switch(Wu(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return we(t),null;case 1:return we(t),null;case 3:return a=t.stateNode,o=null,e!==null&&(o=e.memoizedState.cache),t.memoizedState.cache!==o&&(t.flags|=2048),Ua(Ve),fn(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(e===null||e.child===null)&&(_r(t)?Da(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,bc())),we(t),null;case 26:var r=t.type,n=t.memoizedState;return e===null?(Da(t),n!==null?(we(t),Tx(t,n)):(we(t),Tc(t,r,null,o,a))):n?n!==e.memoizedState?(Da(t),we(t),Tx(t,n)):(we(t),t.flags&=-16777217):(e=e.memoizedProps,e!==o&&Da(t),we(t),Tc(t,r,e,o,a)),null;case 27:if(ni(t),a=So.current,r=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==o&&Da(t);else{if(!o){if(t.stateNode===null)throw Error(F(166));return we(t),null}e=wa.current,_r(t)?rx(t,e):(e=Oh(r,o,a),t.stateNode=e,Da(t))}return we(t),null;case 5:if(ni(t),r=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==o&&Da(t);else{if(!o){if(t.stateNode===null)throw Error(F(166));return we(t),null}if(n=wa.current,_r(t))rx(t,n);else{var l=Ai(So.current);switch(n){case 1:n=l.createElementNS("http://www.w3.org/2000/svg",r);break;case 2:n=l.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;default:switch(r){case"svg":n=l.createElementNS("http://www.w3.org/2000/svg",r);break;case"math":n=l.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;case"script":n=l.createElement("div"),n.innerHTML="<script><\/script>",n=n.removeChild(n.firstChild);break;case"select":n=typeof o.is=="string"?l.createElement("select",{is:o.is}):l.createElement("select"),o.multiple?n.multiple=!0:o.size&&(n.size=o.size);break;default:n=typeof o.is=="string"?l.createElement(r,{is:o.is}):l.createElement(r)}}n[lt]=t,n[Rt]=o;e:for(l=t.child;l!==null;){if(l.tag===5||l.tag===6)n.appendChild(l.stateNode);else if(l.tag!==4&&l.tag!==27&&l.child!==null){l.child.return=l,l=l.child;continue}if(l===t)break e;for(;l.sibling===null;){if(l.return===null||l.return===t)break e;l=l.return}l.sibling.return=l.return,l=l.sibling}t.stateNode=n;e:switch(ft(n,r,o),r){case"button":case"input":case"select":case"textarea":o=!!o.autoFocus;break e;case"img":o=!0;break e;default:o=!1}o&&Da(t)}}return we(t),Tc(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,a),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==o&&Da(t);else{if(typeof o!="string"&&t.stateNode===null)throw Error(F(166));if(e=So.current,_r(t)){if(e=t.stateNode,a=t.memoizedProps,o=null,r=st,r!==null)switch(r.tag){case 27:case 5:o=r.memoizedProps}e[lt]=t,e=!!(e.nodeValue===a||o!==null&&o.suppressHydrationWarning===!0||Fh(e.nodeValue,a)),e||Do(t,!0)}else e=Ai(e).createTextNode(o),e[lt]=t,t.stateNode=e}return we(t),null;case 31:if(a=t.memoizedState,e===null||e.memoizedState!==null){if(o=_r(t),a!==null){if(e===null){if(!o)throw Error(F(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(F(557));e[lt]=t}else lr(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;we(t),e=!1}else a=bc(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),e=!0;if(!e)return t.flags&256?(Bt(t),t):(Bt(t),null);if((t.flags&128)!==0)throw Error(F(558))}return we(t),null;case 13:if(o=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(r=_r(t),o!==null&&o.dehydrated!==null){if(e===null){if(!r)throw Error(F(318));if(r=t.memoizedState,r=r!==null?r.dehydrated:null,!r)throw Error(F(317));r[lt]=t}else lr(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;we(t),r=!1}else r=bc(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=r),r=!0;if(!r)return t.flags&256?(Bt(t),t):(Bt(t),null)}return Bt(t),(t.flags&128)!==0?(t.lanes=a,t):(a=o!==null,e=e!==null&&e.memoizedState!==null,a&&(o=t.child,r=null,o.alternate!==null&&o.alternate.memoizedState!==null&&o.alternate.memoizedState.cachePool!==null&&(r=o.alternate.memoizedState.cachePool.pool),n=null,o.memoizedState!==null&&o.memoizedState.cachePool!==null&&(n=o.memoizedState.cachePool.pool),n!==r&&(o.flags|=2048)),a!==e&&a&&(t.child.flags|=8192),Os(t,t.updateQueue),we(t),null);case 4:return fn(),e===null&&Cd(t.stateNode.containerInfo),we(t),null;case 10:return Ua(t.type),we(t),null;case 19:if(at(He),o=t.memoizedState,o===null)return we(t),null;if(r=(t.flags&128)!==0,n=o.rendering,n===null)if(r)Jn(o,!1);else{if(Be!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(n=mi(e),n!==null){for(t.flags|=128,Jn(o,!1),e=n.updateQueue,t.updateQueue=e,Os(t,e),t.subtreeFlags=0,e=a,a=t.child;a!==null;)Vy(a,e),a=a.sibling;return Ie(He,He.current&1|2),re&&La(t,o.treeForkCount),t.child}e=e.sibling}o.tail!==null&&zt()>bi&&(t.flags|=128,r=!0,Jn(o,!1),t.lanes=4194304)}else{if(!r)if(e=mi(n),e!==null){if(t.flags|=128,r=!0,e=e.updateQueue,t.updateQueue=e,Os(t,e),Jn(o,!0),o.tail===null&&o.tailMode==="hidden"&&!n.alternate&&!re)return we(t),null}else 2*zt()-o.renderingStartTime>bi&&a!==536870912&&(t.flags|=128,r=!0,Jn(o,!1),t.lanes=4194304);o.isBackwards?(n.sibling=t.child,t.child=n):(e=o.last,e!==null?e.sibling=n:t.child=n,o.last=n)}return o.tail!==null?(e=o.tail,o.rendering=e,o.tail=e.sibling,o.renderingStartTime=zt(),e.sibling=null,a=He.current,Ie(He,r?a&1|2:a&1),re&&La(t,o.treeForkCount),e):(we(t),null);case 22:case 23:return Bt(t),ad(),o=t.memoizedState!==null,e!==null?e.memoizedState!==null!==o&&(t.flags|=8192):o&&(t.flags|=8192),o?(a&536870912)!==0&&(t.flags&128)===0&&(we(t),t.subtreeFlags&6&&(t.flags|=8192)):we(t),a=t.updateQueue,a!==null&&Os(t,a.retryQueue),a=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),o=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(o=t.memoizedState.cachePool.pool),o!==a&&(t.flags|=2048),e!==null&&at(or),null;case 24:return a=null,e!==null&&(a=e.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),Ua(Ve),we(t),null;case 25:return null;case 30:return null}throw Error(F(156,t.tag))}function Cw(e,t){switch(Wu(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Ua(Ve),fn(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return ni(t),null;case 31:if(t.memoizedState!==null){if(Bt(t),t.alternate===null)throw Error(F(340));lr()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(Bt(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(F(340));lr()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return at(He),null;case 4:return fn(),null;case 10:return Ua(t.type),null;case 22:case 23:return Bt(t),ad(),e!==null&&at(or),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return Ua(Ve),null;case 25:return null;default:return null}}function Vg(e,t){switch(Wu(t),t.tag){case 3:Ua(Ve),fn();break;case 26:case 27:case 5:ni(t);break;case 4:fn();break;case 31:t.memoizedState!==null&&Bt(t);break;case 13:Bt(t);break;case 19:at(He);break;case 10:Ua(t.type);break;case 22:case 23:Bt(t),ad(),e!==null&&at(or);break;case 24:Ua(Ve)}}function Xl(e,t){try{var a=t.updateQueue,o=a!==null?a.lastEffect:null;if(o!==null){var r=o.next;a=r;do{if((a.tag&e)===e){o=void 0;var n=a.create,l=a.inst;o=n(),l.destroy=o}a=a.next}while(a!==r)}}catch(s){me(t,t.return,s)}}function No(e,t,a){try{var o=t.updateQueue,r=o!==null?o.lastEffect:null;if(r!==null){var n=r.next;o=n;do{if((o.tag&e)===e){var l=o.inst,s=l.destroy;if(s!==void 0){l.destroy=void 0,r=t;var i=a,f=s;try{f()}catch(d){me(r,i,d)}}}o=o.next}while(o!==n)}}catch(d){me(t,t.return,d)}}function Yg(e){var t=e.updateQueue;if(t!==null){var a=e.stateNode;try{ag(t,a)}catch(o){me(e,e.return,o)}}}function Qg(e,t,a){a.props=cr(e.type,e.memoizedProps),a.state=e.memoizedState;try{a.componentWillUnmount()}catch(o){me(e,t,o)}}function yl(e,t){try{var a=e.ref;if(a!==null){switch(e.tag){case 26:case 27:case 5:var o=e.stateNode;break;case 30:o=e.stateNode;break;default:o=e.stateNode}typeof a=="function"?e.refCleanup=a(o):a.current=o}}catch(r){me(e,t,r)}}function Sa(e,t){var a=e.ref,o=e.refCleanup;if(a!==null)if(typeof o=="function")try{o()}catch(r){me(e,t,r)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(r){me(e,t,r)}else a.current=null}function Kg(e){var t=e.type,a=e.memoizedProps,o=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":a.autoFocus&&o.focus();break e;case"img":a.src?o.src=a.src:a.srcSet&&(o.srcset=a.srcSet)}}catch(r){me(e,e.return,r)}}function Ec(e,t,a){try{var o=e.stateNode;Gw(o,e.type,a,t),o[Rt]=t}catch(r){me(e,e.return,r)}}function Zg(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Lo(e.type)||e.tag===4}function Fc(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Zg(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Lo(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Iu(e,t,a){var o=e.tag;if(o===5||o===6)e=e.stateNode,t?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(e,t):(t=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,t.appendChild(e),a=a._reactRootContainer,a!=null||t.onclick!==null||(t.onclick=_a));else if(o!==4&&(o===27&&Lo(e.type)&&(a=e.stateNode,t=null),e=e.child,e!==null))for(Iu(e,t,a),e=e.sibling;e!==null;)Iu(e,t,a),e=e.sibling}function Ii(e,t,a){var o=e.tag;if(o===5||o===6)e=e.stateNode,t?a.insertBefore(e,t):a.appendChild(e);else if(o!==4&&(o===27&&Lo(e.type)&&(a=e.stateNode),e=e.child,e!==null))for(Ii(e,t,a),e=e.sibling;e!==null;)Ii(e,t,a),e=e.sibling}function Wg(e){var t=e.stateNode,a=e.memoizedProps;try{for(var o=e.type,r=t.attributes;r.length;)t.removeAttributeNode(r[0]);ft(t,o,a),t[lt]=e,t[Rt]=a}catch(n){me(e,e.return,n)}}var za=!1,je=!1,Dc=!1,Ex=typeof WeakSet=="function"?WeakSet:Set,et=null;function kw(e,t){if(e=e.containerInfo,Au=Ei,e=Hy(e),Vu(e)){if("selectionStart"in e)var a={start:e.selectionStart,end:e.selectionEnd};else e:{a=(a=e.ownerDocument)&&a.defaultView||window;var o=a.getSelection&&a.getSelection();if(o&&o.rangeCount!==0){a=o.anchorNode;var r=o.anchorOffset,n=o.focusNode;o=o.focusOffset;try{a.nodeType,n.nodeType}catch{a=null;break e}var l=0,s=-1,i=-1,f=0,d=0,x=e,u=null;t:for(;;){for(var p;x!==a||r!==0&&x.nodeType!==3||(s=l+r),x!==n||o!==0&&x.nodeType!==3||(i=l+o),x.nodeType===3&&(l+=x.nodeValue.length),(p=x.firstChild)!==null;)u=x,x=p;for(;;){if(x===e)break t;if(u===a&&++f===r&&(s=l),u===n&&++d===o&&(i=l),(p=x.nextSibling)!==null)break;x=u,u=x.parentNode}x=p}a=s===-1||i===-1?null:{start:s,end:i}}else a=null}a=a||{start:0,end:0}}else a=null;for(Ru={focusedElem:e,selectionRange:a},Ei=!1,et=t;et!==null;)if(t=et,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,et=e;else for(;et!==null;){switch(t=et,n=t.alternate,e=t.flags,t.tag){case 0:if((e&4)!==0&&(e=t.updateQueue,e=e!==null?e.events:null,e!==null))for(a=0;a<e.length;a++)r=e[a],r.ref.impl=r.nextImpl;break;case 11:case 15:break;case 1:if((e&1024)!==0&&n!==null){e=void 0,a=t,r=n.memoizedProps,n=n.memoizedState,o=a.stateNode;try{var v=cr(a.type,r);e=o.getSnapshotBeforeUpdate(v,n),o.__reactInternalSnapshotBeforeUpdate=e}catch(w){me(a,a.return,w)}}break;case 3:if((e&1024)!==0){if(e=t.stateNode.containerInfo,a=e.nodeType,a===9)Tu(e);else if(a===1)switch(e.nodeName){case"HEAD":case"HTML":case"BODY":Tu(e);break;default:e.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if((e&1024)!==0)throw Error(F(163))}if(e=t.sibling,e!==null){e.return=t.return,et=e;break}et=t.return}}function $g(e,t,a){var o=a.flags;switch(a.tag){case 0:case 11:case 15:Ba(e,a),o&4&&Xl(5,a);break;case 1:if(Ba(e,a),o&4)if(e=a.stateNode,t===null)try{e.componentDidMount()}catch(l){me(a,a.return,l)}else{var r=cr(a.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(r,t,e.__reactInternalSnapshotBeforeUpdate)}catch(l){me(a,a.return,l)}}o&64&&Yg(a),o&512&&yl(a,a.return);break;case 3:if(Ba(e,a),o&64&&(e=a.updateQueue,e!==null)){if(t=null,a.child!==null)switch(a.child.tag){case 27:case 5:t=a.child.stateNode;break;case 1:t=a.child.stateNode}try{ag(e,t)}catch(l){me(a,a.return,l)}}break;case 27:t===null&&o&4&&Wg(a);case 26:case 5:Ba(e,a),t===null&&o&4&&Kg(a),o&512&&yl(a,a.return);break;case 12:Ba(e,a);break;case 31:Ba(e,a),o&4&&th(e,a);break;case 13:Ba(e,a),o&4&&ah(e,a),o&64&&(e=a.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(a=Bw.bind(null,a),$w(e,a))));break;case 22:if(o=a.memoizedState!==null||za,!o){t=t!==null&&t.memoizedState!==null||je,r=za;var n=je;za=o,(je=t)&&!n?Oa(e,a,(a.subtreeFlags&8772)!==0):Ba(e,a),za=r,je=n}break;case 30:break;default:Ba(e,a)}}function Jg(e){var t=e.alternate;t!==null&&(e.alternate=null,Jg(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&Pu(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var Te=null,Ct=!1;function Na(e,t,a){for(a=a.child;a!==null;)eh(e,t,a),a=a.sibling}function eh(e,t,a){if(Ht&&typeof Ht.onCommitFiberUnmount=="function")try{Ht.onCommitFiberUnmount(Ll,a)}catch{}switch(a.tag){case 26:je||Sa(a,t),Na(e,t,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:je||Sa(a,t);var o=Te,r=Ct;Lo(a.type)&&(Te=a.stateNode,Ct=!1),Na(e,t,a),bl(a.stateNode),Te=o,Ct=r;break;case 5:je||Sa(a,t);case 6:if(o=Te,r=Ct,Te=null,Na(e,t,a),Te=o,Ct=r,Te!==null)if(Ct)try{(Te.nodeType===9?Te.body:Te.nodeName==="HTML"?Te.ownerDocument.body:Te).removeChild(a.stateNode)}catch(n){me(a,t,n)}else try{Te.removeChild(a.stateNode)}catch(n){me(a,t,n)}break;case 18:Te!==null&&(Ct?(e=Te,jx(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,a.stateNode),In(e)):jx(Te,a.stateNode));break;case 4:o=Te,r=Ct,Te=a.stateNode.containerInfo,Ct=!0,Na(e,t,a),Te=o,Ct=r;break;case 0:case 11:case 14:case 15:No(2,a,t),je||No(4,a,t),Na(e,t,a);break;case 1:je||(Sa(a,t),o=a.stateNode,typeof o.componentWillUnmount=="function"&&Qg(a,t,o)),Na(e,t,a);break;case 21:Na(e,t,a);break;case 22:je=(o=je)||a.memoizedState!==null,Na(e,t,a),je=o;break;default:Na(e,t,a)}}function th(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{In(e)}catch(a){me(t,t.return,a)}}}function ah(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{In(e)}catch(a){me(t,t.return,a)}}function Aw(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new Ex),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new Ex),t;default:throw Error(F(435,e.tag))}}function Ls(e,t){var a=Aw(e);t.forEach(function(o){if(!a.has(o)){a.add(o);var r=Ow.bind(null,e,o);o.then(r,r)}})}function St(e,t){var a=t.deletions;if(a!==null)for(var o=0;o<a.length;o++){var r=a[o],n=e,l=t,s=l;e:for(;s!==null;){switch(s.tag){case 27:if(Lo(s.type)){Te=s.stateNode,Ct=!1;break e}break;case 5:Te=s.stateNode,Ct=!1;break e;case 3:case 4:Te=s.stateNode.containerInfo,Ct=!0;break e}s=s.return}if(Te===null)throw Error(F(160));eh(n,l,r),Te=null,Ct=!1,n=r.alternate,n!==null&&(n.return=null),r.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)oh(t,e),t=t.sibling}var pa=null;function oh(e,t){var a=e.alternate,o=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:St(t,e),wt(e),o&4&&(No(3,e,e.return),Xl(3,e),No(5,e,e.return));break;case 1:St(t,e),wt(e),o&512&&(je||a===null||Sa(a,a.return)),o&64&&za&&(e=e.updateQueue,e!==null&&(o=e.callbacks,o!==null&&(a=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=a===null?o:a.concat(o))));break;case 26:var r=pa;if(St(t,e),wt(e),o&512&&(je||a===null||Sa(a,a.return)),o&4){var n=a!==null?a.memoizedState:null;if(o=e.memoizedState,a===null)if(o===null)if(e.stateNode===null){e:{o=e.type,a=e.memoizedProps,r=r.ownerDocument||r;t:switch(o){case"title":n=r.getElementsByTagName("title")[0],(!n||n[_l]||n[lt]||n.namespaceURI==="http://www.w3.org/2000/svg"||n.hasAttribute("itemprop"))&&(n=r.createElement(o),r.head.insertBefore(n,r.querySelector("head > title"))),ft(n,o,a),n[lt]=e,tt(n),o=n;break e;case"link":var l=$x("link","href",r).get(o+(a.href||""));if(l){for(var s=0;s<l.length;s++)if(n=l[s],n.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&n.getAttribute("rel")===(a.rel==null?null:a.rel)&&n.getAttribute("title")===(a.title==null?null:a.title)&&n.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){l.splice(s,1);break t}}n=r.createElement(o),ft(n,o,a),r.head.appendChild(n);break;case"meta":if(l=$x("meta","content",r).get(o+(a.content||""))){for(s=0;s<l.length;s++)if(n=l[s],n.getAttribute("content")===(a.content==null?null:""+a.content)&&n.getAttribute("name")===(a.name==null?null:a.name)&&n.getAttribute("property")===(a.property==null?null:a.property)&&n.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&n.getAttribute("charset")===(a.charSet==null?null:a.charSet)){l.splice(s,1);break t}}n=r.createElement(o),ft(n,o,a),r.head.appendChild(n);break;default:throw Error(F(468,o))}n[lt]=e,tt(n),o=n}e.stateNode=o}else Jx(r,e.type,e.stateNode);else e.stateNode=Wx(r,o,e.memoizedProps);else n!==o?(n===null?a.stateNode!==null&&(a=a.stateNode,a.parentNode.removeChild(a)):n.count--,o===null?Jx(r,e.type,e.stateNode):Wx(r,o,e.memoizedProps)):o===null&&e.stateNode!==null&&Ec(e,e.memoizedProps,a.memoizedProps)}break;case 27:St(t,e),wt(e),o&512&&(je||a===null||Sa(a,a.return)),a!==null&&o&4&&Ec(e,e.memoizedProps,a.memoizedProps);break;case 5:if(St(t,e),wt(e),o&512&&(je||a===null||Sa(a,a.return)),e.flags&32){r=e.stateNode;try{un(r,"")}catch(v){me(e,e.return,v)}}o&4&&e.stateNode!=null&&(r=e.memoizedProps,Ec(e,r,a!==null?a.memoizedProps:r)),o&1024&&(Dc=!0);break;case 6:if(St(t,e),wt(e),o&4){if(e.stateNode===null)throw Error(F(162));o=e.memoizedProps,a=e.stateNode;try{a.nodeValue=o}catch(v){me(e,e.return,v)}}break;case 3:if(ei=null,r=pa,pa=Ri(t.containerInfo),St(t,e),pa=r,wt(e),o&4&&a!==null&&a.memoizedState.isDehydrated)try{In(t.containerInfo)}catch(v){me(e,e.return,v)}Dc&&(Dc=!1,rh(e));break;case 4:o=pa,pa=Ri(e.stateNode.containerInfo),St(t,e),wt(e),pa=o;break;case 12:St(t,e),wt(e);break;case 31:St(t,e),wt(e),o&4&&(o=e.updateQueue,o!==null&&(e.updateQueue=null,Ls(e,o)));break;case 13:St(t,e),wt(e),e.child.flags&8192&&e.memoizedState!==null!=(a!==null&&a.memoizedState!==null)&&(Xi=zt()),o&4&&(o=e.updateQueue,o!==null&&(e.updateQueue=null,Ls(e,o)));break;case 22:r=e.memoizedState!==null;var i=a!==null&&a.memoizedState!==null,f=za,d=je;if(za=f||r,je=d||i,St(t,e),je=d,za=f,wt(e),o&8192)e:for(t=e.stateNode,t._visibility=r?t._visibility&-2:t._visibility|1,r&&(a===null||i||za||je||er(e)),a=null,t=e;;){if(t.tag===5||t.tag===26){if(a===null){i=a=t;try{if(n=i.stateNode,r)l=n.style,typeof l.setProperty=="function"?l.setProperty("display","none","important"):l.display="none";else{s=i.stateNode;var x=i.memoizedProps.style,u=x!=null&&x.hasOwnProperty("display")?x.display:null;s.style.display=u==null||typeof u=="boolean"?"":(""+u).trim()}}catch(v){me(i,i.return,v)}}}else if(t.tag===6){if(a===null){i=t;try{i.stateNode.nodeValue=r?"":i.memoizedProps}catch(v){me(i,i.return,v)}}}else if(t.tag===18){if(a===null){i=t;try{var p=i.stateNode;r?Vx(p,!0):Vx(i.stateNode,!1)}catch(v){me(i,i.return,v)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===e)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;a===t&&(a=null),t=t.return}a===t&&(a=null),t.sibling.return=t.return,t=t.sibling}o&4&&(o=e.updateQueue,o!==null&&(a=o.retryQueue,a!==null&&(o.retryQueue=null,Ls(e,a))));break;case 19:St(t,e),wt(e),o&4&&(o=e.updateQueue,o!==null&&(e.updateQueue=null,Ls(e,o)));break;case 30:break;case 21:break;default:St(t,e),wt(e)}}function wt(e){var t=e.flags;if(t&2){try{for(var a,o=e.return;o!==null;){if(Zg(o)){a=o;break}o=o.return}if(a==null)throw Error(F(160));switch(a.tag){case 27:var r=a.stateNode,n=Fc(e);Ii(e,n,r);break;case 5:var l=a.stateNode;a.flags&32&&(un(l,""),a.flags&=-33);var s=Fc(e);Ii(e,s,l);break;case 3:case 4:var i=a.stateNode.containerInfo,f=Fc(e);Iu(e,f,i);break;default:throw Error(F(161))}}catch(d){me(e,e.return,d)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function rh(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;rh(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),e=e.sibling}}function Ba(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)$g(e,t.alternate,t),t=t.sibling}function er(e){for(e=e.child;e!==null;){var t=e;switch(t.tag){case 0:case 11:case 14:case 15:No(4,t,t.return),er(t);break;case 1:Sa(t,t.return);var a=t.stateNode;typeof a.componentWillUnmount=="function"&&Qg(t,t.return,a),er(t);break;case 27:bl(t.stateNode);case 26:case 5:Sa(t,t.return),er(t);break;case 22:t.memoizedState===null&&er(t);break;case 30:er(t);break;default:er(t)}e=e.sibling}}function Oa(e,t,a){for(a=a&&(t.subtreeFlags&8772)!==0,t=t.child;t!==null;){var o=t.alternate,r=e,n=t,l=n.flags;switch(n.tag){case 0:case 11:case 15:Oa(r,n,a),Xl(4,n);break;case 1:if(Oa(r,n,a),o=n,r=o.stateNode,typeof r.componentDidMount=="function")try{r.componentDidMount()}catch(f){me(o,o.return,f)}if(o=n,r=o.updateQueue,r!==null){var s=o.stateNode;try{var i=r.shared.hiddenCallbacks;if(i!==null)for(r.shared.hiddenCallbacks=null,r=0;r<i.length;r++)tg(i[r],s)}catch(f){me(o,o.return,f)}}a&&l&64&&Yg(n),yl(n,n.return);break;case 27:Wg(n);case 26:case 5:Oa(r,n,a),a&&o===null&&l&4&&Kg(n),yl(n,n.return);break;case 12:Oa(r,n,a);break;case 31:Oa(r,n,a),a&&l&4&&th(r,n);break;case 13:Oa(r,n,a),a&&l&4&&ah(r,n);break;case 22:n.memoizedState===null&&Oa(r,n,a),yl(n,n.return);break;case 30:break;default:Oa(r,n,a)}t=t.sibling}}function hd(e,t){var a=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==a&&(e!=null&&e.refCount++,a!=null&&ql(a))}function Id(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&ql(e))}function da(e,t,a,o){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)nh(e,t,a,o),t=t.sibling}function nh(e,t,a,o){var r=t.flags;switch(t.tag){case 0:case 11:case 15:da(e,t,a,o),r&2048&&Xl(9,t);break;case 1:da(e,t,a,o);break;case 3:da(e,t,a,o),r&2048&&(e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&ql(e)));break;case 12:if(r&2048){da(e,t,a,o),e=t.stateNode;try{var n=t.memoizedProps,l=n.id,s=n.onPostCommit;typeof s=="function"&&s(l,t.alternate===null?"mount":"update",e.passiveEffectDuration,-0)}catch(i){me(t,t.return,i)}}else da(e,t,a,o);break;case 31:da(e,t,a,o);break;case 13:da(e,t,a,o);break;case 23:break;case 22:n=t.stateNode,l=t.alternate,t.memoizedState!==null?n._visibility&2?da(e,t,a,o):gl(e,t):n._visibility&2?da(e,t,a,o):(n._visibility|=2,qr(e,t,a,o,(t.subtreeFlags&10256)!==0||!1)),r&2048&&hd(l,t);break;case 24:da(e,t,a,o),r&2048&&Id(t.alternate,t);break;default:da(e,t,a,o)}}function qr(e,t,a,o,r){for(r=r&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var n=e,l=t,s=a,i=o,f=l.flags;switch(l.tag){case 0:case 11:case 15:qr(n,l,s,i,r),Xl(8,l);break;case 23:break;case 22:var d=l.stateNode;l.memoizedState!==null?d._visibility&2?qr(n,l,s,i,r):gl(n,l):(d._visibility|=2,qr(n,l,s,i,r)),r&&f&2048&&hd(l.alternate,l);break;case 24:qr(n,l,s,i,r),r&&f&2048&&Id(l.alternate,l);break;default:qr(n,l,s,i,r)}t=t.sibling}}function gl(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var a=e,o=t,r=o.flags;switch(o.tag){case 22:gl(a,o),r&2048&&hd(o.alternate,o);break;case 24:gl(a,o),r&2048&&Id(o.alternate,o);break;default:gl(a,o)}t=t.sibling}}var sl=8192;function Pr(e,t,a){if(e.subtreeFlags&sl)for(e=e.child;e!==null;)lh(e,t,a),e=e.sibling}function lh(e,t,a){switch(e.tag){case 26:Pr(e,t,a),e.flags&sl&&e.memoizedState!==null&&cC(a,pa,e.memoizedState,e.memoizedProps);break;case 5:Pr(e,t,a);break;case 3:case 4:var o=pa;pa=Ri(e.stateNode.containerInfo),Pr(e,t,a),pa=o;break;case 22:e.memoizedState===null&&(o=e.alternate,o!==null&&o.memoizedState!==null?(o=sl,sl=16777216,Pr(e,t,a),sl=o):Pr(e,t,a));break;default:Pr(e,t,a)}}function sh(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function el(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var o=t[a];et=o,fh(o,e)}sh(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)ih(e),e=e.sibling}function ih(e){switch(e.tag){case 0:case 11:case 15:el(e),e.flags&2048&&No(9,e,e.return);break;case 3:el(e);break;case 12:el(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,$s(e)):el(e);break;default:el(e)}}function $s(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var o=t[a];et=o,fh(o,e)}sh(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:No(8,t,t.return),$s(t);break;case 22:a=t.stateNode,a._visibility&2&&(a._visibility&=-3,$s(t));break;default:$s(t)}e=e.sibling}}function fh(e,t){for(;et!==null;){var a=et;switch(a.tag){case 0:case 11:case 15:No(8,a,t);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var o=a.memoizedState.cachePool.pool;o!=null&&o.refCount++}break;case 24:ql(a.memoizedState.cache)}if(o=a.child,o!==null)o.return=a,et=o;else e:for(a=e;et!==null;){o=et;var r=o.sibling,n=o.return;if(Jg(o),o===a){et=null;break e}if(r!==null){r.return=n,et=r;break e}et=n}}}var Rw={getCacheForType:function(e){var t=it(Ve),a=t.data.get(e);return a===void 0&&(a=e(),t.data.set(e,a)),a},cacheSignal:function(){return it(Ve).controller.signal}},Mw=typeof WeakMap=="function"?WeakMap:Map,fe=0,he=null,ae=null,oe=0,pe=0,Nt=null,Io=!1,Cn=!1,bd=!1,Qa=0,Be=0,Bo=0,nr=0,vd=0,Lt=0,xn=0,hl=null,kt=null,bu=!1,Xi=0,ch=0,bi=1/0,vi=null,Ao=null,Qe=0,Ro=null,yn=null,Xa=0,vu=0,Su=null,uh=null,Il=0,wu=null;function Pt(){return(fe&2)!==0&&oe!==0?oe&-oe:G.T!==null?wd():by()}function dh(){if(Lt===0)if((oe&536870912)===0||re){var e=As;As<<=1,(As&3932160)===0&&(As=262144),Lt=e}else Lt=536870912;return e=Ut.current,e!==null&&(e.flags|=32),Lt}function At(e,t,a){(e===he&&(pe===2||pe===9)||e.cancelPendingCommit!==null)&&(gn(e,0),bo(e,oe,Lt,!1)),Hl(e,a),((fe&2)===0||e!==he)&&(e===he&&((fe&2)===0&&(nr|=a),Be===4&&bo(e,oe,Lt,!1)),ka(e))}function ph(e,t,a){if((fe&6)!==0)throw Error(F(327));var o=!a&&(t&127)===0&&(t&e.expiredLanes)===0||zl(e,t),r=o?Fw(e,t):Nc(e,t,!0),n=o;do{if(r===0){Cn&&!o&&bo(e,t,0,!1);break}else{if(a=e.current.alternate,n&&!Tw(a)){r=Nc(e,t,!1),n=!1;continue}if(r===2){if(n=t,e.errorRecoveryDisabledLanes&n)var l=0;else l=e.pendingLanes&-536870913,l=l!==0?l:l&536870912?536870912:0;if(l!==0){t=l;e:{var s=e;r=hl;var i=s.current.memoizedState.isDehydrated;if(i&&(gn(s,l).flags|=256),l=Nc(s,l,!1),l!==2){if(bd&&!i){s.errorRecoveryDisabledLanes|=n,nr|=n,r=4;break e}n=kt,kt=r,n!==null&&(kt===null?kt=n:kt.push.apply(kt,n))}r=l}if(n=!1,r!==2)continue}}if(r===1){gn(e,0),bo(e,t,0,!0);break}e:{switch(o=e,n=r,n){case 0:case 1:throw Error(F(345));case 4:if((t&4194048)!==t)break;case 6:bo(o,t,Lt,!Io);break e;case 2:kt=null;break;case 3:case 5:break;default:throw Error(F(329))}if((t&62914560)===t&&(r=Xi+300-zt(),10<r)){if(bo(o,t,Lt,!Io),Di(o,0,!0)!==0)break e;Xa=t,o.timeoutHandle=Nh(Fx.bind(null,o,a,kt,vi,bu,t,Lt,nr,xn,Io,n,"Throttled",-0,0),r);break e}Fx(o,a,kt,vi,bu,t,Lt,nr,xn,Io,n,null,-0,0)}}break}while(!0);ka(e)}function Fx(e,t,a,o,r,n,l,s,i,f,d,x,u,p){if(e.timeoutHandle=-1,x=t.subtreeFlags,x&8192||(x&16785408)===16785408){x={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:_a},lh(t,n,x);var v=(n&62914560)===n?Xi-zt():(n&4194048)===n?ch-zt():0;if(v=uC(x,v),v!==null){Xa=n,e.cancelPendingCommit=v(Nx.bind(null,e,t,n,a,o,r,l,s,i,d,x,null,u,p)),bo(e,n,l,!f);return}}Nx(e,t,n,a,o,r,l,s,i)}function Tw(e){for(var t=e;;){var a=t.tag;if((a===0||a===11||a===15)&&t.flags&16384&&(a=t.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var o=0;o<a.length;o++){var r=a[o],n=r.getSnapshot;r=r.value;try{if(!qt(n(),r))return!1}catch{return!1}}if(a=t.child,t.subtreeFlags&16384&&a!==null)a.return=t,t=a;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function bo(e,t,a,o){t&=~vd,t&=~nr,e.suspendedLanes|=t,e.pingedLanes&=~t,o&&(e.warmLanes|=t),o=e.expirationTimes;for(var r=t;0<r;){var n=31-_t(r),l=1<<n;o[n]=-1,r&=~l}a!==0&&gy(e,a,t)}function Gi(){return(fe&6)===0?(Gl(0,!1),!1):!0}function Sd(){if(ae!==null){if(pe===0)var e=ae.return;else e=ae,Pa=xr=null,sd(e),nn=null,Rl=0,e=ae;for(;e!==null;)Vg(e.alternate,e),e=e.return;ae=null}}function gn(e,t){var a=e.timeoutHandle;a!==-1&&(e.timeoutHandle=-1,Yw(a)),a=e.cancelPendingCommit,a!==null&&(e.cancelPendingCommit=null,a()),Xa=0,Sd(),he=e,ae=a=qa(e.current,null),oe=t,pe=0,Nt=null,Io=!1,Cn=zl(e,t),bd=!1,xn=Lt=vd=nr=Bo=Be=0,kt=hl=null,bu=!1,(t&8)!==0&&(t|=t&32);var o=e.entangledLanes;if(o!==0)for(e=e.entanglements,o&=t;0<o;){var r=31-_t(o),n=1<<r;t|=e[r],o&=~n}return Qa=t,Li(),a}function mh(e,t){Q=null,G.H=Tl,t===wn||t===Hi?(t=fx(),pe=3):t===ed?(t=fx(),pe=4):pe=t===yd?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,Nt=t,ae===null&&(Be=1,gi(e,ta(t,e.current)))}function xh(){var e=Ut.current;return e===null?!0:(oe&4194048)===oe?oa===null:(oe&62914560)===oe||(oe&536870912)!==0?e===oa:!1}function yh(){var e=G.H;return G.H=Tl,e===null?Tl:e}function gh(){var e=G.A;return G.A=Rw,e}function Si(){Be=4,Io||(oe&4194048)!==oe&&Ut.current!==null||(Cn=!0),(Bo&134217727)===0&&(nr&134217727)===0||he===null||bo(he,oe,Lt,!1)}function Nc(e,t,a){var o=fe;fe|=2;var r=yh(),n=gh();(he!==e||oe!==t)&&(vi=null,gn(e,t)),t=!1;var l=Be;e:do try{if(pe!==0&&ae!==null){var s=ae,i=Nt;switch(pe){case 8:Sd(),l=6;break e;case 3:case 2:case 9:case 6:Ut.current===null&&(t=!0);var f=pe;if(pe=0,Nt=null,en(e,s,i,f),a&&Cn){l=0;break e}break;default:f=pe,pe=0,Nt=null,en(e,s,i,f)}}Ew(),l=Be;break}catch(d){mh(e,d)}while(!0);return t&&e.shellSuspendCounter++,Pa=xr=null,fe=o,G.H=r,G.A=n,ae===null&&(he=null,oe=0,Li()),l}function Ew(){for(;ae!==null;)hh(ae)}function Fw(e,t){var a=fe;fe|=2;var o=yh(),r=gh();he!==e||oe!==t?(vi=null,bi=zt()+500,gn(e,t)):Cn=zl(e,t);e:do try{if(pe!==0&&ae!==null){t=ae;var n=Nt;t:switch(pe){case 1:pe=0,Nt=null,en(e,t,n,1);break;case 2:case 9:if(ix(n)){pe=0,Nt=null,Dx(t);break}t=function(){pe!==2&&pe!==9||he!==e||(pe=7),ka(e)},n.then(t,t);break e;case 3:pe=7;break e;case 4:pe=5;break e;case 7:ix(n)?(pe=0,Nt=null,Dx(t)):(pe=0,Nt=null,en(e,t,n,7));break;case 5:var l=null;switch(ae.tag){case 26:l=ae.memoizedState;case 5:case 27:var s=ae;if(l?Hh(l):s.stateNode.complete){pe=0,Nt=null;var i=s.sibling;if(i!==null)ae=i;else{var f=s.return;f!==null?(ae=f,ji(f)):ae=null}break t}}pe=0,Nt=null,en(e,t,n,5);break;case 6:pe=0,Nt=null,en(e,t,n,6);break;case 8:Sd(),Be=6;break e;default:throw Error(F(462))}}Dw();break}catch(d){mh(e,d)}while(!0);return Pa=xr=null,G.H=o,G.A=r,fe=a,ae!==null?0:(he=null,oe=0,Li(),Be)}function Dw(){for(;ae!==null&&!tS();)hh(ae)}function hh(e){var t=jg(e.alternate,e,Qa);e.memoizedProps=e.pendingProps,t===null?ji(e):ae=t}function Dx(e){var t=e,a=t.alternate;switch(t.tag){case 15:case 0:t=kx(a,t,t.pendingProps,t.type,void 0,oe);break;case 11:t=kx(a,t,t.pendingProps,t.type.render,t.ref,oe);break;case 5:sd(t);default:Vg(a,t),t=ae=Vy(t,Qa),t=jg(a,t,Qa)}e.memoizedProps=e.pendingProps,t===null?ji(e):ae=t}function en(e,t,a,o){Pa=xr=null,sd(t),nn=null,Rl=0;var r=t.return;try{if(bw(e,r,t,a,oe)){Be=1,gi(e,ta(a,e.current)),ae=null;return}}catch(n){if(r!==null)throw ae=r,n;Be=1,gi(e,ta(a,e.current)),ae=null;return}t.flags&32768?(re||o===1?e=!0:Cn||(oe&536870912)!==0?e=!1:(Io=e=!0,(o===2||o===9||o===3||o===6)&&(o=Ut.current,o!==null&&o.tag===13&&(o.flags|=16384))),Ih(t,e)):ji(t)}function ji(e){var t=e;do{if((t.flags&32768)!==0){Ih(t,Io);return}e=t.return;var a=ww(t.alternate,t,Qa);if(a!==null){ae=a;return}if(t=t.sibling,t!==null){ae=t;return}ae=t=e}while(t!==null);Be===0&&(Be=5)}function Ih(e,t){do{var a=Cw(e.alternate,e);if(a!==null){a.flags&=32767,ae=a;return}if(a=e.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!t&&(e=e.sibling,e!==null)){ae=e;return}ae=e=a}while(e!==null);Be=6,ae=null}function Nx(e,t,a,o,r,n,l,s,i){e.cancelPendingCommit=null;do Vi();while(Qe!==0);if((fe&6)!==0)throw Error(F(327));if(t!==null){if(t===e.current)throw Error(F(177));if(n=t.lanes|t.childLanes,n|=Yu,uS(e,a,n,l,s,i),e===he&&(ae=he=null,oe=0),yn=t,Ro=e,Xa=a,vu=n,Su=r,uh=o,(t.subtreeFlags&10256)!==0||(t.flags&10256)!==0?(e.callbackNode=null,e.callbackPriority=0,Lw(li,function(){return Ch(),null})):(e.callbackNode=null,e.callbackPriority=0),o=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||o){o=G.T,G.T=null,r=ce.p,ce.p=2,l=fe,fe|=4;try{kw(e,t,a)}finally{fe=l,ce.p=r,G.T=o}}Qe=1,bh(),vh(),Sh()}}function bh(){if(Qe===1){Qe=0;var e=Ro,t=yn,a=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||a){a=G.T,G.T=null;var o=ce.p;ce.p=2;var r=fe;fe|=4;try{oh(t,e);var n=Ru,l=Hy(e.containerInfo),s=n.focusedElem,i=n.selectionRange;if(l!==s&&s&&s.ownerDocument&&zy(s.ownerDocument.documentElement,s)){if(i!==null&&Vu(s)){var f=i.start,d=i.end;if(d===void 0&&(d=f),"selectionStart"in s)s.selectionStart=f,s.selectionEnd=Math.min(d,s.value.length);else{var x=s.ownerDocument||document,u=x&&x.defaultView||window;if(u.getSelection){var p=u.getSelection(),v=s.textContent.length,w=Math.min(i.start,v),E=i.end===void 0?w:Math.min(i.end,v);!p.extend&&w>E&&(l=E,E=w,w=l);var y=tx(s,w),c=tx(s,E);if(y&&c&&(p.rangeCount!==1||p.anchorNode!==y.node||p.anchorOffset!==y.offset||p.focusNode!==c.node||p.focusOffset!==c.offset)){var m=x.createRange();m.setStart(y.node,y.offset),p.removeAllRanges(),w>E?(p.addRange(m),p.extend(c.node,c.offset)):(m.setEnd(c.node,c.offset),p.addRange(m))}}}}for(x=[],p=s;p=p.parentNode;)p.nodeType===1&&x.push({element:p,left:p.scrollLeft,top:p.scrollTop});for(typeof s.focus=="function"&&s.focus(),s=0;s<x.length;s++){var g=x[s];g.element.scrollLeft=g.left,g.element.scrollTop=g.top}}Ei=!!Au,Ru=Au=null}finally{fe=r,ce.p=o,G.T=a}}e.current=t,Qe=2}}function vh(){if(Qe===2){Qe=0;var e=Ro,t=yn,a=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||a){a=G.T,G.T=null;var o=ce.p;ce.p=2;var r=fe;fe|=4;try{$g(e,t.alternate,t)}finally{fe=r,ce.p=o,G.T=a}}Qe=3}}function Sh(){if(Qe===4||Qe===3){Qe=0,aS();var e=Ro,t=yn,a=Xa,o=uh;(t.subtreeFlags&10256)!==0||(t.flags&10256)!==0?Qe=5:(Qe=0,yn=Ro=null,wh(e,e.pendingLanes));var r=e.pendingLanes;if(r===0&&(Ao=null),_u(a),t=t.stateNode,Ht&&typeof Ht.onCommitFiberRoot=="function")try{Ht.onCommitFiberRoot(Ll,t,void 0,(t.current.flags&128)===128)}catch{}if(o!==null){t=G.T,r=ce.p,ce.p=2,G.T=null;try{for(var n=e.onRecoverableError,l=0;l<o.length;l++){var s=o[l];n(s.value,{componentStack:s.stack})}}finally{G.T=t,ce.p=r}}(Xa&3)!==0&&Vi(),ka(e),r=e.pendingLanes,(a&261930)!==0&&(r&42)!==0?e===wu?Il++:(Il=0,wu=e):Il=0,Gl(0,!1)}}function wh(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,ql(t)))}function Vi(){return bh(),vh(),Sh(),Ch()}function Ch(){if(Qe!==5)return!1;var e=Ro,t=vu;vu=0;var a=_u(Xa),o=G.T,r=ce.p;try{ce.p=32>a?32:a,G.T=null,a=Su,Su=null;var n=Ro,l=Xa;if(Qe=0,yn=Ro=null,Xa=0,(fe&6)!==0)throw Error(F(331));var s=fe;if(fe|=4,ih(n.current),nh(n,n.current,l,a),fe=s,Gl(0,!1),Ht&&typeof Ht.onPostCommitFiberRoot=="function")try{Ht.onPostCommitFiberRoot(Ll,n)}catch{}return!0}finally{ce.p=r,G.T=o,wh(e,t)}}function Bx(e,t,a){t=ta(a,t),t=yu(e.stateNode,t,2),e=ko(e,t,2),e!==null&&(Hl(e,2),ka(e))}function me(e,t,a){if(e.tag===3)Bx(e,e,a);else for(;t!==null;){if(t.tag===3){Bx(t,e,a);break}else if(t.tag===1){var o=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof o.componentDidCatch=="function"&&(Ao===null||!Ao.has(o))){e=ta(a,e),a=_g(2),o=ko(t,a,2),o!==null&&(Pg(a,o,t,e),Hl(o,2),ka(o));break}}t=t.return}}function Bc(e,t,a){var o=e.pingCache;if(o===null){o=e.pingCache=new Mw;var r=new Set;o.set(t,r)}else r=o.get(t),r===void 0&&(r=new Set,o.set(t,r));r.has(a)||(bd=!0,r.add(a),e=Nw.bind(null,e,t,a),t.then(e,e))}function Nw(e,t,a){var o=e.pingCache;o!==null&&o.delete(t),e.pingedLanes|=e.suspendedLanes&a,e.warmLanes&=~a,he===e&&(oe&a)===a&&(Be===4||Be===3&&(oe&62914560)===oe&&300>zt()-Xi?(fe&2)===0&&gn(e,0):vd|=a,xn===oe&&(xn=0)),ka(e)}function kh(e,t){t===0&&(t=yy()),e=mr(e,t),e!==null&&(Hl(e,t),ka(e))}function Bw(e){var t=e.memoizedState,a=0;t!==null&&(a=t.retryLane),kh(e,a)}function Ow(e,t){var a=0;switch(e.tag){case 31:case 13:var o=e.stateNode,r=e.memoizedState;r!==null&&(a=r.retryLane);break;case 19:o=e.stateNode;break;case 22:o=e.stateNode._retryCache;break;default:throw Error(F(314))}o!==null&&o.delete(t),kh(e,a)}function Lw(e,t){return zu(e,t)}var wi=null,Ur=null,Cu=!1,Ci=!1,Oc=!1,vo=0;function ka(e){e!==Ur&&e.next===null&&(Ur===null?wi=Ur=e:Ur=Ur.next=e),Ci=!0,Cu||(Cu=!0,Hw())}function Gl(e,t){if(!Oc&&Ci){Oc=!0;do for(var a=!1,o=wi;o!==null;){if(!t)if(e!==0){var r=o.pendingLanes;if(r===0)var n=0;else{var l=o.suspendedLanes,s=o.pingedLanes;n=(1<<31-_t(42|e)+1)-1,n&=r&~(l&~s),n=n&201326741?n&201326741|1:n?n|2:0}n!==0&&(a=!0,Ox(o,n))}else n=oe,n=Di(o,o===he?n:0,o.cancelPendingCommit!==null||o.timeoutHandle!==-1),(n&3)===0||zl(o,n)||(a=!0,Ox(o,n));o=o.next}while(a);Oc=!1}}function zw(){Ah()}function Ah(){Ci=Cu=!1;var e=0;vo!==0&&Vw()&&(e=vo);for(var t=zt(),a=null,o=wi;o!==null;){var r=o.next,n=Rh(o,t);n===0?(o.next=null,a===null?wi=r:a.next=r,r===null&&(Ur=a)):(a=o,(e!==0||(n&3)!==0)&&(Ci=!0)),o=r}Qe!==0&&Qe!==5||Gl(e,!1),vo!==0&&(vo=0)}function Rh(e,t){for(var a=e.suspendedLanes,o=e.pingedLanes,r=e.expirationTimes,n=e.pendingLanes&-62914561;0<n;){var l=31-_t(n),s=1<<l,i=r[l];i===-1?((s&a)===0||(s&o)!==0)&&(r[l]=cS(s,t)):i<=t&&(e.expiredLanes|=s),n&=~s}if(t=he,a=oe,a=Di(e,e===t?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),o=e.callbackNode,a===0||e===t&&(pe===2||pe===9)||e.cancelPendingCommit!==null)return o!==null&&o!==null&&cc(o),e.callbackNode=null,e.callbackPriority=0;if((a&3)===0||zl(e,a)){if(t=a&-a,t===e.callbackPriority)return t;switch(o!==null&&cc(o),_u(a)){case 2:case 8:a=my;break;case 32:a=li;break;case 268435456:a=xy;break;default:a=li}return o=Mh.bind(null,e),a=zu(a,o),e.callbackPriority=t,e.callbackNode=a,t}return o!==null&&o!==null&&cc(o),e.callbackPriority=2,e.callbackNode=null,2}function Mh(e,t){if(Qe!==0&&Qe!==5)return e.callbackNode=null,e.callbackPriority=0,null;var a=e.callbackNode;if(Vi()&&e.callbackNode!==a)return null;var o=oe;return o=Di(e,e===he?o:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),o===0?null:(ph(e,o,t),Rh(e,zt()),e.callbackNode!=null&&e.callbackNode===a?Mh.bind(null,e):null)}function Ox(e,t){if(Vi())return null;ph(e,t,!0)}function Hw(){Qw(function(){(fe&6)!==0?zu(py,zw):Ah()})}function wd(){if(vo===0){var e=dn;e===0&&(e=ks,ks<<=1,(ks&261888)===0&&(ks=256)),vo=e}return vo}function Lx(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:Xs(""+e)}function zx(e,t){var a=t.ownerDocument.createElement("input");return a.name=t.name,a.value=t.value,e.id&&a.setAttribute("form",e.id),t.parentNode.insertBefore(a,t),e=new FormData(e),a.parentNode.removeChild(a),e}function _w(e,t,a,o,r){if(t==="submit"&&a&&a.stateNode===r){var n=Lx((r[Rt]||null).action),l=o.submitter;l&&(t=(t=l[Rt]||null)?Lx(t.formAction):l.getAttribute("formAction"),t!==null&&(n=t,l=null));var s=new Ni("action","action",null,o,r);e.push({event:s,listeners:[{instance:null,listener:function(){if(o.defaultPrevented){if(vo!==0){var i=l?zx(r,l):new FormData(r);mu(a,{pending:!0,data:i,method:r.method,action:n},null,i)}}else typeof n=="function"&&(s.preventDefault(),i=l?zx(r,l):new FormData(r),mu(a,{pending:!0,data:i,method:r.method,action:n},n,i))},currentTarget:r}]})}}for(zs=0;zs<au.length;zs++)Hs=au[zs],Hx=Hs.toLowerCase(),_x=Hs[0].toUpperCase()+Hs.slice(1),ma(Hx,"on"+_x);var Hs,Hx,_x,zs;ma(Py,"onAnimationEnd");ma(qy,"onAnimationIteration");ma(Uy,"onAnimationStart");ma("dblclick","onDoubleClick");ma("focusin","onFocus");ma("focusout","onBlur");ma(ow,"onTransitionRun");ma(rw,"onTransitionStart");ma(nw,"onTransitionCancel");ma(Xy,"onTransitionEnd");cn("onMouseEnter",["mouseout","mouseover"]);cn("onMouseLeave",["mouseout","mouseover"]);cn("onPointerEnter",["pointerout","pointerover"]);cn("onPointerLeave",["pointerout","pointerover"]);ur("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));ur("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));ur("onBeforeInput",["compositionend","keypress","textInput","paste"]);ur("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));ur("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));ur("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var El="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),Pw=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(El));function Th(e,t){t=(t&4)!==0;for(var a=0;a<e.length;a++){var o=e[a],r=o.event;o=o.listeners;e:{var n=void 0;if(t)for(var l=o.length-1;0<=l;l--){var s=o[l],i=s.instance,f=s.currentTarget;if(s=s.listener,i!==n&&r.isPropagationStopped())break e;n=s,r.currentTarget=f;try{n(r)}catch(d){ii(d)}r.currentTarget=null,n=i}else for(l=0;l<o.length;l++){if(s=o[l],i=s.instance,f=s.currentTarget,s=s.listener,i!==n&&r.isPropagationStopped())break e;n=s,r.currentTarget=f;try{n(r)}catch(d){ii(d)}r.currentTarget=null,n=i}}}}function te(e,t){var a=t[Qc];a===void 0&&(a=t[Qc]=new Set);var o=e+"__bubble";a.has(o)||(Eh(t,e,2,!1),a.add(o))}function Lc(e,t,a){var o=0;t&&(o|=4),Eh(a,e,o,t)}var _s="_reactListening"+Math.random().toString(36).slice(2);function Cd(e){if(!e[_s]){e[_s]=!0,vy.forEach(function(a){a!=="selectionchange"&&(Pw.has(a)||Lc(a,!1,e),Lc(a,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[_s]||(t[_s]=!0,Lc("selectionchange",!1,t))}}function Eh(e,t,a,o){switch(Xh(t)){case 2:var r=mC;break;case 8:r=xC;break;default:r=Md}a=r.bind(null,t,a,e),r=void 0,!Jc||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(r=!0),o?r!==void 0?e.addEventListener(t,a,{capture:!0,passive:r}):e.addEventListener(t,a,!0):r!==void 0?e.addEventListener(t,a,{passive:r}):e.addEventListener(t,a,!1)}function zc(e,t,a,o,r){var n=o;if((t&1)===0&&(t&2)===0&&o!==null)e:for(;;){if(o===null)return;var l=o.tag;if(l===3||l===4){var s=o.stateNode.containerInfo;if(s===r)break;if(l===4)for(l=o.return;l!==null;){var i=l.tag;if((i===3||i===4)&&l.stateNode.containerInfo===r)return;l=l.return}for(;s!==null;){if(l=jr(s),l===null)return;if(i=l.tag,i===5||i===6||i===26||i===27){o=n=l;continue e}s=s.parentNode}}o=o.return}Ty(function(){var f=n,d=Uu(a),x=[];e:{var u=Gy.get(e);if(u!==void 0){var p=Ni,v=e;switch(e){case"keypress":if(js(a)===0)break e;case"keydown":case"keyup":p=OS;break;case"focusin":v="focus",p=xc;break;case"focusout":v="blur",p=xc;break;case"beforeblur":case"afterblur":p=xc;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":p=Vm;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":p=wS;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":p=HS;break;case Py:case qy:case Uy:p=AS;break;case Xy:p=PS;break;case"scroll":case"scrollend":p=vS;break;case"wheel":p=US;break;case"copy":case"cut":case"paste":p=MS;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":p=Qm;break;case"toggle":case"beforetoggle":p=GS}var w=(t&4)!==0,E=!w&&(e==="scroll"||e==="scrollend"),y=w?u!==null?u+"Capture":null:u;w=[];for(var c=f,m;c!==null;){var g=c;if(m=g.stateNode,g=g.tag,g!==5&&g!==26&&g!==27||m===null||y===null||(g=Sl(c,y),g!=null&&w.push(Fl(c,g,m))),E)break;c=c.return}0<w.length&&(u=new p(u,v,null,a,d),x.push({event:u,listeners:w}))}}if((t&7)===0){e:{if(u=e==="mouseover"||e==="pointerover",p=e==="mouseout"||e==="pointerout",u&&a!==$c&&(v=a.relatedTarget||a.fromElement)&&(jr(v)||v[bn]))break e;if((p||u)&&(u=d.window===d?d:(u=d.ownerDocument)?u.defaultView||u.parentWindow:window,p?(v=a.relatedTarget||a.toElement,p=f,v=v?jr(v):null,v!==null&&(E=Ol(v),w=v.tag,v!==E||w!==5&&w!==27&&w!==6)&&(v=null)):(p=null,v=f),p!==v)){if(w=Vm,g="onMouseLeave",y="onMouseEnter",c="mouse",(e==="pointerout"||e==="pointerover")&&(w=Qm,g="onPointerLeave",y="onPointerEnter",c="pointer"),E=p==null?u:nl(p),m=v==null?u:nl(v),u=new w(g,c+"leave",p,a,d),u.target=E,u.relatedTarget=m,g=null,jr(d)===f&&(w=new w(y,c+"enter",v,a,d),w.target=m,w.relatedTarget=E,g=w),E=g,p&&v)t:{for(w=qw,y=p,c=v,m=0,g=y;g;g=w(g))m++;g=0;for(var k=c;k;k=w(k))g++;for(;0<m-g;)y=w(y),m--;for(;0<g-m;)c=w(c),g--;for(;m--;){if(y===c||c!==null&&y===c.alternate){w=y;break t}y=w(y),c=w(c)}w=null}else w=null;p!==null&&Px(x,u,p,w,!1),v!==null&&E!==null&&Px(x,E,v,w,!0)}}e:{if(u=f?nl(f):window,p=u.nodeName&&u.nodeName.toLowerCase(),p==="select"||p==="input"&&u.type==="file")var N=$m;else if(Wm(u))if(Oy)N=ew;else{N=$S;var b=WS}else p=u.nodeName,!p||p.toLowerCase()!=="input"||u.type!=="checkbox"&&u.type!=="radio"?f&&qu(f.elementType)&&(N=$m):N=JS;if(N&&(N=N(e,f))){By(x,N,a,d);break e}b&&b(e,u,f),e==="focusout"&&f&&u.type==="number"&&f.memoizedProps.value!=null&&Wc(u,"number",u.value)}switch(b=f?nl(f):window,e){case"focusin":(Wm(b)||b.contentEditable==="true")&&(Qr=b,eu=f,cl=null);break;case"focusout":cl=eu=Qr=null;break;case"mousedown":tu=!0;break;case"contextmenu":case"mouseup":case"dragend":tu=!1,ax(x,a,d);break;case"selectionchange":if(aw)break;case"keydown":case"keyup":ax(x,a,d)}var D;if(ju)e:{switch(e){case"compositionstart":var S="onCompositionStart";break e;case"compositionend":S="onCompositionEnd";break e;case"compositionupdate":S="onCompositionUpdate";break e}S=void 0}else Yr?Dy(e,a)&&(S="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(S="onCompositionStart");S&&(Fy&&a.locale!=="ko"&&(Yr||S!=="onCompositionStart"?S==="onCompositionEnd"&&Yr&&(D=Ey()):(ho=d,Xu="value"in ho?ho.value:ho.textContent,Yr=!0)),b=ki(f,S),0<b.length&&(S=new Ym(S,e,null,a,d),x.push({event:S,listeners:b}),D?S.data=D:(D=Ny(a),D!==null&&(S.data=D)))),(D=VS?YS(e,a):QS(e,a))&&(S=ki(f,"onBeforeInput"),0<S.length&&(b=new Ym("onBeforeInput","beforeinput",null,a,d),x.push({event:b,listeners:S}),b.data=D)),_w(x,e,f,a,d)}Th(x,t)})}function Fl(e,t,a){return{instance:e,listener:t,currentTarget:a}}function ki(e,t){for(var a=t+"Capture",o=[];e!==null;){var r=e,n=r.stateNode;if(r=r.tag,r!==5&&r!==26&&r!==27||n===null||(r=Sl(e,a),r!=null&&o.unshift(Fl(e,r,n)),r=Sl(e,t),r!=null&&o.push(Fl(e,r,n))),e.tag===3)return o;e=e.return}return[]}function qw(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Px(e,t,a,o,r){for(var n=t._reactName,l=[];a!==null&&a!==o;){var s=a,i=s.alternate,f=s.stateNode;if(s=s.tag,i!==null&&i===o)break;s!==5&&s!==26&&s!==27||f===null||(i=f,r?(f=Sl(a,n),f!=null&&l.unshift(Fl(a,f,i))):r||(f=Sl(a,n),f!=null&&l.push(Fl(a,f,i)))),a=a.return}l.length!==0&&e.push({event:t,listeners:l})}var Uw=/\r\n?/g,Xw=/\u0000|\uFFFD/g;function qx(e){return(typeof e=="string"?e:""+e).replace(Uw,`
`).replace(Xw,"")}function Fh(e,t){return t=qx(t),qx(e)===t}function xe(e,t,a,o,r,n){switch(a){case"children":typeof o=="string"?t==="body"||t==="textarea"&&o===""||un(e,o):(typeof o=="number"||typeof o=="bigint")&&t!=="body"&&un(e,""+o);break;case"className":Ms(e,"class",o);break;case"tabIndex":Ms(e,"tabindex",o);break;case"dir":case"role":case"viewBox":case"width":case"height":Ms(e,a,o);break;case"style":My(e,o,n);break;case"data":if(t!=="object"){Ms(e,"data",o);break}case"src":case"href":if(o===""&&(t!=="a"||a!=="href")){e.removeAttribute(a);break}if(o==null||typeof o=="function"||typeof o=="symbol"||typeof o=="boolean"){e.removeAttribute(a);break}o=Xs(""+o),e.setAttribute(a,o);break;case"action":case"formAction":if(typeof o=="function"){e.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof n=="function"&&(a==="formAction"?(t!=="input"&&xe(e,t,"name",r.name,r,null),xe(e,t,"formEncType",r.formEncType,r,null),xe(e,t,"formMethod",r.formMethod,r,null),xe(e,t,"formTarget",r.formTarget,r,null)):(xe(e,t,"encType",r.encType,r,null),xe(e,t,"method",r.method,r,null),xe(e,t,"target",r.target,r,null)));if(o==null||typeof o=="symbol"||typeof o=="boolean"){e.removeAttribute(a);break}o=Xs(""+o),e.setAttribute(a,o);break;case"onClick":o!=null&&(e.onclick=_a);break;case"onScroll":o!=null&&te("scroll",e);break;case"onScrollEnd":o!=null&&te("scrollend",e);break;case"dangerouslySetInnerHTML":if(o!=null){if(typeof o!="object"||!("__html"in o))throw Error(F(61));if(a=o.__html,a!=null){if(r.children!=null)throw Error(F(60));e.innerHTML=a}}break;case"multiple":e.multiple=o&&typeof o!="function"&&typeof o!="symbol";break;case"muted":e.muted=o&&typeof o!="function"&&typeof o!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(o==null||typeof o=="function"||typeof o=="boolean"||typeof o=="symbol"){e.removeAttribute("xlink:href");break}a=Xs(""+o),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":o!=null&&typeof o!="function"&&typeof o!="symbol"?e.setAttribute(a,""+o):e.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":o&&typeof o!="function"&&typeof o!="symbol"?e.setAttribute(a,""):e.removeAttribute(a);break;case"capture":case"download":o===!0?e.setAttribute(a,""):o!==!1&&o!=null&&typeof o!="function"&&typeof o!="symbol"?e.setAttribute(a,o):e.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":o!=null&&typeof o!="function"&&typeof o!="symbol"&&!isNaN(o)&&1<=o?e.setAttribute(a,o):e.removeAttribute(a);break;case"rowSpan":case"start":o==null||typeof o=="function"||typeof o=="symbol"||isNaN(o)?e.removeAttribute(a):e.setAttribute(a,o);break;case"popover":te("beforetoggle",e),te("toggle",e),Us(e,"popover",o);break;case"xlinkActuate":Fa(e,"http://www.w3.org/1999/xlink","xlink:actuate",o);break;case"xlinkArcrole":Fa(e,"http://www.w3.org/1999/xlink","xlink:arcrole",o);break;case"xlinkRole":Fa(e,"http://www.w3.org/1999/xlink","xlink:role",o);break;case"xlinkShow":Fa(e,"http://www.w3.org/1999/xlink","xlink:show",o);break;case"xlinkTitle":Fa(e,"http://www.w3.org/1999/xlink","xlink:title",o);break;case"xlinkType":Fa(e,"http://www.w3.org/1999/xlink","xlink:type",o);break;case"xmlBase":Fa(e,"http://www.w3.org/XML/1998/namespace","xml:base",o);break;case"xmlLang":Fa(e,"http://www.w3.org/XML/1998/namespace","xml:lang",o);break;case"xmlSpace":Fa(e,"http://www.w3.org/XML/1998/namespace","xml:space",o);break;case"is":Us(e,"is",o);break;case"innerText":case"textContent":break;default:(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")&&(a=IS.get(a)||a,Us(e,a,o))}}function ku(e,t,a,o,r,n){switch(a){case"style":My(e,o,n);break;case"dangerouslySetInnerHTML":if(o!=null){if(typeof o!="object"||!("__html"in o))throw Error(F(61));if(a=o.__html,a!=null){if(r.children!=null)throw Error(F(60));e.innerHTML=a}}break;case"children":typeof o=="string"?un(e,o):(typeof o=="number"||typeof o=="bigint")&&un(e,""+o);break;case"onScroll":o!=null&&te("scroll",e);break;case"onScrollEnd":o!=null&&te("scrollend",e);break;case"onClick":o!=null&&(e.onclick=_a);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!Sy.hasOwnProperty(a))e:{if(a[0]==="o"&&a[1]==="n"&&(r=a.endsWith("Capture"),t=a.slice(2,r?a.length-7:void 0),n=e[Rt]||null,n=n!=null?n[a]:null,typeof n=="function"&&e.removeEventListener(t,n,r),typeof o=="function")){typeof n!="function"&&n!==null&&(a in e?e[a]=null:e.hasAttribute(a)&&e.removeAttribute(a)),e.addEventListener(t,o,r);break e}a in e?e[a]=o:o===!0?e.setAttribute(a,""):Us(e,a,o)}}}function ft(e,t,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":te("error",e),te("load",e);var o=!1,r=!1,n;for(n in a)if(a.hasOwnProperty(n)){var l=a[n];if(l!=null)switch(n){case"src":o=!0;break;case"srcSet":r=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(F(137,t));default:xe(e,t,n,l,a,null)}}r&&xe(e,t,"srcSet",a.srcSet,a,null),o&&xe(e,t,"src",a.src,a,null);return;case"input":te("invalid",e);var s=n=l=r=null,i=null,f=null;for(o in a)if(a.hasOwnProperty(o)){var d=a[o];if(d!=null)switch(o){case"name":r=d;break;case"type":l=d;break;case"checked":i=d;break;case"defaultChecked":f=d;break;case"value":n=d;break;case"defaultValue":s=d;break;case"children":case"dangerouslySetInnerHTML":if(d!=null)throw Error(F(137,t));break;default:xe(e,t,o,d,a,null)}}ky(e,n,s,i,f,l,r,!1);return;case"select":te("invalid",e),o=l=n=null;for(r in a)if(a.hasOwnProperty(r)&&(s=a[r],s!=null))switch(r){case"value":n=s;break;case"defaultValue":l=s;break;case"multiple":o=s;default:xe(e,t,r,s,a,null)}t=n,a=l,e.multiple=!!o,t!=null?an(e,!!o,t,!1):a!=null&&an(e,!!o,a,!0);return;case"textarea":te("invalid",e),n=r=o=null;for(l in a)if(a.hasOwnProperty(l)&&(s=a[l],s!=null))switch(l){case"value":o=s;break;case"defaultValue":r=s;break;case"children":n=s;break;case"dangerouslySetInnerHTML":if(s!=null)throw Error(F(91));break;default:xe(e,t,l,s,a,null)}Ry(e,o,r,n);return;case"option":for(i in a)a.hasOwnProperty(i)&&(o=a[i],o!=null)&&(i==="selected"?e.selected=o&&typeof o!="function"&&typeof o!="symbol":xe(e,t,i,o,a,null));return;case"dialog":te("beforetoggle",e),te("toggle",e),te("cancel",e),te("close",e);break;case"iframe":case"object":te("load",e);break;case"video":case"audio":for(o=0;o<El.length;o++)te(El[o],e);break;case"image":te("error",e),te("load",e);break;case"details":te("toggle",e);break;case"embed":case"source":case"link":te("error",e),te("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(f in a)if(a.hasOwnProperty(f)&&(o=a[f],o!=null))switch(f){case"children":case"dangerouslySetInnerHTML":throw Error(F(137,t));default:xe(e,t,f,o,a,null)}return;default:if(qu(t)){for(d in a)a.hasOwnProperty(d)&&(o=a[d],o!==void 0&&ku(e,t,d,o,a,void 0));return}}for(s in a)a.hasOwnProperty(s)&&(o=a[s],o!=null&&xe(e,t,s,o,a,null))}function Gw(e,t,a,o){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var r=null,n=null,l=null,s=null,i=null,f=null,d=null;for(p in a){var x=a[p];if(a.hasOwnProperty(p)&&x!=null)switch(p){case"checked":break;case"value":break;case"defaultValue":i=x;default:o.hasOwnProperty(p)||xe(e,t,p,null,o,x)}}for(var u in o){var p=o[u];if(x=a[u],o.hasOwnProperty(u)&&(p!=null||x!=null))switch(u){case"type":n=p;break;case"name":r=p;break;case"checked":f=p;break;case"defaultChecked":d=p;break;case"value":l=p;break;case"defaultValue":s=p;break;case"children":case"dangerouslySetInnerHTML":if(p!=null)throw Error(F(137,t));break;default:p!==x&&xe(e,t,u,p,o,x)}}Zc(e,l,s,i,f,d,n,r);return;case"select":p=l=s=u=null;for(n in a)if(i=a[n],a.hasOwnProperty(n)&&i!=null)switch(n){case"value":break;case"multiple":p=i;default:o.hasOwnProperty(n)||xe(e,t,n,null,o,i)}for(r in o)if(n=o[r],i=a[r],o.hasOwnProperty(r)&&(n!=null||i!=null))switch(r){case"value":u=n;break;case"defaultValue":s=n;break;case"multiple":l=n;default:n!==i&&xe(e,t,r,n,o,i)}t=s,a=l,o=p,u!=null?an(e,!!a,u,!1):!!o!=!!a&&(t!=null?an(e,!!a,t,!0):an(e,!!a,a?[]:"",!1));return;case"textarea":p=u=null;for(s in a)if(r=a[s],a.hasOwnProperty(s)&&r!=null&&!o.hasOwnProperty(s))switch(s){case"value":break;case"children":break;default:xe(e,t,s,null,o,r)}for(l in o)if(r=o[l],n=a[l],o.hasOwnProperty(l)&&(r!=null||n!=null))switch(l){case"value":u=r;break;case"defaultValue":p=r;break;case"children":break;case"dangerouslySetInnerHTML":if(r!=null)throw Error(F(91));break;default:r!==n&&xe(e,t,l,r,o,n)}Ay(e,u,p);return;case"option":for(var v in a)u=a[v],a.hasOwnProperty(v)&&u!=null&&!o.hasOwnProperty(v)&&(v==="selected"?e.selected=!1:xe(e,t,v,null,o,u));for(i in o)u=o[i],p=a[i],o.hasOwnProperty(i)&&u!==p&&(u!=null||p!=null)&&(i==="selected"?e.selected=u&&typeof u!="function"&&typeof u!="symbol":xe(e,t,i,u,o,p));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var w in a)u=a[w],a.hasOwnProperty(w)&&u!=null&&!o.hasOwnProperty(w)&&xe(e,t,w,null,o,u);for(f in o)if(u=o[f],p=a[f],o.hasOwnProperty(f)&&u!==p&&(u!=null||p!=null))switch(f){case"children":case"dangerouslySetInnerHTML":if(u!=null)throw Error(F(137,t));break;default:xe(e,t,f,u,o,p)}return;default:if(qu(t)){for(var E in a)u=a[E],a.hasOwnProperty(E)&&u!==void 0&&!o.hasOwnProperty(E)&&ku(e,t,E,void 0,o,u);for(d in o)u=o[d],p=a[d],!o.hasOwnProperty(d)||u===p||u===void 0&&p===void 0||ku(e,t,d,u,o,p);return}}for(var y in a)u=a[y],a.hasOwnProperty(y)&&u!=null&&!o.hasOwnProperty(y)&&xe(e,t,y,null,o,u);for(x in o)u=o[x],p=a[x],!o.hasOwnProperty(x)||u===p||u==null&&p==null||xe(e,t,x,u,o,p)}function Ux(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function jw(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,a=performance.getEntriesByType("resource"),o=0;o<a.length;o++){var r=a[o],n=r.transferSize,l=r.initiatorType,s=r.duration;if(n&&s&&Ux(l)){for(l=0,s=r.responseEnd,o+=1;o<a.length;o++){var i=a[o],f=i.startTime;if(f>s)break;var d=i.transferSize,x=i.initiatorType;d&&Ux(x)&&(i=i.responseEnd,l+=d*(i<s?1:(s-f)/(i-f)))}if(--o,t+=8*(n+l)/(r.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var Au=null,Ru=null;function Ai(e){return e.nodeType===9?e:e.ownerDocument}function Xx(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function Dh(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function Mu(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Hc=null;function Vw(){var e=window.event;return e&&e.type==="popstate"?e===Hc?!1:(Hc=e,!0):(Hc=null,!1)}var Nh=typeof setTimeout=="function"?setTimeout:void 0,Yw=typeof clearTimeout=="function"?clearTimeout:void 0,Gx=typeof Promise=="function"?Promise:void 0,Qw=typeof queueMicrotask=="function"?queueMicrotask:typeof Gx<"u"?function(e){return Gx.resolve(null).then(e).catch(Kw)}:Nh;function Kw(e){setTimeout(function(){throw e})}function Lo(e){return e==="head"}function jx(e,t){var a=t,o=0;do{var r=a.nextSibling;if(e.removeChild(a),r&&r.nodeType===8)if(a=r.data,a==="/$"||a==="/&"){if(o===0){e.removeChild(r),In(t);return}o--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")o++;else if(a==="html")bl(e.ownerDocument.documentElement);else if(a==="head"){a=e.ownerDocument.head,bl(a);for(var n=a.firstChild;n;){var l=n.nextSibling,s=n.nodeName;n[_l]||s==="SCRIPT"||s==="STYLE"||s==="LINK"&&n.rel.toLowerCase()==="stylesheet"||a.removeChild(n),n=l}}else a==="body"&&bl(e.ownerDocument.body);a=r}while(a);In(t)}function Vx(e,t){var a=e;e=0;do{var o=a.nextSibling;if(a.nodeType===1?t?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(t?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),o&&o.nodeType===8)if(a=o.data,a==="/$"){if(e===0)break;e--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||e++;a=o}while(a)}function Tu(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var a=t;switch(t=t.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":Tu(a),Pu(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}e.removeChild(a)}}function Zw(e,t,a,o){for(;e.nodeType===1;){var r=a;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!o&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(o){if(!e[_l])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(n=e.getAttribute("rel"),n==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(n!==r.rel||e.getAttribute("href")!==(r.href==null||r.href===""?null:r.href)||e.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin)||e.getAttribute("title")!==(r.title==null?null:r.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(n=e.getAttribute("src"),(n!==(r.src==null?null:r.src)||e.getAttribute("type")!==(r.type==null?null:r.type)||e.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin))&&n&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var n=r.name==null?null:""+r.name;if(r.type==="hidden"&&e.getAttribute("name")===n)return e}else return e;if(e=ra(e.nextSibling),e===null)break}return null}function Ww(e,t,a){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!a||(e=ra(e.nextSibling),e===null))return null;return e}function Bh(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=ra(e.nextSibling),e===null))return null;return e}function Eu(e){return e.data==="$?"||e.data==="$~"}function Fu(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function $w(e,t){var a=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||a.readyState!=="loading")t();else{var o=function(){t(),a.removeEventListener("DOMContentLoaded",o)};a.addEventListener("DOMContentLoaded",o),e._reactRetry=o}}function ra(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var Du=null;function Yx(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"||a==="/&"){if(t===0)return ra(e.nextSibling);t--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||t++}e=e.nextSibling}return null}function Qx(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(t===0)return e;t--}else a!=="/$"&&a!=="/&"||t++}e=e.previousSibling}return null}function Oh(e,t,a){switch(t=Ai(a),e){case"html":if(e=t.documentElement,!e)throw Error(F(452));return e;case"head":if(e=t.head,!e)throw Error(F(453));return e;case"body":if(e=t.body,!e)throw Error(F(454));return e;default:throw Error(F(451))}}function bl(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);Pu(e)}var na=new Map,Kx=new Set;function Ri(e){return typeof e.getRootNode=="function"?e.getRootNode():e.nodeType===9?e:e.ownerDocument}var Ka=ce.d;ce.d={f:Jw,r:eC,D:tC,C:aC,L:oC,m:rC,X:lC,S:nC,M:sC};function Jw(){var e=Ka.f(),t=Gi();return e||t}function eC(e){var t=vn(e);t!==null&&t.tag===5&&t.type==="form"?Mg(t):Ka.r(e)}var kn=typeof document>"u"?null:document;function Lh(e,t,a){var o=kn;if(o&&typeof t=="string"&&t){var r=ea(t);r='link[rel="'+e+'"][href="'+r+'"]',typeof a=="string"&&(r+='[crossorigin="'+a+'"]'),Kx.has(r)||(Kx.add(r),e={rel:e,crossOrigin:a,href:t},o.querySelector(r)===null&&(t=o.createElement("link"),ft(t,"link",e),tt(t),o.head.appendChild(t)))}}function tC(e){Ka.D(e),Lh("dns-prefetch",e,null)}function aC(e,t){Ka.C(e,t),Lh("preconnect",e,t)}function oC(e,t,a){Ka.L(e,t,a);var o=kn;if(o&&e&&t){var r='link[rel="preload"][as="'+ea(t)+'"]';t==="image"&&a&&a.imageSrcSet?(r+='[imagesrcset="'+ea(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(r+='[imagesizes="'+ea(a.imageSizes)+'"]')):r+='[href="'+ea(e)+'"]';var n=r;switch(t){case"style":n=hn(e);break;case"script":n=An(e)}na.has(n)||(e=ke({rel:"preload",href:t==="image"&&a&&a.imageSrcSet?void 0:e,as:t},a),na.set(n,e),o.querySelector(r)!==null||t==="style"&&o.querySelector(jl(n))||t==="script"&&o.querySelector(Vl(n))||(t=o.createElement("link"),ft(t,"link",e),tt(t),o.head.appendChild(t)))}}function rC(e,t){Ka.m(e,t);var a=kn;if(a&&e){var o=t&&typeof t.as=="string"?t.as:"script",r='link[rel="modulepreload"][as="'+ea(o)+'"][href="'+ea(e)+'"]',n=r;switch(o){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":n=An(e)}if(!na.has(n)&&(e=ke({rel:"modulepreload",href:e},t),na.set(n,e),a.querySelector(r)===null)){switch(o){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(Vl(n)))return}o=a.createElement("link"),ft(o,"link",e),tt(o),a.head.appendChild(o)}}}function nC(e,t,a){Ka.S(e,t,a);var o=kn;if(o&&e){var r=tn(o).hoistableStyles,n=hn(e);t=t||"default";var l=r.get(n);if(!l){var s={loading:0,preload:null};if(l=o.querySelector(jl(n)))s.loading=5;else{e=ke({rel:"stylesheet",href:e,"data-precedence":t},a),(a=na.get(n))&&kd(e,a);var i=l=o.createElement("link");tt(i),ft(i,"link",e),i._p=new Promise(function(f,d){i.onload=f,i.onerror=d}),i.addEventListener("load",function(){s.loading|=1}),i.addEventListener("error",function(){s.loading|=2}),s.loading|=4,Js(l,t,o)}l={type:"stylesheet",instance:l,count:1,state:s},r.set(n,l)}}}function lC(e,t){Ka.X(e,t);var a=kn;if(a&&e){var o=tn(a).hoistableScripts,r=An(e),n=o.get(r);n||(n=a.querySelector(Vl(r)),n||(e=ke({src:e,async:!0},t),(t=na.get(r))&&Ad(e,t),n=a.createElement("script"),tt(n),ft(n,"link",e),a.head.appendChild(n)),n={type:"script",instance:n,count:1,state:null},o.set(r,n))}}function sC(e,t){Ka.M(e,t);var a=kn;if(a&&e){var o=tn(a).hoistableScripts,r=An(e),n=o.get(r);n||(n=a.querySelector(Vl(r)),n||(e=ke({src:e,async:!0,type:"module"},t),(t=na.get(r))&&Ad(e,t),n=a.createElement("script"),tt(n),ft(n,"link",e),a.head.appendChild(n)),n={type:"script",instance:n,count:1,state:null},o.set(r,n))}}function Zx(e,t,a,o){var r=(r=So.current)?Ri(r):null;if(!r)throw Error(F(446));switch(e){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(t=hn(a.href),a=tn(r).hoistableStyles,o=a.get(t),o||(o={type:"style",instance:null,count:0,state:null},a.set(t,o)),o):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){e=hn(a.href);var n=tn(r).hoistableStyles,l=n.get(e);if(l||(r=r.ownerDocument||r,l={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},n.set(e,l),(n=r.querySelector(jl(e)))&&!n._p&&(l.instance=n,l.state.loading=5),na.has(e)||(a={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},na.set(e,a),n||iC(r,e,a,l.state))),t&&o===null)throw Error(F(528,""));return l}if(t&&o!==null)throw Error(F(529,""));return null;case"script":return t=a.async,a=a.src,typeof a=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(t=An(a),a=tn(r).hoistableScripts,o=a.get(t),o||(o={type:"script",instance:null,count:0,state:null},a.set(t,o)),o):{type:"void",instance:null,count:0,state:null};default:throw Error(F(444,e))}}function hn(e){return'href="'+ea(e)+'"'}function jl(e){return'link[rel="stylesheet"]['+e+"]"}function zh(e){return ke({},e,{"data-precedence":e.precedence,precedence:null})}function iC(e,t,a,o){e.querySelector('link[rel="preload"][as="style"]['+t+"]")?o.loading=1:(t=e.createElement("link"),o.preload=t,t.addEventListener("load",function(){return o.loading|=1}),t.addEventListener("error",function(){return o.loading|=2}),ft(t,"link",a),tt(t),e.head.appendChild(t))}function An(e){return'[src="'+ea(e)+'"]'}function Vl(e){return"script[async]"+e}function Wx(e,t,a){if(t.count++,t.instance===null)switch(t.type){case"style":var o=e.querySelector('style[data-href~="'+ea(a.href)+'"]');if(o)return t.instance=o,tt(o),o;var r=ke({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return o=(e.ownerDocument||e).createElement("style"),tt(o),ft(o,"style",r),Js(o,a.precedence,e),t.instance=o;case"stylesheet":r=hn(a.href);var n=e.querySelector(jl(r));if(n)return t.state.loading|=4,t.instance=n,tt(n),n;o=zh(a),(r=na.get(r))&&kd(o,r),n=(e.ownerDocument||e).createElement("link"),tt(n);var l=n;return l._p=new Promise(function(s,i){l.onload=s,l.onerror=i}),ft(n,"link",o),t.state.loading|=4,Js(n,a.precedence,e),t.instance=n;case"script":return n=An(a.src),(r=e.querySelector(Vl(n)))?(t.instance=r,tt(r),r):(o=a,(r=na.get(n))&&(o=ke({},a),Ad(o,r)),e=e.ownerDocument||e,r=e.createElement("script"),tt(r),ft(r,"link",o),e.head.appendChild(r),t.instance=r);case"void":return null;default:throw Error(F(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(o=t.instance,t.state.loading|=4,Js(o,a.precedence,e));return t.instance}function Js(e,t,a){for(var o=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),r=o.length?o[o.length-1]:null,n=r,l=0;l<o.length;l++){var s=o[l];if(s.dataset.precedence===t)n=s;else if(n!==r)break}n?n.parentNode.insertBefore(e,n.nextSibling):(t=a.nodeType===9?a.head:a,t.insertBefore(e,t.firstChild))}function kd(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function Ad(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var ei=null;function $x(e,t,a){if(ei===null){var o=new Map,r=ei=new Map;r.set(a,o)}else r=ei,o=r.get(a),o||(o=new Map,r.set(a,o));if(o.has(e))return o;for(o.set(e,null),a=a.getElementsByTagName(e),r=0;r<a.length;r++){var n=a[r];if(!(n[_l]||n[lt]||e==="link"&&n.getAttribute("rel")==="stylesheet")&&n.namespaceURI!=="http://www.w3.org/2000/svg"){var l=n.getAttribute(t)||"";l=e+l;var s=o.get(l);s?s.push(n):o.set(l,[n])}}return o}function Jx(e,t,a){e=e.ownerDocument||e,e.head.insertBefore(a,t==="title"?e.querySelector("head > title"):null)}function fC(e,t,a){if(a===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function Hh(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function cC(e,t,a,o){if(a.type==="stylesheet"&&(typeof o.media!="string"||matchMedia(o.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var r=hn(o.href),n=t.querySelector(jl(r));if(n){t=n._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=Mi.bind(e),t.then(e,e)),a.state.loading|=4,a.instance=n,tt(n);return}n=t.ownerDocument||t,o=zh(o),(r=na.get(r))&&kd(o,r),n=n.createElement("link"),tt(n);var l=n;l._p=new Promise(function(s,i){l.onload=s,l.onerror=i}),ft(n,"link",o),a.instance=n}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(a,t),(t=a.state.preload)&&(a.state.loading&3)===0&&(e.count++,a=Mi.bind(e),t.addEventListener("load",a),t.addEventListener("error",a))}}var _c=0;function uC(e,t){return e.stylesheets&&e.count===0&&ti(e,e.stylesheets),0<e.count||0<e.imgCount?function(a){var o=setTimeout(function(){if(e.stylesheets&&ti(e,e.stylesheets),e.unsuspend){var n=e.unsuspend;e.unsuspend=null,n()}},6e4+t);0<e.imgBytes&&_c===0&&(_c=62500*jw());var r=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&ti(e,e.stylesheets),e.unsuspend)){var n=e.unsuspend;e.unsuspend=null,n()}},(e.imgBytes>_c?50:800)+t);return e.unsuspend=a,function(){e.unsuspend=null,clearTimeout(o),clearTimeout(r)}}:null}function Mi(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)ti(this,this.stylesheets);else if(this.unsuspend){var e=this.unsuspend;this.unsuspend=null,e()}}}var Ti=null;function ti(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,Ti=new Map,t.forEach(dC,e),Ti=null,Mi.call(e))}function dC(e,t){if(!(t.state.loading&4)){var a=Ti.get(e);if(a)var o=a.get(null);else{a=new Map,Ti.set(e,a);for(var r=e.querySelectorAll("link[data-precedence],style[data-precedence]"),n=0;n<r.length;n++){var l=r[n];(l.nodeName==="LINK"||l.getAttribute("media")!=="not all")&&(a.set(l.dataset.precedence,l),o=l)}o&&a.set(null,o)}r=t.instance,l=r.getAttribute("data-precedence"),n=a.get(l)||o,n===o&&a.set(null,r),a.set(l,r),this.count++,o=Mi.bind(this),r.addEventListener("load",o),r.addEventListener("error",o),n?n.parentNode.insertBefore(r,n.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(r,e.firstChild)),t.state.loading|=4}}var Dl={$$typeof:Ha,Provider:null,Consumer:null,_currentValue:tr,_currentValue2:tr,_threadCount:0};function pC(e,t,a,o,r,n,l,s,i){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=uc(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=uc(0),this.hiddenUpdates=uc(null),this.identifierPrefix=o,this.onUncaughtError=r,this.onCaughtError=n,this.onRecoverableError=l,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=i,this.incompleteTransitions=new Map}function _h(e,t,a,o,r,n,l,s,i,f,d,x){return e=new pC(e,t,a,l,i,f,d,x,s),t=1,n===!0&&(t|=24),n=Ot(3,null,null,t),e.current=n,n.stateNode=e,t=$u(),t.refCount++,e.pooledCache=t,t.refCount++,n.memoizedState={element:o,isDehydrated:a,cache:t},td(n),e}function Ph(e){return e?(e=Wr,e):Wr}function qh(e,t,a,o,r,n){r=Ph(r),o.context===null?o.context=r:o.pendingContext=r,o=Co(t),o.payload={element:a},n=n===void 0?null:n,n!==null&&(o.callback=n),a=ko(e,o,t),a!==null&&(At(a,e,t),dl(a,e,t))}function ey(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<t?a:t}}function Rd(e,t){ey(e,t),(e=e.alternate)&&ey(e,t)}function Uh(e){if(e.tag===13||e.tag===31){var t=mr(e,67108864);t!==null&&At(t,e,67108864),Rd(e,67108864)}}function ty(e){if(e.tag===13||e.tag===31){var t=Pt();t=Hu(t);var a=mr(e,t);a!==null&&At(a,e,t),Rd(e,t)}}var Ei=!0;function mC(e,t,a,o){var r=G.T;G.T=null;var n=ce.p;try{ce.p=2,Md(e,t,a,o)}finally{ce.p=n,G.T=r}}function xC(e,t,a,o){var r=G.T;G.T=null;var n=ce.p;try{ce.p=8,Md(e,t,a,o)}finally{ce.p=n,G.T=r}}function Md(e,t,a,o){if(Ei){var r=Nu(o);if(r===null)zc(e,t,o,Fi,a),ay(e,o);else if(gC(r,e,t,a,o))o.stopPropagation();else if(ay(e,o),t&4&&-1<yC.indexOf(e)){for(;r!==null;){var n=vn(r);if(n!==null)switch(n.tag){case 3:if(n=n.stateNode,n.current.memoizedState.isDehydrated){var l=$o(n.pendingLanes);if(l!==0){var s=n;for(s.pendingLanes|=2,s.entangledLanes|=2;l;){var i=1<<31-_t(l);s.entanglements[1]|=i,l&=~i}ka(n),(fe&6)===0&&(bi=zt()+500,Gl(0,!1))}}break;case 31:case 13:s=mr(n,2),s!==null&&At(s,n,2),Gi(),Rd(n,2)}if(n=Nu(o),n===null&&zc(e,t,o,Fi,a),n===r)break;r=n}r!==null&&o.stopPropagation()}else zc(e,t,o,null,a)}}function Nu(e){return e=Uu(e),Td(e)}var Fi=null;function Td(e){if(Fi=null,e=jr(e),e!==null){var t=Ol(e);if(t===null)e=null;else{var a=t.tag;if(a===13){if(e=iy(t),e!==null)return e;e=null}else if(a===31){if(e=fy(t),e!==null)return e;e=null}else if(a===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return Fi=e,null}function Xh(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(oS()){case py:return 2;case my:return 8;case li:case rS:return 32;case xy:return 268435456;default:return 32}default:return 32}}var Bu=!1,Mo=null,To=null,Eo=null,Nl=new Map,Bl=new Map,yo=[],yC="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function ay(e,t){switch(e){case"focusin":case"focusout":Mo=null;break;case"dragenter":case"dragleave":To=null;break;case"mouseover":case"mouseout":Eo=null;break;case"pointerover":case"pointerout":Nl.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":Bl.delete(t.pointerId)}}function tl(e,t,a,o,r,n){return e===null||e.nativeEvent!==n?(e={blockedOn:t,domEventName:a,eventSystemFlags:o,nativeEvent:n,targetContainers:[r]},t!==null&&(t=vn(t),t!==null&&Uh(t)),e):(e.eventSystemFlags|=o,t=e.targetContainers,r!==null&&t.indexOf(r)===-1&&t.push(r),e)}function gC(e,t,a,o,r){switch(t){case"focusin":return Mo=tl(Mo,e,t,a,o,r),!0;case"dragenter":return To=tl(To,e,t,a,o,r),!0;case"mouseover":return Eo=tl(Eo,e,t,a,o,r),!0;case"pointerover":var n=r.pointerId;return Nl.set(n,tl(Nl.get(n)||null,e,t,a,o,r)),!0;case"gotpointercapture":return n=r.pointerId,Bl.set(n,tl(Bl.get(n)||null,e,t,a,o,r)),!0}return!1}function Gh(e){var t=jr(e.target);if(t!==null){var a=Ol(t);if(a!==null){if(t=a.tag,t===13){if(t=iy(a),t!==null){e.blockedOn=t,_m(e.priority,function(){ty(a)});return}}else if(t===31){if(t=fy(a),t!==null){e.blockedOn=t,_m(e.priority,function(){ty(a)});return}}else if(t===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function ai(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var a=Nu(e.nativeEvent);if(a===null){a=e.nativeEvent;var o=new a.constructor(a.type,a);$c=o,a.target.dispatchEvent(o),$c=null}else return t=vn(a),t!==null&&Uh(t),e.blockedOn=a,!1;t.shift()}return!0}function oy(e,t,a){ai(e)&&a.delete(t)}function hC(){Bu=!1,Mo!==null&&ai(Mo)&&(Mo=null),To!==null&&ai(To)&&(To=null),Eo!==null&&ai(Eo)&&(Eo=null),Nl.forEach(oy),Bl.forEach(oy)}function Ps(e,t){e.blockedOn===t&&(e.blockedOn=null,Bu||(Bu=!0,Ke.unstable_scheduleCallback(Ke.unstable_NormalPriority,hC)))}var qs=null;function ry(e){qs!==e&&(qs=e,Ke.unstable_scheduleCallback(Ke.unstable_NormalPriority,function(){qs===e&&(qs=null);for(var t=0;t<e.length;t+=3){var a=e[t],o=e[t+1],r=e[t+2];if(typeof o!="function"){if(Td(o||a)===null)continue;break}var n=vn(a);n!==null&&(e.splice(t,3),t-=3,mu(n,{pending:!0,data:r,method:a.method,action:o},o,r))}}))}function In(e){function t(i){return Ps(i,e)}Mo!==null&&Ps(Mo,e),To!==null&&Ps(To,e),Eo!==null&&Ps(Eo,e),Nl.forEach(t),Bl.forEach(t);for(var a=0;a<yo.length;a++){var o=yo[a];o.blockedOn===e&&(o.blockedOn=null)}for(;0<yo.length&&(a=yo[0],a.blockedOn===null);)Gh(a),a.blockedOn===null&&yo.shift();if(a=(e.ownerDocument||e).$$reactFormReplay,a!=null)for(o=0;o<a.length;o+=3){var r=a[o],n=a[o+1],l=r[Rt]||null;if(typeof n=="function")l||ry(a);else if(l){var s=null;if(n&&n.hasAttribute("formAction")){if(r=n,l=n[Rt]||null)s=l.formAction;else if(Td(r)!==null)continue}else s=l.action;typeof s=="function"?a[o+1]=s:(a.splice(o,3),o-=3),ry(a)}}}function jh(){function e(n){n.canIntercept&&n.info==="react-transition"&&n.intercept({handler:function(){return new Promise(function(l){return r=l})},focusReset:"manual",scroll:"manual"})}function t(){r!==null&&(r(),r=null),o||setTimeout(a,20)}function a(){if(!o&&!navigation.transition){var n=navigation.currentEntry;n&&n.url!=null&&navigation.navigate(n.url,{state:n.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var o=!1,r=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(a,100),function(){o=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),r!==null&&(r(),r=null)}}}function Ed(e){this._internalRoot=e}Yi.prototype.render=Ed.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(F(409));var a=t.current,o=Pt();qh(a,o,e,t,null,null)};Yi.prototype.unmount=Ed.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;qh(e.current,2,null,e,null,null),Gi(),t[bn]=null}};function Yi(e){this._internalRoot=e}Yi.prototype.unstable_scheduleHydration=function(e){if(e){var t=by();e={blockedOn:null,target:e,priority:t};for(var a=0;a<yo.length&&t!==0&&t<yo[a].priority;a++);yo.splice(a,0,e),a===0&&Gh(e)}};var ny=ly.version;if(ny!=="19.2.6")throw Error(F(527,ny,"19.2.6"));ce.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(F(188)):(e=Object.keys(e).join(","),Error(F(268,e)));return e=Z1(t),e=e!==null?cy(e):null,e=e===null?null:e.stateNode,e};var IC={bundleType:0,version:"19.2.6",rendererPackageName:"react-dom",currentDispatcherRef:G,reconcilerVersion:"19.2.6"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(al=__REACT_DEVTOOLS_GLOBAL_HOOK__,!al.isDisabled&&al.supportsFiber))try{Ll=al.inject(IC),Ht=al}catch{}var al;Qi.createRoot=function(e,t){if(!sy(e))throw Error(F(299));var a=!1,o="",r=Lg,n=zg,l=Hg;return t!=null&&(t.unstable_strictMode===!0&&(a=!0),t.identifierPrefix!==void 0&&(o=t.identifierPrefix),t.onUncaughtError!==void 0&&(r=t.onUncaughtError),t.onCaughtError!==void 0&&(n=t.onCaughtError),t.onRecoverableError!==void 0&&(l=t.onRecoverableError)),t=_h(e,1,!1,null,null,a,o,null,r,n,l,jh),e[bn]=t.current,Cd(e),new Ed(t)};Qi.hydrateRoot=function(e,t,a){if(!sy(e))throw Error(F(299));var o=!1,r="",n=Lg,l=zg,s=Hg,i=null;return a!=null&&(a.unstable_strictMode===!0&&(o=!0),a.identifierPrefix!==void 0&&(r=a.identifierPrefix),a.onUncaughtError!==void 0&&(n=a.onUncaughtError),a.onCaughtError!==void 0&&(l=a.onCaughtError),a.onRecoverableError!==void 0&&(s=a.onRecoverableError),a.formState!==void 0&&(i=a.formState)),t=_h(e,1,!0,t,a??null,o,r,i,n,l,s,jh),t.context=Ph(null),a=t.current,o=Pt(),o=Hu(o),r=Co(o),r.callback=null,ko(a,r,o),a=o,t.current.lanes=a,Hl(t,a),ka(t),e[bn]=t.current,Cd(e),new Yi(t)};Qi.version="19.2.6"});var Kh=ua((QR,Qh)=>{"use strict";function Yh(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Yh)}catch(e){console.error(e)}}Yh(),Qh.exports=Vh()});var Zh,Wh,Fd=T(()=>{Zh=e=>{let t,a=new Set,o=(f,d)=>{let x=typeof f=="function"?f(t):f;if(!Object.is(x,t)){let u=t;t=d??(typeof x!="object"||x===null)?x:Object.assign({},t,x),a.forEach(p=>p(t,u))}},r=()=>t,s={setState:o,getState:r,getInitialState:()=>i,subscribe:f=>(a.add(f),()=>a.delete(f))},i=t=e(o,r,s);return s},Wh=(e=>e?Zh(e):Zh)});function vC(e,t=bC){let a=Yl.default.useSyncExternalStore(e.subscribe,Yl.default.useCallback(()=>t(e.getState()),[e,t]),Yl.default.useCallback(()=>t(e.getInitialState()),[e,t]));return Yl.default.useDebugValue(a),a}var Yl,bC,$h,Jh,eI=T(()=>{Yl=_(ze(),1);Fd();bC=e=>e;$h=e=>{let t=Wh(e),a=o=>vC(t,o);return Object.assign(a,t),a},Jh=(e=>e?$h(e):$h)});var tI=T(()=>{Fd();eI()});function Dd(e){window.XRAY_Console?.setContext(e)}async function aI(e){return window.XRAY_Console?.execute(e)??null}function Nd(e){return window.XRAY_Console?.navigateHistory(e)??null}var Bd=T(()=>{"use strict"});function oI(e,t){console.warn(`[XRAY] XRAY_Store unavailable; skipping ${e} of "${t}".`)}async function Ql(e,t){return window.XRAY_Store?.get?await window.XRAY_Store.get(e)??t:(oI("read",e),t)}async function yr(e,t){if(window.XRAY_Store?.set){await window.XRAY_Store.set(e,t);return}oI("write",e)}var rI=T(()=>{"use strict"});function Tn(e){return typeof e=="string"&&fI.test(e)}function SC(e){return Ze(e,"")!==""}function Ze(e,t){if(typeof e=="string"){let a=e.trim();if(/^[0-9a-fA-F]{6}$/.test(a)&&(a="#"+a),/^#[0-9a-fA-F]{3}$/.test(a)&&(a="#"+a.slice(1).split("").map(o=>o+o).join("")),fI.test(a))return a.toLowerCase()}return t}function Zl(e){let t=e||{},a={bg:Ze(t.bg,xa.bg),surface:Ze(t.surface,xa.surface),text:Ze(t.text,xa.text),accent:Ze(t.accent,xa.accent)};for(let o of Wl){let r=t[o];SC(r)&&(a[o]=Ze(r,"#000000"))}return a}function wC(e){let t={};for(let a of Wl)Tn(e[a])&&(t[a]=Ze(e[a],"#000000"));return t}function Aa(e){let t=parseInt(e.slice(1),16);return[t>>16&255,t>>8&255,t&255]}function Za([e,t,a]){let o=r=>Math.max(0,Math.min(255,Math.round(r))).toString(16).padStart(2,"0");return`#${o(e)}${o(t)}${o(a)}`}function Rn([e,t,a]){return`${Math.round(e)}, ${Math.round(t)}, ${Math.round(a)}`}function Kl(e,t,a){return[e[0]+(t[0]-e[0])*a,e[1]+(t[1]-e[1])*a,e[2]+(t[2]-e[2])*a]}function CC([e,t,a]){return .2126*e+.7152*t+.0722*a}function kC([e,t,a]){e/=255,t/=255,a/=255;let o=Math.max(e,t,a),r=Math.min(e,t,a),n=(o+r)/2,l=0,s=0;if(o!==r){let i=o-r;s=n>.5?i/(2-o-r):i/(o+r),o===e?l=(t-a)/i+(t<a?6:0):o===t?l=(a-e)/i+2:l=(e-t)/i+4,l/=6}return[l*360,s*100,n*100]}function Mn(e,t,a){e=(e%360+360)%360,t=Math.max(0,Math.min(100,t))/100,a=Math.max(0,Math.min(100,a))/100;let o=(1-Math.abs(2*a-1))*t,r=o*(1-Math.abs(e/60%2-1)),n=a-o/2,l=0,s=0,i=0;return e<60?(l=o,s=r):e<120?(l=r,s=o):e<180?(s=o,i=r):e<240?(s=r,i=o):e<300?(l=r,i=o):(l=o,i=r),Za([(l+n)*255,(s+n)*255,(i+n)*255])}function gr(e,t){let a=Ze(e,xa.accent),[o]=kC(Aa(a));return t==="light"?{bg:Mn(o,30,96),surface:Mn(o,42,99),text:Mn(o,22,12),accent:a}:{bg:Mn(o,22,7),surface:Mn(o,18,11),text:Mn(o,16,92),accent:a}}function Ki(e){let t=Number.isFinite(e)?e:0,a=nI.length,o=nI[(Math.floor(t*a)%a+a)%a],r=(t*100%5+5)%5<1?"light":"dark";return gr(o,r)}function cI(e){let t=Ir(e);return`/* XRAY custom theme */
.xray-theme {
${Object.entries(t).map(([o,r])=>`  ${o}: ${r};`).join(`
`)}
}`}function Od(e){let t=e/255;return t<=.03928?t/12.92:Math.pow((t+.055)/1.055,2.4)}function lI([e,t,a]){return .2126*Od(e)+.7152*Od(t)+.0722*Od(a)}function hr(e,t){let a=lI(Aa(Ze(e,"#000000"))),o=lI(Aa(Ze(t,"#ffffff"))),r=Math.max(a,o),n=Math.min(a,o);return(r+.05)/(n+.05)}function uI(e){return e>=7?"AAA":e>=4.5?"AA":e>=3?"AA Large":"Fail"}function Zi(e){return{theme:"custom",customTheme:e.colors,...e.font?{font:e.font}:{},...e.radius!=null?{radius:e.radius}:{},...e.hacker!=null?{hacker:e.hacker}:{}}}function AC(e){return btoa(unescape(encodeURIComponent(e)))}function RC(e){let t=e+"=".repeat((4-e.length%4)%4);return decodeURIComponent(escape(atob(t)))}function dI(e){let t=wC(e.colors),a={c:[e.colors.bg,e.colors.surface,e.colors.text,e.colors.accent],o:Object.keys(t).length?t:void 0,f:e.font,r:e.radius,h:e.hacker?1:0};return Ld+AC(JSON.stringify(a)).replace(/=+$/,"")}function Wi(e){try{let t=String(e||"").trim();if(t=t.replace(/^#?/,"").replace(/^theme=/,""),t.startsWith(Ld)&&(t=t.slice(Ld.length)),!t)return null;let a=JSON.parse(RC(t));if(!a||!Array.isArray(a.c))return null;let o=a.o&&typeof a.o=="object"?a.o:{};return{colors:Zl({bg:a.c[0],surface:a.c[1],text:a.c[2],accent:a.c[3],...o}),font:typeof a.f=="string"?a.f:void 0,radius:typeof a.r=="number"?a.r:void 0,hacker:a.h===1}}catch{return null}}function pI(e){let t=String(e||"").trim();if(!t)return null;try{let i=JSON.parse(t);if(i&&typeof i=="object"&&(i.bg||i.accent))return Zl(i)}catch{}let a=i=>{let f=t.match(new RegExp(`--xray-${i}\\s*:\\s*(#[0-9a-fA-F]{3,6})`));return f?f[1]:void 0},o=a("bg"),r=a("surface"),n=a("text"),l=a("accent");if(!o&&!r&&!n&&!l)return null;let s={};for(let i of Wl){let f=a(i);f&&(s[i]=f)}return Zl({bg:o,surface:r,text:n,accent:l,...s})}function $i(e){let t=Aa(Ze(e.bg,xa.bg)),a=Aa(Ze(e.surface,xa.surface)),o=Aa(Ze(e.text,xa.text)),r=Ze(e.accent,xa.accent),l=CC(t)>140?TC:MC,s={bg:Za(t),surface:Za(a),surface2:Za(Kl(a,o,.1)),surface3:Za(Kl(a,o,.18)),text:Za(o),subtext:Za(Kl(o,t,.34)),hint:Za(Kl(o,t,.55)),border:Za(Kl(a,o,.16)),accent:r,green:l.green,red:l.red,yellow:l.yellow,blue:l.blue,mauve:l.mauve,teal:l.teal,peach:l.peach},i={...s};for(let f of iI)Tn(e[f])&&(i[f]=Ze(e[f],s[f]));return i}function zd(e,t){return!sI.includes(t)&&Tn(e[t])}function Ir(e){let t=$i(e),a=Aa(t.bg),o=Aa(t.surface),r=Aa(t.surface2),n=Aa(t.text),l=Tn(e.border)?Ze(e.border,t.border):`rgba(${Rn(n)}, 0.16)`;return{"--xray-bg":t.bg,"--xray-surface":t.surface,"--xray-surface2":t.surface2,"--xray-surface3":t.surface3,"--xray-text":t.text,"--xray-subtext":t.subtext,"--xray-hint":t.hint,"--xray-bg-rgb":Rn(a),"--xray-surface-rgb":Rn(o),"--xray-surface2-rgb":Rn(r),"--xray-text-rgb":Rn(n),"--xray-border":l,"--xray-accent":t.accent,"--xray-green":t.green,"--xray-red":t.red,"--xray-yellow":t.yellow,"--xray-blue":t.blue,"--xray-mauve":t.mauve,"--xray-teal":t.teal,"--xray-peach":t.peach,"--xray-operator-grid":`rgba(${Rn(n)}, 0.03)`}}var xa,sI,iI,Wl,fI,nI,Ld,MC,TC,br=T(()=>{"use strict";xa={bg:"#0f1117",surface:"#171a23",text:"#e7e9f0",accent:"#7c5cff"},sI=["bg","surface","text","accent"],iI=["bg","surface","surface2","surface3","text","subtext","hint","border","accent","green","red","yellow","blue","mauve","teal","peach"],Wl=iI.filter(e=>!sI.includes(e)),fI=/^#[0-9a-fA-F]{6}$/;nI=["#7c5cff","#22d3ee","#fb7185","#34d399","#f59e0b","#a78bfa","#38bdf8","#f472b6","#4ade80","#e879f9"];Ld="xray1:";MC={green:"#a6e3a1",red:"#f38ba8",yellow:"#f9e2af",blue:"#89b4fa",mauve:"#cba6f7",teal:"#94e2d5",peach:"#fab387"},TC={green:"#0f8a4f",red:"#d6336c",yellow:"#b7791f",blue:"#1971c2",mauve:"#7048e8",teal:"#0c8599",peach:"#d9480f"}});function En(e){if(e==null||e==="")return null;if(typeof e!="string")return e;let t=e.trim();if(!t||!t.startsWith("{")&&!t.startsWith("["))return e;try{return JSON.parse(t)}catch{return e}}function ya(e,t,a,o){if(typeof e=="string"&&e.trim()===""||typeof e!="number"&&typeof e!="string")return t;let r=Number(e);return Number.isFinite(r)?Math.min(o,Math.max(a,Math.round(r))):t}function se(e){if(!e)return null;if(Hd.has(e))return Hd.get(e);let t=En(e.responseDecrypted??e.responseRaw??e.response??null);return Hd.set(e,t),t}function Pd(e){if(!e)return null;if(_d.has(e))return _d.get(e);let t=la(se(e));return _d.set(e,t),t}function sa(e){return e?En(e.requestBody??null):null}function Ra(e){let t=e||Date.now(),a=Math.floor(t/1e3),o=Ji.get(a);if(o!==void 0)return o;Ji.size>512&&Ji.clear();let r=EC.format(t);return Ji.set(a,r),r}function ef(e,t=6){if(e==null||typeof e!="object"||t<=0)return e;if(Array.isArray(e))return e.map(o=>ef(o,t-1));let a={};for(let[o,r]of Object.entries(e))o!=="__xray_ref__"&&(a[o]=ef(r,t-1));return a}function Tt(e){let t=Number(e)||0;return t>=1024*1024?(t/(1024*1024)).toFixed(1)+"mb":t>=1024?(t/1024).toFixed(1)+"kb":t+"b"}function ia(e,t=220){if(e===void 0)return"undefined";if(e===null)return"null";if(typeof e=="string")return e.length>t?e.slice(0,t)+"...":e;if(typeof e=="number"||typeof e=="boolean")return String(e);try{let a=JSON.stringify(e);return a.length>t?a.slice(0,t)+"...":a}catch{return String(e)}}function Z(e,t=2,a=8e4){let o=[],r="";try{r=JSON.stringify(e,function(n,l){if(typeof l=="bigint")return l.toString()+"n";if(l&&typeof l=="object"){for(;o.length>0&&o[o.length-1]!==this;)o.pop();if(o.includes(l))return"[Circular]";o.push(l)}return l},t)??"undefined"}catch{r=String(e)}return r.length<=a?r:r.slice(0,a)+`
... truncated ${r.length-a} chars`}function fa(e){return(e||"GET").toLowerCase()}function Xt(e){let t=Number(e)||0;return t>=400?"error":t>=300?"warn":t>=200?"ok":""}function tf(e){return e.type==="network"&&e.args?.[0]&&typeof e.args[0]=="object"?e.args[0]:null}function mI(e){return`'${String(e??"").replace(/'/g,"'\\''")}'`}function af(e){return window.XRAY_ConsoleHelpers?.generateCurl?window.XRAY_ConsoleHelpers.generateCurl(e):e?`curl ${mI(e.url||"")} -X ${mI((e.method||"GET").toUpperCase())}`:"// Select an API request first"}function of(e){return window.XRAY_ConsoleHelpers?.generateFetch?window.XRAY_ConsoleHelpers.generateFetch(e):e?`fetch(${JSON.stringify(e.url||"")})`:"// Select an API request first"}function xI(e){let t=window.XRAY_ConsoleHelpers?.buildMock?.(e)||se(e);return Z(t,2,12e4)}async function ct(e){try{await navigator.clipboard?.writeText?.(e)}catch{}}function yI(e,t,a="text/plain;charset=utf-8"){let o=new Blob([t],{type:a}),r=URL.createObjectURL(o),n=document.createElement("a");n.href=r,n.download=e,n.click(),URL.revokeObjectURL(r)}function la(e){return window.XRAY_ConsoleHelpers?.schema?window.XRAY_ConsoleHelpers.schema(e):e===null?"null":Array.isArray(e)?e.length?[la(e[0])]:"array":typeof e=="object"?Object.fromEntries(Object.entries(e||{}).map(([t,a])=>[t,la(a)])):typeof e}var Hd,_d,EC,Ji,Ae=T(()=>{"use strict";Hd=new WeakMap,_d=new WeakMap;EC=new Intl.DateTimeFormat("en-US",{hour12:!1,hour:"2-digit",minute:"2-digit",second:"2-digit"}),Ji=new Map});function _C(e){let t=e.replace("#","");if(t.length!==6)return!1;let a=[0,2,4].map(l=>{let s=parseInt(t.slice(l,l+2),16)/255;return s<=.03928?s/12.92:((s+.055)/1.055)**2.4}),[o,r,n]=a;return .2126*o+.7152*r+.0722*n>.35}function PC(e){return e.theme==="custom"?_C(e.customTheme?.bg??""):HC.has(e.theme)}function Fn(e){let t=PC(e)?zC:qd;return t[e.accent]??t.blue}function qC(e,t){return FC.includes(e)?e:t}function UC(e,t){return DC.includes(e)?e:t}function XC(e,t){return NC.includes(e)?e:t}function GC(e,t){return BC.includes(e)?e:t}function jC(e,t){return OC.includes(e)?e:t}function VC(e,t){return LC.includes(e)?e:t}function sf(e){let t=Object.fromEntries(Object.entries(e||{}).filter(([,o])=>o!==void 0)),a={...We,...t};return{captureFetch:!!a.captureFetch,captureXhr:!!a.captureXhr,captureWs:!!a.captureWs,maxEntries:ya(a.maxEntries,We.maxEntries,50,5e3),slowThresholdMs:ya(a.slowThresholdMs,We.slowThresholdMs,100,5e3),verySlowThresholdMs:ya(a.verySlowThresholdMs,We.verySlowThresholdMs,200,1e4),defaultDetailView:qC(a.defaultDetailView,We.defaultDetailView),compactRows:!!a.compactRows,showHostInPath:!!a.showHostInPath,accent:UC(a.accent,We.accent),theme:XC(a.theme,We.theme),customTheme:Zl(a.customTheme),font:GC(a.font,We.font),density:jC(a.density,We.density),radius:ya(a.radius,We.radius,0,20),glow:!!a.glow,hacker:!!a.hacker,confirmDestructiveActions:!!a.confirmDestructiveActions,panelWidth:ya(a.panelWidth,We.panelWidth,rf,nf),dockSide:VC(a.dockSide,We.dockSide),apiSplit:ya(a.apiSplit,We.apiSplit,0,2e3),logsSplit:ya(a.logsSplit,We.logsSplit,0,2e3)}}var FC,DC,NC,BC,OC,LC,rf,nf,qd,zC,HC,lf,We,Dn=T(()=>{"use strict";br();Ae();FC=["tree","grid","raw","schema","diff","viz","waterfall","headers"],DC=["blue","mauve","teal","green","peach","coral"],NC=["operator","dev-edition","midnight","light-lab","claude","custom"],BC=["jetbrains","cascadia","iosevka","system"],OC=["compact","comfortable","spacious"],LC=["left","right"],rf=360,nf=2e3,qd={blue:"#89b4fa",mauve:"#cba6f7",teal:"#94e2d5",green:"#a6e3a1",peach:"#fab387",coral:"#d97757"},zC={blue:"#1e66f5",mauve:"#8839ef",teal:"#0f7a80",green:"#2f8a1f",peach:"#c4560a",coral:"#b84a24"},HC=new Set(["light-lab","claude"]);lf={jetbrains:"'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",cascadia:"'Cascadia Code', 'Cascadia Mono', 'JetBrains Mono', monospace",iosevka:"'Iosevka', 'JetBrains Mono', 'Fira Code', monospace",system:"ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"},We={captureFetch:!0,captureXhr:!0,captureWs:!0,maxEntries:1e3,slowThresholdMs:500,verySlowThresholdMs:1e3,defaultDetailView:"tree",compactRows:!1,showHostInPath:!0,accent:"blue",theme:"operator",customTheme:xa,font:"jetbrains",density:"compact",radius:10,glow:!0,hacker:!1,confirmDestructiveActions:!0,panelWidth:960,dockSide:"right",apiSplit:0,logsSplit:0}});function gI(e){return{activeTab:e.activeTab,detailView:e.detailView,detailTab:e.detailTab,consoleMiniTab:e.consoleMiniTab,networkFilter:e.networkFilter,apiSearchQuery:e.apiSearchQuery,apiQuickFilter:e.apiQuickFilter,apiGroupingMode:e.apiGroupingMode,apiDetailOpen:e.apiDetailOpen,apiDrawerPlacement:e.apiDrawerPlacement,methodFilters:Array.from(e.methodFilters),statusFilters:Array.from(e.statusFilters),typeFilters:Array.from(e.typeFilters),expandedGroups:Array.from(e.expandedGroups),collapsedSections:Array.from(e.collapsedSections),sortField:e.sortField,sortOrder:e.sortOrder,recording:e.recording,pinnedIds:Array.from(e.pinnedIds),snippets:e.snippets,settings:e.settings}}function QC(e){return Array.isArray(e)?e.filter(a=>a&&typeof a.id=="string"&&typeof a.code=="string").slice(0,30).map(a=>({id:a.id,title:a.title,code:a.code})):void 0}function hI(e){let t=QC(e.snippets);return{...e.activeTab&&YC.includes(e.activeTab)?{activeTab:e.activeTab}:{},...e.detailView?{detailView:e.detailView}:{},...e.detailTab?{detailTab:e.detailTab}:{},...e.consoleMiniTab?{consoleMiniTab:e.consoleMiniTab}:{},...e.networkFilter?{networkFilter:e.networkFilter}:{},...typeof e.apiSearchQuery=="string"?{apiSearchQuery:e.apiSearchQuery}:{},...e.apiQuickFilter?{apiQuickFilter:e.apiQuickFilter}:{},...e.apiGroupingMode?{apiGroupingMode:e.apiGroupingMode}:{},...typeof e.apiDetailOpen=="boolean"?{apiDetailOpen:e.apiDetailOpen}:{},...e.apiDrawerPlacement?{apiDrawerPlacement:e.apiDrawerPlacement}:{},...Array.isArray(e.methodFilters)?{methodFilters:new Set(e.methodFilters)}:{},...Array.isArray(e.statusFilters)?{statusFilters:new Set(e.statusFilters)}:{},...Array.isArray(e.typeFilters)?{typeFilters:new Set(e.typeFilters)}:{},...Array.isArray(e.expandedGroups)?{expandedGroups:new Set(e.expandedGroups)}:{},...Array.isArray(e.collapsedSections)?{collapsedSections:new Set(e.collapsedSections)}:{},...e.sortField?{sortField:e.sortField}:{},...e.sortOrder?{sortOrder:e.sortOrder}:{},...typeof e.recording=="boolean"?{recording:e.recording}:{},...Array.isArray(e.pinnedIds)?{pinnedIds:new Set(e.pinnedIds)}:{},...t?{snippets:t}:{},...e.settings?{settings:sf(e.settings)}:{}}}var Ud,YC,II=T(()=>{"use strict";Dn();Ud="react_panel_preferences",YC=["console","api","logs","rules","insights"]});function Xd(){return"rule_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,8)}function bI(){return{id:Xd(),label:"New rule",enabled:!0,match:{url:"",method:""},action:{type:"mock",status:200,body:`{
  "mocked": true
}`,headers:{},delayMs:0}}}function cf(e){let t=e||{},a=t.match||{url:"",method:""},o=t.action||{type:"mock",status:200,body:"",headers:{},delayMs:0},r=["mock","delay","fail","passthrough"].includes(o.type)?o.type:"mock",n={};return o.headers&&typeof o.headers=="object"&&Object.entries(o.headers).forEach(([l,s])=>{typeof l=="string"&&l&&(n[l]=String(s))}),{id:typeof t.id=="string"&&t.id?t.id:Xd(),label:typeof t.label=="string"?t.label.slice(0,120):"Rule",enabled:t.enabled!==!1,match:{url:typeof a.url=="string"?a.url.slice(0,2e3):"",method:typeof a.method=="string"?a.method.toUpperCase().slice(0,12):""},action:{type:r,status:ya(o.status,200,200,599),body:typeof o.body=="string"?o.body.slice(0,1e5):"",headers:n,delayMs:ya(o.delayMs,0,0,6e4)}}}function uf(e){return Array.isArray(e)?e.slice(0,KC).map(t=>cf(t)):[]}function vI(e){return e.filter(t=>t.enabled&&t.match.url.trim()).map(t=>({id:t.id,enabled:!0,match:{url:t.match.url.trim(),method:t.match.method},action:t.action}))}function SI(e){let t=e.match.method||"ANY";return e.action.type==="mock"?`${t} \u2192 mock ${e.action.status}`:e.action.type==="fail"?`${t} \u2192 network failure`:e.action.type==="delay"?`${t} \u2192 delay ${e.action.delayMs}ms`:`${t} \u2192 passthrough`}function CI(e){return JSON.stringify({[ZC]:1,rules:e},null,2)}function kI(e){let t=String(e||"").trim();if(!t)return null;let a;try{a=JSON.parse(t)}catch{return null}let o=Array.isArray(a)?a:a&&typeof a=="object"&&Array.isArray(a.rules)?a.rules:null;if(!o||!o.length)return null;let r=uf(o).map(n=>({...n,id:Xd()}));return r.length?r:null}var ff,KC,wI,ZC,df=T(()=>{"use strict";Ae();ff="traffic_rules",KC=50;wI=[{label:"Throttle all (+2s)",rule:{label:"Throttle all (+2s)",match:{url:"re:.*",method:""},action:{type:"delay",status:200,body:"",headers:{},delayMs:2e3}}},{label:"Offline (fail all)",rule:{label:"Offline (fail all)",match:{url:"re:.*",method:""},action:{type:"fail",status:0,body:"",headers:{},delayMs:0}}},{label:"Force 500 on /api",rule:{label:"Force 500 on /api",match:{url:"/api/",method:""},action:{type:"mock",status:500,body:`{
  "error": "Injected server error"
}`,headers:{},delayMs:0}}},{label:"Empty list on /api",rule:{label:"Empty list on /api",match:{url:"/api/",method:"GET"},action:{type:"mock",status:200,body:"[]",headers:{},delayMs:0}}},{label:"Rate limit (429)",rule:{label:"Rate limit (429)",match:{url:"/api/",method:""},action:{type:"mock",status:429,body:`{
  "error": "Too many requests"
}`,headers:{},delayMs:0}}}],ZC="xray-rules"});function WC(){return window.__XRAY_BRIDGE_TOKEN__||window.__XRAY_bridgeToken||void 0}function $C(){try{let e=chrome.devtools?.inspectedWindow?.tabId;return typeof e=="number"&&Number.isInteger(e)&&e>=0?e:null}catch{return null}}function pf(e,t){let a=WC(),o=e==="config"?"__xray_config__":"__xray_replay__";if(a)try{return window.postMessage({[o]:!0,source:"xray-react-ui",token:a,...t},"*"),!0}catch{return!1}let r=$C(),n=typeof chrome<"u"?chrome.runtime:void 0;if(r!=null&&n?.sendMessage)try{return n.sendMessage({type:"xray:page-bridge",tabId:r,kind:e,...t},()=>{n.lastError}),!0}catch{return!1}return!1}function mf(e){pf("config",{config:{captureFetch:e.captureFetch,captureXhr:e.captureXhr,captureWs:e.captureWs}})}function xf(e){pf("config",{config:{rules:vI(e)}})}var AI=T(()=>{"use strict";df()});function Pe(e){return e.type==="api"}function Gd(e){return e.type==="log"}function ne(e){return String(e.urlPath||e.url||"(unknown)")}function Et(e){let t=ne(e);return e.graphql?.operationName?`${t}#${e.graphql.operationName}`:t}function $l(e){return e.graphql?.operationName?`${e.graphql.operationType} ${e.graphql.operationName}`:ne(e)}function yf(e){let t=String(e.url||"");if(!t)return"";try{return new URL(t).host}catch{return""}}function RI(e,t){if(!e||typeof e!="object")return"";let a=t.toLowerCase(),o=Object.entries(e).find(([r])=>r.toLowerCase()===a);return o?String(o[1]??""):""}function zo(e){return String(e.contentType||RI(e.responseHeaders,"content-type")||RI(e.requestHeaders,"content-type")||"")}function ie(e){return Math.max(0,Number(e?.duration)||0)}function JC(e){let t=Number(e.status)||0;return t>=500?"5xx":t>=400?"4xx":t>=300?"3xx":t>=200?"2xx":"other"}function DI(e,t,a=500){let o=e.filter(Pe),r=o.reduce((s,i)=>s+ie(i),0),n=new Map;o.forEach(s=>{let i=ne(s);n.set(i,(n.get(i)||0)+1)});let l=Array.from(n.entries()).sort((s,i)=>i[1]-s[1])[0]?.[0]||"No endpoint yet";return{total:o.length,errors:o.filter(s=>Number(s.status)>=400).length,slow:o.filter(s=>ie(s)>=a).length,pinned:o.filter(s=>t.has(s.id)).length,avgDuration:o.length?r/o.length:0,totalBytes:o.reduce((s,i)=>s+(Number(i.size)||0),0),topEndpoint:l,repeatedEndpoints:Array.from(n.values()).filter(s=>s>=3).length}}function e2(e){let t=MI.get(e);if(t)return t;t=new Map;let a=new Map;for(let o of e){if(!Pe(o))continue;let r=Et(o),n=t.get(r)||{count:0,errors:0,avgDuration:0,maxDuration:0},l=ie(o);n.count+=1,Number(o.status)>=400&&(n.errors+=1),n.maxDuration=Math.max(n.maxDuration,l),a.set(r,(a.get(r)||0)+l),t.set(r,n)}for(let[o,r]of t)r.avgDuration=r.count?(a.get(o)||0)/r.count:0;return MI.set(e,t),t}function gf(e,t){return e2(t).get(Et(e))||{count:0,errors:0,avgDuration:0,maxDuration:0}}function NI(e){let t=TI.get(e);if(t)return t;let a=e.responseDecrypted??e.responseRaw??e.response,o=!1;if(Number(e.status)===204||a==null||a==="")o=!0;else{let l=se(e);Array.isArray(l)?o=l.length===0:l&&typeof l=="object"&&(o=Object.keys(l).length===0)}let r=Number(e.size)>=1e5;r||(typeof a=="string"?r=a.length>=1e5:a!=null&&(r=Z(a,0,12e4).length>=1e5));let n={empty:o,large:r};return TI.set(e,n),n}function BI(e){return NI(e).empty}function OI(e){return NI(e).large}function t2(e,t,a=new Set,o=500){if(!Pe(e))return a.has(e.id)?["pinned"]:[];let r=[],n=Number(e.status)||0,l=gf(e,t);return n>=400&&r.push("error"),e.driftFromId&&r.push("drift"),e.mocked&&r.push("mocked"),e.replayed&&r.push("replayed"),e.graphql&&r.push("graphql"),(e.source==="ws"||e.source==="sse")&&r.push("ws"),ie(e)>=o&&r.push("slow"),l.count>=3&&r.push("repeated"),OI(e)&&r.push("large"),BI(e)&&r.push("empty"),a.has(e.id)&&r.push("pinned"),r}function a2(e,t,a,o=new Set,r=500){return t==="all"?!0:t==="drift"?!!e.driftFromId:t==="graphql"?!!e.graphql:t==="ws"?e.source==="ws"||e.source==="sse":t==="mocked"?!!e.mocked:t==="replayed"?!!e.replayed:t==="errors"?(Number(e.status)||0)>=400:t==="slow"?ie(e)>=r:t==="pinned"?o.has(e.id):t==="repeated"?gf(e,a).count>=3:t==="large"?OI(e):t==="empty"?BI(e):!0}function o2(e,t){if(!t)return!0;let a=EI.get(e);return a===void 0&&(a=[e.method,e.status,e.url,e.urlPath,e.source,yf(e),zo(e),e.logLevel,e.message,ia(e.logData,240)].join(" ").toLowerCase(),EI.set(e,a)),a.includes(t.toLowerCase())}function r2(e){let t=new Map;return e.filter(Pe).forEach(a=>{let o=Et(a),r=t.get(o)||[];r.push(a),t.set(o,r)}),Array.from(t.entries()).map(([a,o])=>{let r=o.slice().sort((s,i)=>Number(i.timestamp)-Number(s.timestamp)),n=r.reduce((s,i)=>s+ie(i),0),l=$l(r[0]);return{key:"api:"+a,path:l,entries:r,latestEntry:r[0],count:r.length,errors:r.filter(s=>Number(s.status)>=400).length,avgDuration:r.length?n/r.length:0,maxDuration:r.reduce((s,i)=>Math.max(s,ie(i)),0),totalBytes:r.reduce((s,i)=>s+(Number(i.size)||0),0),lastSeen:Number(r[0]?.timestamp)||0,methods:Array.from(new Set(r.map(s=>String(s.method||"GET").toUpperCase()))),sources:Array.from(new Set(r.map(s=>String(s.source||"fetch").toLowerCase())))}})}function FI(e,t,a,o){let r=o==="asc"?1:-1,n=i=>a==="method"?String(i.method||""):a==="status"?Number(i.status)||0:a==="url"?ne(i):a==="duration"?Number(i.duration)||0:a==="size"?Number(i.size)||0:Number(i.timestamp)||0,l=n(e),s=n(t);return typeof l=="number"&&typeof s=="number"?(l-s)*r:String(l).localeCompare(String(s))*r}function LI(e){let{mode:t,entries:a,query:o,statusFilters:r,typeFilters:n,methodFilters:l=new Set,expandedGroups:s,pinnedIds:i,sortField:f,sortOrder:d,slowThresholdMs:x=500,apiQuickFilter:u="all",apiGroupingMode:p="endpoint"}=e,v=a.filter(t==="api"?Pe:Gd).filter(m=>o2(m,o)).filter(m=>t!=="api"||a2(m,u,a,i,x)).filter(m=>t!=="api"||!l.size||l.has(String(m.method||"GET").toUpperCase())).filter(m=>t!=="api"||!r.size||r.has(JC(m))).filter(m=>t!=="api"||!n.size||n.has(String(m.source||"fetch").toLowerCase())),w=(m,g)=>{let k=i.has(m.id)?1:0;return(i.has(g.id)?1:0)-k||FI(m,g,f,d)},E=m=>t2(m,a,i,x);if(t==="logs")return v.slice().sort(w).map(m=>({key:m.id,entry:m,flags:E(m)}));if(p==="flat")return v.slice().sort(w).map(m=>({key:m.id,entry:m,flags:E(m)}));let y=r2(v).sort((m,g)=>{let k=m.entries.some(b=>i.has(b.id))?1:0;return(g.entries.some(b=>i.has(b.id))?1:0)-k||FI(m.latestEntry,g.latestEntry,f,d)}),c=[];return y.forEach(m=>{let g=m.entries.slice().sort(w),k=s.has(m.key);c.push({key:m.key,entry:g[0],flags:E(g[0]),groupKey:m.key,groupCount:g.length,groupExpanded:k,groupStats:m}),k&&g.length>1&&g.slice(1).forEach(N=>c.push({key:N.id,entry:N,flags:E(N),groupKey:m.key,groupChild:!0}))}),c}var MI,TI,EI,Gt=T(()=>{"use strict";Ae();MI=new WeakMap;TI=new WeakMap;EI=new WeakMap});function bf(e){if(!Pe(e))return"";let t=Number(e.status)||0;if(t>=400||t===0)return"";let a=hf.get(e.id);if(a!==void 0)return a;let o=se(e),r=o==null?"":Z(la(o),0,2e4);return hf.size>4096&&hf.clear(),hf.set(e.id,r),r}function jd(e){let t=If.get(e.id);if(t!==void 0)return t;let a=Et(e);return If.size>4096&&If.clear(),If.set(e.id,a),a}function zI(e){let t=new Map;for(let a of e)Vd(t,a);return t}function Vd(e,t){!Pe(t)||!bf(t)||e.set(jd(t),t)}function HI(e,t,a){let o=bf(e);if(!o)return{driftFromId:null};let r=jd(e);if(a){let n=a.get(r);if(!n||n.id===e.id)return{driftFromId:null};let l=bf(n);return{driftFromId:!l||l===o?null:n.id}}for(let n=t.length-1;n>=0;n-=1){let l=t[n];if(!Pe(l)||l.id===e.id||jd(l)!==r)continue;let s=bf(l);if(s)return{driftFromId:s===o?null:l.id}}return{driftFromId:null}}var hf,If,_I=T(()=>{"use strict";Gt();Ae();hf=new Map;If=new Map});function Nn(e){if(typeof e=="string")return e.length>2e4?e.slice(0,2e4)+"\u2026":e;if(!e||typeof e!="object")return e;try{let t=JSON.stringify(e);return!t||t.length<=2e4?e:t.slice(0,2e4)+"\u2026"}catch{return}}function PI(e){return e.slice(-500).map(t=>{let a={...t};return a.responseRaw=Nn(t.responseRaw),a.responseDecrypted=Nn(t.responseDecrypted),a.requestBody=Nn(t.requestBody),a.logData=Nn(t.logData),a.message=typeof t.message=="string"?Nn(t.message):t.message,Array.isArray(t.args)&&(a.args=t.args.slice(0,20).map(Nn)),Array.isArray(t.wsFrames)&&t.wsFrames.length>50&&(a.wsFrames=t.wsFrames.slice(-50)),a})}function qI(e){return Array.isArray(e)?e.filter(t=>!!t&&typeof t=="object"&&typeof t.id=="string").slice(-500):[]}var vf,Yd,UI=T(()=>{"use strict";vf="session_entries",Yd="ai_settings"});function jI(e){if(e.type==="api"){let o=Number(e.status)||0;return{id:"evt_"+e.id,type:"network",level:o>=400?"error":o>=300?"warn":"info",timestamp:Number(e.timestamp)||Date.now(),message:`${e.method||"GET"} ${e.status||""} ${e.urlPath||e.url||""}`.trim(),args:[e],entryId:e.id}}let t=e.logLevel||"log",a=Array.isArray(e.args)?e.args:Array.isArray(e.logData)?e.logData:[e.logData??e.message??""];return{id:"evt_"+e.id,type:"log",level:t,timestamp:Number(e.timestamp)||Date.now(),message:String(e.message??a.map(o=>typeof o=="string"?o:n2(o)).join(" ")).slice(0,600),args:a,entryId:e.id}}function n2(e){try{return JSON.stringify(e,(t,a)=>t==="__xray_ref__"?void 0:a)??String(e)}catch{return String(e)}}function VI(e){Qd||(Qd=setTimeout(()=>{Qd=null;try{yr(vf,PI(e().entries))}catch{}},4e3))}function Cf(e){vr&&(clearTimeout(vr),vr=null),yr(ff,e),xf(e)}function l2(e){vr&&clearTimeout(vr),vr=setTimeout(()=>{vr=null,yr(ff,e),xf(e)},300)}function be(e){yr(Ud,gI(e))}function YI(){let{entries:e,selectedId:t}=I.getState();return t&&e.find(a=>a.id===t)||null}var XI,Jl,GI,Qd,Sf,Ho,wf,Kd,I,vr,$e=T(()=>{"use strict";tI();Bd();rI();II();Dn();AI();_I();df();UI();XI=1e3,Jl=2e3,GI={provider:"anthropic",model:"claude-fable-5",apiKey:"",baseUrl:"",authHeader:"authorization",authPrefix:"Bearer "},Qd=null,Sf=null;Ho=[],wf=new Map,Kd=null,I=Jh((e,t)=>({initialized:!1,open:!1,devtoolsMode:!1,activeTab:"console",detailView:"tree",detailTab:"response",consoleMiniTab:"network",networkFilter:"all",searchQuery:"",apiSearchQuery:"",apiQuickFilter:"all",apiGroupingMode:"flat",apiDetailOpen:!1,apiDrawerPlacement:"right",methodFilters:new Set,statusFilters:new Set,typeFilters:new Set,expandedGroups:new Set,collapsedSections:new Set,sortField:"timestamp",sortOrder:"desc",recording:!0,pausedCount:0,entries:[],consoleEvents:[],consoleDraft:"",snippets:[{id:"snip_default",title:"Response schema",code:"schema(res)"}],rules:[],aiSettings:GI,selectedId:null,expandedId:null,pinnedIds:new Set,exportOpen:!1,settingsOpen:!1,settingsSection:"general",commandOpen:!1,globalSearchOpen:!1,replayEditorEntry:null,explainEntry:null,pendingConfirmation:null,settings:We,toastMessage:null,setInitialized:a=>e({initialized:a}),setOpen:a=>{window.__XRAY_focusTrapActive=a;let o=!t().devtoolsMode;if(a&&o){let r=document.activeElement;Sf=r instanceof HTMLElement&&r.id!=="__xray_root__"?r:null}if(e({open:a}),!a&&o&&Sf){let r=Sf;Sf=null;try{r.focus()}catch{}}},setDevtoolsMode:a=>e({devtoolsMode:a,open:a?!0:t().open}),setActiveTab:a=>{e({activeTab:a}),be(t())},setDetailView:a=>{e({detailView:a}),be(t())},setDetailTab:a=>{e({detailTab:a}),be(t())},setConsoleMiniTab:a=>{e({consoleMiniTab:a}),be(t())},setNetworkFilter:a=>{e({networkFilter:a}),be(t())},setSearchQuery:a=>e({searchQuery:a}),setApiSearchQuery:a=>{e({apiSearchQuery:a}),be(t())},setApiQuickFilter:a=>{e({apiQuickFilter:a}),be(t())},setApiGroupingMode:a=>{e({apiGroupingMode:a}),be(t())},setApiDetailOpen:a=>{e({apiDetailOpen:a}),be(t())},setApiDrawerPlacement:a=>{e({apiDrawerPlacement:a}),be(t())},toggleMethodFilter:a=>{let o=new Set(t().methodFilters),r=a.toUpperCase();o.has(r)?o.delete(r):o.add(r),e({methodFilters:o}),be(t())},toggleStatusFilter:a=>{let o=new Set(t().statusFilters);o.has(a)?o.delete(a):o.add(a),e({statusFilters:o}),be(t())},toggleTypeFilter:a=>{let o=new Set(t().typeFilters);o.has(a)?o.delete(a):o.add(a),e({typeFilters:o}),be(t())},clearApiFilters:()=>{e({apiQuickFilter:"all",methodFilters:new Set,statusFilters:new Set,typeFilters:new Set}),be(t())},togglePinned:a=>{let o=new Set(t().pinnedIds);o.has(a)?o.delete(a):o.add(a),e({pinnedIds:o}),be(t())},clearPinned:()=>{e({pinnedIds:new Set}),be(t())},toggleGroup:a=>{let o=new Set(t().expandedGroups);o.has(a)?o.delete(a):o.add(a),e({expandedGroups:o}),be(t())},toggleSection:a=>{let o=new Set(t().collapsedSections);o.has(a)?o.delete(a):o.add(a),e({collapsedSections:o}),be(t())},setSort:a=>{let{sortField:o,sortOrder:r}=t();e({sortField:a,sortOrder:o===a&&r==="desc"?"asc":"desc"}),be(t())},setRecording:a=>{if(a&&Ho.length){let o=Ho;Ho=[],e({recording:!0,pausedCount:0,consoleEvents:[...t().consoleEvents,...o].slice(-Jl)})}else e({recording:a,...a?{pausedCount:0}:{}});be(t())},addEntry:a=>t().addEntries([a]),addEntries:a=>{if(!a.length)return;let o=t(),r=Math.max(50,Math.min(5e3,Number(o.settings.maxEntries)||XI)),n=o.entries.slice(),l=zI(n),s=[];for(let f of a){if(!f)continue;let d=f.id||"entry_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,8),x=HI({...f,id:d},n,l),u={...f,id:d,...x.driftFromId?{driftFromId:x.driftFromId}:{}};n.push(u),Vd(l,u),s.push(jI(u))}let i={entries:n.length>r?n.slice(-r):n};o.recording?i.consoleEvents=[...o.consoleEvents,...s].slice(-Jl):(Ho=[...Ho,...s].slice(-Jl),i.pausedCount=Ho.length),e(i),VI(t)},updateEntry:a=>{let o=wf.get(a.id);wf.set(a.id,o?{...o,...a}:a),Kd===null&&(Kd=window.setTimeout(()=>{Kd=null;let r=wf;if(!r.size)return;wf=new Map;let n=!1,l=t().entries.map(s=>{let i=r.get(s.id);return i?(n=!0,{...s,...i}):s});n&&(e({entries:l}),VI(t))},50))},restoreEntries:a=>{if(!a.length)return;let o=Math.max(50,Math.min(5e3,Number(t().settings.maxEntries)||XI)),r=new Set(t().entries.map(i=>i.id)),n=a.filter(i=>!r.has(i.id)),l=[...n,...t().entries].slice(-o),s=n.map(jI);e({entries:l,consoleEvents:[...s,...t().consoleEvents].slice(-Jl)})},addRule:a=>{let o=cf({...bI(),...a||{}}),r=[...t().rules,o].slice(0,50);e({rules:r,activeTab:"rules"}),Cf(r)},updateRule:(a,o)=>{let r=t().rules.map(n=>n.id===a?cf({...n,...o,match:{...n.match,...o.match||{}},action:{...n.action,...o.action||{}}}):n);e({rules:r}),l2(r)},removeRule:a=>{let o=t().rules.filter(r=>r.id!==a);e({rules:o}),Cf(o)},toggleRule:a=>{let o=t().rules.map(r=>r.id===a?{...r,enabled:!r.enabled}:r);e({rules:o}),Cf(o)},setRules:a=>{let o=uf(a);e({rules:o}),Cf(o)},setAiSettings:a=>{let o={...t().aiSettings,...a};e({aiSettings:o}),yr(Yd,o)},replayEntry:(a,o)=>{let r={...a,...o||{}},n={url:String(r.url||""),method:String(r.method||"GET"),headers:r.requestHeaders||{},body:r.requestBody??null,replayOf:a.id};pf("replay",{request:n})?t().showToast("Replaying request\u2026"):t().showToast("Replay needs a live page \u2014 open XRAY on the page itself.")},openReplayEditor:a=>e({replayEditorEntry:a}),closeReplayEditor:()=>e({replayEditorEntry:null}),openExplain:a=>e({explainEntry:a}),closeExplain:()=>e({explainEntry:null}),clearConsole:()=>{Ho=[],e({consoleEvents:[],expandedId:null,pausedCount:0})},clearEntries:()=>{Ho=[],Dd(null),e({entries:[],consoleEvents:[],selectedId:null,expandedId:null,pinnedIds:new Set,pausedCount:0}),be(t()),yr(vf,[])},addConsoleEvent:a=>{let o=[...t().consoleEvents,a].slice(-Jl);e({consoleEvents:o,expandedId:a.type==="result"||a.type==="error"?a.id:t().expandedId})},setConsoleDraft:a=>e({consoleDraft:a}),insertConsoleCommand:a=>e({consoleDraft:a,activeTab:"console"}),saveSnippet:a=>{let o=a.code.trim();if(!o)return;let r=t().snippets.filter(s=>s.code!==o),l=[{id:"snip_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,8),title:a.title,code:o},...r].slice(0,30);e({snippets:l,activeTab:"console"}),be(t())},renameSnippet:(a,o)=>{let r=o.trim();e({snippets:t().snippets.map(n=>n.id===a?{...n,title:r||void 0}:n)}),be(t())},removeSnippet:a=>{e({snippets:t().snippets.filter(o=>o.id!==a)}),be(t())},selectEntry:(a,o)=>{let r=a&&t().entries.find(l=>l.id===a)||null;Dd(r);let n=o?.openDetail!==!1;e({selectedId:a,expandedId:a?"evt_"+a:null,apiDetailOpen:r?.type==="api"&&n?!0:t().apiDetailOpen})},toggleExpanded:a=>e({expandedId:t().expandedId===a?null:a}),setExportOpen:a=>e({exportOpen:a}),setSettingsOpen:a=>e({settingsOpen:a}),openSettings:a=>e({settingsSection:a,settingsOpen:!0}),setCommandOpen:a=>e({commandOpen:a}),setGlobalSearchOpen:a=>e({globalSearchOpen:a}),updateSettings:a=>{let o=sf({...t().settings,...a});e({settings:o,detailView:a.defaultDetailView?o.defaultDetailView:t().detailView,entries:t().entries.slice(-o.maxEntries)}),mf(o),be(t())},resetSettings:()=>{let a=We;e({settings:a,detailView:a.defaultDetailView}),mf(a),be(t())},requestConfirmation:a=>e({pendingConfirmation:{id:a.id||"confirm_"+Date.now().toString(36),title:a.title,message:a.message,confirmLabel:a.confirmLabel,cancelLabel:a.cancelLabel,tone:a.tone,onConfirm:a.onConfirm}}),closeConfirmation:()=>e({pendingConfirmation:null}),confirmPending:()=>{let a=t().pendingConfirmation;a&&(e({pendingConfirmation:null}),a.onConfirm())},showToast:a=>e({toastMessage:a}),clearToast:()=>e({toastMessage:null}),restorePreferences:async()=>{let[a,o,r,n]=await Promise.all([Ql(Ud,{}),Ql(ff,[]),Ql(Yd,null),Ql(vf,[])]),l=hI(a),s=uf(o);e({...l,rules:s,...r?{aiSettings:{...GI,...r}}:{}});let i=I.getState().settings;mf(i),xf(s);let f=qI(n);f.length&&!I.getState().entries.length&&I.getState().restoreEntries(f)}}));vr=null});function QI(e,t,a){let o=new Array(e);return new Proxy(o,{get(r,n,l){if(typeof n=="string"){let s=n.charCodeAt(0);if(s>=48&&s<=57){let i=+n;if(Number.isInteger(i)&&i>=0&&i<e){let f=r[i];if(!f){let d=t[i*2];f=r[i]={index:i,key:a(i),start:d,size:t[i*2+1],end:d+t[i*2+1],lane:0}}return f}}if(n==="length")return e}return Reflect.get(r,n,l)}})}var KI=T(()=>{});function Sr(e,t,a){let o=a.initialDeps??[],r,n=!0;function l(){var s;let f=0,d=e();if(!(d.length!==o.length||d.some((p,v)=>o[v]!==p)))return r;o=d;let u=0;return r=t(...d),a?.onChange&&!(n&&a.skipInitialOnChange)&&a.onChange(r),n=!1,r}return l.updateDeps=s=>{o=s},l}function Zd(e,t){if(e===void 0)throw new Error(`Unexpected undefined${t?`: ${t}`:""}`);return e}var Wd,ZI,WI=T(()=>{Wd=(e,t)=>Math.abs(e-t)<1.01,ZI=(e,t,a)=>{let o;return function(...r){e.clearTimeout(o),o=e.setTimeout(()=>t.apply(this,r),a)}}});function p2({measurements:e,outerSize:t,scrollOffset:a,lanes:o,flat:r}){let n=e.length-1,l=r?d=>r[d*2]:d=>e[d].start,s=r?d=>r[d*2]+r[d*2+1]:d=>e[d].end;if(e.length<=o)return{startIndex:0,endIndex:n};let i=ob(0,n,l,a),f=i;if(o===1)for(;f<n&&s(f)<a+t;)f++;else if(o>1){let d=Array(o).fill(0);for(;f<n&&d.some(u=>u<a+t);){let u=e[f];d[u.lane]=u.end,f++}let x=Array(o).fill(a+t);for(;i>=0&&x.some(u=>u>=a);){let u=e[i];x[u.lane]=u.start,i--}i=Math.max(0,i-i%o),f=Math.min(n,f+(o-1-f%o))}return{startIndex:i,endIndex:f}}var es,$I,JI,s2,i2,eb,kf,f2,c2,tb,u2,d2,ab,Af,ob,$d=T(()=>{KI();WI();$I=()=>{if(es!==void 0)return es;if(typeof navigator>"u")return es=!1;if(/iP(hone|od|ad)/.test(navigator.userAgent))return es=!0;let e=navigator.maxTouchPoints;return es=navigator.platform==="MacIntel"&&e!==void 0&&e>0},JI=e=>{let{offsetWidth:t,offsetHeight:a}=e;return{width:t,height:a}},s2=e=>e,i2=e=>{let t=Math.max(e.startIndex-e.overscan,0),o=Math.min(e.endIndex+e.overscan,e.count-1)-t+1,r=new Array(o);for(let n=0;n<o;n++)r[n]=t+n;return r},eb=(e,t)=>{let a=e.scrollElement;if(!a)return;let o=e.targetWindow;if(!o)return;let r=l=>{let{width:s,height:i}=l;t({width:Math.round(s),height:Math.round(i)})};if(r(JI(a)),!o.ResizeObserver)return()=>{};let n=new o.ResizeObserver(l=>{let s=()=>{let i=l[0];if(i?.borderBoxSize){let f=i.borderBoxSize[0];if(f){r({width:f.inlineSize,height:f.blockSize});return}}r(JI(a))};e.options.useAnimationFrameWithResizeObserver?requestAnimationFrame(s):s()});return n.observe(a,{box:"border-box"}),()=>{n.unobserve(a)}},kf={passive:!0},f2=typeof window>"u"?!0:"onscrollend"in window,c2=(e,t,a)=>{let o=e.scrollElement;if(!o)return;let r=e.targetWindow;if(!r)return;let n=e.options.useScrollendEvent&&f2,l=0,s=n?null:ZI(r,()=>t(l,!1),e.options.isScrollingResetDelay),i=x=>()=>{l=a(o),s?.(),t(l,x)},f=i(!0),d=i(!1);return o.addEventListener("scroll",f,kf),n&&o.addEventListener("scrollend",d,kf),()=>{o.removeEventListener("scroll",f),n&&o.removeEventListener("scrollend",d)}},tb=(e,t)=>c2(e,t,a=>{let{horizontal:o,isRtl:r}=e.options;return o?a.scrollLeft*(r&&-1||1):a.scrollTop}),u2=(e,t,a)=>{if(t?.borderBoxSize){let o=t.borderBoxSize[0];if(o)return Math.round(o[a.options.horizontal?"inlineSize":"blockSize"])}return e[a.options.horizontal?"offsetWidth":"offsetHeight"]},d2=(e,{adjustments:t=0,behavior:a},o)=>{var r,n;(n=(r=o.scrollElement)==null?void 0:r.scrollTo)==null||n.call(r,{[o.options.horizontal?"left":"top"]:e+t,behavior:a})},ab=d2,Af=class{constructor(t){this.unsubs=[],this.scrollElement=null,this.targetWindow=null,this.isScrolling=!1,this.scrollState=null,this.measurementsCache=[],this._flatMeasurements=null,this.itemSizeCache=new Map,this.itemSizeCacheVersion=0,this.laneAssignments=new Map,this.pendingMin=null,this.prevLanes=void 0,this.lanesChangedFlag=!1,this.lanesSettling=!1,this.pendingScrollAnchor=null,this.scrollRect=null,this.scrollOffset=null,this.scrollDirection=null,this.scrollAdjustments=0,this._iosDeferredAdjustment=0,this._iosTouching=!1,this._iosJustTouchEnded=!1,this._iosTouchEndTimerId=null,this._intendedScrollOffset=null,this.elementsCache=new Map,this.now=()=>{var a,o,r;return((r=(o=(a=this.targetWindow)==null?void 0:a.performance)==null?void 0:o.now)==null?void 0:r.call(o))??Date.now()},this.observer=(()=>{let a=null,o=()=>a||(!this.targetWindow||!this.targetWindow.ResizeObserver?null:a=new this.targetWindow.ResizeObserver(r=>{r.forEach(n=>{let l=()=>{let s=n.target,i=this.indexFromElement(s);if(!s.isConnected){this.observer.unobserve(s);for(let[f,d]of this.elementsCache)if(d===s){this.elementsCache.delete(f);break}return}this.shouldMeasureDuringScroll(i)&&this.resizeItem(i,this.options.measureElement(s,n,this))};this.options.useAnimationFrameWithResizeObserver?requestAnimationFrame(l):l()})}));return{disconnect:()=>{var r;(r=o())==null||r.disconnect(),a=null},observe:r=>{var n;return(n=o())==null?void 0:n.observe(r,{box:"border-box"})},unobserve:r=>{var n;return(n=o())==null?void 0:n.unobserve(r)}}})(),this.range=null,this.setOptions=a=>{var o,r;let n={debug:!1,initialOffset:0,overscan:1,paddingStart:0,paddingEnd:0,scrollPaddingStart:0,scrollPaddingEnd:0,horizontal:!1,getItemKey:s2,rangeExtractor:i2,onChange:()=>{},measureElement:u2,initialRect:{width:0,height:0},scrollMargin:0,gap:0,indexAttribute:"data-index",initialMeasurementsCache:[],lanes:1,anchorTo:"start",followOnAppend:!1,scrollEndThreshold:1,isScrollingResetDelay:150,enabled:!0,isRtl:!1,useScrollendEvent:!1,useAnimationFrameWithResizeObserver:!1,laneAssignmentMode:"estimate"};for(let f in a){let d=a[f];d!==void 0&&(n[f]=d)}let l=this.options,s=null,i=null;if(l!==void 0&&l.enabled&&n.enabled&&n.anchorTo==="end"&&this.scrollElement!==null){let f=l.count,d=n.count,x=this.getMeasurements(),u=f>0?((o=x[0])==null?void 0:o.key)??l.getItemKey(0):null,p=f>0?((r=x[f-1])==null?void 0:r.key)??l.getItemKey(f-1):null;if(d!==f||f>0&&d>0&&(n.getItemKey(0)!==u||n.getItemKey(d-1)!==p)){let E=f>0?this.getVirtualItemForOffset(this.getScrollOffset())??x[0]:null;E&&(s=[E.key,this.getScrollOffset()-E.start]);let y=n.followOnAppend===!0?"auto":n.followOnAppend||null;y&&d>f&&this.isAtEnd(l.scrollEndThreshold)&&(f===0||n.getItemKey(d-1)!==p)&&(i=y)}}this.options=n,(s||i)&&(this.pendingScrollAnchor=[s?.[0]??null,s?.[1]??0,i])},this.notify=a=>{var o,r;(r=(o=this.options).onChange)==null||r.call(o,this,a)},this.maybeNotify=Sr(()=>(this.calculateRange(),[this.isScrolling,this.range?this.range.startIndex:null,this.range?this.range.endIndex:null]),a=>{this.notify(a)},{key:!1,debug:()=>this.options.debug,initialDeps:[this.isScrolling,this.range?this.range.startIndex:null,this.range?this.range.endIndex:null]}),this.cleanup=()=>{this.unsubs.filter(Boolean).forEach(a=>a()),this.unsubs=[],this.observer.disconnect(),this.rafId!=null&&this.targetWindow&&(this.targetWindow.cancelAnimationFrame(this.rafId),this.rafId=null),this.scrollState=null,this.scrollElement=null,this.targetWindow=null},this._didMount=()=>()=>{this.cleanup()},this._willUpdate=()=>{var a;let o=this.options.enabled?this.options.getScrollElement():null;if(this.scrollElement!==o){if(this.cleanup(),!o){this.maybeNotify();return}if(this.scrollElement=o,this.scrollElement&&"ownerDocument"in this.scrollElement?this.targetWindow=this.scrollElement.ownerDocument.defaultView:this.targetWindow=((a=this.scrollElement)==null?void 0:a.window)??null,this.elementsCache.forEach(n=>{this.observer.observe(n)}),this.unsubs.push(this.options.observeElementRect(this,n=>{this.scrollRect=n,this.maybeNotify()})),this.unsubs.push(this.options.observeElementOffset(this,(n,l)=>{this._intendedScrollOffset!==null&&Math.abs(n-this._intendedScrollOffset)<1.5&&(n=this._intendedScrollOffset),this._intendedScrollOffset=null,this.scrollAdjustments=0,this.scrollDirection=l?this.getScrollOffset()<n?"forward":"backward":null,this.scrollOffset=n,this.isScrolling=l,this._flushIosDeferredIfReady(),this.scrollState&&this.scheduleScrollReconcile(),this.maybeNotify()})),"addEventListener"in this.scrollElement){let n=this.scrollElement,l=()=>{this._iosTouching=!0,this._iosJustTouchEnded=!1,this._iosTouchEndTimerId!==null&&this.targetWindow!=null&&(this.targetWindow.clearTimeout(this._iosTouchEndTimerId),this._iosTouchEndTimerId=null)},s=()=>{this._iosTouching=!1,!(!$I()||this.targetWindow==null)&&(this._iosJustTouchEnded=!0,this._iosTouchEndTimerId=this.targetWindow.setTimeout(()=>{this._iosJustTouchEnded=!1,this._iosTouchEndTimerId=null,this._flushIosDeferredIfReady()},150))};n.addEventListener("touchstart",l,kf),n.addEventListener("touchend",s,kf),this.unsubs.push(()=>{n.removeEventListener("touchstart",l),n.removeEventListener("touchend",s),this._iosTouchEndTimerId!==null&&this.targetWindow!=null&&(this.targetWindow.clearTimeout(this._iosTouchEndTimerId),this._iosTouchEndTimerId=null)})}this._scrollToOffset(this.getScrollOffset(),{adjustments:void 0,behavior:void 0})}let r=this.pendingScrollAnchor;if(this.pendingScrollAnchor=null,r&&this.scrollElement&&this.options.enabled){let[n,l,s]=r;if(n!==null){let{count:i,getItemKey:f}=this.options,d=0;for(;d<i&&f(d)!==n;)d++;let x=d<i?this.getMeasurements()[d]:void 0;if(x){let u=x.start+l-this.getScrollOffset();Wd(u,0)||this.applyScrollAdjustment(u)}}s&&this.scrollToEnd({behavior:s})}},this._flushIosDeferredIfReady=()=>{if(this._iosDeferredAdjustment===0||this.isScrolling||this._iosTouching||this._iosJustTouchEnded)return;let a=this.getScrollOffset(),o=this.getMaxScrollOffset();if(a<0||a>o)return;let r=this._iosDeferredAdjustment;this._iosDeferredAdjustment=0,this._scrollToOffset(a,{adjustments:this.scrollAdjustments+=r,behavior:void 0})},this.rafId=null,this.getSize=()=>this.options.enabled?(this.scrollRect=this.scrollRect??this.options.initialRect,this.scrollRect[this.options.horizontal?"width":"height"]):(this.scrollRect=null,0),this.getScrollOffset=()=>this.options.enabled?(this.scrollOffset=this.scrollOffset??(typeof this.options.initialOffset=="function"?this.options.initialOffset():this.options.initialOffset),this.scrollOffset):(this.scrollOffset=null,0),this.getFurthestMeasurement=(a,o)=>{let r=new Map,n=new Map;for(let l=o-1;l>=0;l--){let s=a[l];if(r.has(s.lane))continue;let i=n.get(s.lane);if(i==null||s.end>i.end?n.set(s.lane,s):s.end<i.end&&r.set(s.lane,!0),r.size===this.options.lanes)break}return n.size===this.options.lanes?Array.from(n.values()).sort((l,s)=>l.end===s.end?l.index-s.index:l.end-s.end)[0]:void 0},this.getMeasurementOptions=Sr(()=>[this.options.count,this.options.paddingStart,this.options.scrollMargin,this.options.getItemKey,this.options.enabled,this.options.lanes,this.options.laneAssignmentMode],(a,o,r,n,l,s,i)=>(this.prevLanes!==void 0&&this.prevLanes!==s&&(this.lanesChangedFlag=!0),this.prevLanes=s,this.pendingMin=null,{count:a,paddingStart:o,scrollMargin:r,getItemKey:n,enabled:l,lanes:s,laneAssignmentMode:i}),{key:!1}),this.getMeasurements=Sr(()=>[this.getMeasurementOptions(),this.itemSizeCacheVersion],({count:a,paddingStart:o,scrollMargin:r,getItemKey:n,enabled:l,lanes:s,laneAssignmentMode:i},f)=>{let d=this.itemSizeCache;if(!l)return this.measurementsCache=[],this.itemSizeCache.clear(),this.laneAssignments.clear(),[];if(this.laneAssignments.size>a)for(let v of this.laneAssignments.keys())v>=a&&this.laneAssignments.delete(v);this.lanesChangedFlag&&(this.lanesChangedFlag=!1,this.lanesSettling=!0,this.measurementsCache=[],this.itemSizeCache.clear(),this.laneAssignments.clear(),this.pendingMin=null),this.measurementsCache.length===0&&!this.lanesSettling&&(this.measurementsCache=this.options.initialMeasurementsCache,this.measurementsCache.forEach(v=>{this.itemSizeCache.set(v.key,v.size)}));let x=this.lanesSettling?0:this.pendingMin??0;if(this.pendingMin=null,this.lanesSettling&&this.measurementsCache.length===a&&(this.lanesSettling=!1),s===1){let v=this.options.gap,w=a*2,E=this._flatMeasurements;if(!E||E.length<w){let m=new Float64Array(w);E&&x>0&&m.set(E.subarray(0,x*2)),E=m,this._flatMeasurements=E}let y;if(x===0)y=o+r;else{let m=x-1;y=E[m*2]+E[m*2+1]+v}for(let m=x;m<a;m++){let g=n(m),k=d.get(g),N=typeof k=="number"?k:this.options.estimateSize(m);E[m*2]=y,E[m*2+1]=N,y+=N+v}let c=QI(a,E,n);return this.measurementsCache=c,c}let u=this.measurementsCache.slice(0,x),p=new Array(s).fill(void 0);for(let v=0;v<x;v++){let w=u[v];w&&(p[w.lane]=v)}for(let v=x;v<a;v++){let w=n(v),E=this.laneAssignments.get(v),y,c,m=i==="estimate"||d.has(w);if(E!==void 0&&this.options.lanes>1){y=E;let b=p[y],D=b!==void 0?u[b]:void 0;c=D?D.end+this.options.gap:o+r}else{let b=this.options.lanes===1?u[v-1]:this.getFurthestMeasurement(u,v);c=b?b.end+this.options.gap:o+r,y=b?b.lane:v%this.options.lanes,this.options.lanes>1&&m&&this.laneAssignments.set(v,y)}let g=d.get(w),k=typeof g=="number"?g:this.options.estimateSize(v),N=c+k;u[v]={index:v,start:c,size:k,end:N,key:w,lane:y},p[y]=v}return this.measurementsCache=u,u},{key:!1,debug:()=>this.options.debug}),this.calculateRange=Sr(()=>[this.getMeasurements(),this.getSize(),this.getScrollOffset(),this.options.lanes],(a,o,r,n)=>this.range=a.length>0&&o>0?p2({measurements:a,outerSize:o,scrollOffset:r,lanes:n,flat:n===1&&this._flatMeasurements!=null?this._flatMeasurements:null}):null,{key:!1,debug:()=>this.options.debug}),this.getVirtualIndexes=Sr(()=>{let a=null,o=null,r=this.calculateRange();return r&&(a=r.startIndex,o=r.endIndex),this.maybeNotify.updateDeps([this.isScrolling,a,o]),[this.options.rangeExtractor,this.options.overscan,this.options.count,a,o]},(a,o,r,n,l)=>n===null||l===null?[]:a({startIndex:n,endIndex:l,overscan:o,count:r}),{key:!1,debug:()=>this.options.debug}),this.indexFromElement=a=>{let o=this.options.indexAttribute,r=a.getAttribute(o);return r?parseInt(r,10):(console.warn(`Missing attribute name '${o}={index}' on measured element.`),-1)},this.shouldMeasureDuringScroll=a=>{var o;if(!this.scrollState||this.scrollState.behavior!=="smooth")return!0;let r=this.scrollState.index??((o=this.getVirtualItemForOffset(this.scrollState.lastTargetOffset))==null?void 0:o.index);if(r!==void 0&&this.range){let n=Math.max(this.options.overscan,Math.ceil((this.range.endIndex-this.range.startIndex)/2)),l=Math.max(0,r-n),s=Math.min(this.options.count-1,r+n);return a>=l&&a<=s}return!0},this.measureElement=a=>{if(!a){this.elementsCache.forEach((l,s)=>{l.isConnected||(this.observer.unobserve(l),this.elementsCache.delete(s))});return}let o=this.indexFromElement(a),r=this.options.getItemKey(o),n=this.elementsCache.get(r);n!==a&&(n&&this.observer.unobserve(n),this.observer.observe(a),this.elementsCache.set(r,a)),(!this.isScrolling||this.scrollState)&&this.shouldMeasureDuringScroll(o)&&this.resizeItem(o,this.options.measureElement(a,void 0,this))},this.resizeItem=(a,o)=>{var r,n;if(a<0||a>=this.options.count)return;let l,s,i,f=this._flatMeasurements;if(this.options.lanes===1&&f!==null)i=this.options.getItemKey(a),s=f[a*2],l=f[a*2+1];else{let u=this.measurementsCache[a];if(!u)return;i=u.key,s=u.start,l=u.size}let d=this.itemSizeCache.get(i)??l,x=o-d;if(x!==0){let u=this.options.anchorTo==="end"&&((r=this.scrollState)==null?void 0:r.behavior)!=="smooth"&&this.getVirtualDistanceFromEnd()<=this.options.scrollEndThreshold,p=u?this.getTotalSize():0,v=((n=this.scrollState)==null?void 0:n.behavior)!=="smooth"&&(this.shouldAdjustScrollPositionOnItemSizeChange!==void 0?this.shouldAdjustScrollPositionOnItemSizeChange(this.measurementsCache[a]??{index:a,key:i,start:s,size:l,end:s+l,lane:0},x,this):s<this.getScrollOffset()+this.scrollAdjustments&&this.scrollDirection!=="backward");(this.pendingMin===null||a<this.pendingMin)&&(this.pendingMin=a),this.itemSizeCache.set(i,o),this.itemSizeCacheVersion++,u?this.applyScrollAdjustment(this.getTotalSize()-p):v&&this.applyScrollAdjustment(x),this.notify(!1)}},this.getVirtualItems=Sr(()=>[this.getVirtualIndexes(),this.getMeasurements()],(a,o)=>{let r=[];for(let n=0,l=a.length;n<l;n++){let s=a[n],i=o[s];r.push(i)}return r},{key:!1,debug:()=>this.options.debug}),this.getVirtualItemForOffset=a=>{let o=this.getMeasurements();if(o.length===0)return;let r=this._flatMeasurements,n=this.options.lanes===1&&r!=null,l=ob(0,o.length-1,n?s=>r[s*2]:s=>Zd(o[s]).start,a);return Zd(o[l])},this.getMaxScrollOffset=()=>{if(!this.scrollElement)return 0;if("scrollHeight"in this.scrollElement)return this.options.horizontal?this.scrollElement.scrollWidth-this.scrollElement.clientWidth:this.scrollElement.scrollHeight-this.scrollElement.clientHeight;{let a=this.scrollElement.document.documentElement;return this.options.horizontal?a.scrollWidth-this.scrollElement.innerWidth:a.scrollHeight-this.scrollElement.innerHeight}},this.getVirtualDistanceFromEnd=()=>Math.max(this.getTotalSize()-this.getSize()-this.getScrollOffset(),0),this.getDistanceFromEnd=()=>Math.max(this.getMaxScrollOffset()-this.getScrollOffset(),0),this.isAtEnd=(a=this.options.scrollEndThreshold)=>this.getDistanceFromEnd()<=a,this.getOffsetForAlignment=(a,o,r=0)=>{if(!this.scrollElement)return 0;let n=this.getSize(),l=this.getScrollOffset();o==="auto"&&(o=a>=l+n?"end":"start"),o==="center"?a+=(r-n)/2:o==="end"&&(a-=n);let s=this.getMaxScrollOffset();return Math.max(Math.min(s,a),0)},this.getOffsetForIndex=(a,o="auto")=>{a=Math.max(0,Math.min(a,this.options.count-1));let r=this.getSize(),n=this.getScrollOffset(),l=this.measurementsCache[a];if(!l)return;if(o==="auto")if(l.end>=n+r-this.options.scrollPaddingEnd)o="end";else if(l.start<=n+this.options.scrollPaddingStart)o="start";else return[n,o];if(o==="end"&&a===this.options.count-1)return[this.getMaxScrollOffset(),o];let s=o==="end"?l.end+this.options.scrollPaddingEnd:l.start-this.options.scrollPaddingStart;return[this.getOffsetForAlignment(s,o,l.size),o]},this.scrollToOffset=(a,{align:o="start",behavior:r="auto"}={})=>{let n=this.getOffsetForAlignment(a,o),l=this.now();this.scrollState={index:null,align:o,behavior:r,startedAt:l,lastTargetOffset:n,stableFrames:0},this._scrollToOffset(n,{adjustments:void 0,behavior:r}),this.scheduleScrollReconcile()},this.scrollToIndex=(a,{align:o="auto",behavior:r="auto"}={})=>{a=Math.max(0,Math.min(a,this.options.count-1));let n=this.getOffsetForIndex(a,o);if(!n)return;let[l,s]=n,i=this.now();this.scrollState={index:a,align:s,behavior:r,startedAt:i,lastTargetOffset:l,stableFrames:0},this._scrollToOffset(l,{adjustments:void 0,behavior:r}),this.scheduleScrollReconcile()},this.scrollBy=(a,{behavior:o="auto"}={})=>{let r=this.getScrollOffset()+a,n=this.now();this.scrollState={index:null,align:"start",behavior:o,startedAt:n,lastTargetOffset:r,stableFrames:0},this._scrollToOffset(r,{adjustments:void 0,behavior:o}),this.scheduleScrollReconcile()},this.scrollToEnd=({behavior:a="auto"}={})=>{if(this.options.count>0){this.scrollToIndex(this.options.count-1,{align:"end",behavior:a});return}this.scrollToOffset(Math.max(this.getTotalSize()-this.getSize(),0),{behavior:a})},this.getTotalSize=()=>{var a;let o=this.getMeasurements(),r;if(o.length===0)r=this.options.paddingStart;else if(this.options.lanes===1){let n=o.length-1,l=this._flatMeasurements;l!=null?r=l[n*2]+l[n*2+1]:r=((a=o[n])==null?void 0:a.end)??0}else{let n=Array(this.options.lanes).fill(null),l=o.length-1;for(;l>=0&&n.some(s=>s===null);){let s=o[l];n[s.lane]===null&&(n[s.lane]=s.end),l--}r=Math.max(...n.filter(s=>s!==null))}return Math.max(r-this.options.scrollMargin+this.options.paddingEnd,0)},this.takeSnapshot=()=>{let a=[];if(this.itemSizeCache.size===0)return a;let o=this.getMeasurements();for(let r of o)r&&this.itemSizeCache.has(r.key)&&a.push({index:r.index,key:r.key,start:r.start,size:r.size,end:r.end,lane:r.lane});return a},this._scrollToOffset=(a,{adjustments:o,behavior:r})=>{this._intendedScrollOffset=a+(o??0),this.options.scrollToFn(a,{behavior:r,adjustments:o},this)},this.measure=()=>{this.pendingMin=null,this.itemSizeCache.clear(),this.laneAssignments.clear(),this.itemSizeCacheVersion++,this.notify(!1)},this.setOptions(t)}applyScrollAdjustment(t,a){t!==0&&($I()&&(this.isScrolling||this._iosTouching||this._iosJustTouchEnded)?this._iosDeferredAdjustment+=t:this._scrollToOffset(this.getScrollOffset(),{adjustments:this.scrollAdjustments+=t,behavior:a}))}scheduleScrollReconcile(){if(!this.targetWindow){this.scrollState=null;return}this.rafId==null&&(this.rafId=this.targetWindow.requestAnimationFrame(()=>{this.rafId=null,this.reconcileScroll()}))}reconcileScroll(){if(!this.scrollState||!this.scrollElement)return;if(this.now()-this.scrollState.startedAt>5e3){this.scrollState=null;return}let o=this.scrollState.index!=null?this.getOffsetForIndex(this.scrollState.index,this.scrollState.align):void 0,r=o?o[0]:this.scrollState.lastTargetOffset,n=1,l=r!==this.scrollState.lastTargetOffset;if(!l&&Wd(r,this.getScrollOffset())){if(this.scrollState.stableFrames++,this.scrollState.stableFrames>=n){this.getScrollOffset()!==r&&this._scrollToOffset(r,{adjustments:void 0,behavior:"auto"}),this.scrollState=null;return}}else if(this.scrollState.stableFrames=0,l){let s=this.getSize()||600,i=Math.abs(r-this.getScrollOffset()),f=this.scrollState.behavior==="smooth"&&i>s;this.scrollState.lastTargetOffset=r,f||(this.scrollState.behavior="auto"),this._scrollToOffset(r,{adjustments:void 0,behavior:f?"smooth":"auto"})}this.scheduleScrollReconcile()}},ob=(e,t,a,o)=>{for(;e<=t;){let r=(e+t)/2|0,n=a(r);if(n<o)e=r+1;else if(n>o)t=r-1;else return r}return e>0?e-1:0}});function m2({useFlushSync:e=!0,...t}){let a=_o.useReducer(n=>n+1,0)[1],o={...t,onChange:(n,l)=>{var s;e&&l?(0,nb.flushSync)(a):a(),(s=t.onChange)==null||s.call(t,n,l)}},[r]=_o.useState(()=>new Af(o));return r.setOptions(o),rb(()=>r._didMount(),[]),rb(()=>r._willUpdate()),r}function Bn(e){return m2({observeElementRect:eb,observeElementOffset:tb,scrollToFn:ab,...e})}var _o,nb,rb,Jd=T(()=>{_o=_(ze(),1),nb=_(lc(),1);$d();$d();rb=typeof document<"u"?_o.useLayoutEffect:_o.useEffect});var lb,sb=T(()=>{lb={outline:{xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"},filled:{xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"currentColor",stroke:"none"}}});var On,R,H=T(()=>{On=_(ze(),1);sb();R=(e,t,a,o)=>{let r=(0,On.forwardRef)(({color:n="currentColor",size:l=24,stroke:s=2,title:i,className:f,children:d,...x},u)=>(0,On.createElement)("svg",{ref:u,...lb[e],width:l,height:l,className:["tabler-icon",`tabler-icon-${t}`,f].join(" "),...e==="filled"?{fill:n}:{strokeWidth:s,stroke:n},...x},[i&&(0,On.createElement)("title",{key:"svg-title"},i),...o.map(([p,v])=>(0,On.createElement)(p,v)),...Array.isArray(d)?d:[d]]));return r.displayName=`${a}`,r}});var x2,ep,ib=T(()=>{H();x2=[["path",{d:"M4 10a2 2 0 1 0 4 0a2 2 0 0 0 -4 0",key:"svg-0"}],["path",{d:"M6 4v4",key:"svg-1"}],["path",{d:"M6 12v8",key:"svg-2"}],["path",{d:"M10 16a2 2 0 1 0 4 0a2 2 0 0 0 -4 0",key:"svg-3"}],["path",{d:"M12 4v10",key:"svg-4"}],["path",{d:"M12 18v2",key:"svg-5"}],["path",{d:"M16 7a2 2 0 1 0 4 0a2 2 0 0 0 -4 0",key:"svg-6"}],["path",{d:"M18 4v1",key:"svg-7"}],["path",{d:"M18 9v11",key:"svg-8"}]],ep=R("outline","adjustments","Adjustments",x2)});var y2,Wa,fb=T(()=>{H();y2=[["path",{d:"M12 9v4",key:"svg-0"}],["path",{d:"M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0",key:"svg-1"}],["path",{d:"M12 16h.01",key:"svg-2"}]],Wa=R("outline","alert-triangle","AlertTriangle",y2)});var g2,Rf,cb=T(()=>{H();g2=[["path",{d:"M9 14l-4 -4l4 -4",key:"svg-0"}],["path",{d:"M5 10h11a4 4 0 1 1 0 8h-1",key:"svg-1"}]],Rf=R("outline","arrow-back-up","ArrowBackUp",g2)});var h2,tp,ub=T(()=>{H();h2=[["path",{d:"M17 7l-10 10",key:"svg-0"}],["path",{d:"M16 17l-9 0l0 -9",key:"svg-1"}]],tp=R("outline","arrow-down-left","ArrowDownLeft",h2)});var I2,Ln,db=T(()=>{H();I2=[["path",{d:"M12 5l0 14",key:"svg-0"}],["path",{d:"M18 13l-6 6",key:"svg-1"}],["path",{d:"M6 13l6 6",key:"svg-2"}]],Ln=R("outline","arrow-down","ArrowDown",I2)});var b2,ts,pb=T(()=>{H();b2=[["path",{d:"M5 12l14 0",key:"svg-0"}],["path",{d:"M13 18l6 -6",key:"svg-1"}],["path",{d:"M13 6l6 6",key:"svg-2"}]],ts=R("outline","arrow-right","ArrowRight",b2)});var v2,ap,mb=T(()=>{H();v2=[["path",{d:"M17 7l-10 10",key:"svg-0"}],["path",{d:"M8 7l9 0l0 9",key:"svg-1"}]],ap=R("outline","arrow-up-right","ArrowUpRight",v2)});var S2,Mf,xb=T(()=>{H();S2=[["path",{d:"M12 5l0 14",key:"svg-0"}],["path",{d:"M18 11l-6 -6",key:"svg-1"}],["path",{d:"M6 11l6 -6",key:"svg-2"}]],Mf=R("outline","arrow-up","ArrowUp",S2)});var w2,op,yb=T(()=>{H();w2=[["path",{d:"M16 4l4 0l0 4",key:"svg-0"}],["path",{d:"M14 10l6 -6",key:"svg-1"}],["path",{d:"M8 20l-4 0l0 -4",key:"svg-2"}],["path",{d:"M4 20l6 -6",key:"svg-3"}],["path",{d:"M16 20l4 0l0 -4",key:"svg-4"}],["path",{d:"M14 14l6 6",key:"svg-5"}],["path",{d:"M8 4l-4 0l0 4",key:"svg-6"}],["path",{d:"M4 4l6 6",key:"svg-7"}]],op=R("outline","arrows-maximize","ArrowsMaximize",w2)});var C2,zn,gb=T(()=>{H();C2=[["path",{d:"M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11",key:"svg-0"}]],zn=R("outline","bolt","Bolt",C2)});var k2,rp,hb=T(()=>{H();k2=[["path",{d:"M12 17l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v5",key:"svg-0"}],["path",{d:"M16 19h6",key:"svg-1"}],["path",{d:"M19 16v6",key:"svg-2"}]],rp=R("outline","bookmark-plus","BookmarkPlus",k2)});var A2,Po,Ib=T(()=>{H();A2=[["path",{d:"M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4",key:"svg-0"}]],Po=R("outline","bookmark","Bookmark",A2)});var R2,np,bb=T(()=>{H();R2=[["path",{d:"M7 4a2 2 0 0 0 -2 2v3a2 3 0 0 1 -2 3a2 3 0 0 1 2 3v3a2 2 0 0 0 2 2",key:"svg-0"}],["path",{d:"M17 4a2 2 0 0 1 2 2v3a2 3 0 0 0 2 3a2 3 0 0 0 -2 3v3a2 2 0 0 1 -2 2",key:"svg-1"}]],np=R("outline","braces","Braces",R2)});var M2,wr,vb=T(()=>{H();M2=[["path",{d:"M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -6",key:"svg-0"}],["path",{d:"M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -10",key:"svg-1"}],["path",{d:"M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -14",key:"svg-2"}],["path",{d:"M4 20h14",key:"svg-3"}]],wr=R("outline","chart-bar","ChartBar",M2)});var T2,as,Sb=T(()=>{H();T2=[["path",{d:"M5 12l5 5l10 -10",key:"svg-0"}]],as=R("outline","check","Check",T2)});var E2,$a,wb=T(()=>{H();E2=[["path",{d:"M6 9l6 6l6 -6",key:"svg-0"}]],$a=R("outline","chevron-down","ChevronDown",E2)});var F2,lp,Cb=T(()=>{H();F2=[["path",{d:"M15 6l-6 6l6 6",key:"svg-0"}]],lp=R("outline","chevron-left","ChevronLeft",F2)});var D2,Hn,kb=T(()=>{H();D2=[["path",{d:"M9 6l6 6l-6 6",key:"svg-0"}]],Hn=R("outline","chevron-right","ChevronRight",D2)});var N2,sp,Ab=T(()=>{H();N2=[["path",{d:"M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",key:"svg-0"}],["path",{d:"M9 12l2 2l4 -4",key:"svg-1"}]],sp=R("outline","circle-check","CircleCheck",N2)});var B2,Tf,Rb=T(()=>{H();B2=[["path",{d:"M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",key:"svg-0"}],["path",{d:"M10 10l4 4m0 -4l-4 4",key:"svg-1"}]],Tf=R("outline","circle-x","CircleX",B2)});var O2,os,Mb=T(()=>{H();O2=[["path",{d:"M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2",key:"svg-0"}],["path",{d:"M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2",key:"svg-1"}]],os=R("outline","clipboard","Clipboard",O2)});var L2,rs,Tb=T(()=>{H();L2=[["path",{d:"M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0",key:"svg-0"}],["path",{d:"M12 7v5l3 3",key:"svg-1"}]],rs=R("outline","clock","Clock",L2)});var z2,ip,Eb=T(()=>{H();z2=[["path",{d:"M7 8l-4 4l4 4",key:"svg-0"}],["path",{d:"M17 8l4 4l-4 4",key:"svg-1"}],["path",{d:"M14 4l-4 16",key:"svg-2"}]],ip=R("outline","code","Code",z2)});var H2,fp,Fb=T(()=>{H();H2=[["path",{d:"M11 7l6 6",key:"svg-0"}],["path",{d:"M4 16l11.7 -11.7a1 1 0 0 1 1.4 0l2.6 2.6a1 1 0 0 1 0 1.4l-11.7 11.7h-4v-4",key:"svg-1"}]],fp=R("outline","color-picker","ColorPicker",H2)});var _2,ut,Db=T(()=>{H();_2=[["path",{d:"M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666",key:"svg-0"}],["path",{d:"M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1",key:"svg-1"}]],ut=R("outline","copy","Copy",_2)});var P2,cp,Nb=T(()=>{H();P2=[["path",{d:"M4 6c0 1.657 3.582 3 8 3s8 -1.343 8 -3s-3.582 -3 -8 -3s-8 1.343 -8 3",key:"svg-0"}],["path",{d:"M4 6v6c0 1.657 3.582 3 8 3c.856 0 1.68 -.05 2.454 -.144m5.546 -2.856v-6",key:"svg-1"}],["path",{d:"M4 12v6c0 1.657 3.582 3 8 3c.171 0 .341 -.002 .51 -.006",key:"svg-2"}],["path",{d:"M19 22v-6",key:"svg-3"}],["path",{d:"M22 19l-3 -3l-3 3",key:"svg-4"}]],cp=R("outline","database-import","DatabaseImport",P2)});var q2,qo,Bb=T(()=>{H();q2=[["path",{d:"M4 6a8 3 0 1 0 16 0a8 3 0 1 0 -16 0",key:"svg-0"}],["path",{d:"M4 6v6a8 3 0 0 0 16 0v-6",key:"svg-1"}],["path",{d:"M4 12v6a8 3 0 0 0 16 0v-6",key:"svg-2"}]],qo=R("outline","database","Database",q2)});var U2,up,Ob=T(()=>{H();U2=[["path",{d:"M3 19l18 0",key:"svg-0"}],["path",{d:"M5 7a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1l0 -8",key:"svg-1"}]],up=R("outline","device-laptop","DeviceLaptop",U2)});var X2,ns,Lb=T(()=>{H();X2=[["path",{d:"M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14",key:"svg-0"}],["path",{d:"M8 8.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0",fill:"currentColor",key:"svg-1"}],["path",{d:"M15 8.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0",fill:"currentColor",key:"svg-2"}],["path",{d:"M15 15.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0",fill:"currentColor",key:"svg-3"}],["path",{d:"M8 15.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0",fill:"currentColor",key:"svg-4"}]],ns=R("outline","dice","Dice",X2)});var G2,Ft,zb=T(()=>{H();G2=[["path",{d:"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2",key:"svg-0"}],["path",{d:"M7 11l5 5l5 -5",key:"svg-1"}],["path",{d:"M12 4l0 12",key:"svg-2"}]],Ft=R("outline","download","Download",G2)});var j2,Ef,Hb=T(()=>{H();j2=[["path",{d:"M19 20h-10.5l-4.21 -4.3a1 1 0 0 1 0 -1.41l10 -10a1 1 0 0 1 1.41 0l5 5a1 1 0 0 1 0 1.41l-9.2 9.3",key:"svg-0"}],["path",{d:"M18 13.3l-6.3 -6.3",key:"svg-1"}]],Ef=R("outline","eraser","Eraser",j2)});var V2,dp,_b=T(()=>{H();V2=[["path",{d:"M14 3v4a1 1 0 0 0 1 1h4",key:"svg-0"}],["path",{d:"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2",key:"svg-1"}],["path",{d:"M12 10l0 4",key:"svg-2"}],["path",{d:"M10 12l4 0",key:"svg-3"}],["path",{d:"M10 17l4 0",key:"svg-4"}]],dp=R("outline","file-diff","FileDiff",V2)});var Y2,pp,Pb=T(()=>{H();Y2=[["path",{d:"M14 3v4a1 1 0 0 0 1 1h4",key:"svg-0"}],["path",{d:"M11.5 21h-4.5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v5m-5 6h7m-3 -3l3 3l-3 3",key:"svg-1"}]],pp=R("outline","file-export","FileExport",Y2)});var Q2,mp,qb=T(()=>{H();Q2=[["path",{d:"M14 3v4a1 1 0 0 0 1 1h4",key:"svg-0"}],["path",{d:"M5 13v-8a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2h-5.5m-9.5 -2h7m-3 -3l3 3l-3 3",key:"svg-1"}]],mp=R("outline","file-import","FileImport",Q2)});var K2,Cr,Ub=T(()=>{H();K2=[["path",{d:"M8 4h12v2.172a2 2 0 0 1 -.586 1.414l-3.914 3.914m-.5 3.5v4l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227",key:"svg-0"}],["path",{d:"M3 3l18 18",key:"svg-1"}]],Cr=R("outline","filter-off","FilterOff",K2)});var Z2,ls,Xb=T(()=>{H();Z2=[["path",{d:"M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227",key:"svg-0"}]],ls=R("outline","filter","Filter",Z2)});var W2,xp,Gb=T(()=>{H();W2=[["path",{d:"M12 11v8l3 -3m-6 0l3 3",key:"svg-0"}],["path",{d:"M9 7l1 0",key:"svg-1"}],["path",{d:"M14 7l1 0",key:"svg-2"}],["path",{d:"M19 7l1 0",key:"svg-3"}],["path",{d:"M4 7l1 0",key:"svg-4"}]],xp=R("outline","fold-down","FoldDown",W2)});var $2,yp,jb=T(()=>{H();$2=[["path",{d:"M12 3v6l3 -3m-6 0l3 3",key:"svg-0"}],["path",{d:"M12 21v-6l3 3m-6 0l3 -3",key:"svg-1"}],["path",{d:"M4 12l1 0",key:"svg-2"}],["path",{d:"M9 12l1 0",key:"svg-3"}],["path",{d:"M14 12l1 0",key:"svg-4"}],["path",{d:"M19 12l1 0",key:"svg-5"}]],yp=R("outline","fold","Fold",$2)});var J2,gp,Vb=T(()=>{H();J2=[["path",{d:"M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",key:"svg-0"}],["path",{d:"M12 17l0 .01",key:"svg-1"}],["path",{d:"M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4",key:"svg-2"}]],gp=R("outline","help","Help",J2)});var ek,hp,Yb=T(()=>{H();ek=[["path",{d:"M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0",key:"svg-0"}],["path",{d:"M12 9h.01",key:"svg-1"}],["path",{d:"M11 12h1v4h1",key:"svg-2"}]],hp=R("outline","info-circle","InfoCircle",ek)});var tk,Ip,Qb=T(()=>{H();tk=[["path",{d:"M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0",key:"svg-0"}],["path",{d:"M15 9h.01",key:"svg-1"}]],Ip=R("outline","key","Key",tk)});var ak,bp,Kb=T(()=>{H();ak=[["path",{d:"M2 8a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2l0 -8",key:"svg-0"}],["path",{d:"M6 10l0 .01",key:"svg-1"}],["path",{d:"M10 10l0 .01",key:"svg-2"}],["path",{d:"M14 10l0 .01",key:"svg-3"}],["path",{d:"M18 10l0 .01",key:"svg-4"}],["path",{d:"M6 14l0 .01",key:"svg-5"}],["path",{d:"M18 14l0 .01",key:"svg-6"}],["path",{d:"M10 14l4 .01",key:"svg-7"}]],bp=R("outline","keyboard","Keyboard",ak)});var ok,vp,Zb=T(()=>{H();ok=[["path",{d:"M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -2",key:"svg-0"}],["path",{d:"M4 16a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -2",key:"svg-1"}]],vp=R("outline","layout-list","LayoutList",ok)});var rk,Sp,Wb=T(()=>{H();rk=[["path",{d:"M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12",key:"svg-0"}],["path",{d:"M4 12l16 0",key:"svg-1"}]],Sp=R("outline","layout-rows","LayoutRows",rk)});var nk,wp,$b=T(()=>{H();nk=[["path",{d:"M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12",key:"svg-0"}],["path",{d:"M9 4v16",key:"svg-1"}],["path",{d:"M14 10l2 2l-2 2",key:"svg-2"}]],wp=R("outline","layout-sidebar-left-expand","LayoutSidebarLeftExpand",nk)});var lk,Cp,Jb=T(()=>{H();lk=[["path",{d:"M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12",key:"svg-0"}],["path",{d:"M15 4v16",key:"svg-1"}],["path",{d:"M10 10l-2 2l2 2",key:"svg-2"}]],Cp=R("outline","layout-sidebar-right-expand","LayoutSidebarRightExpand",lk)});var sk,kp,e0=T(()=>{H();sk=[["path",{d:"M14 15.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0",key:"svg-0"}],["path",{d:"M3 19v-10.5a3.5 3.5 0 0 1 7 0v10.5",key:"svg-1"}],["path",{d:"M3 13h7",key:"svg-2"}],["path",{d:"M21 12v7",key:"svg-3"}]],kp=R("outline","letter-case","LetterCase",sk)});var ik,Ap,t0=T(()=>{H();ik=[["path",{d:"M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6",key:"svg-0"}],["path",{d:"M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0",key:"svg-1"}],["path",{d:"M8 11v-4a4 4 0 1 1 8 0v4",key:"svg-2"}]],Ap=R("outline","lock","Lock",ik)});var fk,kr,a0=T(()=>{H();fk=[["path",{d:"M6 9a6 6 0 1 0 12 0a6 6 0 0 0 -12 0",key:"svg-0"}],["path",{d:"M12 3c1.333 .333 2 2.333 2 6s-.667 5.667 -2 6",key:"svg-1"}],["path",{d:"M12 3c-1.333 .333 -2 2.333 -2 6s.667 5.667 2 6",key:"svg-2"}],["path",{d:"M6 9h12",key:"svg-3"}],["path",{d:"M3 20h7",key:"svg-4"}],["path",{d:"M14 20h7",key:"svg-5"}],["path",{d:"M10 20a2 2 0 1 0 4 0a2 2 0 0 0 -4 0",key:"svg-6"}],["path",{d:"M12 15v3",key:"svg-7"}]],kr=R("outline","network","Network",fk)});var ck,Ar,o0=T(()=>{H();ck=[["path",{d:"M12 21a9 9 0 0 1 0 -18c4.97 0 9 3.582 9 8c0 1.06 -.474 2.078 -1.318 2.828c-.844 .75 -1.989 1.172 -3.182 1.172h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25",key:"svg-0"}],["path",{d:"M7.5 10.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",key:"svg-1"}],["path",{d:"M11.5 7.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",key:"svg-2"}],["path",{d:"M15.5 10.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",key:"svg-3"}]],Ar=R("outline","palette","Palette",ck)});var uk,Rp,r0=T(()=>{H();uk=[["path",{d:"M11 19h-6a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v4",key:"svg-0"}],["path",{d:"M14 15a1 1 0 0 1 1 -1h5a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1l0 -3",key:"svg-1"}]],Rp=R("outline","picture-in-picture","PictureInPicture",uk)});var dk,Ff,n0=T(()=>{H();dk=[["path",{d:"M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4",key:"svg-0"}],["path",{d:"M9 15l-4.5 4.5",key:"svg-1"}],["path",{d:"M14.5 4l5.5 5.5",key:"svg-2"}]],Ff=R("outline","pin","Pin",dk)});var pk,Mp,l0=T(()=>{H();pk=[["path",{d:"M3 3l18 18",key:"svg-0"}],["path",{d:"M15 4.5l-3.249 3.249m-2.57 1.433l-2.181 .818l-1.5 1.5l7 7l1.5 -1.5l.82 -2.186m1.43 -2.563l3.25 -3.251",key:"svg-1"}],["path",{d:"M9 15l-4.5 4.5",key:"svg-2"}],["path",{d:"M14.5 4l5.5 5.5",key:"svg-3"}]],Mp=R("outline","pinned-off","PinnedOff",pk)});var mk,Tp,s0=T(()=>{H();mk=[["path",{d:"M7 4v16l13 -8l-13 -8",key:"svg-0"}]],Tp=R("outline","player-play","PlayerPlay",mk)});var xk,Ep,i0=T(()=>{H();xk=[["path",{d:"M5 12a7 7 0 1 0 14 0a7 7 0 1 0 -14 0",key:"svg-0"}]],Ep=R("outline","player-record","PlayerRecord",xk)});var yk,Rr,f0=T(()=>{H();yk=[["path",{d:"M7 12l5 5l-1.5 1.5a3.536 3.536 0 1 1 -5 -5l1.5 -1.5",key:"svg-0"}],["path",{d:"M17 12l-5 -5l1.5 -1.5a3.536 3.536 0 1 1 5 5l-1.5 1.5",key:"svg-1"}],["path",{d:"M3 21l2.5 -2.5",key:"svg-2"}],["path",{d:"M18.5 5.5l2.5 -2.5",key:"svg-3"}],["path",{d:"M10 11l-2 2",key:"svg-4"}],["path",{d:"M13 14l-2 2",key:"svg-5"}]],Rr=R("outline","plug-connected","PlugConnected",yk)});var gk,Fp,c0=T(()=>{H();gk=[["path",{d:"M12 5l0 14",key:"svg-0"}],["path",{d:"M5 12l14 0",key:"svg-1"}]],Fp=R("outline","plus","Plus",gk)});var hk,Dp,u0=T(()=>{H();hk=[["path",{d:"M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",key:"svg-0"}],["path",{d:"M15.51 15.56a5 5 0 1 0 -3.51 1.44",key:"svg-1"}],["path",{d:"M18.832 17.86a9 9 0 1 0 -6.832 3.14",key:"svg-2"}],["path",{d:"M12 12v9",key:"svg-3"}]],Dp=R("outline","radar-2","Radar2",hk)});var Ik,_n,d0=T(()=>{H();Ik=[["path",{d:"M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4",key:"svg-0"}],["path",{d:"M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4",key:"svg-1"}]],_n=R("outline","refresh","Refresh",Ik)});var bk,Np,p0=T(()=>{H();bk=[["path",{d:"M6.5 15a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0 -5",key:"svg-0"}],["path",{d:"M17 7.875l3 -1.687",key:"svg-1"}],["path",{d:"M17 7.875v3.375",key:"svg-2"}],["path",{d:"M17 7.875l-3 -1.687",key:"svg-3"}],["path",{d:"M17 7.875l3 1.688",key:"svg-4"}],["path",{d:"M17 4.5v3.375",key:"svg-5"}],["path",{d:"M17 7.875l-3 1.688",key:"svg-6"}]],Np=R("outline","regex","Regex",bk)});var vk,Ja,m0=T(()=>{H();vk=[["path",{d:"M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3",key:"svg-0"}],["path",{d:"M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3",key:"svg-1"}]],Ja=R("outline","repeat","Repeat",vk)});var Sk,ss,x0=T(()=>{H();Sk=[["path",{d:"M3 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0",key:"svg-0"}],["path",{d:"M19 7a2 2 0 1 0 0 -4a2 2 0 0 0 0 4",key:"svg-1"}],["path",{d:"M11 19h5.5a3.5 3.5 0 0 0 0 -7h-8a3.5 3.5 0 0 1 0 -7h4.5",key:"svg-2"}]],ss=R("outline","route","Route",Sk)});var wk,ot,y0=T(()=>{H();wk=[["path",{d:"M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0",key:"svg-0"}],["path",{d:"M21 21l-6 -6",key:"svg-1"}]],ot=R("outline","search","Search",wk)});var Ck,Mr,g0=T(()=>{H();Ck=[["path",{d:"M10 14l11 -11",key:"svg-0"}],["path",{d:"M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5",key:"svg-1"}]],Mr=R("outline","send","Send",Ck)});var kk,is,h0=T(()=>{H();kk=[["path",{d:"M3 7a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3",key:"svg-0"}],["path",{d:"M3 15a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3l0 -2",key:"svg-1"}],["path",{d:"M7 8l0 .01",key:"svg-2"}],["path",{d:"M7 16l0 .01",key:"svg-3"}]],is=R("outline","server","Server",kk)});var Ak,Tr,I0=T(()=>{H();Ak=[["path",{d:"M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065",key:"svg-0"}],["path",{d:"M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0",key:"svg-1"}]],Tr=R("outline","settings","Settings",Ak)});var Rk,Bp,b0=T(()=>{H();Rk=[["path",{d:"M3 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",key:"svg-0"}],["path",{d:"M15 6a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",key:"svg-1"}],["path",{d:"M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",key:"svg-2"}],["path",{d:"M8.7 10.7l6.6 -3.4",key:"svg-3"}],["path",{d:"M8.7 13.3l6.6 3.4",key:"svg-4"}]],Bp=R("outline","share","Share",Rk)});var Mk,eo,v0=T(()=>{H();Mk=[["path",{d:"M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6",key:"svg-0"}]],eo=R("outline","sparkles","Sparkles",Mk)});var Tk,Op,S0=T(()=>{H();Tk=[["path",{d:"M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14",key:"svg-0"}],["path",{d:"M3 10h18",key:"svg-1"}],["path",{d:"M10 3v18",key:"svg-2"}]],Op=R("outline","table","Table",Tk)});var Ek,rt,w0=T(()=>{H();Ek=[["path",{d:"M8 9l3 3l-3 3",key:"svg-0"}],["path",{d:"M13 15l3 0",key:"svg-1"}],["path",{d:"M3 6a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -12",key:"svg-2"}]],rt=R("outline","terminal-2","Terminal2",Ek)});var Fk,Lp,C0=T(()=>{H();Fk=[["path",{d:"M4 16l6 -7l5 5l5 -6",key:"svg-0"}],["path",{d:"M14 14a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",key:"svg-1"}],["path",{d:"M9 9a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",key:"svg-2"}],["path",{d:"M3 16a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",key:"svg-3"}],["path",{d:"M19 8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",key:"svg-4"}]],Lp=R("outline","timeline","Timeline",Fk)});var Dk,Uo,k0=T(()=>{H();Dk=[["path",{d:"M4 7l16 0",key:"svg-0"}],["path",{d:"M10 11l0 6",key:"svg-1"}],["path",{d:"M14 11l0 6",key:"svg-2"}],["path",{d:"M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12",key:"svg-3"}],["path",{d:"M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3",key:"svg-4"}]],Uo=R("outline","trash","Trash",Dk)});var Nk,Er,A0=T(()=>{H();Nk=[["path",{d:"M6 21l15 -15l-3 -3l-15 15l3 3",key:"svg-0"}],["path",{d:"M15 6l3 3",key:"svg-1"}],["path",{d:"M9 3a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2",key:"svg-2"}],["path",{d:"M19 13a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2",key:"svg-3"}]],Er=R("outline","wand","Wand",Nk)});var Bk,zp,R0=T(()=>{H();Bk=[["path",{d:"M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0",key:"svg-0"}],["path",{d:"M3.6 9h16.8",key:"svg-1"}],["path",{d:"M3.6 15h16.8",key:"svg-2"}],["path",{d:"M11.5 3a17 17 0 0 0 0 18",key:"svg-3"}],["path",{d:"M12.5 3a17 17 0 0 1 0 18",key:"svg-4"}]],zp=R("outline","world","World",Bk)});var Ok,to,M0=T(()=>{H();Ok=[["path",{d:"M18 6l-12 12",key:"svg-0"}],["path",{d:"M6 6l12 12",key:"svg-1"}]],to=R("outline","x","X",Ok)});var qe=T(()=>{ib();fb();cb();ub();db();pb();mb();xb();yb();gb();hb();Ib();bb();vb();Sb();wb();Cb();kb();Ab();Rb();Mb();Tb();Eb();Fb();Db();Nb();Bb();Ob();Lb();zb();Hb();_b();Pb();qb();Ub();Xb();Gb();jb();Vb();Yb();Qb();Kb();Zb();Wb();$b();Jb();e0();t0();a0();o0();r0();n0();l0();s0();i0();f0();c0();u0();d0();p0();m0();x0();y0();g0();h0();I0();b0();v0();S0();w0();C0();k0();A0();R0();M0();});var E0=ua(Df=>{"use strict";var Lk=Symbol.for("react.transitional.element"),zk=Symbol.for("react.fragment");function T0(e,t,a){var o=null;if(a!==void 0&&(o=""+a),t.key!==void 0&&(o=""+t.key),"key"in t){a={};for(var r in t)r!=="key"&&(a[r]=t[r])}else a=t;return t=a.ref,{$$typeof:Lk,type:e,key:o,ref:t!==void 0?t:null,props:a}}Df.Fragment=zk;Df.jsx=T0;Df.jsxs=T0});var j=ua((tN,F0)=>{"use strict";F0.exports=E0()});function Xo({id:e,title:t,icon:a,right:o,bodyClassName:r,className:n,children:l}){let s=I(d=>d.collapsedSections.has(e)),i=I(d=>d.toggleSection),f=`xray-sec-${e}`;return(0,Ma.jsxs)("section",{className:`xray-collapsible ${s?"collapsed":""} ${n||""}`,children:[(0,Ma.jsxs)("button",{type:"button",className:"xray-collapsible-header","aria-expanded":!s,"aria-controls":f,onClick:()=>i(e),children:[(0,Ma.jsx)($a,{size:15,stroke:2,className:"xray-collapsible-chevron"}),a&&(0,Ma.jsx)("span",{className:"xray-collapsible-icon",children:a}),(0,Ma.jsx)("span",{className:"xray-collapsible-title",children:t}),o&&(0,Ma.jsx)("span",{className:"xray-collapsible-right",onClick:d=>d.stopPropagation(),children:o})]}),(0,Ma.jsx)("div",{id:f,className:"xray-collapsible-body",inert:s,"aria-hidden":s,children:(0,Ma.jsx)("div",{className:`xray-collapsible-inner ${r||""}`,children:l})})]})}var Ma,Hp=T(()=>{"use strict";qe();$e();Ma=_(j())});function Je({label:e,hint:t,icon:a,action:o}){return(0,Go.jsxs)("div",{className:"xray-empty",role:"status",children:[(0,Go.jsx)("span",{className:"xray-empty-glyph",children:a||(0,Go.jsx)(Dp,{size:26,stroke:1.5})}),(0,Go.jsx)("p",{className:"xray-empty-title",children:e}),t&&(0,Go.jsx)("p",{className:"xray-empty-hint",children:t}),o&&(0,Go.jsx)("div",{className:"xray-empty-action",children:o})]})}var Go,fs=T(()=>{"use strict";qe();Go=_(j())});function _p(e){let{stored:t,varName:a,minList:o,minRest:r}=e,n=ga.default.useRef(null),l=ga.default.useRef(null),[s,i]=ga.default.useState(null),[f,d]=ga.default.useState(0),[x,u]=ga.default.useState(0);ga.default.useEffect(()=>{let c=n.current;if(!c||typeof ResizeObserver>"u")return;let m=()=>{d(Math.round(c.getBoundingClientRect().width)),l.current&&u(Math.round(l.current.getBoundingClientRect().width))};m();let g=new ResizeObserver(m);return g.observe(c),()=>g.disconnect()},[]);let p=f>0?Math.max(o,f-r):Math.max(o,1200),w=Math.min(p,Math.max(o,s??(t||x||o))),E=s??t,y=E>0?{[a]:`${Math.min(p,Math.max(o,E))}px`}:void 0;return{containerRef:n,paneRef:l,value:w,max:p,min:o,splitStyle:y,setLive:i}}function Pp({label:e,value:t,min:a,max:o,step:r=24,onLiveChange:n,onCommit:l,onReset:s}){let i=ga.default.useRef(null),f=ga.default.useRef(0),[d,x]=ga.default.useState(!1),u=y=>Math.max(a,Math.min(o,Math.round(y)));ga.default.useEffect(()=>()=>{f.current&&cancelAnimationFrame(f.current)},[]);function p(y){y.button===0&&(y.preventDefault(),y.currentTarget.setPointerCapture(y.pointerId),i.current={startX:y.clientX,width:t,latest:y.clientX},x(!0),n(t))}function v(y){let c=i.current;c&&(c.latest=y.clientX,!f.current&&(f.current=requestAnimationFrame(()=>{f.current=0;let m=i.current;m&&n(u(m.width+(m.latest-m.startX)))})))}function w(y){let c=i.current;if(c){i.current=null,f.current&&(cancelAnimationFrame(f.current),f.current=0),x(!1);try{y.currentTarget.releasePointerCapture(y.pointerId)}catch{}l(u(c.width+(y.clientX-c.startX)))}}function E(y){y.key!=="ArrowLeft"&&y.key!=="ArrowRight"||(y.preventDefault(),l(u(t+(y.key==="ArrowRight"?r:-r))))}return(0,D0.jsx)("div",{className:`xray-pane-divider ${d?"dragging":""}`,role:"separator","aria-orientation":"vertical","aria-label":`${e} \u2014 drag, or use arrow keys`,"aria-valuenow":t,"aria-valuemin":a,"aria-valuemax":o,tabIndex:0,onPointerDown:p,onPointerMove:v,onPointerUp:w,onPointerCancel:w,onKeyDown:E,onDoubleClick:s,title:"Drag to resize \xB7 double-click to reset"})}var ga,D0,N0=T(()=>{"use strict";ga=_(ze()),D0=_(j())});function Hk(e){return Math.max(0,Number(e.duration)||0)}function O0(e){let t=e.timing;if(t&&Number(t.totalMs)>0)return{phases:[{label:"DNS",ms:Number(t.dnsMs)||0,className:"dns"},{label:"Connect",ms:Math.max(0,(Number(t.connectMs)||0)-(Number(t.tlsMs)||0)),className:"connect"},{label:"TLS",ms:Number(t.tlsMs)||0,className:"tls"},{label:"Wait (TTFB)",ms:Number(t.ttfbMs)||0,className:"ttfb"},{label:"Download",ms:Number(t.downloadMs)||0,className:"download"}].filter(r=>r.ms>0),totalMs:Number(t.totalMs),real:!0};let a=Hk(e);return{phases:[{label:"Total",ms:a,className:"total"}],totalMs:a,real:!1}}function qp(e,t){return t==="request"?sa(e):t==="headers"?{requestHeaders:e.requestHeaders||{},responseHeaders:e.responseHeaders||{}}:se(e)}function L0(e){let a=(Array.isArray(e)?e:e&&typeof e=="object"?Object.values(e).find(Array.isArray)||[e]:[]).filter(r=>r&&typeof r=="object"&&!Array.isArray(r)).slice(0,200),o=Array.from(a.reduce((r,n)=>(Object.keys(n).slice(0,20).forEach(l=>r.add(l)),r),new Set));return{objects:a,columns:o}}function z0(e,t,a=200){let o=[],r=(n,l,s,i)=>{if(o.length>=a||i>6)return;if(n===void 0&&l!==void 0){o.push({path:s,kind:"added",after:l});return}if(n!==void 0&&l===void 0){o.push({path:s,kind:"removed",before:n});return}if(!(n!==null&&typeof n=="object")||!(l!==null&&typeof l=="object")){Object.is(n,l)||o.push({path:s,kind:"changed",before:n,after:l});return}if(Array.isArray(n)!==Array.isArray(l)){o.push({path:s,kind:"changed",before:n,after:l});return}if(Array.isArray(n)&&Array.isArray(l)){let u=Math.max(n.length,l.length);for(let p=0;p<Math.min(u,50);p+=1)r(n[p],l[p],`${s}[${p}]`,i+1);u>50&&o.length<a&&o.push({path:`${s}[\u2026]`,kind:"changed",before:`${n.length} items`,after:`${l.length} items`});return}let x=new Set([...Object.keys(n),...Object.keys(l)]);for(let u of x)r(n[u],l[u],s?`${s}.${u}`:u,i+1)};return r(e,t,"",0),o}var B0,H0=T(()=>{"use strict";Ae();B0=["tree","grid","raw","schema","diff","viz","waterfall","headers"]});function Pn(e){return typeof e=="number"&&Number.isFinite(e)}function _k(e,t){if(e==null)return`#${t+1}`;let a=typeof e=="string"?e:String(e);return a.length>40?a.slice(0,40)+"\u2026":a||`#${t+1}`}function Pk(e){if(Array.isArray(e))return e;if(e&&typeof e=="object"){let t=Object.values(e).find(Array.isArray);if(Array.isArray(t))return t}return null}function _0(e){let t=new Map;for(let a of e){let o=a==null?"null":typeof a=="object"?"[object]":String(a);t.set(o,(t.get(o)||0)+1)}return Array.from(t.entries()).sort((a,o)=>o[1]-a[1]).map(([a,o])=>({label:a,value:o,negative:!1}))}function qk(e){let t=new Map,a=[],o=new Set;for(let l of e)for(let[s,i]of Object.entries(l))Pn(i)?t.set(s,(t.get(s)||0)+1):typeof i=="string"&&!o.has(s)&&(o.add(s),a.push(s));let r=Array.from(t.entries()).sort((l,s)=>s[1]-l[1])[0]?.[0],n=a[0];if(r){let l=e.filter(i=>Pn(i[r])).slice(0,40).map((i,f)=>{let d=i[r];return{label:n?_k(i[n],f):`#${f+1}`,value:d,negative:d<0}});if(!l.length)return null;let s=e.filter(i=>Pn(i[r])).length;return{kind:"bars",title:`${r} across ${s} rows`,subtitle:n?`Labeled by ${n}`:void 0,bars:l,truncated:Math.max(0,s-l.length),maxAbs:Math.max(...l.map(i=>Math.abs(i.value)),0)}}if(n){let l=_0(e.map(i=>i[n])),s=l.slice(0,40);return{kind:"bars",title:`Distribution of ${n}`,subtitle:`${e.length} rows`,bars:s,truncated:Math.max(0,l.length-s.length),maxAbs:Math.max(...s.map(i=>i.value),0)}}return null}function P0(e){let t=o=>({kind:"none",title:o,bars:[],truncated:0,maxAbs:0}),a=Pk(e);if(a&&a.length){if(a.every(Pn)){let o=a.slice(0,40).map((r,n)=>({label:`#${n+1}`,value:r,negative:r<0}));return{kind:"bars",title:`${a.length} values`,bars:o,truncated:Math.max(0,a.length-o.length),maxAbs:Math.max(...o.map(r=>Math.abs(r.value)),0)}}if(a.every(o=>o&&typeof o=="object"&&!Array.isArray(o))){let o=qk(a);if(o)return o}if(a.every(o=>o==null||typeof o!="object")){let o=_0(a),r=o.slice(0,40);return{kind:"bars",title:`Distribution of ${a.length} values`,bars:r,truncated:Math.max(0,o.length-r.length),maxAbs:Math.max(...r.map(n=>n.value),0)}}return t("This array has no numeric or categorical field to chart.")}if(e&&typeof e=="object"){let o=Object.entries(e).filter(([,r])=>Pn(r));if(o.length){let r=o.slice(0,40).map(([n,l])=>({label:n,value:l,negative:l<0}));return{kind:"bars",title:`${o.length} numeric fields`,bars:r,truncated:Math.max(0,o.length-r.length),maxAbs:Math.max(...r.map(n=>Math.abs(n.value)),0)}}return t("No numeric fields in this object to chart.")}return Pn(e)?{kind:"bars",title:"Single value",bars:[{label:"value",value:e,negative:e<0}],truncated:0,maxAbs:Math.abs(e)}:t("Select a response with arrays or numbers to visualize.")}function Up(e){return Number.isInteger(e)?e.toLocaleString("en-US"):Math.abs(e)>=1e3?e.toLocaleString("en-US",{maximumFractionDigits:1}):String(Number(e.toFixed(3)))}var q0=T(()=>{"use strict"});function U0(e){let t=e.replace(/-/g,"+").replace(/_/g,"/").padEnd(Math.ceil(e.length/4)*4,"=");try{let a=atob(t),o=Uint8Array.from(a,r=>r.charCodeAt(0));return new TextDecoder().decode(o)}catch{return""}}function X0(e){try{return JSON.parse(e)}catch{return null}}function Nf(e){let t=Number(e);return!Number.isFinite(t)||t<=0?null:new Date(t*1e3).toISOString()}function Xk(e,t){let a=e.split(".");if(a.length<2)return null;let o=X0(U0(a[0])),r=X0(U0(a[1]));if(o==null&&r==null)return null;let n=r&&typeof r=="object"?r:{},l=Nf(n.exp);return{source:t,raw:e,header:o,payload:r,expiresAt:l,issuedAt:Nf(n.iat),expired:l?Number(n.exp)*1e3<Date.now():null}}function qn(e,t,a,o=0){if(!(o>4||t.length>200)){if(typeof e=="string"){t.push({text:e,source:a});return}if(Array.isArray(e)){e.forEach((r,n)=>qn(r,t,`${a}[${n}]`,o+1));return}e&&typeof e=="object"&&Object.entries(e).forEach(([r,n])=>qn(n,t,a?`${a}.${r}`:r,o+1))}}function G0(e){let t=[],a=new Set,o=[],r=Array.isArray(e.jwtLenses)?e.jwtLenses:[];for(let l of r){if(!l||typeof l!="object")continue;let s=l.payload&&typeof l.payload=="object"?l.payload:{},i=Nf(s.exp);if(t.push({source:`requestHeaders.${String(l.source||"authorization")}`,raw:"[redacted]",header:l.header??null,payload:l.payload??null,expiresAt:i,issuedAt:Nf(s.iat),expired:i?Number(s.exp)*1e3<Date.now():null}),t.length>=20)return t}qn(e.requestHeaders,o,"requestHeaders"),qn(e.responseHeaders,o,"responseHeaders"),qn(e.requestBody,o,"requestBody");let n=e.responseDecrypted??e.responseRaw;qn(n,o,"response");for(let l of o){let s=l.text.match(Uk);if(s)for(let i of s){if(a.has(i))continue;a.add(i);let f=Xk(i,l.source);if(f&&t.push(f),t.length>=20)return t}}return t}var Uk,j0=T(()=>{"use strict";Uk=/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/g});function V0(e){return!!e&&typeof e=="object"}function Gk(e){return e==null||e===""?!0:Array.isArray(e)?e.length===0:V0(e)?Object.keys(e).length===0:!1}function jk(e,t){return Number(e.size)>8e4?!0:Z(t,0,12e4).length>8e4}function Y0(e,t){return Pe(e)&&Pe(t)&&Et(e)===Et(t)}function Vk(e,t){return t.filter(o=>o.id!==e.id&&Y0(o,e)).filter(o=>Number(o.timestamp)<=Number(e.timestamp||Date.now())).sort((o,r)=>Number(r.timestamp)-Number(o.timestamp))[0]||null}function Yk(e,t){if(e.driftFromId)return!0;let a=Vk(e,t);return a?Z(Pd(a),0,2e4)!==Z(Pd(e),0,2e4):!1}function ve(e,t){let a=e.findIndex(o=>o.id===t.id);if(a===-1){e.push(t);return}t.priority>e[a].priority&&(e[a]=t)}function Q0(e,t){let a=se(e),o=Number(e.status)||0,r=ne(e),n=t.filter(i=>i.id!==e.id&&Y0(i,e)),l=t.filter(i=>Pe(i)&&Number(i.status)>=400),s=[];return o>=400&&(ve(s,{id:"inspect-error",label:"Inspect Error",kind:"view",view:"tree",priority:100}),ve(s,{id:"compare-previous",label:"Compare Previous",kind:"console",command:"diff(prev, res)",priority:95}),l.length&&ve(s,{id:"related-errors",label:"Related Errors",kind:"console",command:`$errors().filter(e => (e.urlPath || e.url || '').includes(${JSON.stringify(r)}))`,priority:90})),ie(e)>500&&(ve(s,{id:"similar-calls",label:"Similar Calls",kind:"console",command:`$endpoint(${JSON.stringify(r)})`,priority:82}),ve(s,{id:"waterfall",label:"Waterfall",kind:"view",view:"waterfall",priority:80}),ve(s,{id:"compare-previous",label:"Compare Previous",kind:"console",command:"diff(prev, res)",priority:78})),(Array.isArray(a)||V0(a))&&(ve(s,{id:"schema",label:"Schema",kind:"view",view:"schema",command:"schema(res)",priority:75}),ve(s,{id:"table",label:"Table",kind:"view",view:"grid",command:"table(res.items || res)",priority:74}),ve(s,{id:"visualize",label:"Visualize",kind:"view",view:"viz",command:"table(res.items || res)",priority:73})),Yk(e,t)&&(ve(s,{id:"diff",label:"Diff",kind:"view",view:"diff",command:"diff(prev, res)",priority:88}),ve(s,{id:"compare-previous",label:"Compare Previous",kind:"view",view:"diff",command:"diff(prev, res)",priority:87}),ve(s,{id:"schema",label:"Schema",kind:"view",view:"schema",command:"schema(res)",priority:86})),jk(e,a)&&(ve(s,{id:"copy-full",label:"Copy Full",kind:"copy",lazyCommand:()=>Z(a,2,5e5),toast:"Full response copied.",priority:70}),ve(s,{id:"schema",label:"Schema",kind:"view",view:"schema",command:"schema(res)",priority:69})),Gk(a)&&(ve(s,{id:"headers",label:"Headers",kind:"view",view:"headers",priority:65}),ve(s,{id:"request",label:"Request",kind:"view",view:"raw",priority:64}),n.length&&ve(s,{id:"similar-calls",label:"Similar Calls",kind:"console",command:`$endpoint(${JSON.stringify(r)})`,priority:63})),n.length>=3&&(ve(s,{id:"similar-calls",label:"Similar Calls",kind:"console",command:`$endpoint(${JSON.stringify(r)})`,priority:62}),ve(s,{id:"waterfall",label:"Waterfall",kind:"view",view:"waterfall",priority:61}),ve(s,{id:"slow-calls",label:"Slow Calls",kind:"console",command:"$slow(500)",priority:60})),ve(s,{id:"copy-curl",label:"Copy cURL",kind:"copy",command:af(e),toast:"cURL copied.",priority:45}),ve(s,{id:"copy-fetch",label:"Copy fetch",kind:"copy",command:of(e),toast:"fetch snippet copied.",priority:44}),ve(s,{id:"mock",label:"Mock",kind:"copy",lazyCommand:()=>xI(e),toast:"Mock response copied.",priority:43}),ve(s,{id:"send-console",label:"Send to Console",kind:"console",command:"res",priority:43}),ve(s,{id:"save-snippet",label:"Save Snippet",kind:"snippet",command:"schema(res)",priority:42}),ve(s,{id:"export",label:"Export",kind:"export",priority:41}),s.sort((i,f)=>f.priority-i.priority).slice(0,14)}var K0=T(()=>{"use strict";Gt();Ae()});function $0(e){return Array.isArray(e)?"array":e!==null&&typeof e=="object"?"object":null}function J0(e){return typeof e=="string"?"xray-json-string":typeof e=="number"?"xray-json-number":typeof e=="boolean"?"xray-json-bool":e==null?"xray-json-null":"xray-json-punct"}function ev(e){return typeof e=="string"?JSON.stringify(e):e===void 0?"undefined":e===null?"null":String(e)}function tv({nodeKey:e,value:t,path:a,depth:o,isOpen:r,toggle:n}){let l=$0(t),s=e===null?null:(0,ue.jsx)("span",{className:"xray-json-key",children:typeof e=="number"?e:JSON.stringify(e)});if(!l)return(0,ue.jsxs)("div",{className:"xray-json-row",role:"treeitem",style:{paddingLeft:o*14+8},children:[(0,ue.jsx)("span",{className:"xray-json-gutter"}),s,s&&(0,ue.jsx)("span",{className:"xray-json-punct",children:": "}),(0,ue.jsx)("span",{className:J0(t),children:ev(t)})]});let i=l==="array"?t.map((u,p)=>[p,u]):Object.entries(t),f=r(a,o),d=l==="array"?["[","]"]:["{","}"],x=l==="array"?`${i.length} ${i.length===1?"item":"items"}`:`${i.length} ${i.length===1?"key":"keys"}`;return(0,ue.jsxs)("div",{className:"xray-json-node",role:"treeitem","aria-expanded":f,children:[(0,ue.jsxs)("button",{className:"xray-json-row xray-json-branch",style:{paddingLeft:o*14},onClick:()=>n(a,o),children:[(0,ue.jsx)($a,{size:13,stroke:2.2,className:`xray-json-chevron ${f?"":"closed"}`}),s,s&&(0,ue.jsx)("span",{className:"xray-json-punct",children:": "}),(0,ue.jsx)("span",{className:"xray-json-punct",children:d[0]}),!f&&(0,ue.jsx)("span",{className:"xray-json-summary",children:x}),!f&&(0,ue.jsx)("span",{className:"xray-json-punct",children:d[1]})]}),f&&(0,ue.jsxs)("div",{className:"xray-json-children",children:[i.map(([u,p])=>(0,ue.jsx)(tv,{nodeKey:u,value:p,path:`${a}.${u}`,depth:o+1,isOpen:r,toggle:n},u)),(0,ue.jsxs)("div",{className:"xray-json-row",style:{paddingLeft:o*14+8},children:[(0,ue.jsx)("span",{className:"xray-json-gutter"}),(0,ue.jsx)("span",{className:"xray-json-punct",children:d[1]})]})]})]})}var jo,ue,Z0,W0,jt,cs=T(()=>{"use strict";jo=_(ze());qe();Ae();ue=_(j()),Z0=6e4,W0=4;jt=jo.default.memo(function({value:t}){let a=jo.default.useMemo(()=>Z(t,0,Z0+1).length>Z0,[t]),[o,r]=jo.default.useState(()=>new Map),[n,l]=jo.default.useState(null);jo.default.useEffect(()=>{r(new Map),l(null)},[t]);let s=jo.default.useCallback((f,d)=>{let x=o.get(f);return x!==void 0?x:n!==null?n:d<W0},[o,n]),i=jo.default.useCallback((f,d)=>{r(x=>{let u=new Map(x),p=x.get(f)??(n!==null?n:d<W0);return u.set(f,!p),u})},[n]);if(a){let f=Z(t);return(0,ue.jsx)("pre",{className:"xray-json xray-json-editor xray-json-text",children:f})}return $0(t)===null?(0,ue.jsx)("pre",{className:"xray-json xray-json-scalar",children:(0,ue.jsx)("span",{className:J0(t),children:ev(t)})}):(0,ue.jsxs)("div",{className:"xray-json xray-json-tree",role:"tree","aria-label":"JSON viewer",children:[(0,ue.jsxs)("div",{className:"xray-json-tree-toolbar",children:[(0,ue.jsxs)("button",{className:"xray-json-tree-btn",onClick:()=>{l(!0),r(new Map)},title:"Expand all nodes",children:[(0,ue.jsx)(xp,{size:13,stroke:2}),"Expand all"]}),(0,ue.jsxs)("button",{className:"xray-json-tree-btn",onClick:()=>{l(!1),r(new Map)},title:"Collapse all nodes",children:[(0,ue.jsx)(yp,{size:13,stroke:2}),"Collapse all"]})]}),(0,ue.jsx)("div",{className:"xray-json-tree-body",children:(0,ue.jsx)(tv,{nodeKey:null,value:t,path:"$",depth:0,isOpen:s,toggle:i})})]})})});function Wk(e){return e.startsWith("requestHeaders")?"Request header":e.startsWith("responseHeaders")?"Response header":e.startsWith("requestBody")?"Request body":"Response body"}function us({entry:e,compact:t=!1,onClose:a}){let o=I(B=>B.detailView),r=I(B=>B.setDetailView),n=I(B=>B.detailTab),l=I(B=>B.setDetailTab),s=I(B=>B.insertConsoleCommand),i=I(B=>B.saveSnippet),f=I(B=>B.setExportOpen),d=I(B=>B.showToast),x=I(B=>B.entries.length),u=I(B=>B.replayEntry),p=I(B=>B.openReplayEditor),v=I(B=>B.openExplain),[w,E]=Ue.default.useState("response"),y=Ue.default.useMemo(()=>aA(e),[e]),c=Object.keys(y).length>0,m=Ue.default.useMemo(()=>G0(e),[e]),g=Array.isArray(e.wsFrames),k=Array.isArray(e.initiator)&&e.initiator.length>0,N=Ue.default.useMemo(()=>e.driftFromId&&I.getState().entries.find(B=>B.id===e.driftFromId)||null,[e.driftFromId,x]),b=Ue.default.useMemo(()=>w==="headers"?eA(e):w==="cookies"?y:w==="timeline"?tA(e):qp(e,n),[y,n,e,w]),D=Ue.default.useMemo(()=>Q0(e,I.getState().entries),[e,x]),S=Ue.default.useMemo(()=>$k(D),[D]),P=Ue.default.useMemo(()=>N??oA(e,I.getState().entries),[N,e,x]),le=Ue.default.useMemo(()=>P?se(P):null,[P]),[dt,pt]=Ue.default.useState(null);Ue.default.useEffect(()=>{E(B=>B==="frames"&&!g||B==="initiator"&&!k||B==="tokens"&&!m.length?"response":B)},[e.id,g,k,m.length]),Ue.default.useEffect(()=>{let B=!1;if(pt(null),!!window.XRAY_Worker?.detailAnalysis)return window.XRAY_Worker.detailAnalysis(b,le).then(de=>{!B&&de&&typeof de=="object"&&pt(de)}).catch(()=>{}),()=>{B=!0}},[b,le]),Ue.default.useEffect(()=>{w==="cookies"&&!c&&E("response")},[c,w]);function lo(B){if(E(B),B==="headers"){l("headers"),r("tree");return}if(l("response"),B==="timeline"){r("waterfall");return}(o==="headers"||o==="waterfall")&&r("tree")}function Qo(B){if(r(B),B==="headers"){l("headers"),E("headers");return}if(B==="waterfall"){l("response"),E("timeline");return}l("response"),E("response")}async function ha(){await ct(typeof b=="string"?b:Z(b,2,5e5)),d("Response copied.")}async function O(B){if(B.kind==="view"){B.id==="headers"||B.view==="headers"?(E("headers"),l("headers"),r("tree")):B.view==="waterfall"?(E("timeline"),l("response"),r("waterfall")):(E("response"),l(B.id==="request"?"request":"response"),B.view&&r(B.view)),d(`${B.label} opened.`);return}if(B.kind==="console"&&B.command){s(B.command),d(`${B.label} inserted in Console.`);return}if(B.kind==="snippet"&&B.command){i({title:`${e.method||"GET"} ${ne(e)}`,code:B.command}),d("Saved to Console snippets.");return}if(B.kind==="copy"){let de=B.command??B.lazyCommand?.();if(!de)return;await ct(de),d(B.toast||`${B.label} copied.`);return}B.kind==="export"&&(f(!0),d("Export opened."))}let K=Qk.filter(B=>B.id==="cookies"?c:B.id==="frames"?g:B.id==="initiator"?k:B.id==="tokens"?m.length>0:!0),Le=Number(e.status)||0;function L(){u(e)}return(0,C.jsxs)("div",{className:`xray-request-detail ${t?"compact":""}`,children:[!t&&(0,C.jsxs)(C.Fragment,{children:[(0,C.jsxs)("div",{className:"xray-detail-hero",children:[(0,C.jsxs)("div",{className:"xray-response-heading",children:[(0,C.jsx)("span",{className:`xray-method ${fa(e.method)}`,children:e.method||"GET"}),(0,C.jsx)("h3",{children:ne(e)})]}),(0,C.jsxs)("div",{className:"xray-response-chips",children:[(0,C.jsx)("span",{className:`xray-response-chip ${Xt(Le)}`,children:e.status||e.logLevel||"log"}),(0,C.jsxs)("span",{className:"xray-response-chip",children:[Math.round(ie(e)),"ms"]}),(0,C.jsx)("span",{className:"xray-response-chip",children:Tt(e.size)})]}),a&&(0,C.jsx)("button",{className:"xray-icon-btn","aria-label":"Close selected request detail",onClick:a,children:(0,C.jsx)(to,{...Oe})})]}),N&&(0,C.jsxs)("div",{className:"xray-drift-banner",role:"status",children:[(0,C.jsx)(ss,{...Oe}),(0,C.jsx)("span",{children:"Response schema changed versus the previous call to this endpoint."}),(0,C.jsx)("button",{className:"xray-chip",onClick:()=>{E("response"),l("response"),r("diff")},children:"View diff"})]}),(0,C.jsxs)("div",{className:"xray-detail-actionbar","aria-label":"Request actions",children:[(0,C.jsxs)("button",{className:"xray-chip xray-operation-chip",onClick:L,title:"Replay this request from the page",children:[(0,C.jsx)(Ja,{...Oe}),"Replay"]}),(0,C.jsxs)("button",{className:"xray-chip xray-operation-chip",onClick:()=>p(e),title:"Edit method, headers, or body then replay",children:[(0,C.jsx)(Ja,{...Oe}),"Edit & Replay"]}),(0,C.jsxs)("button",{className:"xray-chip xray-operation-chip",onClick:()=>v(e),title:"Explain this request with AI",children:[(0,C.jsx)(eo,{...Oe}),"Explain"]}),(0,C.jsxs)("button",{className:"xray-chip xray-operation-chip",onClick:()=>I.getState().addRule({label:`${e.method||"GET"} ${ne(e)}`,match:{url:String(e.urlPath||e.url||""),method:String(e.method||"")},action:{type:"mock",status:Number(e.status)||200,body:typeof se(e)=="string"?String(se(e)):Z(se(e),2,1e5),headers:{},delayMs:0}}),title:"Create a mock rule from this response",children:[(0,C.jsx)(Rr,{...Oe}),"Mock this"]})]}),(0,C.jsxs)("div",{className:"xray-detail-nav",children:[(0,C.jsx)("div",{className:"xray-detail-tabs","aria-label":"Response tabs",children:K.map(B=>(0,C.jsx)("button",{className:`xray-detail-tab ${w===B.id?"active":""}`,onClick:()=>lo(B.id),children:B.label},B.id))}),(0,C.jsx)("div",{className:"xray-detail-views","aria-label":"View modes",children:B0.map(B=>(0,C.jsx)("button",{className:`xray-chip ${o===B?"active":""}`,onClick:()=>Qo(B),children:Kk[B]||B},B))})]}),(0,C.jsx)("div",{className:"xray-operation-groups xray-smart-ops","aria-label":"Smart response operations",children:S.map(B=>(0,C.jsxs)("div",{className:"xray-operation-group",children:[(0,C.jsx)("span",{children:B.label}),(0,C.jsx)("div",{className:"xray-operation-bar",children:B.operations.map(de=>(0,C.jsxs)("button",{className:`xray-chip xray-operation-chip ${de.kind}`,onClick:()=>{O(de)},children:[(0,C.jsx)(Jk,{operation:de}),de.label.replace("Send to ","")]},de.id))})]},B.label))})]}),(0,C.jsxs)("div",{className:"xray-detail-content",children:[!t&&w==="frames"&&(0,C.jsx)(cA,{frames:e.wsFrames||[],state:e.wsState}),!t&&w==="initiator"&&(0,C.jsx)(dA,{entry:e}),!t&&w==="tokens"&&(0,C.jsx)(pA,{jwts:m}),(t||w!=="frames"&&w!=="initiator"&&w!=="tokens")&&(0,C.jsxs)(C.Fragment,{children:[(t||o==="tree")&&(0,C.jsx)(rA,{compact:t,entry:e,detailTab:n,responseTab:w,activeValue:b,hasFrames:g}),!t&&o==="grid"&&(0,C.jsx)(sA,{value:b,workerGrid:dt?.grid}),!t&&o==="raw"&&(0,C.jsx)(nA,{value:b}),!t&&o==="schema"&&(0,C.jsx)(lA,{value:b,workerSchema:dt?.schema}),!t&&o==="diff"&&(0,C.jsx)(mA,{current:b,previous:le,baselineId:N?.id||null,baselineIsDrift:!!N}),!t&&o==="viz"&&(0,C.jsx)(iA,{value:b}),!t&&o==="waterfall"&&(0,C.jsx)(fA,{entry:e}),!t&&o==="headers"&&(0,C.jsx)(ov,{entry:e})]})]}),!t&&(0,C.jsxs)("div",{className:"xray-detail-footer",children:[(0,C.jsxs)("button",{className:"xray-action-btn",onClick:()=>s("res"),children:[(0,C.jsx)(Mr,{...Oe}),"Console"]}),(0,C.jsxs)("button",{className:"xray-action-btn",onClick:()=>i({title:`${e.method||"GET"} ${ne(e)}`,code:"schema(res)"}),children:[(0,C.jsx)(Po,{...Oe}),"Snippet"]}),(0,C.jsxs)("button",{className:"xray-action-btn",onClick:()=>{ha()},children:[(0,C.jsx)(ut,{...Oe}),"Copy"]}),(0,C.jsxs)("button",{className:"xray-action-btn primary",onClick:()=>f(!0),children:[(0,C.jsx)(Ft,{...Oe}),"Export"]})]})]})}function $k(e){let t=new Set,a=Zk.map(r=>{let n=r.ids,l=e.filter(s=>n.includes(s.id));return l.forEach(s=>t.add(s.id)),{label:r.label,operations:l}}).filter(r=>r.operations.length),o=e.filter(r=>!t.has(r.id));return o.length?[...a,{label:"More",operations:o}]:a}function Jk({operation:e}){return e.id==="schema"?(0,C.jsx)(np,{...Oe}):e.id==="table"?(0,C.jsx)(Op,{...Oe}):e.id==="visualize"?(0,C.jsx)(wr,{...Oe}):e.id==="diff"||e.id==="compare-previous"?(0,C.jsx)(dp,{...Oe}):e.id==="waterfall"?(0,C.jsx)(Lp,{...Oe}):e.kind==="copy"?(0,C.jsx)(ut,{...Oe}):e.kind==="console"?(0,C.jsx)(rt,{...Oe}):e.kind==="snippet"?(0,C.jsx)(Po,{...Oe}):e.kind==="export"?(0,C.jsx)(Ft,{...Oe}):(0,C.jsx)(ip,{...Oe})}function eA(e){return{requestHeaders:e.requestHeaders||{},responseHeaders:e.responseHeaders||{}}}function tA(e){return{startedAt:e.timestamp?new Date(e.timestamp).toISOString():null,durationMs:Math.round(ie(e)),status:e.status||null,size:Number(e.size)||0,source:e.source||"fetch"}}function aA(e){let t=av(e.requestHeaders,"cookie"),a=av(e.responseHeaders,"set-cookie");return{...t?{requestCookie:t}:{},...a?{setCookie:a}:{}}}function av(e,t){if(!e||typeof e!="object")return"";let a=t.toLowerCase(),o=Object.entries(e).find(([r])=>r.toLowerCase()===a);return o?String(o[1]??""):""}function oA(e,t){let a=Et(e);return t.filter(o=>o.id!==e.id&&o.type==="api"&&Et(o)===a).filter(o=>Number(o.timestamp)<=Number(e.timestamp||Date.now())).sort((o,r)=>Number(r.timestamp)-Number(o.timestamp))[0]||null}function rA({compact:e,entry:t,detailTab:a,responseTab:o,activeValue:r,hasFrames:n}){return e?(0,C.jsx)(jt,{value:qp(t,a)}):o==="headers"?(0,C.jsx)(ov,{entry:t}):typeof r=="string"?(0,C.jsx)("pre",{className:"xray-json xray-json-text",children:r}):r==null&&n&&o==="response"?(0,C.jsx)(Je,{label:"Streaming entry",hint:"This is a WebSocket/SSE stream \u2014 open the Frames tab to inspect the messages."}):(0,C.jsx)(jt,{value:r})}function nA({value:e}){let t=Ue.default.useMemo(()=>typeof e=="string"?e:Z(e),[e]);return(0,C.jsx)("pre",{className:"xray-json",children:t})}function lA({value:e,workerSchema:t}){let a=Ue.default.useMemo(()=>t??la(e),[t,e]);return(0,C.jsx)(jt,{value:a})}function ov({entry:e}){let[t,a]=Ue.default.useState(""),o=I(l=>l.showToast),r=Ue.default.useMemo(()=>[{label:"Request headers",headers:Object.entries(e.requestHeaders||{})},{label:"Response headers",headers:Object.entries(e.responseHeaders||{})}],[e]),n=t.trim().toLowerCase();return(0,C.jsxs)("div",{className:"xray-headers-view",children:[(0,C.jsxs)("label",{className:"xray-search xray-headers-filter",children:[(0,C.jsx)(ot,{...Oe}),(0,C.jsx)("input",{className:"xray-input",placeholder:"Filter headers...",value:t,onChange:l=>a(l.currentTarget.value)})]}),r.map(l=>{let s=l.headers.filter(([i,f])=>!n||i.toLowerCase().includes(n)||String(f??"").toLowerCase().includes(n));return(0,C.jsxs)("section",{className:"xray-headers-section",children:[(0,C.jsxs)("h4",{children:[l.label,(0,C.jsxs)("span",{className:"xray-muted",children:[" ",s.length]})]}),s.length===0?(0,C.jsx)("p",{className:"xray-muted",children:n?"No headers match.":"No headers captured."}):(0,C.jsx)("div",{className:"xray-headers-grid",children:s.map(([i,f])=>(0,C.jsxs)("div",{className:"xray-header-row",children:[(0,C.jsx)("span",{className:"xray-header-name",children:i}),(0,C.jsx)("span",{className:"xray-header-value",title:String(f??""),children:String(f??"")}),(0,C.jsx)("button",{className:"xray-icon-btn","aria-label":`Copy ${i} value`,onClick:()=>{ct(String(f??"")),o(`${i} copied.`)},children:(0,C.jsx)(ut,{size:13,stroke:2})})]},i))})]},l.label)})]})}function sA({value:e,workerGrid:t}){let{objects:a,columns:o}=t||L0(e);return a.length?(0,C.jsxs)("table",{className:"xray-table",children:[(0,C.jsx)("thead",{children:(0,C.jsx)("tr",{children:o.map(r=>(0,C.jsx)("th",{children:r},r))})}),(0,C.jsx)("tbody",{children:a.map((r,n)=>(0,C.jsx)("tr",{children:o.map(l=>(0,C.jsx)("td",{children:ia(r[l],160)},l))},n))})]}):(0,C.jsx)(Je,{label:"No object rows found"})}function iA({value:e}){let t=Ue.default.useMemo(()=>P0(e),[e]);if(t.kind==="none"||!t.bars.length)return(0,C.jsx)(Je,{label:t.title});let a=t.maxAbs||1;return(0,C.jsxs)("div",{className:"xray-viz",role:"figure","aria-label":t.title,children:[(0,C.jsxs)("div",{className:"xray-viz-head",children:[(0,C.jsx)("h3",{children:t.title}),t.subtitle&&(0,C.jsx)("span",{className:"xray-muted",children:t.subtitle})]}),(0,C.jsx)("div",{className:"xray-viz-bars",children:t.bars.map((o,r)=>(0,C.jsxs)("div",{className:"xray-viz-row",title:`${o.label}: ${Up(o.value)}`,children:[(0,C.jsx)("span",{className:"xray-viz-label",children:o.label}),(0,C.jsx)("span",{className:"xray-viz-track",children:(0,C.jsx)("span",{className:`xray-viz-fill ${o.negative?"negative":""}`,style:{width:`${Math.max(2,Math.abs(o.value)/a*100)}%`}})}),(0,C.jsx)("span",{className:"xray-viz-value",children:Up(o.value)})]},r))}),t.truncated>0&&(0,C.jsxs)("p",{className:"xray-muted xray-viz-foot",children:["+",t.truncated," more not shown"]})]})}function fA({entry:e}){let{phases:t,totalMs:a,real:o}=O0(e),r=Math.max(1,a);return(0,C.jsxs)("div",{className:"xray-card xray-waterfall-card",children:[(0,C.jsxs)("div",{className:"xray-waterfall-head",children:[(0,C.jsx)("h3",{children:"Timing"}),(0,C.jsxs)("span",{className:"xray-muted",children:[o?"Resource Timing":"Wall clock"," \xB7 ",Math.round(a),"ms"]})]}),(0,C.jsx)("div",{className:"xray-waterfall-track",children:t.map(n=>(0,C.jsx)("span",{className:`xray-waterfall-seg ${n.className}`,style:{width:`${Math.max(1,n.ms/r*100)}%`},title:`${n.label}: ${Math.round(n.ms)}ms`},n.label))}),(0,C.jsx)("ul",{className:"xray-waterfall-legend",children:t.map(n=>(0,C.jsxs)("li",{children:[(0,C.jsx)("span",{className:`xray-waterfall-dot ${n.className}`}),(0,C.jsx)("span",{children:n.label}),(0,C.jsxs)("strong",{children:[Math.round(n.ms),"ms"]})]},n.label))}),e.timing?.transferSize?(0,C.jsxs)("p",{className:"xray-muted",children:["Transfer size ",Tt(e.timing.transferSize)]}):null]})}function cA({frames:e,state:t}){return e.length?(0,C.jsxs)("div",{className:"xray-frames",children:[(0,C.jsxs)("div",{className:"xray-frames-head",children:[(0,C.jsx)("span",{className:`xray-ws-state ${t||""}`,children:t||"stream"}),(0,C.jsxs)("span",{className:"xray-muted",children:[e.length," frames"]})]}),(0,C.jsx)("div",{className:"xray-frames-list",children:e.slice().reverse().map((a,o)=>(0,C.jsxs)("div",{className:`xray-frame-row ${a.dir}`,children:[(0,C.jsx)("span",{className:`xray-frame-dir ${a.dir}`,children:a.dir==="in"?"\u2193 in":"\u2191 out"}),(0,C.jsx)("span",{className:"xray-frame-time",children:Ra(a.ts)}),(0,C.jsx)("span",{className:"xray-frame-size",children:Tt(a.size)}),(0,C.jsx)("code",{className:"xray-frame-preview",children:a.preview})]},e.length-o))})]}):(0,C.jsx)(Je,{label:t==="connecting"?"Waiting for stream frames\u2026":"No frames captured"})}function uA(e){let t=e.match(/^\s*(?:at\s+)?(.*?)\s*\(?((?:https?|chrome-extension|webpack|file):[^)\s]+)\)?\s*$/);return t&&t[2]?{fn:t[1]||"(anonymous)",location:t[2]}:{fn:e,location:""}}function dA({entry:e}){let t=I(o=>o.showToast),a=e.initiator||[];return a.length?(0,C.jsxs)("div",{className:"xray-card",children:[(0,C.jsx)("h3",{children:"Call stack"}),(0,C.jsx)("p",{className:"xray-muted",children:"Where this request was initiated from on the page."}),(0,C.jsx)("ol",{className:"xray-initiator-list",children:a.map((o,r)=>{let n=uA(o);return(0,C.jsxs)("li",{className:"xray-initiator-frame",children:[(0,C.jsx)("span",{className:"xray-initiator-fn",children:n.fn}),n.location&&(0,C.jsx)("code",{className:"xray-initiator-loc",title:n.location,children:n.location}),(0,C.jsx)("button",{className:"xray-icon-btn","aria-label":"Copy stack frame",onClick:()=>{ct(o),t("Frame copied.")},children:(0,C.jsx)(ut,{size:13,stroke:2})})]},r)})})]}):(0,C.jsx)(Je,{label:"No initiator captured"})}function pA({jwts:e}){return e.length?(0,C.jsx)("div",{className:"xray-tokens",children:e.map((t,a)=>(0,C.jsxs)("div",{className:"xray-card xray-token-card",children:[(0,C.jsxs)("div",{className:"xray-token-head",children:[(0,C.jsxs)("span",{className:"xray-token-source",children:[(0,C.jsx)(Ip,{...Oe}),Wk(t.source)]}),t.expiresAt&&(0,C.jsxs)("span",{className:`xray-token-exp ${t.expired?"expired":"valid"}`,children:[t.expired?"Expired":"Valid"," \xB7 exp ",t.expiresAt]})]}),(0,C.jsxs)("div",{className:"xray-token-body",children:[(0,C.jsxs)("div",{children:[(0,C.jsx)("span",{className:"xray-token-label",children:"Header"}),(0,C.jsx)(jt,{value:t.header})]}),(0,C.jsxs)("div",{children:[(0,C.jsx)("span",{className:"xray-token-label",children:"Payload"}),(0,C.jsx)(jt,{value:t.payload})]})]})]},a))}):(0,C.jsx)(Je,{label:"No JWT tokens found"})}var Ue,C,Oe,Qk,Kk,Zk,mA,Xp=T(()=>{"use strict";Ue=_(ze());qe();fs();$e();H0();q0();Gt();j0();K0();Ae();cs();C=_(j()),Oe={size:16,stroke:1.8},Qk=[{id:"response",label:"Preview"},{id:"headers",label:"Headers"},{id:"cookies",label:"Cookies"},{id:"frames",label:"Frames"},{id:"initiator",label:"Initiator"},{id:"tokens",label:"Tokens"},{id:"timeline",label:"Timeline"}],Kk={tree:"Tree",raw:"Raw",grid:"Table",schema:"Schema",diff:"Diff",viz:"Visualize",waterfall:"Waterfall",headers:"Headers"},Zk=[{label:"Inspect",ids:["inspect-error","schema","table","visualize","headers","waterfall","request"]},{label:"Transform",ids:["compare-previous","diff","mock","related-errors","similar-calls","slow-calls"]},{label:"Copy",ids:["copy-curl","copy-fetch","copy-full"]},{label:"Send",ids:["send-console","save-snippet","export"]}];mA=Ue.default.memo(function({current:t,previous:a,baselineId:o,baselineIsDrift:r}){let n=I(s=>s.selectEntry),l=Ue.default.useMemo(()=>a==null?[]:z0(a,t),[a,t]);return a==null?(0,C.jsx)(Je,{label:"No previous matching response",hint:"A second call to this endpoint (or a recorded drift baseline) is needed to diff against."}):(0,C.jsxs)("div",{className:"xray-diff",children:[(0,C.jsxs)("div",{className:"xray-diff-head",children:[(0,C.jsx)("span",{className:"xray-muted",children:l.length?`${l.length} difference${l.length===1?"":"s"} vs ${r?"the drift baseline":"the previous call"}`:"No structural differences"}),o&&(0,C.jsx)("button",{className:"xray-chip",onClick:()=>n(o),children:"Jump to baseline"})]}),l.length>0&&(0,C.jsx)("div",{className:"xray-diff-lines",children:l.map((s,i)=>(0,C.jsxs)("div",{className:`xray-diff-line ${s.kind}`,children:[(0,C.jsx)("span",{className:"xray-diff-kind",children:s.kind==="added"?"+":s.kind==="removed"?"\u2212":"\xB1"}),(0,C.jsx)("code",{className:"xray-diff-path",children:s.path||"(root)"}),s.kind!=="added"&&(0,C.jsx)("code",{className:"xray-diff-before",children:ia(s.before,90)}),s.kind!=="removed"&&(0,C.jsx)("code",{className:"xray-diff-after",children:ia(s.after,90)})]},i))})]})})});function xA(e){if(!e||typeof e!="object")return null;let t=e.__xray_ref__;return typeof t=="string"?t:null}function Gp(e){return xA(e)?!0:Array.isArray(e)?e.some(Gp):!1}function rv(){let e=window;return typeof e.__XRAY_fetchLogObject__=="function"||typeof e.__XRAY_getLogObject__=="function"}async function nv(e){let t=window;try{if(typeof t.__XRAY_fetchLogObject__=="function")return await t.__XRAY_fetchLogObject__(e);if(typeof t.__XRAY_getLogObject__=="function")return t.__XRAY_getLogObject__(e)}catch{return null}return null}var lv=T(()=>{"use strict"});function ds({entry:e}){let t=e.logData!==void 0?e.logData:e.args??e.message??null,a=Array.isArray(e.objectRefs)?e.objectRefs.filter(d=>typeof d=="string"):[],o=(a.length>0||Gp(t))&&rv(),[r,n]=Bf.default.useState(void 0),[l,s]=Bf.default.useState(!1);Bf.default.useEffect(()=>{n(void 0),s(!1)},[e.id]);async function i(){s(!0);let d=await Promise.all(a.map(x=>nv(x)));s(!1),n(d.length===1?d[0]:d)}let f=e.logLevel||"log";return(0,vt.jsxs)("div",{className:"xray-log-detail",children:[(0,vt.jsxs)("div",{className:"xray-log-detail-head",children:[(0,vt.jsxs)("span",{className:`xray-log-level ${f}`,children:[(0,vt.jsx)(rt,{...sv}),f]}),(0,vt.jsx)("span",{className:"xray-muted",children:Ra(e.timestamp)}),o&&(0,vt.jsxs)("button",{className:"xray-btn xray-log-load",disabled:l,onClick:()=>{i()},children:[(0,vt.jsx)(cp,{...sv}),l?"Loading\u2026":r===void 0?"Load full object":"Reload"]})]}),e.message&&typeof e.message=="string"&&(0,vt.jsx)("div",{className:"xray-log-message",children:ia(e.message,400)}),(0,vt.jsx)("div",{className:"xray-log-detail-body",children:r!==void 0?(0,vt.jsx)(jt,{value:r}):t==null?(0,vt.jsx)(Je,{label:"No log payload"}):(0,vt.jsx)(jt,{value:t})}),o&&r===void 0&&(0,vt.jsx)("p",{className:"xray-muted xray-log-hint",children:"This is a lightweight preview. Load the full object to inspect deep or truncated values."})]})}var Bf,vt,sv,jp=T(()=>{"use strict";Bf=_(ze());qe();cs();fs();Ae();lv();vt=_(j()),sv={size:16,stroke:1.8}});function fv(e){let t=I(p=>p.entries),a=I(p=>p.apiSearchQuery.trim()),o=I(p=>p.statusFilters),r=I(p=>p.typeFilters),n=I(p=>p.methodFilters),l=I(p=>p.expandedGroups),s=I(p=>p.pinnedIds),i=I(p=>p.sortField),f=I(p=>p.sortOrder),d=I(p=>p.apiQuickFilter),x=I(p=>p.apiGroupingMode),u=I(p=>p.settings.slowThresholdMs);return(0,ge.useMemo)(()=>LI({mode:e,entries:t,query:a,statusFilters:o,typeFilters:r,methodFilters:n,expandedGroups:l,pinnedIds:s,sortField:i,sortOrder:f,slowThresholdMs:u,apiQuickFilter:d,apiGroupingMode:x}),[x,d,t,l,n,e,s,a,u,i,f,o,r])}function Vp({mode:e}){return e==="api"?(0,A.jsx)(bA,{}):(0,A.jsx)(vA,{})}function bA(){let e=I(L=>L.entries),t=I(L=>L.selectedId),a=I(L=>L.apiDetailOpen),o=I(L=>L.selectEntry),r=I(L=>L.setApiDetailOpen),n=I(L=>L.togglePinned),l=I(L=>L.toggleGroup),s=I(L=>L.pinnedIds),i=I(L=>L.settings.compactRows),f=I(L=>L.settings.slowThresholdMs),d=I(L=>L.settings.showHostInPath),x=I(L=>L.sortField),u=I(L=>L.sortOrder),p=I(L=>L.settings.apiSplit),v=I(L=>L.updateSettings),w=fv("api"),E=t&&e.find(L=>L.id===t&&L.type==="api")||null,y=(0,ge.useMemo)(()=>Math.max(100,...e.filter(Pe).map(L=>ie(L))),[e]),c=(0,ge.useMemo)(()=>DI(e,s,f),[e,s,f]),m=(0,ge.useRef)(null),g=(0,ge.useCallback)(L=>w[L]?.key||L,[w]),k=(0,ge.useCallback)(()=>i?42:68,[i]),N=Bn({count:w.length,getScrollElement:()=>m.current,estimateSize:k,getItemKey:g,overscan:14}),b=x==="timestamp"&&u==="desc",D=(0,ge.useRef)(!1),[S,P]=(0,ge.useState)(0),le=(0,ge.useRef)(0);(0,ge.useEffect)(()=>{let L=c.total,B=L-le.current;le.current=L,B>0&&b&&D.current&&P(de=>de+B)},[c.total,b]);let dt=(0,ge.useCallback)(()=>{let L=m.current;if(!L)return;let B=L.scrollTop>120;D.current=B,B||P(0)},[]),pt=(0,ge.useCallback)(()=>{P(0),D.current=!1;let L=m.current;L&&(L.scrollTop=0)},[]),lo=(0,ge.useCallback)(L=>{o(L.id),r(!0)},[o,r]),Qo=(0,ge.useCallback)(L=>{L&&l(L)},[l]),ha=(0,ge.useCallback)(L=>n(L),[n]),O=_p({stored:p,varName:"--xray-api-split",minList:260,minRest:340}),K=10;function Le(L){if(!["ArrowDown","ArrowUp","Home","End","PageDown","PageUp"].includes(L.key)&&L.key!=="Enter"&&L.key!==" "||!w.length)return;let gt=w.findIndex(Ta=>Ta.entry.id===t);if(L.key==="Enter"||L.key===" "){gt>=0&&(r(!0),L.preventDefault());return}L.preventDefault();let so=w.length-1,z;if(L.key==="Home")z=0;else if(L.key==="End")z=so;else{let Ta=L.key==="ArrowDown"?1:L.key==="ArrowUp"?-1:L.key==="PageDown"?K:-K;z=gt<0?Ta>0?0:so:Math.min(so,Math.max(0,gt+Ta))}let Re=w[z];Re&&(o(Re.entry.id,{openDetail:!1}),N.scrollToIndex(z,{align:"auto"}))}return(0,A.jsx)("section",{className:`xray-api-workspace ${E&&a?"detail-open":""}`,children:(0,A.jsxs)("div",{className:"xray-api-body",style:O.splitStyle,ref:O.containerRef,children:[(0,A.jsxs)("div",{className:"xray-api-collection-pane",ref:O.paneRef,children:[(0,A.jsx)(Pp,{label:"Resize request list",value:O.value,min:O.min,max:O.max,onLiveChange:O.setLive,onCommit:L=>{O.setLive(null),v({apiSplit:L})},onReset:()=>{O.setLive(null),v({apiSplit:0})}}),(0,A.jsx)(SA,{summary:c,visibleCount:w.length}),(0,A.jsx)(wA,{summary:c}),(0,A.jsxs)("div",{className:"xray-api-main",children:[(0,A.jsx)(CA,{}),(0,A.jsxs)("div",{className:"xray-api-table-scroll",ref:m,tabIndex:0,role:"listbox","aria-label":"Captured requests",onKeyDown:Le,onScroll:dt,children:[(0,A.jsx)("div",{style:{height:N.getTotalSize(),position:"relative"},children:N.getVirtualItems().map(L=>{let B=w[L.index],de=B.entry;return(0,A.jsx)("div",{"data-index":L.index,ref:N.measureElement,style:{position:"absolute",top:0,left:0,width:"100%",transform:`translateY(${L.start}px)`},children:(0,A.jsx)(AA,{row:B,entries:e,maxDuration:y,selected:t===de.id,pinned:s.has(de.id),slowThresholdMs:f,showHostInPath:d,onSelect:lo,onToggleGroup:Qo,onTogglePinned:ha})},L.key)})}),!w.length&&(0,A.jsx)(Je,{label:"No API requests yet",hint:"Browse the page or trigger a call \u2014 fetch, XHR, GraphQL, and WebSocket traffic streams in here live. Press Ctrl/\u2318+K to jump anywhere."})]}),S>0&&(0,A.jsxs)("button",{className:"xray-newmsg-pill xray-newreq-pill",onClick:pt,children:[(0,A.jsx)(Mf,{size:14,stroke:2}),S," new"]})]})]}),(0,A.jsx)(MA,{entry:E}),(0,A.jsx)(FA,{entry:E&&a?E:null,onClose:()=>r(!1)})]})})}function vA(){let e=I(u=>u.entries),t=I(u=>u.selectedId),a=I(u=>u.selectEntry),o=I(u=>u.togglePinned),r=I(u=>u.pinnedIds),n=I(u=>u.settings.logsSplit),l=I(u=>u.updateSettings),s=_p({stored:n,varName:"--xray-logs-split",minList:240,minRest:300}),i=fv("logs"),f=t&&e.find(u=>u.id===t)||null,d=(0,ge.useRef)(null),x=Bn({count:i.length,getScrollElement:()=>d.current,estimateSize:()=>46,getItemKey:u=>i[u]?.key||u,measureElement:u=>u.getBoundingClientRect().height,overscan:10});return(0,A.jsxs)("section",{className:"xray-split",style:s.splitStyle,ref:s.containerRef,children:[(0,A.jsxs)("div",{className:"xray-list-panel",ref:s.paneRef,children:[(0,A.jsx)(Pp,{label:"Resize log list",value:s.value,min:s.min,max:s.max,onLiveChange:s.setLive,onCommit:u=>{s.setLive(null),l({logsSplit:u})},onReset:()=>{s.setLive(null),l({logsSplit:0})}}),(0,A.jsx)(BA,{mode:"logs"}),(0,A.jsxs)("div",{className:"xray-virtual-list",ref:d,children:[(0,A.jsx)("div",{style:{height:x.getTotalSize(),position:"relative"},children:x.getVirtualItems().map(u=>{let p=i[u.index];return(0,A.jsx)("div",{"data-index":u.index,ref:x.measureElement,style:{position:"absolute",top:0,left:0,width:"100%",transform:`translateY(${u.start}px)`},children:(0,A.jsx)(DA,{row:p,selected:t===p.entry.id,pinned:r.has(p.entry.id),onSelect:()=>a(p.entry.id),onTogglePinned:()=>o(p.entry.id)})},u.key)})}),!i.length&&(0,A.jsx)(Je,{label:"No logs captured",hint:"Page console.log output and captured objects land here \u2014 trigger some activity on the page to populate the list."})]}),(0,A.jsx)(NA,{entry:f})]}),(0,A.jsx)("div",{className:"xray-detail-panel",children:f?(0,A.jsx)(ds,{entry:f}):(0,A.jsx)(Je,{label:"Select an entry",hint:"Pick a log on the left to inspect its arguments and expand nested objects."})})]})}function SA({summary:e,visibleCount:t}){return(0,A.jsxs)("div",{className:"xray-api-collection-head",children:[(0,A.jsxs)("div",{className:"xray-api-collection-title",children:[(0,A.jsx)("span",{children:"Captured Requests"}),(0,A.jsxs)("strong",{children:[e.total," APIs"]})]}),(0,A.jsxs)("div",{className:"xray-api-env-pill",title:"Environment inferred from captured browser traffic",children:[(0,A.jsx)(zp,{...xt}),(0,A.jsx)("span",{children:"Live page"})]}),(0,A.jsx)(Xo,{id:"api-stats",title:"Summary",className:"xray-api-stats-collapsible",children:(0,A.jsxs)("div",{className:"xray-api-summary-strip","aria-label":"Captured request summary",children:[(0,A.jsx)(Of,{tone:"ok",icon:(0,A.jsx)(qo,{...xt}),label:"Visible",value:String(t)}),(0,A.jsx)(Of,{tone:e.errors?"error":"ok",icon:(0,A.jsx)(is,{...xt}),label:"Errors",value:String(e.errors)}),(0,A.jsx)(Of,{tone:e.slow?"warn":"ok",icon:(0,A.jsx)(rs,{...xt}),label:"Avg",value:`${Math.round(e.avgDuration)}ms`}),(0,A.jsx)(Of,{tone:"info",icon:(0,A.jsx)(qo,{...xt}),label:"Bytes",value:Tt(e.totalBytes)})]})})]})}function Of({icon:e,label:t,value:a,tone:o}){return(0,A.jsxs)("span",{className:`xray-api-summary-pill ${o}`,children:[e,(0,A.jsx)("span",{children:t}),(0,A.jsx)("strong",{children:a})]})}function wA({summary:e}){let t=I(b=>b.apiSearchQuery),a=I(b=>b.setApiSearchQuery),o=I(b=>b.apiQuickFilter),r=I(b=>b.setApiQuickFilter),n=I(b=>b.apiGroupingMode),l=I(b=>b.setApiGroupingMode),s=I(b=>b.statusFilters),i=I(b=>b.typeFilters),f=I(b=>b.methodFilters),d=I(b=>b.toggleMethodFilter),x=I(b=>b.toggleStatusFilter),u=I(b=>b.toggleTypeFilter),p=I(b=>b.clearApiFilters),v=I(b=>b.setSort),w=I(b=>b.sortField),E=I(b=>b.sortOrder),y=I(b=>b.entries),c=(0,ge.useMemo)(()=>y.reduce((b,D)=>b+(D.driftFromId?1:0),0),[y]),m=b=>r(o===b?"all":b),g=b=>b==="errors"?e.errors:b==="slow"?e.slow:b==="pinned"?e.pinned:b==="repeated"?e.repeatedEndpoints:b==="drift"?c:null,k=b=>{let D=g(b.id);return(0,A.jsxs)("button",{className:`xray-chip ${o===b.id?"active":""}`,onClick:()=>m(b.id),"aria-pressed":o===b.id,children:[b.label,D!=null&&D>0&&(0,A.jsx)("span",{className:"xray-chip-count",children:D})]},b.id)},N=f.size+i.size+s.size+(o!=="all"?1:0);return(0,A.jsxs)("div",{className:"xray-api-toolbar",children:[(0,A.jsxs)("label",{className:"xray-search xray-api-search",children:[(0,A.jsx)(ot,{...xt}),(0,A.jsx)("input",{className:"xray-input",value:t,onChange:b=>a(b.currentTarget.value),placeholder:"Filter method, status, path, domain, source, content type..."})]}),(0,A.jsxs)(Xo,{id:"api-filters",title:"Filters & Sort",className:"xray-api-filters-collapsible",right:N>0?(0,A.jsx)("span",{className:"xray-chip-count",children:N}):void 0,children:[(0,A.jsxs)("div",{className:"xray-filter-chips xray-api-primary-filters","aria-label":"Primary API filters",children:[(0,A.jsx)("button",{className:`xray-chip ${o==="all"&&!f.size&&!i.size&&!s.size?"active":""}`,onClick:p,children:"All"}),["GET","POST"].map(b=>(0,A.jsx)("button",{className:`xray-chip ${f.has(b)?"active":""}`,onClick:()=>d(b),children:b},b)),["xhr","fetch"].map(b=>(0,A.jsx)("button",{className:`xray-chip ${i.has(b)?"active":""}`,onClick:()=>u(b),children:b==="xhr"?"XHR":"Fetch"},b)),yA.map(k)]}),(0,A.jsxs)("div",{className:"xray-api-secondary-controls",children:[(0,A.jsxs)("div",{className:"xray-filter-chips compact","aria-label":"Status and source filters",children:[(0,A.jsxs)("span",{className:"xray-filter-label",children:[(0,A.jsx)(ls,{...xt}),"Match"]}),["2xx","3xx","4xx","5xx"].map(b=>(0,A.jsx)("button",{className:`xray-chip ${s.has(b)?"active":""}`,onClick:()=>x(b),children:b},b)),gA.map(k)]}),(0,A.jsxs)("div",{className:"xray-filter-chips compact","aria-label":"API sort and grouping",children:[(0,A.jsx)("span",{className:"xray-filter-label",children:"Sort"}),hA.map(b=>(0,A.jsxs)("button",{className:`xray-chip ${w===b.id?"active":""}`,onClick:()=>v(b.id),"aria-pressed":w===b.id,children:[b.label,w===b.id&&(E==="asc"?(0,A.jsx)(Mf,{size:13,stroke:2.2}):(0,A.jsx)(Ln,{size:13,stroke:2.2}))]},b.id)),["flat","endpoint"].map(b=>(0,A.jsx)("button",{className:`xray-chip ${n===b?"active":""}`,onClick:()=>l(b),children:b==="flat"?"Flat":"Endpoint Groups"},b)),(0,A.jsxs)("button",{className:"xray-chip",onClick:p,children:[(0,A.jsx)(Cr,{...xt}),"Reset"]})]})]})]})]})}function CA(){return(0,A.jsxs)("div",{className:"xray-api-table-head",role:"row",children:[(0,A.jsx)("span",{children:"Method"}),(0,A.jsx)("span",{children:"Request"}),(0,A.jsx)("span",{children:"Status"}),(0,A.jsx)("span",{children:"Timing"}),(0,A.jsx)("span",{className:"xray-api-table-tools",children:(0,A.jsx)(kA,{})})]})}function kA(){let e=I(a=>a.settings.compactRows),t=I(a=>a.updateSettings);return(0,A.jsx)("button",{className:"xray-icon-btn xray-density-toggle","aria-pressed":e,title:e?"Switch to expanded (two-line) rows":"Switch to compact (single-line) rows",onClick:()=>t({compactRows:!e}),children:e?(0,A.jsx)(Sp,{...xt}):(0,A.jsx)(vp,{...xt})})}function RA({flags:e}){if(!e.length)return(0,A.jsx)("span",{className:"xray-api-flags muted",children:"None"});let t=e.slice(0,3);return(0,A.jsxs)("span",{className:"xray-api-flags",title:e.map(a=>iv[a]).join(", "),children:[t.map(a=>(0,A.jsx)("span",{className:`xray-api-flag ${a}`,children:iv[a]},a)),e.length>t.length&&(0,A.jsxs)("span",{className:"xray-api-flag more",children:["+",e.length-t.length]})]})}function TA(e){let t=String(e.url||"");if(!t)return{};try{return Object.fromEntries(new URL(t).searchParams.entries())}catch{return{}}}function EA(e,t,a){return t==="params"?a:t==="headers"?e.requestHeaders||{}:t==="body"?sa(e):t==="timeline"?{startedAt:Ra(e.timestamp),durationMs:Math.round(ie(e)),status:e.status||null,source:e.source||"fetch",size:Number(e.size)||0}:{method:String(e.method||"GET").toUpperCase(),url:e.url||e.urlPath||"",path:ne(e),source:e.source||"fetch",status:e.status||null,contentType:zo(e)||null}}function FA({entry:e,onClose:t}){return(0,A.jsx)("aside",{className:`xray-api-detail-drawer ${e?"":"empty"}`,"aria-label":"Selected API request detail",children:(0,A.jsx)("div",{className:"xray-api-drawer-body",children:e?(0,A.jsx)(us,{entry:e,onClose:t}):(0,A.jsx)(Je,{label:"Nothing selected",hint:"Choose a request to open the detail drawer \u2014 preview, schema, diff, replay, and more."})})})}function DA({row:e,selected:t,pinned:a,onSelect:o,onTogglePinned:r}){let n=e.entry,l=Number(n.status)||0;return(0,A.jsxs)("button",{className:`xray-entry-row ${t?"selected":""} ${a?"pinned":""}`,onClick:o,children:[(0,A.jsx)("span",{className:`xray-status-dot ${Xt(l)}`}),(0,A.jsx)("span",{className:`xray-method ${fa(n.method)}`,children:n.logLevel||"log"}),(0,A.jsx)("span",{className:`xray-status ${Xt(l)}`,children:Ra(n.timestamp)}),(0,A.jsx)("span",{className:"xray-entry-main",children:(0,A.jsx)("span",{className:"xray-path",children:ia(n.message??n.logData,160)})}),(0,A.jsx)("span",{className:`xray-pin ${a?"active":""}`,onClick:s=>{s.stopPropagation(),r()},children:(0,A.jsx)(Ff,{...xt})})]})}function NA({entry:e}){return e?(0,A.jsx)("div",{className:"xray-mobile-detail-panel",children:e.type==="log"?(0,A.jsx)(ds,{entry:e}):(0,A.jsx)(us,{entry:e})}):null}function BA({mode:e}){let t=I(o=>o.apiSearchQuery),a=I(o=>o.setApiSearchQuery);return(0,A.jsx)("div",{className:"xray-list-controls",children:(0,A.jsxs)("label",{className:"xray-search",children:[(0,A.jsx)(ot,{...xt}),(0,A.jsx)("input",{className:"xray-input",value:t,onChange:o=>a(o.currentTarget.value),placeholder:e==="api"?"Search path, method, status...":"Search logs..."})]})})}var ge,A,xt,yA,gA,hA,iv,IA,AA,MA,cv=T(()=>{"use strict";ge=_(ze());Jd();qe();Hp();fs();N0();Xp();jp();cs();$e();Gt();Ae();A=_(j()),xt={size:16,stroke:1.8},yA=[{id:"errors",label:"Errors"},{id:"slow",label:"Slow"}],gA=[{id:"repeated",label:"Repeated"},{id:"pinned",label:"Pinned"},{id:"large",label:"Large"},{id:"empty",label:"Empty"},{id:"drift",label:"Drift"},{id:"graphql",label:"GraphQL"},{id:"ws",label:"Streams"},{id:"mocked",label:"Mocked"},{id:"replayed",label:"Replays"}],hA=[{id:"timestamp",label:"Latest"},{id:"duration",label:"Slowest"},{id:"status",label:"Status"},{id:"size",label:"Size"}],iv={error:"Error",slow:"Slow",repeated:"Repeated",large:"Large",empty:"Empty",pinned:"Pinned",drift:"Drift",graphql:"GraphQL",ws:"Stream",mocked:"Mocked",replayed:"Replay"},IA=[{id:"request",label:"Request"},{id:"params",label:"Params"},{id:"headers",label:"Headers"},{id:"body",label:"Body"},{id:"timeline",label:"Timeline"}];AA=ge.default.memo(function({row:t,entries:a,maxDuration:o,selected:r,pinned:n,slowThresholdMs:l,showHostInPath:s,onSelect:i,onToggleGroup:f,onTogglePinned:d}){let x=t.entry,u=Number(x.status)||0,p=ne(x),v=$l(x),w=yf(x)||"local",E=String(x.source||"fetch").toLowerCase(),y=t.groupStats||gf(x,a),c=t.groupStats?.totalBytes??x.size,m=t.flags,g=Math.max(8,Math.min(100,ie(x)/o*100)),k=!!(t.groupCount&&t.groupCount>1&&!t.groupChild),N=zo(x)||"response";function b(S){(S.key==="Enter"||S.key===" ")&&(S.preventDefault(),i(x))}async function D(S){S.stopPropagation(),await ct(String(x.url||p))}return(0,A.jsxs)("div",{className:`xray-api-row ${r?"selected":""} ${t.groupChild?"child":""} ${n?"pinned":""} ${k?"group":""} ${u>=400?"has-error":""} ${ie(x)>=l?"has-slow":""}`,role:"option","aria-selected":r,tabIndex:r?0:-1,onClick:()=>i(x),onKeyDown:b,children:[(0,A.jsx)("span",{className:`xray-method ${fa(x.method)}`,children:String(x.method||"GET").toUpperCase().replace("DELETE","DEL")}),(0,A.jsxs)("span",{className:"xray-api-path-cell",children:[(0,A.jsx)("span",{className:"xray-path",title:String(x.url||p),children:v}),(0,A.jsx)("span",{className:"xray-entry-meta",children:k?`${y.count} calls - ${y.errors} errors - avg ${Math.round(y.avgDuration)}ms`:`${s?w:N} - ${E.toUpperCase()} - ${Tt(c)} - ${Ra(x.timestamp)}`}),(0,A.jsx)(RA,{flags:m})]}),(0,A.jsx)("span",{className:`xray-status ${Xt(u)}`,children:x.status||"---"}),(0,A.jsxs)("span",{className:"xray-entry-duration",children:[(0,A.jsx)("span",{className:"xray-bar-track",children:(0,A.jsx)("span",{className:`xray-bar ${ie(x)>=l?"slow":""} ${u>=400?"error":""}`,style:{width:`${g}%`}})}),(0,A.jsxs)("span",{children:[Math.round(ie(x)),"ms"]})]}),(0,A.jsxs)("span",{className:"xray-api-row-actions",children:[t.groupCount&&t.groupCount>1&&(0,A.jsx)("button",{className:"xray-icon-btn",tabIndex:-1,"aria-label":t.groupExpanded?"Collapse endpoint group":"Expand endpoint group",onClick:S=>{S.stopPropagation(),f(t.groupKey)},children:t.groupExpanded?(0,A.jsx)($a,{...xt}):(0,A.jsx)(Hn,{...xt})}),(0,A.jsx)("button",{className:"xray-icon-btn",tabIndex:-1,"aria-label":"Copy request URL",onClick:S=>{D(S)},children:(0,A.jsx)(ut,{...xt})}),(0,A.jsx)("button",{className:`xray-icon-btn ${n?"active":""}`,tabIndex:-1,"aria-label":n?"Unpin request":"Pin request",onClick:S=>{S.stopPropagation(),d(x.id)},children:(0,A.jsx)(Ff,{...xt})})]})]})});MA=ge.default.memo(function({entry:t}){let[a,o]=ge.default.useState("request"),r=(0,ge.useMemo)(()=>t?TA(t):{},[t]),n=(0,ge.useMemo)(()=>t?EA(t,a,r):null,[t,a,r]);if(!t)return(0,A.jsx)("aside",{className:"xray-request-context-pane empty","aria-label":"Selected request context",children:(0,A.jsx)(Je,{label:"Select a request",hint:"Pick a request from the list to inspect its response, headers, timing, and smart operations."})});let l=Number(t.status)||0,s=ne(t),i=yf(t)||"local";return(0,A.jsxs)("aside",{className:"xray-request-context-pane","aria-label":"Selected request context",children:[(0,A.jsxs)("div",{className:"xray-request-context-head",children:[(0,A.jsx)("span",{className:"xray-pane-kicker",children:"Request Context"}),(0,A.jsxs)("div",{className:"xray-request-line",children:[(0,A.jsx)("span",{className:`xray-method ${fa(t.method)}`,children:String(t.method||"GET").toUpperCase()}),(0,A.jsx)("code",{title:String(t.url||s),children:s})]}),(0,A.jsxs)("div",{className:"xray-request-meta-grid",children:[(0,A.jsxs)("span",{children:[(0,A.jsx)("strong",{children:"Host"}),i]}),(0,A.jsxs)("span",{children:[(0,A.jsx)("strong",{children:"Status"}),(0,A.jsx)("b",{className:`xray-status ${Xt(l)}`,children:t.status||"---"})]}),(0,A.jsxs)("span",{children:[(0,A.jsx)("strong",{children:"Time"}),Math.round(ie(t)),"ms"]}),(0,A.jsxs)("span",{children:[(0,A.jsx)("strong",{children:"Size"}),Tt(t.size)]})]})]}),(0,A.jsx)("div",{className:"xray-detail-tabs xray-request-tabs","aria-label":"Request tabs",children:IA.map(f=>(0,A.jsx)("button",{className:`xray-detail-tab ${a===f.id?"active":""}`,onClick:()=>o(f.id),children:f.label},f.id))}),(0,A.jsx)("div",{className:"xray-request-context-content",children:(0,A.jsx)(jt,{value:n})}),(0,A.jsxs)("div",{className:"xray-request-context-footer",children:[(0,A.jsx)("span",{children:String(t.source||"fetch").toUpperCase()}),(0,A.jsx)("span",{children:zo(t)||"unknown content"})]})]})})});function Lf(e,t){return t==="all"?!0:t==="error"?e.level==="error"||e.type==="error":t==="warn"?e.level==="warn":t==="result"?e.type==="result"||e.type==="command":e.type==="log"&&e.level!=="warn"&&e.level!=="error"}function HA(){let e=I(o=>o.consoleEvents),t=I(o=>o.networkFilter),a=I(o=>o.searchQuery.trim().toLowerCase());return(0,q.useMemo)(()=>e.filter(o=>{if(o.type!=="network")return!1;let r=tf(o);if(!r)return!1;let n=String(r.source||"").toLowerCase(),l=Number(r.status)||0;return t==="errors"&&l<400||t!=="all"&&t!=="errors"&&n!==t?!1:a?String(r.method||"").toLowerCase().includes(a)||String(r.status||"").includes(a)||ne(r).toLowerCase().includes(a)||n.includes(a):!0}),[e,t,a])}function uv(){let e=I(t=>t.consoleEvents);return(0,q.useMemo)(()=>e.filter(t=>t.type!=="network"),[e])}function dv(){let e=I(c=>c.consoleMiniTab),t=I(c=>c.setConsoleMiniTab),a=I(c=>c.recording),o=I(c=>c.pausedCount),r=I(c=>c.setRecording),n=I(c=>c.clearConsole),l=I(c=>c.requestConfirmation),s=I(c=>c.setExportOpen),i=I(c=>c.searchQuery),f=I(c=>c.setSearchQuery),d=I(c=>c.networkFilter),x=I(c=>c.setNetworkFilter),[u,p]=(0,q.useState)("all"),[v,w]=(0,q.useState)(""),E=uv(),y=(0,q.useMemo)(()=>{let c={all:E.length,log:0,warn:0,error:0,result:0};for(let m of E)Lf(m,"error")?c.error+=1:Lf(m,"warn")?c.warn+=1:Lf(m,"result")?c.result+=1:c.log+=1;return c},[E]);return(0,M.jsxs)(M.Fragment,{children:[(0,M.jsxs)("section",{className:"xray-console-head",children:[(0,M.jsx)("div",{className:"xray-console-tabs",children:LA.map(c=>(0,M.jsxs)("button",{className:`xray-mini-tab ${e===c.id?"active":""}`,onClick:()=>t(c.id),children:[c.icon,(0,M.jsx)("span",{children:c.label})]},c.id))}),(0,M.jsxs)("div",{className:"xray-toolbar",children:[(0,M.jsxs)("button",{className:"xray-btn",onClick:()=>l({title:"Clear console stream?",message:"This clears the React console stream only. Captured API entries remain available.",confirmLabel:"Clear console",tone:"danger",onConfirm:n}),children:[(0,M.jsx)(Uo,{...Fe}),"Clear"]}),(0,M.jsxs)("button",{className:`xray-btn ${a?"xray-live":"xray-paused"}`,title:"Pause the live console stream. Messages keep buffering and flush back in when you resume; capture itself is toggled in Settings \u2192 Capture.","aria-pressed":a,onClick:()=>r(!a),children:[(0,M.jsx)(Ep,{...Fe}),a?"Live":o>0?`Paused \xB7 ${o} new`:"Paused"]}),(0,M.jsxs)("button",{className:"xray-btn",onClick:()=>s(!0),children:[(0,M.jsx)(Ft,{...Fe}),"Export"]})]})]}),e==="network"&&(0,M.jsxs)("section",{className:"xray-filterbar",children:[(0,M.jsxs)("label",{className:"xray-search",children:[(0,M.jsx)(ot,{...Fe}),(0,M.jsx)("input",{className:"xray-input",placeholder:"Filter by path, method, status...",value:i,onChange:c=>f(c.currentTarget.value)})]}),(0,M.jsx)("div",{className:"xray-filter-chips",children:OA.map(c=>(0,M.jsxs)("button",{className:`xray-chip ${d===c.id?"active":""}`,onClick:()=>x(c.id),children:[c.icon,c.label]},c.id))})]}),e==="console"&&(0,M.jsxs)("section",{className:"xray-filterbar",children:[(0,M.jsxs)("label",{className:"xray-search",children:[(0,M.jsx)(ot,{...Fe}),(0,M.jsx)("input",{className:"xray-input",placeholder:"Filter console messages...",value:v,onChange:c=>w(c.currentTarget.value)})]}),(0,M.jsx)("div",{className:"xray-filter-chips",children:zA.map(c=>(0,M.jsxs)("button",{className:`xray-chip ${u===c.id?"active":""}`,onClick:()=>p(c.id),children:[c.label,(0,M.jsx)("span",{className:"xray-chip-count",children:y[c.id]})]},c.id))})]}),e==="network"&&(0,M.jsx)(PA,{}),e==="console"&&(0,M.jsx)(YA,{levelFilter:u,query:v,onClearFilter:()=>{p("all"),w("")}}),(0,M.jsx)(_A,{}),(0,M.jsx)(KA,{}),(0,M.jsx)(ZA,{})]})}function _A(){let e=I(g=>g.snippets),t=I(g=>g.setConsoleDraft),a=I(g=>g.removeSnippet),o=I(g=>g.renameSnippet),r=I(g=>g.saveSnippet),n=I(g=>g.consoleDraft),[l,s]=(0,q.useState)(!1),[i,f]=(0,q.useState)(""),[d,x]=(0,q.useState)(null),[u,p]=(0,q.useState)(""),[v,w]=(0,q.useState)(null),E=(0,q.useRef)(void 0);function y(){r({code:n,title:i.trim()||void 0}),s(!1),f("")}function c(g){a(g.id),w(g),window.clearTimeout(E.current),E.current=window.setTimeout(()=>w(null),6e3)}function m(g){o(g,u),x(null)}return(0,M.jsxs)("div",{className:"xray-snippet-bar","aria-label":"Saved console snippets",children:[(0,M.jsxs)("span",{className:"xray-snippet-label",children:[(0,M.jsx)(Po,{...Fe}),"Snippets"]}),(0,M.jsxs)("div",{className:"xray-snippet-chips",children:[e.length===0&&!v&&(0,M.jsx)("span",{className:"xray-muted",children:"Save reusable commands here."}),e.map(g=>(0,M.jsxs)("span",{className:"xray-snippet-chip",children:[d===g.id?(0,M.jsx)("input",{className:"xray-input xray-snippet-rename",value:u,autoFocus:!0,placeholder:"Snippet name",onChange:k=>p(k.currentTarget.value),onKeyDown:k=>{k.key==="Enter"?m(g.id):k.key==="Escape"&&x(null)},onBlur:()=>m(g.id)}):(0,M.jsx)("button",{className:"xray-snippet-load",title:`${g.code}

Double-click to rename`,onClick:()=>t(g.code),onDoubleClick:()=>{x(g.id),p(g.title||"")},children:g.title||g.code}),(0,M.jsx)("button",{className:"xray-snippet-remove","aria-label":"Delete snippet",onClick:()=>c(g),children:(0,M.jsx)(to,{size:12,stroke:2})})]},g.id)),v&&(0,M.jsx)("button",{className:"xray-btn xray-snippet-undo",onClick:()=>{r({code:v.code,title:v.title}),w(null)},children:"Undo delete"})]}),l?(0,M.jsxs)("span",{className:"xray-snippet-chip xray-snippet-naming",children:[(0,M.jsx)("input",{className:"xray-input xray-snippet-rename",value:i,autoFocus:!0,placeholder:"Name (optional) \u2014 Enter to save",onChange:g=>f(g.currentTarget.value),onKeyDown:g=>{g.key==="Enter"?y():g.key==="Escape"&&(s(!1),f(""))}}),(0,M.jsx)("button",{className:"xray-btn",onClick:y,children:"Save"})]}):(0,M.jsxs)("button",{className:"xray-btn xray-snippet-save",disabled:!n.trim(),title:n.trim()?"Save current command as a snippet":"Type a command to save it",onClick:()=>s(!0),children:[(0,M.jsx)(rp,{...Fe}),"Save"]})]})}function PA(){let e=HA(),t=I(k=>k.networkFilter),a=I(k=>k.searchQuery),o=I(k=>k.setNetworkFilter),r=I(k=>k.setSearchQuery),n=t!=="all"||a.trim().length>0,l=(0,q.useRef)(null),s=(0,q.useRef)(!1),i=(0,q.useRef)(0),f=(0,q.useRef)(!1),d=(0,q.useRef)(0),x=(0,q.useRef)(`${t}\0${a}`),[u,p]=(0,q.useState)(!1),[v,w]=(0,q.useState)(0),E=(0,q.useMemo)(()=>{let k=1/0,N=-1/0;for(let b of e){let D=tf(b);if(!D)continue;let S=Number(D.timestamp)||0;k=Math.min(k,S),N=Math.max(N,S+ie(D))}return Number.isFinite(k)?{minStart:k,span:Math.max(1,N-k)}:{minStart:0,span:1}},[e]),y=Bn({count:e.length,getScrollElement:()=>l.current,estimateSize:k=>I.getState().expandedId===e[k]?.id?420:34,getItemKey:k=>e[k]?.id||k,measureElement:k=>k.getBoundingClientRect().height,overscan:8}),c=(0,q.useCallback)(()=>{e.length&&y.scrollToIndex(e.length-1,{align:"end"});let k=()=>{if(!s.current)return;let N=l.current;N&&(N.scrollTop=N.scrollHeight)};requestAnimationFrame(()=>{k(),requestAnimationFrame(k)}),window.clearTimeout(d.current),d.current=window.setTimeout(k,80)},[e.length,y]);(0,q.useEffect)(()=>()=>window.clearTimeout(d.current),[]);let m=(0,q.useCallback)(k=>{s.current=!1,p(!1),requestAnimationFrame(()=>y.scrollToIndex(k,{align:"start"}))},[y]);(0,q.useEffect)(()=>{let k=e.length,N=`${t} ${a}`;if(x.current!==N){x.current=N,i.current=k,w(0);return}let b=k-i.current;if(i.current=k,!f.current){f.current=!0;return}b>0&&(s.current?c():w(D=>D+b))},[e.length,t,a,c]);let g=(0,q.useCallback)(()=>{let k=l.current;if(!k)return;let N=k.scrollHeight-k.scrollTop-k.clientHeight<48;s.current=N,p(N),N&&w(0)},[]);return(0,q.useEffect)(()=>{g()},[g]),(0,M.jsxs)("section",{className:"xray-network",children:[(0,M.jsxs)("div",{className:"xray-network-head",children:[(0,M.jsx)("span",{children:"Status"}),(0,M.jsx)("span",{children:"Method"}),(0,M.jsx)("span",{children:"Name"}),(0,M.jsx)("span",{children:"Type"}),(0,M.jsx)("span",{children:"Size"}),(0,M.jsx)("span",{children:"Waterfall"})]}),(0,M.jsxs)("div",{className:"xray-virtual-list",ref:l,onScroll:g,children:[(0,M.jsx)("div",{style:{height:y.getTotalSize(),position:"relative"},children:y.getVirtualItems().map(k=>(0,M.jsx)("div",{"data-index":k.index,ref:y.measureElement,style:{position:"absolute",top:0,left:0,width:"100%",transform:`translateY(${k.start}px)`},children:(0,M.jsx)(XA,{event:e[k.index],waterfall:E,index:k.index,onExpand:m})},k.key))}),!e.length&&(0,M.jsx)(Je,{label:n?"No matching requests":"No network activity yet",hint:n?"Nothing matches the current filter and search.":"Trigger a request on the page \u2014 fetch, XHR, and WebSocket traffic streams in here live.",action:n?(0,M.jsx)("button",{className:"xray-btn",onClick:()=>{o("all"),r("")},children:"Clear filter"}):void 0})]}),!u&&v>0&&(0,M.jsxs)("button",{className:"xray-newmsg-pill",onClick:()=>{w(0),s.current=!0,p(!0),c()},children:[(0,M.jsx)(Ln,{size:14,stroke:2}),v," new"]})]})}function qA(e){let t=String(e.source||"fetch").toLowerCase();if(t==="ws")return"ws";if(t==="sse")return"eventsource";if(e.graphql)return"graphql";let a=zo(e).toLowerCase();return a.includes("json")?"json":a.includes("html")?"document":a.includes("javascript")?"script":a.includes("css")?"stylesheet":a.includes("image")?"img":t}function UA({entry:e}){let t=String(e.source||"").toLowerCase(),a=Number(e.status)||0;if(t==="ws"||t==="sse"){let o=e.wsState||(a===101?"open":"connecting");return(0,M.jsxs)("span",{className:`xray-status-chip stream ${o==="closed"||o==="error"?"closed":"open"}`,title:`${t.toUpperCase()} ${o}`,children:[(0,M.jsx)("span",{className:"xray-stream-dot"}),t.toUpperCase()]})}return(0,M.jsx)("span",{className:`xray-status-swatch ${Xt(a)}`,children:a||"\u2014"})}function GA(e){let t=r=>/\n\s*at\s/.test(r)||/^\w*Error\b/.test(r),a=r=>{if(!r||typeof r!="object")return null;let n=r;return n.__type__==="Error"||typeof n.stack=="string"&&typeof n.message=="string"&&"name"in n&&t(n.stack)?{name:String(n.name||"Error"),message:String(n.message||""),stack:String(n.stack||"")}:null},o=a(e.data)||(e.args||[]).map(a).find(Boolean)||null;if(o)return o;if(e.type==="error"&&e.data&&typeof e.data=="object"){let r=e.data;return{name:"Error",message:String(r.message||e.message||"Execution failed"),stack:String(r.stack||"")}}return null}function Yp(e){for(let t of e.stack.split(`
`)){let a=t.match(/((?:https?|chrome-extension|webpack|file|blob):[^)\s]+:\d+:\d+)/);if(a)return a[1]}return""}function jA(e){let t=e.split("?")[0],a=t.split("/").pop()||t,o=a.split(":"),r=o[0]||"(index)";return o.length>=2?`${r}:${o[1]}`:a}function VA({error:e}){let t=q.default.useMemo(()=>{let a=e.stack.split(`
`).map(r=>r.trim()).filter(Boolean),o=a[0]&&(a[0]===`${e.name}: ${e.message}`||a[0].startsWith(e.name))?1:0;return a.slice(o).map(r=>{let n=r.replace(/^at\s+/,"").match(/^(.*?)\s*\(?((?:https?|chrome-extension|webpack|file|blob):[^)\s]+|<anonymous>[^)]*)\)?$/);return n&&n[2]?{fn:n[1]||"(anonymous)",loc:n[2]}:{fn:r,loc:""}})},[e]);return t.length?(0,M.jsx)("ol",{className:"xray-error-frames",children:t.map((a,o)=>(0,M.jsxs)("li",{children:[(0,M.jsx)("span",{className:"xray-error-fn",children:a.fn}),a.loc&&(0,M.jsx)("code",{className:"xray-error-loc",title:a.loc,children:a.loc})]},o))}):(0,M.jsx)("p",{className:"xray-muted",children:"No stack trace available."})}function YA({levelFilter:e,query:t,onClearFilter:a}){let o=uv(),r=I(g=>g.expandedId),n=(0,q.useRef)(null),l=(0,q.useRef)(!0),s=(0,q.useRef)(0),i=(0,q.useRef)(0),f=(0,q.useRef)(`${e} ${t}`),[d,x]=(0,q.useState)(!0),[u,p]=(0,q.useState)(0),v=(0,q.useMemo)(()=>{let g=t.trim().toLowerCase();return o.filter(k=>Lf(k,e)&&(!g||k.message.toLowerCase().includes(g)))},[o,e,t]),w=(0,q.useMemo)(()=>{let g=[];for(let k of v){let N=g[g.length-1];if(N&&k.type==="log"&&N.event.type==="log"&&N.event.level===k.level&&N.event.message===k.message){N.count+=1;continue}g.push({event:k,count:1})}return g},[v]),E=Bn({count:w.length,getScrollElement:()=>n.current,estimateSize:g=>r===w[g]?.event.id?220:36,getItemKey:g=>w[g]?.event.id||g,measureElement:g=>g.getBoundingClientRect().height,overscan:10}),y=(0,q.useCallback)(()=>{w.length&&E.scrollToIndex(w.length-1,{align:"end"});let g=()=>{if(!l.current)return;let k=n.current;k&&(k.scrollTop=k.scrollHeight)};requestAnimationFrame(()=>{g(),requestAnimationFrame(g)}),window.clearTimeout(i.current),i.current=window.setTimeout(g,80)},[w.length,E]);(0,q.useEffect)(()=>()=>window.clearTimeout(i.current),[]),(0,q.useEffect)(()=>{let g=v.length,k=`${e} ${t}`;if(f.current!==k){f.current=k,s.current=g,p(0);return}let N=g-s.current;s.current=g,N>0&&(l.current?y():p(b=>b+N))},[v.length,e,t,y]);let c=(0,q.useCallback)(()=>{let g=n.current;if(!g)return;let k=g.scrollHeight-g.scrollTop-g.clientHeight<48;l.current=k,x(k),k&&p(0)},[]),m=e!=="all"||t.trim().length>0;return(0,M.jsxs)("section",{className:"xray-console-stream-wrap",children:[(0,M.jsxs)("div",{className:"xray-console-stream",ref:n,onScroll:c,children:[(0,M.jsx)("div",{style:{height:E.getTotalSize(),position:"relative"},children:E.getVirtualItems().map(g=>{let k=w[g.index];return k?(0,M.jsx)("div",{"data-index":g.index,ref:E.measureElement,style:{position:"absolute",top:0,left:0,width:"100%",transform:`translateY(${g.start}px)`},children:(0,M.jsx)(QA,{event:k.event,count:k.count})},g.key):null})}),!w.length&&(0,M.jsx)(Je,{label:m?"No matching messages":"No console messages",hint:m?"Nothing matches the current level filter and search.":"console.log / warn / error from the page appear here, alongside results from commands you run below.",action:m?(0,M.jsx)("button",{className:"xray-btn",onClick:a,children:"Clear filter"}):void 0})]}),!d&&u>0&&(0,M.jsxs)("button",{className:"xray-newmsg-pill",onClick:()=>{p(0),l.current=!0,x(!0),y()},children:[(0,M.jsx)(Ln,{size:14,stroke:2}),u," new"]})]})}function KA(){let e=I(p=>p.selectedId&&p.entries.find(v=>v.id===p.selectedId)||null),t=I(p=>p.addConsoleEvent),a=I(p=>p.consoleDraft),o=I(p=>p.setConsoleDraft),r=I(p=>p.setConsoleMiniTab),[n,l]=(0,q.useState)(!1),[s,i]=(0,q.useState)(""),f=(0,q.useRef)(null),d=(0,q.useRef)({active:!1,draft:""});(0,q.useEffect)(()=>{let p=f.current;p&&(p.style.height="auto",p.style.height=Math.min(p.scrollHeight,110)+"px")},[a]);async function x(p){let v=(p??a).trim();if(!v||n)return;d.current={active:!1,draft:""},o(""),l(!0);let w="cmd_"+Date.now().toString(36);t({id:w,type:"command",level:"info",timestamp:Date.now(),message:v,args:[v],commandId:w}),r("console");try{let E=await aI(v);if(!E||E.type==="empty")return;if(E.type==="error"){let y=E.error?.message||"Execution failed";t({id:"res_"+w,type:"error",level:"error",timestamp:Date.now(),message:y,data:E.error,commandId:w}),p||o(v),i(`Error: ${y}`)}else{let y=ia(E.result,260);t({id:"res_"+w,type:"result",level:"info",timestamp:Date.now(),message:y,data:E.result,commandId:w,truncated:!!E.truncated}),i(`Result: ${y.slice(0,140)}`)}}finally{l(!1)}}function u(p){let v=p.currentTarget;if(p.key==="Enter"&&!p.shiftKey){p.preventDefault(),x();return}if(p.key==="ArrowUp"&&(d.current.active||!a||v.selectionStart===0&&v.selectionEnd===0)){p.preventDefault(),d.current.active||(d.current={active:!0,draft:a});let w=Nd("up");w&&o(w);return}if(p.key==="ArrowDown"&&d.current.active&&v.selectionEnd===a.length){p.preventDefault();let w=Nd("down");w===""?(o(d.current.draft),d.current={active:!1,draft:""}):w!=null&&o(w);return}p.key==="Escape"&&d.current.active&&(p.preventDefault(),p.stopPropagation(),o(d.current.draft),d.current={active:!1,draft:""})}return(0,M.jsxs)("div",{className:"xray-prompt",children:[(0,M.jsx)(Hn,{...Fe}),(0,M.jsxs)("div",{className:"xray-prompt-command",children:[(0,M.jsx)("textarea",{ref:f,rows:1,value:a,onChange:p=>{d.current.active=!1,o(p.currentTarget.value)},onKeyDown:u,placeholder:e?"Try res.data, Object.keys(res), schema(res) \u2014 Shift+Enter for a new line":"Select a request, then try res.data","aria-label":"Console command"}),(0,M.jsx)("button",{className:"xray-btn xray-prompt-help",title:"Show the console helpers cheatsheet ($help)",onClick:()=>{x("$help")},children:(0,M.jsx)(gp,{...Fe})}),(0,M.jsxs)("button",{className:"xray-btn",disabled:n,onClick:()=>{x()},children:[n?(0,M.jsx)(_n,{...Fe,className:"xray-spin"}):(0,M.jsx)(Tp,{...Fe}),n?"Running\u2026":"Run"]})]}),(0,M.jsx)("button",{className:"xray-context-chip",title:e?"The prompt evaluates res/req against this request. Click to open the request strip.":"Pick a request in the Network strip to give the prompt a res/req context.",onClick:()=>r("network"),children:e?`Selected ${e.method||"GET"} ${ne(e)}`:"No request selected"}),(0,M.jsx)("span",{className:"xray-visually-hidden","aria-live":"polite",children:s})]})}function ZA(){let e=I(o=>o.entries),t=I(o=>o.settings.slowThresholdMs),a=(0,q.useMemo)(()=>{let o=e.filter(Pe),r=o.filter(s=>Number(s.status)>=400),n=o.filter(s=>ie(s)>=t),l=o.length?o.reduce((s,i)=>s+ie(i),0)/o.length:0;return{total:o.length,errors:r.length,slow:n.length,avg:l}},[e,t]);return(0,M.jsxs)("footer",{className:"xray-statusbar",children:[(0,M.jsxs)("span",{style:{color:"var(--xray-green)"},children:[a.total-a.errors," ok"]}),(0,M.jsxs)("span",{style:{color:"var(--xray-red)"},children:[a.errors," errors"]}),(0,M.jsxs)("span",{style:{color:"var(--xray-yellow)"},children:[a.slow," slow (>",t,"ms)"]}),(0,M.jsx)("span",{className:"xray-spacer"}),(0,M.jsxs)("span",{children:[a.total," requests - avg ",Math.round(a.avg),"ms"]})]})}var q,M,Fe,OA,LA,zA,XA,QA,pv=T(()=>{"use strict";q=_(ze());Jd();qe();fs();Xp();jp();cs();$e();Gt();Bd();Ae();M=_(j()),Fe={size:16,stroke:1.8},OA=[{id:"all",label:"All",icon:(0,M.jsx)(ls,{...Fe})},{id:"xhr",label:"XHR",icon:(0,M.jsx)(ap,{...Fe})},{id:"fetch",label:"Fetch",icon:(0,M.jsx)(tp,{...Fe})},{id:"ws",label:"WS",icon:(0,M.jsx)(_n,{...Fe})},{id:"errors",label:"Errors",icon:(0,M.jsx)(Tf,{...Fe})}],LA=[{id:"network",label:"Network",icon:(0,M.jsx)(kr,{...Fe})},{id:"console",label:"Console",icon:(0,M.jsx)(rt,{...Fe})}],zA=[{id:"all",label:"All"},{id:"log",label:"Logs"},{id:"warn",label:"Warnings"},{id:"error",label:"Errors"},{id:"result",label:"Results"}];XA=q.default.memo(function({event:t,waterfall:a,index:o,onExpand:r}){let n=tf(t),l=I(N=>N.settings.slowThresholdMs),s=I(N=>N.selectedId),i=I(N=>N.expandedId),f=I(N=>N.selectEntry),d=I(N=>N.toggleExpanded);if(!n)return(0,M.jsx)("div",{});let x=Number(n.status)||0,u=s===n.id,p=i===t.id,v=ie(n),w=((Number(n.timestamp)||0)-a.minStart)/a.span,E=Math.max(0,Math.min(99,w*100)),y=Math.max(1.5,Math.min(100-E,v/a.span*100)),c=Number(n.timing?.ttfbMs)||0,m=Number(n.timing?.downloadMs)||0,g=c&&c+m>0?c/Math.max(v,c+m):.6,k=()=>{if(i===t.id){d(t.id);return}f(n.id,{openDetail:!1}),r(o)};return(0,M.jsxs)("div",{children:[(0,M.jsxs)("div",{className:`xray-network-row ${u?"selected":""} ${p?"expanded":""}`,role:"button",tabIndex:0,"aria-expanded":p,onClick:k,onKeyDown:N=>{(N.key==="Enter"||N.key===" ")&&(N.preventDefault(),k())},children:[(0,M.jsx)(UA,{entry:n}),(0,M.jsx)("span",{className:`xray-method ${fa(n.method)}`,children:String(n.method||"GET").toUpperCase().replace("DELETE","DEL")}),(0,M.jsx)("span",{className:"xray-path",title:String(n.url||""),children:ne(n)}),(0,M.jsx)("span",{className:"xray-net-type",title:zo(n)||void 0,children:qA(n)}),(0,M.jsx)("span",{className:"xray-muted xray-net-size",children:Tt(n.size)}),(0,M.jsxs)("span",{className:"xray-waterfall-cell",children:[(0,M.jsx)("span",{className:"xray-waterfall-track",children:(0,M.jsx)("span",{className:`xray-waterfall-bar ${v>=l?"slow":""} ${x>=400?"error":""}`,style:{left:`${E}%`,width:`${y}%`},children:(0,M.jsx)("span",{className:"xray-waterfall-wait",style:{width:`${Math.round(g*100)}%`}})})}),(0,M.jsxs)("span",{className:"xray-waterfall-ms",children:[Math.round(v),"ms"]})]})]}),p&&(0,M.jsx)("div",{className:"xray-detail",children:(0,M.jsx)(us,{entry:n,compact:!0})})]})});QA=q.default.memo(function({event:t,count:a}){let o=I(x=>x.expandedId),r=I(x=>x.toggleExpanded),n=o===t.id,l=(0,q.useMemo)(()=>GA(t),[t]),s=t.type==="result"||(l?!!l.stack:!1)||t.data!==void 0||!!t.args?.some(x=>x&&typeof x=="object"),i=t.type==="command"?(0,M.jsx)(Hn,{...Fe}):t.type==="result"?(0,M.jsx)(lp,{...Fe}):t.level==="error"?(0,M.jsx)(Tf,{...Fe}):t.level==="warn"?(0,M.jsx)(Wa,{...Fe}):(0,M.jsx)("span",{className:"xray-console-dot","aria-hidden":"true"}),f=n&&t.type==="log"&&t.entryId&&!l&&I.getState().entries.find(x=>x.id===t.entryId)||null,d=(0,q.useMemo)(()=>n&&!f&&!l?ef(t.data??t.args??t.message):null,[n,f,l,t]);return(0,M.jsxs)("div",{className:`xray-console-row ${t.type} ${t.level} ${l?"is-error":""}`,role:s?"button":void 0,tabIndex:s?0:void 0,"aria-expanded":s?n:void 0,onClick:()=>s&&r(t.id),onKeyDown:s?x=>{(x.key==="Enter"||x.key===" ")&&(x.preventDefault(),r(t.id))}:void 0,children:[(0,M.jsx)("span",{className:"xray-console-glyph",children:n?(0,M.jsx)($a,{...Fe}):i}),(0,M.jsxs)("span",{className:"xray-console-message",children:[l?(0,M.jsxs)(M.Fragment,{children:[(0,M.jsx)("span",{className:"xray-error-name",children:l.name}),l.message?`: ${l.message}`:""]}):t.message,a>1&&(0,M.jsxs)("span",{className:"xray-repeat-badge",title:`${a} identical consecutive messages`,children:["\xD7",a]}),t.truncated&&(0,M.jsx)("span",{className:"xray-truncated-badge",title:"The result was truncated to fit the transfer limit",children:"truncated"})]}),(0,M.jsxs)("span",{className:"xray-console-aside",children:[l&&Yp(l)&&(0,M.jsx)("span",{className:"xray-console-source",title:Yp(l),children:jA(Yp(l))}),(0,M.jsx)("span",{className:"xray-console-time",children:Ra(t.timestamp)})]}),n&&(0,M.jsx)("div",{className:"xray-detail",children:l?(0,M.jsx)(VA,{error:l}):f?(0,M.jsx)(ds,{entry:f}):(0,M.jsx)(jt,{value:d})})]})})});function Kp(e){return e&&typeof e=="object"&&!Array.isArray(e)?e:{}}function mv(e){return e.replace(/[^a-zA-Z0-9]+/g," ").trim().split(/\s+/).map(a=>a.charAt(0).toUpperCase()+a.slice(1)).join("")||"XrayResponse"}function Zp(e){return Kp(e?.requestHeaders)}function zf(e){let t=Kp(e?.responseHeaders),a=t["content-type"]??t["Content-Type"]??e?.contentType??"application/json";return String(a)}function WA(e,t="XrayResponse"){let a=la(e);function o(r,n=0){if(r==="string")return"string";if(r==="number")return"number";if(r==="boolean")return"boolean";if(r==="null")return"null";if(Array.isArray(r))return`${o(r[0],n+1)}[]`;if(r&&typeof r=="object"){let l="  ".repeat(n+1),s="  ".repeat(n);return`{
${Object.entries(r).map(([i,f])=>`${l}${JSON.stringify(i)}: ${o(f,n+1)};`).join(`
`)}
${s}}`}return"unknown"}return`export type ${t} = ${o(a)};`}function $A(e,t="XrayResponse"){let a=la(e);function o(r){return r==="string"?"z.string()":r==="number"?"z.number()":r==="boolean"?"z.boolean()":r==="null"?"z.null()":Array.isArray(r)?`z.array(${o(r[0])})`:r&&typeof r=="object"?`z.object({
${Object.entries(r).map(([l,s])=>`  ${JSON.stringify(l)}: ${o(s)},`).join(`
`)}
})`:"z.unknown()"}return`import { z } from 'zod';

export const ${mv(t).charAt(0).toLowerCase()}${mv(t).slice(1)}Schema = ${o(a)};`}function JA(e){if(!e)return"// Select an API request first";let t=String(e.method||"GET").toLowerCase(),a=sa(e),o={method:t,url:String(e.url||""),headers:Zp(e),...a==null?{}:{data:a}};return`import axios from 'axios';

const response = await axios(${Z(o,2,12e4)});
const data = response.data;`}function eR(e){let t=o=>{let r=String(o??"");return/[",\n]/.test(r)?`"${r.replace(/"/g,'""')}"`:r},a=e.filter(o=>o.type==="api").map(o=>[o.id,o.method||"",o.status||"",o.url||o.urlPath||"",o.source||"",o.duration||"",o.size||"",o.timestamp?new Date(Number(o.timestamp)).toISOString():""]);return[["id","method","status","url","source","durationMs","sizeBytes","timestamp"],...a].map(o=>o.map(t).join(",")).join(`
`)}function tR(e){let t=e.filter(a=>a.type==="api").map(a=>({startedDateTime:a.timestamp?new Date(Number(a.timestamp)).toISOString():new Date().toISOString(),time:Number(a.duration)||0,request:{method:a.method||"GET",url:a.url||a.urlPath||"",httpVersion:"HTTP/1.1",headers:Object.entries(Zp(a)).map(([o,r])=>({name:o,value:String(r)})),queryString:[],cookies:[],headersSize:-1,bodySize:a.requestBody?Z(a.requestBody,0).length:0,postData:a.requestBody?{mimeType:"application/json",text:Z(sa(a),2,12e4)}:void 0},response:{status:Number(a.status)||0,statusText:"",httpVersion:"HTTP/1.1",headers:Object.entries(Kp(a.responseHeaders)).map(([o,r])=>({name:o,value:String(r)})),cookies:[],content:{size:Number(a.size)||Z(se(a),0).length,mimeType:zf(a),text:typeof se(a)=="string"?String(se(a)):Z(se(a),2,12e4)},redirectURL:"",headersSize:-1,bodySize:Number(a.size)||-1},cache:{},timings:{blocked:0,dns:-1,connect:-1,send:0,wait:Number(a.duration)||0,receive:0,ssl:-1}}));return Z({log:{version:"1.2",creator:{name:"XRAY",version:"react-preview"},entries:t}},2,5e5)}function aR(e){if(!e)return"// Select an API request first";let t=se(e);return`global.fetch = jest.fn();

describe(${JSON.stringify(String(e.urlPath||e.url||"captured request"))}, () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: ${Number(e.status)<400},
      status: ${Number(e.status)||200},
      headers: { get: () => ${JSON.stringify(zf(e))} },
      json: async () => (${Z(t,2,12e4)}),
      text: async () => ${JSON.stringify(typeof t=="string"?t:Z(t,0,12e4))},
    });
  });

  afterEach(() => jest.clearAllMocks());

  it('handles the captured response', async () => {
    const response = await fetch(${JSON.stringify(String(e.url||e.urlPath||""))});
    expect(response.status).toBe(${Number(e.status)||200});
  });
});`}function oR(e){if(!e)return"// Select an API request first";let t=String(e.method||"GET").toLowerCase(),a=se(e),r=zf(e).toLowerCase().includes("json")?`HttpResponse.json(${Z(a,2,12e4)}, { status: ${Number(e.status)||200} })`:`new HttpResponse(${JSON.stringify(typeof a=="string"?a:Z(a,0,12e4))}, { status: ${Number(e.status)||200} })`;return`import { http, HttpResponse } from 'msw';

export const handlers = [
  http.${t}(${JSON.stringify(String(e.url||e.urlPath||""))}, async () => {
    return ${r};
  }),
];`}function rR(e){if(!e)return"// Select an API request first";let t=String(e.method||"GET").toLowerCase(),a=String(e.url||e.urlPath||""),o=Number(e.status)||200,r=`${String(e.method||"GET").toUpperCase()} ${String(e.urlPath||a||"request")}`,n=Zp(e),l=sa(e),s=["get","post","put","patch","delete","head"].includes(t),i={};s||(i.method=String(e.method||"GET").toUpperCase()),Object.keys(n).length&&(i.headers=n),l!=null&&t!=="get"&&t!=="head"&&(i.data=l);let f=Object.keys(i).length?`, ${Z(i,2,12e4)}`:"",d=s?`request.${t}(${JSON.stringify(a)}${f})`:`request.fetch(${JSON.stringify(a)}${f})`,u=zf(e).toLowerCase().includes("json")?"  const body = await response.json();":"  const body = await response.text();";return`import { test, expect } from '@playwright/test';

test(${JSON.stringify(r)}, async ({ request }) => {
  const response = await ${d};
  expect(response.status()).toBe(${o});
${u}
  expect(body).toBeTruthy();
});`}function xv(e,t){let a=String(e?.urlPath||e?.url||"session").replace(/^https?:\/\//,"").replace(/[^a-zA-Z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,80)||"session",o=ps[t];return`xray-${a}-${t}.${o.extension}`}function yv(e){return e==="session-csv"?"text/csv;charset=utf-8":e==="session-har"||e==="session-json"||e==="json"||e==="schema"||e==="mock"?"application/json;charset=utf-8":e==="raw"?"text/plain;charset=utf-8":e==="curl"?"text/x-shellscript;charset=utf-8":"text/typescript;charset=utf-8"}function gv(e,t,a){if(a==="session-json")return Z({entries:t},2,5e5);if(a==="session-csv")return eR(t);if(a==="session-har")return tR(t);if(!e||e.type!=="api")return"// Select an API request first";if(a==="curl")return af(e);if(a==="fetch")return of(e);if(a==="axios")return JA(e);if(a==="schema")return Z(la(se(e)));if(a==="mock"){let o=window.XRAY_ConsoleHelpers?.buildMock?.(e)||se(e);return Z(o,2,12e4)}if(a==="typescript")return WA(se(e));if(a==="zod")return $A(se(e));if(a==="jest")return aR(e);if(a==="msw")return oR(e);if(a==="playwright")return rR(e);if(a==="raw"){let o=e.responseDecrypted??e.responseRaw??se(e);return typeof o=="string"?o:Z(o,2,12e4)}return Z(e?{entry:e,response:se(e)}:{entries:t},2,12e4)}var Qp,lB,ps,hv=T(()=>{"use strict";Ae();Qp=[{label:"Request",formats:["curl","fetch","axios"]},{label:"Response",formats:["json","raw","schema","mock"]},{label:"Types",formats:["typescript","zod"]},{label:"Tests",formats:["jest","msw","playwright"]},{label:"Session",formats:["session-json","session-csv","session-har"]}],lB=Qp.flatMap(e=>e.formats),ps={curl:{title:"cURL command",desc:"Universal shell command with method, headers, and body.",extension:"sh"},fetch:{title:"fetch() request",desc:"Async JavaScript request with status handling.",extension:"ts"},axios:{title:"Axios request",desc:"Axios call with method, URL, headers, and body.",extension:"ts"},json:{title:"Selected JSON",desc:"Captured request metadata plus parsed response.",extension:"json"},raw:{title:"Raw response",desc:"The selected response body as text or JSON.",extension:"txt"},schema:{title:"Response schema",desc:"Inferred structural schema from the selected response.",extension:"json"},mock:{title:"Mock response",desc:"Generated mock payload using XRAY helpers when available.",extension:"json"},typescript:{title:"TypeScript type",desc:"Static TypeScript shape inferred from response data.",extension:"ts"},zod:{title:"Zod schema",desc:"Runtime validation schema inferred from response data.",extension:"ts"},jest:{title:"Jest test",desc:"Starter test with mocked response behavior.",extension:"test.ts"},msw:{title:"MSW handler",desc:"Mock Service Worker handler for the captured endpoint.",extension:"ts"},playwright:{title:"Playwright test",desc:"API test that re-fires the request and asserts its status.",extension:"spec.ts"},"session-json":{title:"Session JSON",desc:"All captured entries in XRAY session format.",extension:"json"},"session-csv":{title:"Session CSV",desc:"Flat API request summary for spreadsheets.",extension:"csv"},"session-har":{title:"Session HAR",desc:"HTTP Archive compatible export.",extension:"har"}}});function Iv(e){let t={};return Array.isArray(e)&&e.forEach(a=>{a&&typeof a=="object"&&"name"in a&&(t[String(a.name)]=String(a.value??""))}),t}function nR(e){return`${e}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`}function lR(e,t){for(let a of[e,t]){let o=Number(a);if(Number.isFinite(o)&&o>0)return Math.round(o)}return 0}function sR(e){let t=e.request,a=e.response;if(!t)return null;let o=String(t.url||""),r=o;try{r=new URL(o).pathname}catch{}let n=a?.content,l=t.postData,s=En(l?.text??null),i=e.timings;return{id:nR("har"),type:"api",timestamp:e.startedDateTime&&Date.parse(String(e.startedDateTime))||Date.now(),source:"import",method:String(t.method||"GET"),url:o,urlPath:r,status:Number(a?.status)||0,duration:lR(e.time,i?.wait),size:Number(n?.size)||0,requestHeaders:Iv(t.headers),responseHeaders:Iv(a?.headers),requestBody:s,responseRaw:typeof n?.text=="string"?n.text:null,responseDecrypted:null,imported:!0,pinned:!1}}function bv(e){let t;try{t=JSON.parse(e)}catch{return{entries:[],format:"unknown",error:"File is not valid JSON."}}let a=t?.log;if(a&&Array.isArray(a.entries))return{entries:a.entries.map(n=>sR(n)).filter(n=>!!n),format:"har"};let o=t?.entries;if(Array.isArray(o))return{entries:o.filter(n=>!!n&&typeof n=="object"&&typeof n.id=="string").map(n=>({...n,imported:!0})),format:"session"};if(Array.isArray(t)){let r=t.filter(n=>!!n&&typeof n=="object"&&typeof n.id=="string").map(n=>({...n,imported:!0}));if(r.length)return{entries:r,format:"session"}}return{entries:[],format:"unknown",error:"Unrecognized file. Expected a HAR file or XRAY session export."}}var vv=T(()=>{"use strict";Ae()});function Sv(e){return Array.from(e.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(t=>t.offsetParent!==null||t===document.activeElement)}function Dt({title:e,subtitle:t,icon:a,className:o="",children:r,footer:n,onClose:l}){let s=(0,Hf.useRef)(null);return(0,Hf.useEffect)(()=>{let i=document.activeElement instanceof HTMLElement?document.activeElement:null,f=s.current;(f?Sv(f)[0]:null)?.focus();function x(u){if(u.key==="Escape"){u.preventDefault(),l();return}if(u.key!=="Tab"||!f)return;let p=Sv(f);if(!p.length){u.preventDefault();return}let v=p[0],w=p[p.length-1];u.shiftKey&&document.activeElement===v?(u.preventDefault(),w.focus()):!u.shiftKey&&document.activeElement===w&&(u.preventDefault(),v.focus())}return document.addEventListener("keydown",x,!0),()=>{document.removeEventListener("keydown",x,!0),i?.focus()}},[l]),(0,Vt.jsx)("div",{className:"xray-modal-backdrop",onMouseDown:l,children:(0,Vt.jsxs)("section",{ref:s,className:`xray-modal ${o}`,role:"dialog","aria-modal":"true","aria-label":e,onMouseDown:i=>i.stopPropagation(),children:[(0,Vt.jsxs)("header",{className:"xray-modal-head",children:[a&&(0,Vt.jsx)("span",{className:"xray-modal-title-icon",children:a}),(0,Vt.jsxs)("div",{children:[(0,Vt.jsx)("h3",{children:e}),t&&(0,Vt.jsx)("div",{className:"xray-modal-subtitle",children:t})]}),(0,Vt.jsx)("span",{className:"xray-spacer"}),(0,Vt.jsx)("button",{className:"xray-icon-btn",onClick:l,"aria-label":`Close ${e}`,children:(0,Vt.jsx)(to,{...iR})})]}),r,n&&(0,Vt.jsx)("footer",{className:"xray-modal-foot",children:n})]})})}var Hf,Vt,iR,Vo=T(()=>{"use strict";Hf=_(ze());qe();Vt=_(j()),iR={size:16,stroke:1.8}});function ms(e){return e.startsWith("session-")}function wv(){let e=I(D=>D.exportOpen),t=I(D=>D.setExportOpen),a=I(D=>D.entries),o=I(D=>D.showToast),r=I(D=>D.insertConsoleCommand),n=I(D=>D.saveSnippet),l=I(D=>D.restoreEntries),s=(0,ao.useRef)(null),i=YI(),[f,d]=(0,ao.useState)("session"),[x,u]=(0,ao.useState)("curl"),p=f==="selected"?i:null,v=(0,ao.useMemo)(()=>gv(p,a,x),[a,x,p]),w=ps[x],E=xv(p,x);if((0,ao.useEffect)(()=>{if(!e)return;let D=i?"selected":"session";d(D),u(D==="selected"?"curl":"session-json")},[e,i?.id]),!e)return null;function y(D){d(D),u(D==="selected"?"curl":"session-json")}async function c(){await ct(v),o(`${w.title} copied.`)}function m(){yI(E,v,yv(x)),o(`${w.title} downloaded.`)}function g(){r(v),t(!1),o("Export snippet inserted in Console.")}function k(){n({title:w.title,code:v}),t(!1),o("Saved to Console snippets.")}async function N(D){let S=D.currentTarget.files?.[0];if(D.currentTarget.value="",!!S)try{let P=await S.text(),le=bv(P);if(le.error||!le.entries.length){o(le.error||"No entries found in file.");return}l(le.entries),t(!1),o(`Imported ${le.entries.length} ${le.format==="har"?"HAR":"session"} entries.`)}catch{o("Could not read the selected file.")}}let b=f==="selected"&&i?`${i.method||"GET"} ${i.urlPath||i.url||""}`:`${a.length} captured entries`;return(0,$.jsx)(Dt,{title:f==="selected"?"Export selected request":"Export session",subtitle:b,icon:(0,$.jsx)(pp,{...Un}),className:"xray-export-modal",onClose:()=>t(!1),footer:(0,$.jsxs)($.Fragment,{children:[(0,$.jsxs)("span",{className:"xray-muted",children:[v.length.toLocaleString()," chars"]}),(0,$.jsx)("input",{ref:s,type:"file",accept:".har,.json,application/json",style:{display:"none"},onChange:D=>{N(D)}}),(0,$.jsxs)("button",{className:"xray-btn",onClick:()=>s.current?.click(),children:[(0,$.jsx)(mp,{...Un}),"Import HAR / session"]}),(0,$.jsx)("span",{className:"xray-spacer"}),f==="selected"&&(0,$.jsxs)($.Fragment,{children:[(0,$.jsxs)("button",{className:"xray-btn",onClick:g,children:[(0,$.jsx)(Mr,{...Un}),"Console"]}),(0,$.jsxs)("button",{className:"xray-btn",onClick:k,children:[(0,$.jsx)(Po,{...Un}),"Snippet"]})]}),(0,$.jsxs)("button",{className:"xray-btn",onClick:()=>{c()},children:[(0,$.jsx)(ut,{...Un}),"Copy"]}),(0,$.jsxs)("button",{className:"xray-btn primary",onClick:m,children:[(0,$.jsx)(Ft,{...Un}),"Download"]})]}),children:(0,$.jsxs)("div",{className:"xray-export-body",children:[(0,$.jsxs)("nav",{className:"xray-export-rail","aria-label":"Export formats",children:[(0,$.jsxs)("div",{className:"xray-export-mode",children:[(0,$.jsx)("button",{className:`xray-chip ${f==="selected"?"active":""}`,disabled:!i,title:i?"Use selected request":"Select an API request first",onClick:()=>y("selected"),children:"Selected"}),(0,$.jsx)("button",{className:`xray-chip ${f==="session"?"active":""}`,onClick:()=>y("session"),children:"Session"})]}),Qp.map(D=>(0,$.jsxs)("div",{className:"xray-export-group",children:[(0,$.jsx)("div",{className:"xray-export-group-label",children:D.label}),D.formats.map(S=>{let P=f==="session"?!ms(S):ms(S)||!i,le=!i&&!ms(S)?"Select a request first":f==="session"&&!ms(S)?"Switch to Selected mode":ms(S)&&f==="selected"?"Switch to Session mode":void 0;return(0,$.jsxs)("button",{disabled:P,className:`xray-export-format ${x===S?"active":""}`,title:le,onClick:()=>u(S),children:[(0,$.jsx)("span",{children:ps[S].title}),(0,$.jsx)("small",{children:ps[S].extension})]},S)})]},D.label))]}),(0,$.jsxs)("section",{className:"xray-export-preview",children:[(0,$.jsxs)("header",{className:"xray-export-preview-head",children:[(0,$.jsxs)("div",{children:[(0,$.jsx)("h3",{children:w.title}),(0,$.jsx)("p",{children:w.desc})]}),(0,$.jsx)("span",{className:"xray-count-pill",children:E})]}),(0,$.jsx)("pre",{className:"xray-json xray-export-code",children:v})]})]})})}var ao,$,Un,Cv=T(()=>{"use strict";ao=_(ze());qe();$e();hv();vv();Ae();Vo();$=_(j()),Un={size:16,stroke:1.8}});function kv(){let e=I(o=>o.pendingConfirmation),t=I(o=>o.closeConfirmation),a=I(o=>o.confirmPending);return e?(0,ca.jsx)(Dt,{title:e.title,subtitle:"Confirm this action before XRAY changes the current session.",icon:(0,ca.jsx)(Wa,{...fR}),className:"xray-confirm-modal",onClose:t,footer:(0,ca.jsxs)(ca.Fragment,{children:[(0,ca.jsx)("span",{className:"xray-spacer"}),(0,ca.jsx)("button",{className:"xray-btn",onClick:t,children:e.cancelLabel||"Cancel"}),(0,ca.jsx)("button",{className:`xray-btn ${e.tone==="danger"?"danger":"primary"}`,onClick:a,children:e.confirmLabel})]}),children:(0,ca.jsx)("div",{className:"xray-modal-body",children:(0,ca.jsx)("p",{className:"xray-confirm-message",children:e.message})})}):null}var ca,fR,Av=T(()=>{"use strict";qe();$e();Vo();ca=_(j()),fR={size:17,stroke:1.8}});function cR(e){return e.reduce((t,a)=>{let o=Et(a);return t[o]=(t[o]||0)+1,t},{})}function uR(e){let t=Number(e.status)||0;return t>=500?"5xx":t>=400?"4xx":t>=300?"3xx":t>=200?"2xx":"other"}function Rv(e,t=500){let a=e.filter(Pe),o=a.filter(s=>Number(s.status)>=400),r=a.filter(s=>ie(s)>=t),n=cR(a),l=a.reduce((s,i)=>{let f=uR(i);return s[f]=(s[f]||0)+1,s},{});return{requests:a.length,errors:o.length,slow:r.length,avgDuration:a.length?a.reduce((s,i)=>s+ie(i),0)/a.length:0,totalBytes:a.reduce((s,i)=>s+(Number(i.size)||0),0),statusCounts:l,repeatedEndpoints:n,nPlusOneCandidates:Object.entries(n).filter(([,s])=>s>=3).map(([s,i])=>{let f=a.filter(x=>Et(x)===s),d=f[0];return{path:d?ne(d):s,label:d?$l(d):s,count:i,avgDuration:f.length?f.reduce((x,u)=>x+ie(u),0)/f.length:0}}).sort((s,i)=>i.count-s.count).slice(0,8),topSlowRequests:a.slice().sort((s,i)=>ie(i)-ie(s)).slice(0,8).map(s=>({id:s.id,method:String(s.method||"GET"),path:ne(s),duration:ie(s),status:Number(s.status)||0}))}}var Mv=T(()=>{"use strict";Gt()});var Xn,J,Fr,xs=T(()=>{"use strict";qe();Xn=_(j()),J={size:16,stroke:1.8},Fr=[{id:"console",label:"Console",icon:(0,Xn.jsx)(rt,{...J})},{id:"api",label:"API",icon:(0,Xn.jsx)(kr,{...J})},{id:"logs",label:"Logs",icon:(0,Xn.jsx)(sp,{...J})},{id:"rules",label:"Rules",icon:(0,Xn.jsx)(Rr,{...J})},{id:"insights",label:"Insights",icon:(0,Xn.jsx)(wr,{...J})}]});function Tv(){let e=I(l=>l.entries),t=I(l=>l.setApiSearchQuery),a=I(l=>l.setActiveTab),o=I(l=>l.settings.slowThresholdMs),r=Rv(e,o);function n(l){t(l),a("api")}return(0,W.jsxs)("section",{className:"xray-page",children:[(0,W.jsx)("header",{className:"xray-page-head",children:(0,W.jsxs)("div",{children:[(0,W.jsx)("h3",{children:"Insights"}),(0,W.jsx)("p",{children:"Deterministic local signals from captured requests. No external AI service is used."})]})}),(0,W.jsx)(Xo,{id:"insights-overview",title:"Overview",className:"xray-insight-overview",children:(0,W.jsxs)("div",{className:"xray-insight-grid",children:[(0,W.jsx)(ys,{icon:(0,W.jsx)(qo,{...J}),label:"Requests",value:String(r.requests)}),(0,W.jsx)(ys,{icon:(0,W.jsx)(Wa,{...J}),label:"Errors",value:String(r.errors),tone:r.errors?"error":"ok"}),(0,W.jsx)(ys,{icon:(0,W.jsx)(zn,{...J}),label:"Slow",value:String(r.slow),tone:r.slow?"warn":"ok"}),(0,W.jsx)(ys,{icon:(0,W.jsx)(rs,{...J}),label:"Average",value:`${Math.round(r.avgDuration)}ms`}),(0,W.jsx)(ys,{icon:(0,W.jsx)(is,{...J}),label:"Payload",value:Tt(r.totalBytes)})]})}),(0,W.jsxs)("div",{className:"xray-insight-columns",children:[(0,W.jsx)(Xo,{id:"insights-repeated",title:"Repeated endpoints",className:"xray-card",children:r.nPlusOneCandidates.length?r.nPlusOneCandidates.map(l=>(0,W.jsxs)("button",{className:"xray-insight-row",onClick:()=>n(l.path),children:[(0,W.jsx)(ss,{...J}),(0,W.jsx)("span",{children:l.label}),(0,W.jsxs)("strong",{children:[l.count,"x"]})]},l.label)):(0,W.jsx)("p",{className:"xray-muted",children:"No repeated endpoint pattern above threshold."})}),(0,W.jsx)(Xo,{id:"insights-slowest",title:"Slowest requests",className:"xray-card",children:r.topSlowRequests.map(l=>(0,W.jsxs)("button",{className:"xray-insight-row",onClick:()=>n(l.path),children:[(0,W.jsx)("span",{className:"xray-method",children:l.method}),(0,W.jsx)("span",{children:l.path}),(0,W.jsxs)("strong",{children:[Math.round(l.duration),"ms"]})]},l.id))}),(0,W.jsx)(Xo,{id:"insights-status",title:"Status mix",className:"xray-card",children:Object.entries(r.statusCounts).map(([l,s])=>(0,W.jsxs)("div",{className:"xray-status-mix-row",children:[(0,W.jsx)("span",{children:l}),(0,W.jsx)("span",{className:"xray-bar-track",children:(0,W.jsx)("span",{className:"xray-bar",style:{width:`${Math.max(8,s/Math.max(1,r.requests)*100)}%`}})}),(0,W.jsx)("strong",{children:s})]},l))})]})]})}function ys({icon:e,label:t,value:a,tone:o=""}){return(0,W.jsxs)("div",{className:`xray-api-metric ${o}`,children:[e,(0,W.jsx)("span",{children:t}),(0,W.jsx)("strong",{children:a})]})}var W,Ev=T(()=>{"use strict";qe();$e();Mv();Ae();Hp();xs();W=_(j())});function Fv(){let e=I(d=>d.rules),t=I(d=>d.addRule),a=I(d=>d.setRules),o=I(d=>d.showToast),[r,n]=(0,Wp.useState)(!1),[l,s]=(0,Wp.useState)("");function i(){if(!e.length){o("No rules to export.");return}ct(CI(e)),o(`Copied ${e.length} rule${e.length===1?"":"s"} to clipboard.`)}function f(){let d=kI(l);if(!d){o("Could not read a rule set from that text.");return}a([...e,...d]),s(""),n(!1),o(`Imported ${d.length} rule${d.length===1?"":"s"}.`)}return(0,U.jsxs)("section",{className:"xray-page xray-rules-page",children:[(0,U.jsxs)("header",{className:"xray-page-head",children:[(0,U.jsxs)("div",{children:[(0,U.jsx)("h3",{children:"Traffic Rules"}),(0,U.jsx)("p",{children:"Intercept matching requests to mock responses, inject latency, or force failures. Rules run in the page before the real network call."})]}),(0,U.jsxs)("button",{className:"xray-btn primary",onClick:()=>t(),children:[(0,U.jsx)(Fp,{...J}),"New rule"]})]}),(0,U.jsxs)("div",{className:"xray-rules-toolbar",children:[(0,U.jsx)("span",{className:"xray-rules-toolbar-label",children:"Presets"}),wI.map(d=>(0,U.jsx)("button",{className:"xray-chip",onClick:()=>{t(d.rule),o(`Added preset \u201C${d.label}\u201D.`)},children:d.label},d.label)),(0,U.jsx)("span",{className:"xray-spacer"}),(0,U.jsxs)("button",{className:"xray-chip",onClick:i,title:"Copy all rules as portable JSON",children:[(0,U.jsx)(ut,{...J}),"Export"]}),(0,U.jsxs)("button",{className:"xray-chip",onClick:()=>n(d=>!d),title:"Paste a rule set to load",children:[(0,U.jsx)(os,{...J}),"Import"]})]}),r&&(0,U.jsxs)("div",{className:"xray-rules-import",children:[(0,U.jsx)("textarea",{className:"xray-input xray-rules-import-field",placeholder:"Paste a rule set exported from XRAY (JSON)",value:l,spellCheck:!1,onChange:d=>s(d.currentTarget.value)}),(0,U.jsx)("button",{className:"xray-btn primary",onClick:f,children:"Load rules"})]}),e.length?(0,U.jsx)("div",{className:"xray-rules-list",children:e.map(d=>(0,U.jsx)(pR,{rule:d},d.id))}):(0,U.jsxs)("div",{className:"xray-card xray-rules-empty",children:[(0,U.jsx)(Rr,{size:22,stroke:1.6}),(0,U.jsx)("p",{children:"No rules yet. Create one here, or use \u201CMock this\u201D on any captured response to seed a rule from real traffic."})]})]})}function pR({rule:e}){let t=I(r=>r.updateRule),a=I(r=>r.removeRule),o=I(r=>r.toggleRule);return(0,U.jsxs)("div",{className:`xray-card xray-rule-card ${e.enabled?"":"disabled"}`,children:[(0,U.jsxs)("div",{className:"xray-rule-head",children:[(0,U.jsx)("button",{className:`xray-toggle ${e.enabled?"on":""}`,"aria-label":"Toggle rule","aria-pressed":e.enabled,onClick:()=>o(e.id)}),(0,U.jsx)("input",{className:"xray-input xray-rule-label",value:e.label,onChange:r=>t(e.id,{label:r.currentTarget.value}),placeholder:"Rule name"}),(0,U.jsx)("span",{className:"xray-rule-summary",children:SI(e)}),(0,U.jsx)("button",{className:"xray-icon-btn","aria-label":"Delete rule",onClick:()=>a(e.id),children:(0,U.jsx)(Uo,{...J})})]}),(0,U.jsxs)("div",{className:"xray-rule-grid",children:[(0,U.jsxs)("label",{className:"xray-field",children:[(0,U.jsx)("span",{children:"URL contains / re:pattern"}),(0,U.jsx)("input",{className:"xray-input",value:e.match.url,onChange:r=>t(e.id,{match:{...e.match,url:r.currentTarget.value}}),placeholder:"/api/users or re:\\\\/v2\\\\/.*"})]}),(0,U.jsxs)("label",{className:"xray-field xray-field-narrow",children:[(0,U.jsx)("span",{children:"Method"}),(0,U.jsxs)("select",{className:"xray-select",value:e.match.method,onChange:r=>t(e.id,{match:{...e.match,method:r.currentTarget.value}}),children:[(0,U.jsx)("option",{value:"",children:"ANY"}),["GET","POST","PUT","PATCH","DELETE"].map(r=>(0,U.jsx)("option",{value:r,children:r},r))]})]}),(0,U.jsxs)("label",{className:"xray-field xray-field-narrow",children:[(0,U.jsx)("span",{children:"Action"}),(0,U.jsx)("select",{className:"xray-select",value:e.action.type,onChange:r=>t(e.id,{action:{...e.action,type:r.currentTarget.value}}),children:dR.map(r=>(0,U.jsx)("option",{value:r.id,children:r.label},r.id))})]}),e.action.type==="mock"&&(0,U.jsxs)("label",{className:"xray-field xray-field-narrow",children:[(0,U.jsx)("span",{children:"Status"}),(0,U.jsx)("input",{className:"xray-input",type:"number",min:200,max:599,value:e.action.status,onChange:r=>t(e.id,{action:{...e.action,status:Number(r.currentTarget.value)}})})]}),(e.action.type==="mock"||e.action.type==="delay")&&(0,U.jsxs)("label",{className:"xray-field xray-field-narrow",children:[(0,U.jsx)("span",{children:"Delay (ms)"}),(0,U.jsx)("input",{className:"xray-input",type:"number",min:0,max:6e4,step:100,value:e.action.delayMs,onChange:r=>t(e.id,{action:{...e.action,delayMs:Number(r.currentTarget.value)}})})]})]}),e.action.type==="mock"&&(0,U.jsxs)("label",{className:"xray-field",children:[(0,U.jsx)("span",{children:"Response body"}),(0,U.jsx)("textarea",{className:"xray-input xray-rule-body",value:e.action.body,spellCheck:!1,onChange:r=>t(e.id,{action:{...e.action,body:r.currentTarget.value}}),placeholder:'{ "mocked": true }'})]})]})}var Wp,U,dR,Dv=T(()=>{"use strict";Wp=_(ze());qe();$e();df();Ae();xs();U=_(j()),dR=[{id:"mock",label:"Mock response"},{id:"delay",label:"Add delay"},{id:"fail",label:"Force failure"},{id:"passthrough",label:"Passthrough"}]});var gs,_f,$p=T(()=>{"use strict";gs="0.3.0",_f="2026-08-28 20:01 UTC"});function Bv(){let e=I(S=>S.settingsOpen),t=I(S=>S.setSettingsOpen),a=I(S=>S.settings),o=I(S=>S.recording),r=I(S=>S.setRecording),n=I(S=>S.updateSettings),l=I(S=>S.resetSettings),s=I(S=>S.aiSettings),i=I(S=>S.setAiSettings),f=I(S=>S.clearEntries),d=I(S=>S.clearConsole),x=I(S=>S.clearPinned),u=I(S=>S.clearApiFilters),p=I(S=>S.setExportOpen),v=I(S=>S.entries),w=I(S=>S.consoleEvents),E=I(S=>S.pinnedIds),y=I(S=>S.requestConfirmation),c=I(S=>S.showToast),m=I(S=>S.settingsSection),[g,k]=(0,Yo.useState)("general");if(Yo.default.useEffect(()=>{e&&k(m)},[e,m]),!e)return null;function N(S,P,le,dt){if(!a.confirmDestructiveActions){dt();return}y({title:S,message:P,confirmLabel:le,tone:"danger",onConfirm:dt})}function b(){N("Reset XRAY settings?","This restores panel preferences to defaults. Captured requests are not deleted.","Reset settings",()=>{l(),c("Settings reset.")})}function D(){N("Clear all captured entries?","This removes requests, logs, console events, and pins from the React UI session.","Clear data",()=>{f(),c("Captured data cleared.")})}return(0,h.jsx)(Dt,{title:"Settings",subtitle:"Runtime controls and UI preferences",icon:(0,h.jsx)(Tr,{...Ee}),className:"xray-settings-modal",onClose:()=>t(!1),footer:(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)("span",{className:"xray-modal-version",children:"XRAY React UI - local deterministic runtime"}),(0,h.jsx)("span",{className:"xray-spacer"}),(0,h.jsx)("button",{className:"xray-btn",onClick:()=>t(!1),children:"Cancel"}),(0,h.jsxs)("button",{className:"xray-btn primary",onClick:()=>{t(!1),c("Settings saved.")},children:[(0,h.jsx)(as,{...Ee}),"Save"]})]}),children:(0,h.jsxs)("div",{className:"xray-settings-modal-body",children:[(0,h.jsx)("nav",{className:"xray-settings-nav","aria-label":"Settings sections",children:xR.map(S=>(0,h.jsxs)("button",{className:`xray-settings-nav-item ${g===S.id?"active":""}`,onClick:()=>k(S.id),children:[S.icon,(0,h.jsx)("span",{children:S.label})]},S.id))}),(0,h.jsxs)("div",{className:"xray-settings-content",children:[g==="general"&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(oo,{label:"General"}),(0,h.jsx)(ro,{label:"Stream to console live",desc:"Append newly captured events to the console stream as they arrive. Pausing this does not stop capture \u2014 that's under Capture.",checked:o,onChange:r}),(0,h.jsx)(hs,{label:"Default detail view",desc:"Switches the detail pane to this view now, and whenever settings are reset.",value:a.defaultDetailView,options:IR,onChange:S=>n({defaultDetailView:S})}),(0,h.jsx)(ro,{label:"Confirm destructive actions",desc:"Ask before clearing data, pins, or settings.",checked:a.confirmDestructiveActions,onChange:S=>n({confirmDestructiveActions:S})})]}),g==="capture"&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(oo,{label:"Capture"}),(0,h.jsx)(ro,{label:"Intercept fetch",desc:"Capture native fetch() requests from the page.",checked:a.captureFetch,onChange:S=>n({captureFetch:S})}),(0,h.jsx)(ro,{label:"Intercept XHR",desc:"Capture XMLHttpRequest calls from the page.",checked:a.captureXhr,onChange:S=>n({captureXhr:S})}),(0,h.jsx)(ro,{label:"Capture WebSocket & SSE",desc:"Stream WebSocket and Server-Sent Event frames into the timeline.",checked:a.captureWs,onChange:S=>n({captureWs:S})}),(0,h.jsx)(Jp,{label:"Max entries",desc:"Trim oldest entries after this limit.",value:a.maxEntries,min:50,max:5e3,step:50,suffix:"entries",onChange:S=>n({maxEntries:S})})]}),g==="session"&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(oo,{label:"Session"}),(0,h.jsx)(Dr,{label:"Captured data",desc:`${v.length} entries \xB7 ${w.length} console events \xB7 ${E.size} pinned.`}),(0,h.jsxs)("div",{className:"xray-settings-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:"Export session"}),(0,h.jsx)("small",{children:"Open the export modal for JSON, CSV, HAR, and per-request formats."})]}),(0,h.jsxs)("button",{className:"xray-btn",onClick:()=>{t(!1),p(!0)},children:[(0,h.jsx)(Ft,{...Ee}),"Export"]})]}),(0,h.jsxs)("div",{className:"xray-settings-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:"Clear API filters"}),(0,h.jsx)("small",{children:"Reset search, quick filters, method/status/source, sort, and grouping."})]}),(0,h.jsxs)("button",{className:"xray-btn",onClick:()=>{u(),c("API filters cleared.")},children:[(0,h.jsx)(Cr,{...Ee}),"Clear filters"]})]}),(0,h.jsxs)("div",{className:"xray-settings-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:"Clear pinned"}),(0,h.jsx)("small",{children:"Remove all pinned request markers."})]}),(0,h.jsxs)("button",{className:"xray-btn",onClick:()=>N("Clear pinned requests?","This removes all pinned request markers.","Clear pinned",()=>{x(),c("Pinned requests cleared.")}),children:[(0,h.jsx)(Mp,{...Ee}),"Clear pinned"]})]}),(0,h.jsxs)("div",{className:"xray-settings-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:"Clear console stream"}),(0,h.jsx)("small",{children:"Clear console UI events but keep captured API entries."})]}),(0,h.jsxs)("button",{className:"xray-btn",onClick:()=>N("Clear console stream?","This clears console UI events but keeps captured API entries.","Clear console",()=>{d(),c("Console stream cleared.")}),children:[(0,h.jsx)(Uo,{...Ee}),"Clear console"]})]})]}),g==="ai"&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(oo,{label:"AI (bring your own key)"}),(0,h.jsx)(Dr,{label:"Local & private",desc:"Your key is stored only in this browser's extension storage. XRAY calls the provider directly from the extension background \u2014 nothing is sent anywhere else."}),(0,h.jsx)(hs,{label:"Provider",desc:"Anthropic and OpenAI are built in. Custom works with any OpenAI-compatible endpoint \u2014 OpenRouter, Groq, Together, DeepSeek, Mistral, Azure, or a local Ollama or LM Studio server.",value:s.provider,options:["anthropic","openai","custom"],onChange:S=>{let P=S;i({provider:P,model:Nv[P][0]??""})}}),s.provider==="custom"?(0,h.jsx)(Pf,{label:"Model",desc:"Model name exactly as your endpoint expects it.",value:s.model,placeholder:"llama3.1:8b",onChange:S=>i({model:S})}):(0,h.jsx)(hs,{label:"Model",desc:"Model used for request explanations.",value:s.model,options:Nv[s.provider],onChange:S=>i({model:S})}),s.provider==="custom"&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(Pf,{label:"Endpoint",desc:"Base URL or full chat-completions URL. Must be https, except localhost for a local model server.",value:s.baseUrl,placeholder:"https://openrouter.ai/api/v1",onChange:S=>i({baseUrl:S})}),(0,h.jsx)(Pf,{label:"Auth header",desc:"Header carrying the key. Almost every provider uses authorization.",value:s.authHeader,placeholder:"authorization",onChange:S=>i({authHeader:S})}),(0,h.jsx)(Pf,{label:"Auth prefix",desc:"Text before the key. Usually 'Bearer ' \u2014 leave blank to send the key on its own.",value:s.authPrefix,placeholder:"Bearer ",onChange:S=>i({authPrefix:S})})]}),(0,h.jsxs)("div",{className:"xray-settings-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:"API key"}),(0,h.jsx)("small",{children:"Stored locally. Used only for Explain requests."})]}),(0,h.jsx)("input",{className:"xray-input",type:"password",value:s.apiKey,placeholder:"sk-...",onChange:S=>i({apiKey:S.currentTarget.value}),autoComplete:"off"})]})]}),g==="appearance"&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(oo,{label:"Appearance"}),(0,h.jsxs)("div",{className:"xray-settings-row xray-theme-picker-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:"Theme"}),(0,h.jsx)("small",{children:"Pick a preset, or build your own with full color freedom. Themes only restyle this panel \u2014 never the page or the extension."})]}),(0,h.jsxs)("div",{className:"xray-theme-grid",children:[yR.map(S=>(0,h.jsxs)("button",{className:`xray-theme-swatch ${a.theme===S.id?"active":""}`,style:{background:S.bg,color:S.text},onClick:()=>n(S.accentPref?{theme:S.id,accent:S.accentPref}:{theme:S.id}),"aria-pressed":a.theme===S.id,children:[(0,h.jsx)("span",{className:"xray-theme-swatch-dot",style:{background:S.accent}}),(0,h.jsx)("span",{className:"xray-theme-swatch-label",children:S.label}),a.theme===S.id&&(0,h.jsx)(as,{size:13,stroke:2.6})]},S.id)),(0,h.jsxs)("button",{className:`xray-theme-swatch ${a.theme==="custom"?"active":""}`,style:{background:a.customTheme.bg,color:a.customTheme.text},onClick:()=>n({theme:"custom"}),"aria-pressed":a.theme==="custom",children:[(0,h.jsx)("span",{className:"xray-theme-swatch-dot",style:{background:a.customTheme.accent}}),(0,h.jsx)("span",{className:"xray-theme-swatch-label",children:"Custom"}),a.theme==="custom"&&(0,h.jsx)(as,{size:13,stroke:2.6})]})]})]}),a.theme==="custom"&&(0,h.jsx)(SR,{}),(0,h.jsx)(hs,{label:"Font stack",desc:"Choose the code-first monospace stack used across tables, JSON, and console.",value:a.font,options:bR,onChange:S=>n({font:S})}),(0,h.jsx)(hs,{label:"Density",desc:"Control global spacing, row heights, and panel chrome.",value:a.density,options:vR,onChange:S=>n({density:S})}),(0,h.jsx)(kR,{label:"Corner radius",desc:"Roundness of cards, buttons, inputs, and drawers.",value:a.radius,min:0,max:20,step:1,suffix:"px",onChange:S=>n({radius:S})}),(0,h.jsx)(RR,{settings:a,onChange:S=>n({accent:S})}),(0,h.jsx)(ro,{label:"Operator glow",desc:"Enable subtle cyan/purple terminal glow and active-focus lighting.",checked:a.glow,onChange:S=>n({glow:S})}),(0,h.jsx)(ro,{label:"Hacker mode",desc:"CRT scanlines, vignette, a moving scan sweep, and phosphor glow. Close Settings to see it \u2014 it styles the panel behind this dialog. Respects reduced-motion.",checked:a.hacker,onChange:S=>{n({hacker:S}),c(S?"Hacker mode ON \u2014 close Settings to see the CRT.":"Hacker mode off.")}}),(0,h.jsx)(ro,{label:"Compact rows",desc:"Reduce request row height for dense API sessions.",checked:a.compactRows,onChange:S=>n({compactRows:S})}),(0,h.jsx)(ro,{label:"Show host in path column",desc:"Display request host below endpoint paths.",checked:a.showHostInPath,onChange:S=>n({showHostInPath:S})})]}),g==="console"&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(oo,{label:"Console"}),(0,h.jsx)(Jp,{label:"Slow threshold",desc:"Highlight requests above this in yellow.",value:a.slowThresholdMs,min:100,max:5e3,step:50,suffix:"ms",onChange:S=>n({slowThresholdMs:S})}),(0,h.jsx)(Jp,{label:"Very slow threshold",desc:"Reserved red threshold for heavier timing views.",value:a.verySlowThresholdMs,min:200,max:1e4,step:100,suffix:"ms",onChange:S=>n({verySlowThresholdMs:S})})]}),g==="decrypt"&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(oo,{label:"Decrypt"}),(0,h.jsx)(Dr,{label:"Runtime boundary",desc:"Decrypt bridge stays in the vanilla runtime. React only displays decrypted fields when the runtime provides them."}),(0,h.jsx)(Dr,{label:"Network access",desc:"No AI provider or remote analysis is used by this settings surface."})]}),g==="shortcuts"&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(oo,{label:"Shortcuts"}),(0,h.jsx)(qf,{keys:"Ctrl/\u2318 + Shift + X",label:"Toggle XRAY"}),(0,h.jsx)(qf,{keys:"Ctrl/\u2318 + K",label:"Open command palette"}),(0,h.jsx)(qf,{keys:"Ctrl/\u2318 + Shift + F",label:"Find in traffic (search bodies)"}),(0,h.jsx)(qf,{keys:"Esc",label:"Close modal or panel surface"})]}),g==="about"&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(oo,{label:"About"}),(0,h.jsx)(Dr,{label:"Version",desc:`XRAY ${gs} \xB7 built ${_f}`}),(0,h.jsx)(Dr,{label:"UI stack",desc:"React, TypeScript, Zustand, TanStack Virtual, and Tabler icons."}),(0,h.jsx)(Dr,{label:"Theme",desc:"Fully token-driven themes (5 presets + a custom Theme Studio) scoped to the panel via inline CSS variables."})]}),(0,h.jsxs)("div",{className:"xray-settings-danger",children:[(0,h.jsx)("div",{className:"xray-danger-title",children:"Danger zone"}),(0,h.jsxs)("button",{className:"xray-danger-row",onClick:D,children:[(0,h.jsx)("span",{children:"Clear all captured sessions"}),(0,h.jsx)(Uo,{...Ee})]}),(0,h.jsxs)("button",{className:"xray-danger-row",onClick:b,children:[(0,h.jsx)("span",{children:"Reset all settings to defaults"}),(0,h.jsx)(_n,{...Ee})]})]})]})]})})}function SR(){let e=I(m=>m.settings.customTheme),t=I(m=>m.settings.font),a=I(m=>m.settings.radius),o=I(m=>m.settings.hacker),r=I(m=>m.updateSettings),n=I(m=>m.showToast),[l,s]=(0,Yo.useState)(""),[i,f]=(0,Yo.useState)(!1),d=$i(e),x=Wl.filter(m=>zd(e,m)).length;function u(m){r({theme:"custom",customTheme:m})}function p(m,g){u({...e,[m]:g})}function v(m){let g={...e};delete g[m],u(g)}function w(){let m={bg:e.bg,surface:e.surface,text:e.text,accent:e.accent};u(m),n("Reverted every token to auto.")}function E(){ct(cI(e)),n("Theme CSS copied to clipboard.")}function y(){ct(dI({colors:e,font:t,radius:a,hacker:o})),n("Share code copied \u2014 colors, font, radius & effects included.")}function c(){let m=Wi(l);if(m){r(Zi(m)),s(""),f(!1),n("Theme imported.");return}let g=pI(l);if(!g){n("Could not read a theme from that text.");return}u(g),s(""),f(!1),n("Theme imported.")}return(0,h.jsxs)("div",{className:"xray-custom-theme",children:[(0,h.jsx)(wR,{theme:e}),(0,h.jsxs)("div",{className:"xray-custom-toolbar",children:[(0,h.jsxs)("button",{className:"xray-chip",onClick:()=>u(gr(e.accent,"dark")),title:"Build a dark theme around the current accent",children:[(0,h.jsx)(Er,{...Ee}),"Dark from accent"]}),(0,h.jsxs)("button",{className:"xray-chip",onClick:()=>u(gr(e.accent,"light")),title:"Build a light theme around the current accent",children:[(0,h.jsx)(Er,{...Ee}),"Light from accent"]}),(0,h.jsxs)("button",{className:"xray-chip",onClick:()=>u(Ki(Math.random())),title:"Roll a coherent random theme",children:[(0,h.jsx)(ns,{...Ee}),"Surprise me"]}),(0,h.jsx)("span",{className:"xray-spacer"}),(0,h.jsxs)("button",{className:"xray-chip",onClick:y,title:"Copy a portable share code (colors + font + radius + effects)",children:[(0,h.jsx)(Bp,{...Ee}),"Share"]}),(0,h.jsxs)("button",{className:"xray-chip",onClick:E,title:"Copy this theme as CSS variables",children:[(0,h.jsx)(ut,{...Ee}),"CSS"]}),(0,h.jsxs)("button",{className:"xray-chip",onClick:()=>f(m=>!m),title:"Paste a theme to load",children:[(0,h.jsx)(os,{...Ee}),"Import"]})]}),i&&(0,h.jsxs)("div",{className:"xray-custom-import",children:[(0,h.jsx)("textarea",{className:"xray-input xray-custom-import-field",placeholder:'Paste a share code (xray1:\u2026), JSON { "bg": "#\u2026" }, or an exported --xray-* CSS block',value:l,spellCheck:!1,onChange:m=>s(m.currentTarget.value)}),(0,h.jsx)("button",{className:"xray-btn primary",onClick:c,children:"Load theme"})]}),(0,h.jsx)(CR,{theme:e}),(0,h.jsxs)("div",{className:"xray-custom-presets",children:[(0,h.jsx)("span",{className:"xray-custom-presets-label",children:"Start from"}),hR.map(m=>(0,h.jsxs)("button",{className:"xray-chip",onClick:()=>u(m.theme),children:[(0,h.jsx)("span",{className:"xray-custom-preset-dot",style:{background:m.theme.accent}}),m.label]},m.label))]}),gR.map(m=>(0,h.jsxs)("div",{className:"xray-custom-group",children:[(0,h.jsxs)("div",{className:"xray-custom-group-head",children:[(0,h.jsx)("span",{className:"xray-custom-group-title",children:m.title}),(0,h.jsx)("span",{className:"xray-custom-group-hint",children:m.hint})]}),(0,h.jsx)("div",{className:"xray-custom-grid",children:m.fields.map(g=>(0,h.jsx)(AR,{label:g.label,value:d[g.key],overridden:zd(e,g.key),onChange:k=>p(g.key,k),onReset:()=>v(g.key),onCopy:()=>{ct(d[g.key]),n(`Copied ${d[g.key]}`)}},g.key))})]},m.title)),(0,h.jsxs)("div",{className:"xray-custom-footnote",children:[(0,h.jsx)("span",{children:x>0?`${x} token${x===1?"":"s"} pinned \xB7 the rest auto-derive from your base colors.`:"Every token auto-derives from your four base colors \u2014 pin any swatch for full control."}),x>0&&(0,h.jsxs)("button",{className:"xray-chip",onClick:w,title:"Revert every token to auto-derived",children:[(0,h.jsx)(Rf,{...Ee}),"Reset all to auto"]})]}),(0,h.jsx)("p",{className:"xray-custom-note",children:"Themes are applied as inline CSS variables on this panel only \u2014 they never touch the page or the extension's capture runtime."})]})}function wR({theme:e}){let t=Ir(e);return(0,h.jsxs)("div",{className:"xray-theme-preview",style:t,"aria-label":"Live theme preview",children:[(0,h.jsxs)("div",{className:"xray-tp-bar",children:[(0,h.jsx)("span",{className:"xray-tp-dot"}),(0,h.jsx)("span",{className:"xray-tp-brand",children:"CONSOLE"}),(0,h.jsx)("span",{className:"xray-tp-tab active",children:"Network"}),(0,h.jsx)("span",{className:"xray-tp-tab",children:"Console"}),(0,h.jsx)("span",{className:"xray-tp-grow"}),(0,h.jsx)("span",{className:"xray-tp-btn",children:"Explain"})]}),(0,h.jsxs)("div",{className:"xray-tp-rows",children:[(0,h.jsxs)("div",{className:"xray-tp-row",children:[(0,h.jsx)("span",{className:"xray-tp-method get",children:"GET"}),(0,h.jsx)("span",{className:"xray-tp-path",children:"/api/users"}),(0,h.jsx)("span",{className:"xray-tp-code ok",children:"200"})]}),(0,h.jsxs)("div",{className:"xray-tp-row selected",children:[(0,h.jsx)("span",{className:"xray-tp-method post",children:"POST"}),(0,h.jsx)("span",{className:"xray-tp-path",children:"/api/session/login"}),(0,h.jsx)("span",{className:"xray-tp-code warn",children:"302"})]}),(0,h.jsxs)("div",{className:"xray-tp-row",children:[(0,h.jsx)("span",{className:"xray-tp-method delete",children:"DELETE"}),(0,h.jsx)("span",{className:"xray-tp-path",children:"/api/cart/item"}),(0,h.jsx)("span",{className:"xray-tp-code err",children:"500"})]})]}),(0,h.jsxs)("div",{className:"xray-tp-badges",children:[(0,h.jsx)("span",{className:"xray-tp-badge green",children:"success"}),(0,h.jsx)("span",{className:"xray-tp-badge yellow",children:"slow"}),(0,h.jsx)("span",{className:"xray-tp-badge red",children:"error"}),(0,h.jsx)("span",{className:"xray-tp-badge blue",children:"info"}),(0,h.jsx)("span",{className:"xray-tp-badge mauve",children:"graphql"})]})]})}function CR({theme:e}){let t=$i(e),a=[{label:"Text on background",ratio:hr(t.text,t.bg)},{label:"Muted on background",ratio:hr(t.subtext,t.bg)},{label:"Text on surface",ratio:hr(t.text,t.surface)},{label:"Text on elevated",ratio:hr(t.text,t.surface2)},{label:"Accent on background",ratio:hr(t.accent,t.bg)},{label:"Text on accent",ratio:hr(t.text,t.accent)}];return(0,h.jsxs)("div",{className:"xray-contrast","aria-label":"WCAG contrast","aria-live":"polite",children:[(0,h.jsx)("span",{className:"xray-contrast-title",children:"Contrast"}),a.map(o=>{let r=uI(o.ratio),n=r==="Fail"?"fail":r==="AA Large"?"warn":"ok";return(0,h.jsxs)("div",{className:"xray-contrast-row",children:[(0,h.jsx)("span",{className:"xray-contrast-label",children:o.label}),(0,h.jsxs)("strong",{children:[o.ratio.toFixed(2),":1"]}),(0,h.jsx)("span",{className:`xray-contrast-grade ${n}`,children:r})]},o.label)})]})}function kR({label:e,desc:t,value:a,min:o,max:r,step:n,suffix:l,onChange:s}){return(0,h.jsxs)("label",{className:"xray-settings-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:e}),(0,h.jsx)("small",{children:t})]}),(0,h.jsxs)("span",{className:"xray-range-control",children:[(0,h.jsx)("input",{type:"range",className:"xray-range",value:a,min:o,max:r,step:n,onChange:i=>s(Number(i.currentTarget.value))}),(0,h.jsxs)("small",{className:"xray-range-value",children:[a,l]})]})]})}function AR({label:e,value:t,overridden:a,onChange:o,onReset:r,onCopy:n}){let[l,s]=(0,Yo.useState)(t);Yo.default.useEffect(()=>{s(t)},[t]);function i(d){s(d);let x=Ze(d,"");x&&o(x)}async function f(){let d=window.EyeDropper;if(d)try{let x=await new d().open();x?.sRGBHex&&o(x.sRGBHex)}catch{}}return(0,h.jsxs)("div",{className:`xray-token-field ${a?"pinned":"auto"}`,children:[(0,h.jsx)("input",{type:"color",className:"xray-color-input",value:Ze(t,"#000000"),onChange:d=>{s(d.currentTarget.value),o(d.currentTarget.value)},"aria-label":`${e} color`}),(0,h.jsxs)("span",{className:"xray-token-meta",children:[(0,h.jsxs)("span",{className:"xray-token-label",children:[e,(0,h.jsx)("span",{className:"xray-token-state",children:a?"pinned":"auto"})]}),(0,h.jsx)("input",{className:`xray-input xray-custom-hex ${Tn(l)?"":"invalid"}`,value:l,spellCheck:!1,maxLength:7,onChange:d=>i(d.currentTarget.value),onBlur:()=>s(t),"aria-label":`${e} hex`})]}),(0,h.jsxs)("span",{className:"xray-token-actions",children:[mR&&(0,h.jsx)("button",{type:"button",className:"xray-token-btn",onClick:f,title:`Pick ${e} from screen`,"aria-label":`Pick ${e} color from screen`,children:(0,h.jsx)(fp,{size:14,stroke:1.8})}),(0,h.jsx)("button",{type:"button",className:"xray-token-btn",onClick:n,title:`Copy ${e} hex`,"aria-label":`Copy ${e} hex`,children:(0,h.jsx)(ut,{size:14,stroke:1.8})}),(0,h.jsx)("button",{type:"button",className:"xray-token-reset",onClick:r,disabled:!a,title:a?`Revert ${e} to auto`:`${e} is auto-derived`,"aria-label":`Revert ${e} to auto`,children:(0,h.jsx)(Rf,{size:14,stroke:1.8})})]})]})}function oo({label:e}){return(0,h.jsx)("div",{className:"xray-settings-section-title",children:e})}function ro({label:e,desc:t,checked:a,onChange:o}){return(0,h.jsxs)("div",{className:"xray-settings-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:e}),(0,h.jsx)("small",{children:t})]}),(0,h.jsx)("button",{className:`xray-toggle ${a?"on":""}`,"aria-label":e,"aria-pressed":a,onClick:()=>o(!a)})]})}function Jp({label:e,desc:t,value:a,min:o,max:r,step:n,suffix:l,onChange:s}){return(0,h.jsxs)("label",{className:"xray-settings-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:e}),(0,h.jsx)("small",{children:t})]}),(0,h.jsxs)("span",{className:"xray-number-input",children:[(0,h.jsx)("input",{type:"number",value:a,min:o,max:r,step:n,onChange:i=>s(Number(i.currentTarget.value))}),(0,h.jsx)("small",{children:l})]})]})}function hs({label:e,desc:t,value:a,options:o,onChange:r}){return(0,h.jsxs)("label",{className:"xray-settings-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:e}),(0,h.jsx)("small",{children:t})]}),(0,h.jsx)("select",{className:"xray-select",value:a,onChange:n=>r(n.currentTarget.value),children:o.map(n=>(0,h.jsx)("option",{value:n,children:n},n))})]})}function Pf({label:e,desc:t,value:a,placeholder:o,onChange:r}){return(0,h.jsxs)("label",{className:"xray-settings-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:e}),(0,h.jsx)("small",{children:t})]}),(0,h.jsx)("input",{className:"xray-input",type:"text",value:a,placeholder:o,spellCheck:!1,autoComplete:"off",autoCapitalize:"off",onChange:n=>r(n.currentTarget.value)})]})}function RR({settings:e,onChange:t}){return(0,h.jsxs)("div",{className:"xray-settings-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:"Accent color"}),(0,h.jsx)("small",{children:"Selections, active states, and primary actions."})]}),(0,h.jsx)("div",{className:"xray-color-row",children:Object.keys(qd).map(a=>(0,h.jsx)("button",{className:`xray-color-swatch ${e.accent===a?"active":""}`,"aria-label":`Use ${a} accent`,"aria-pressed":e.accent===a,style:{background:Fn({...e,accent:a})},onClick:()=>t(a)},a))})]})}function Dr({label:e,desc:t}){return(0,h.jsx)("div",{className:"xray-settings-row read-only",children:(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:e}),(0,h.jsx)("small",{children:t})]})})}function qf({keys:e,label:t}){return(0,h.jsxs)("div",{className:"xray-settings-row",children:[(0,h.jsx)("span",{children:(0,h.jsx)("strong",{children:t})}),(0,h.jsx)("kbd",{children:e})]})}var Yo,h,Ee,mR,xR,Nv,yR,gR,hR,IR,bR,vR,Ov=T(()=>{"use strict";Yo=_(ze());qe();$e();Dn();br();Ae();$p();Vo();h=_(j()),Ee={size:16,stroke:1.8},mR=typeof window<"u"&&"EyeDropper"in window,xR=[{id:"general",label:"General",icon:(0,h.jsx)(ep,{...Ee})},{id:"capture",label:"Capture",icon:(0,h.jsx)(kr,{...Ee})},{id:"session",label:"Session",icon:(0,h.jsx)(qo,{...Ee})},{id:"appearance",label:"Appearance",icon:(0,h.jsx)(Ar,{...Ee})},{id:"console",label:"Console",icon:(0,h.jsx)(rt,{...Ee})},{id:"ai",label:"AI",icon:(0,h.jsx)(eo,{...Ee})},{id:"decrypt",label:"Decrypt",icon:(0,h.jsx)(Ap,{...Ee})},{id:"shortcuts",label:"Shortcuts",icon:(0,h.jsx)(bp,{...Ee})},{id:"about",label:"About",icon:(0,h.jsx)(hp,{...Ee})}],Nv={anthropic:["claude-opus-5","claude-sonnet-5","claude-fable-5","claude-haiku-4-5-20251001"],openai:["gpt-4o","gpt-4o-mini","gpt-4.1"],custom:[]},yR=[{id:"operator",label:"Operator",bg:"#0b0f14",accent:"#37d5ff",text:"#d8e2ef"},{id:"dev-edition",label:"Dev",bg:"#11131f",accent:"#b18cff",text:"#e1e7ff"},{id:"midnight",label:"Midnight",bg:"#05070a",accent:"#00e5ff",text:"#d7f7ff"},{id:"light-lab",label:"Light",bg:"#edf3fb",accent:"#006adc",text:"#172033"},{id:"claude",label:"Claude",bg:"#f0eee6",accent:"#d97757",text:"#23221f",accentPref:"coral"}],gR=[{title:"Base",hint:"Canvas and stacked surfaces",fields:[{key:"bg",label:"Background"},{key:"surface",label:"Surface"},{key:"surface2",label:"Elevated"},{key:"surface3",label:"Overlay"}]},{title:"Foreground",hint:"Text ramp and separators",fields:[{key:"text",label:"Text"},{key:"subtext",label:"Muted"},{key:"hint",label:"Faint"},{key:"border",label:"Border"}]},{title:"Accent",hint:"Selections and primary actions",fields:[{key:"accent",label:"Accent"}]},{title:"Status",hint:"Method, status, and severity colors",fields:[{key:"green",label:"Success"},{key:"red",label:"Error"},{key:"yellow",label:"Warning"},{key:"blue",label:"Info"},{key:"mauve",label:"Accent 2"},{key:"teal",label:"Teal"},{key:"peach",label:"Peach"}]}],hR=[{label:"Slate",theme:{bg:"#0f1117",surface:"#171a23",text:"#e7e9f0",accent:"#7c5cff"}},{label:"Graphite",theme:{bg:"#0e0e10",surface:"#19191c",text:"#ededed",accent:"#22d3ee"}},{label:"Ros\xE9",theme:{bg:"#1a1114",surface:"#241519",text:"#f4e9ec",accent:"#fb7185"}},{label:"Emerald",theme:{bg:"#0b1210",surface:"#131c19",text:"#e6f0ec",accent:"#34d399"}},{label:"Nord",theme:{bg:"#2e3440",surface:"#3b4252",text:"#eceff4",accent:"#88c0d0"}},{label:"Solarized",theme:{bg:"#002b36",surface:"#073642",text:"#eee8d5",accent:"#268bd2"}},{label:"Amber",theme:{bg:"#161207",surface:"#211a0c",text:"#f6ecd6",accent:"#f5a623"}},{label:"Sakura",theme:{bg:"#1c141a",surface:"#281b26",text:"#f6e9f1",accent:"#ec4899"}},{label:"Paper",theme:{bg:"#faf9f6",surface:"#ffffff",text:"#1c1b19",accent:"#2563eb"}},{label:"Sky",theme:{bg:"#eef4fb",surface:"#ffffff",text:"#16273b",accent:"#0284c7"}},{label:"Sage",theme:{bg:"#eef2ec",surface:"#fbfdfa",text:"#1e2a20",accent:"#3f8a4f"}}],IR=["tree","raw","grid","schema","diff","waterfall","viz","headers"],bR=["jetbrains","cascadia","iosevka","system"],vR=["compact","comfortable","spacious"]});function TR(e){return!e||typeof e!="object"?"":Object.entries(e).filter(([,t])=>String(t)!=="[redacted]").map(([t,a])=>`${t}: ${a}`).join(`
`)}function ER(e){let t={};return e.split(`
`).forEach(a=>{let o=a.indexOf(":");if(o<=0)return;let r=a.slice(0,o).trim(),n=a.slice(o+1).trim();r&&(t[r]=n)}),t}function FR(e){return e.requestBody==null?"":typeof e.requestBody=="string"?e.requestBody:Z(e.requestBody,2,1e5)}function zv(){let e=I(p=>p.replayEditorEntry),t=I(p=>p.closeReplayEditor),a=I(p=>p.replayEntry),o=(0,no.useMemo)(()=>e?{method:String(e.method||"GET").toUpperCase(),url:String(e.url||e.urlPath||""),headers:TR(e.requestHeaders),body:FR(e)}:null,[e]),[r,n]=(0,no.useState)("GET"),[l,s]=(0,no.useState)(""),[i,f]=(0,no.useState)(""),[d,x]=(0,no.useState)("");if(no.default.useEffect(()=>{o&&(n(o.method),s(o.url),f(o.headers),x(o.body))},[o]),!e||!o)return null;function u(){if(!e)return;let p=En(d);a(e,{method:r,url:l,requestHeaders:ER(i),requestBody:p}),t()}return(0,De.jsx)(Dt,{title:"Edit & Replay",subtitle:`${e.method||"GET"} ${ne(e)}`,icon:(0,De.jsx)(Ja,{...Lv}),className:"xray-replay-modal",onClose:t,footer:(0,De.jsxs)(De.Fragment,{children:[(0,De.jsx)("span",{className:"xray-muted",children:"Replays run from the inspected page and are recaptured as new entries."}),(0,De.jsx)("span",{className:"xray-spacer"}),(0,De.jsx)("button",{className:"xray-btn",onClick:t,children:"Cancel"}),(0,De.jsxs)("button",{className:"xray-btn primary",onClick:u,children:[(0,De.jsx)(Mr,{...Lv}),"Send replay"]})]}),children:(0,De.jsxs)("div",{className:"xray-replay-body",children:[(0,De.jsxs)("div",{className:"xray-replay-line",children:[(0,De.jsx)("select",{className:"xray-select",value:r,onChange:p=>n(p.currentTarget.value),children:MR.map(p=>(0,De.jsx)("option",{value:p,children:p},p))}),(0,De.jsx)("input",{className:"xray-input",value:l,onChange:p=>s(p.currentTarget.value),placeholder:"https://api.example.com/endpoint"})]}),(0,De.jsxs)("label",{className:"xray-field",children:[(0,De.jsx)("span",{children:"Headers (one per line)"}),(0,De.jsx)("textarea",{className:"xray-input xray-replay-headers",spellCheck:!1,value:i,onChange:p=>f(p.currentTarget.value),placeholder:"content-type: application/json"})]}),(0,De.jsxs)("label",{className:"xray-field",children:[(0,De.jsx)("span",{children:"Body"}),(0,De.jsx)("textarea",{className:"xray-input xray-replay-bodyfield",spellCheck:!1,value:d,onChange:p=>x(p.currentTarget.value),placeholder:'{ "key": "value" }'})]})]})})}var no,De,Lv,MR,Hv=T(()=>{"use strict";no=_(ze());qe();$e();Vo();Gt();Ae();De=_(j()),Lv={size:16,stroke:1.8},MR=["GET","POST","PUT","PATCH","DELETE","HEAD"]});function _v(e,t){let a={method:e.method,url:e.url||e.urlPath,status:e.status,durationMs:Math.round(Number(e.duration)||0),graphql:e.graphql||void 0,requestHeaders:e.requestHeaders,requestBody:sa(e),response:se(e),recentSameEndpoint:t.slice(0,4).map(o=>({status:o.status,durationMs:Math.round(Number(o.duration)||0),timestamp:o.timestamp}))};return["You are an API debugging assistant embedded in a browser devtools extension.","Analyze this captured HTTP request and its response. Be concise and specific.","Explain: (1) what this call does, (2) whether it succeeded or failed and why,","(3) anything notable in the payload or timing, and (4) one concrete next step for the developer.","","Captured request:",Z(a,2,4e4)].join(`
`)}async function Pv(e,t){if(!e.apiKey)return{ok:!1,error:"Add an API key in Settings \u2192 AI to enable explanations."};if(typeof chrome>"u"||!chrome?.runtime?.sendMessage)return{ok:!1,error:"AI explanations require the extension runtime (open XRAY on an inspected page)."};let a=chrome?.runtime,o=a?.sendMessage;return!a||!o?{ok:!1,error:"AI explanations require the extension runtime (open XRAY on an inspected page)."}:new Promise(r=>{try{o({type:"xray:ai-explain",settings:e,prompt:t},n=>{let l=a.lastError;if(l){r({ok:!1,error:l.message||"AI request failed"});return}r(n||{ok:!1,error:"No response from AI provider."})})}catch(n){r({ok:!1,error:n instanceof Error?n.message:String(n)})}})}function qv(e,t){let a=ne(e);return t.filter(o=>o.id!==e.id&&o.type==="api"&&ne(o)===a)}var Uv=T(()=>{"use strict";Gt();Ae()});function Xv(){let e=I(u=>u.explainEntry),t=I(u=>u.closeExplain),a=I(u=>u.entries),o=I(u=>u.aiSettings),r=I(u=>u.setSettingsOpen),[n,l]=(0,Gn.useState)(!1),[s,i]=(0,Gn.useState)(null),[f,d]=(0,Gn.useState)(null);if(Gn.default.useEffect(()=>{if(!e)return;let u=!1;if(i(null),d(null),!o.apiKey){d("Add an API key in Settings \u2192 AI to enable explanations.");return}l(!0);let p=_v(e,qv(e,a));return Pv(o,p).then(v=>{u||(l(!1),v.ok&&v.text?i(v.text):d(v.error||"AI request failed."))}),()=>{u=!0}},[e?.id]),!e)return null;function x(){t(),r(!0)}return(0,Xe.jsx)(Dt,{title:"Explain with AI",subtitle:`${e.method||"GET"} ${ne(e)}`,icon:(0,Xe.jsx)(eo,{...em}),className:"xray-explain-modal",onClose:t,footer:(0,Xe.jsxs)(Xe.Fragment,{children:[(0,Xe.jsxs)("span",{className:"xray-muted",children:[o.provider," \xB7 ",o.model]}),(0,Xe.jsx)("span",{className:"xray-spacer"}),s&&(0,Xe.jsxs)("button",{className:"xray-btn",onClick:()=>{ct(s)},children:[(0,Xe.jsx)(ut,{...em}),"Copy"]}),(0,Xe.jsx)("button",{className:"xray-btn",onClick:t,children:"Close"})]}),children:(0,Xe.jsxs)("div",{className:"xray-explain-body",children:[n&&(0,Xe.jsxs)("div",{className:"xray-explain-loading",children:[(0,Xe.jsx)("span",{className:"xray-spinner"}),"Analyzing request\u2026"]}),f&&(0,Xe.jsxs)("div",{className:"xray-explain-error",children:[(0,Xe.jsx)(Wa,{...em}),(0,Xe.jsxs)("div",{children:[(0,Xe.jsx)("p",{children:f}),(0,Xe.jsx)("button",{className:"xray-btn",onClick:x,children:"Open AI settings"})]})]}),s&&(0,Xe.jsx)("div",{className:"xray-explain-result",children:s})]})})}var Gn,Xe,em,Gv=T(()=>{"use strict";Gn=_(ze());qe();$e();Vo();Gt();Uv();Ae();Xe=_(j()),em={size:16,stroke:1.8}});function tm(e,t){let a=e.trim().toLowerCase();if(!a)return{score:1,ranges:[]};let o=t.toLowerCase();if(o.includes(a)){let i=o.indexOf(a);return{score:120+(i===0||jv.test(o[i-1])?40:0)-i-Math.max(0,o.length-a.length)*.2,ranges:[[i,i+a.length]]}}let r=0,n=0,l=-2,s=[];for(let i=0;i<o.length&&r<a.length;i+=1){if(o[i]!==a[r])continue;n+=l===i-1?6:1,(i===0||jv.test(o[i-1]))&&(n+=10);let f=s[s.length-1];f&&f[1]===i?f[1]=i+1:s.push([i,i+1]),l=i,r+=1}return r<a.length?null:(n+=Math.max(0,18-o.length/4),{score:n,ranges:s})}function Vv(e,t){if(!t.length)return[{text:e,match:!1}];let a=[],o=0;for(let[r,n]of t)r>o&&a.push({text:e.slice(o,r),match:!1}),a.push({text:e.slice(r,n),match:!0}),o=n;return o<e.length&&a.push({text:e.slice(o),match:!1}),a}var jv,Yv=T(()=>{"use strict";jv=/[\s\-_/.:]/});function Kv(){let e=I(O=>O.commandOpen),t=I(O=>O.setCommandOpen),a=I(O=>O.setActiveTab),o=I(O=>O.setExportOpen),r=I(O=>O.setGlobalSearchOpen),n=I(O=>O.openSettings),l=I(O=>O.clearConsole),s=I(O=>O.clearApiFilters),i=I(O=>O.clearEntries),f=I(O=>O.insertConsoleCommand),d=I(O=>O.requestConfirmation),x=I(O=>O.entries),u=I(O=>O.selectedId),p=I(O=>O.selectEntry),v=I(O=>O.replayEntry),w=I(O=>O.openReplayEditor),E=I(O=>O.openExplain),y=I(O=>O.updateSettings),c=I(O=>O.settings.customTheme),m=I(O=>O.settings.hacker),g=I(O=>O.showToast),[k,N]=(0,Yt.useState)(""),[b,D]=(0,Yt.useState)(0),S=(0,Yt.useRef)(null),P=u&&x.find(O=>O.id===u)||null,le=(0,Yt.useMemo)(()=>{let O=[];if(P){let K=`${P.method||"GET"} ${ne(P)}`;O.push({id:"sel-replay",label:`Replay ${K}`,group:"Selection",icon:(0,X.jsx)(Ja,{...J}),run:()=>v(P)},{id:"sel-edit",label:`Edit & replay ${K}`,group:"Selection",icon:(0,X.jsx)(Ja,{...J}),run:()=>w(P)},{id:"sel-explain",label:`Explain ${K}`,group:"Selection",icon:(0,X.jsx)(eo,{...J}),run:()=>E(P)})}return Fr.map(K=>O.push({id:`tab-${K.id}`,label:`Go to ${K.label}`,group:"Go to",icon:K.icon,run:()=>a(K.id)})),O.push({id:"export",label:"Export session",group:"Actions",icon:(0,X.jsx)(Ft,{...J}),run:()=>o(!0)},{id:"find",label:"Find in traffic (bodies, headers, URLs)",group:"Actions",icon:(0,X.jsx)(ot,{...J}),keywords:"search grep regex response body header ctrl shift f",run:()=>r(!0)},{id:"appearance",label:"Open Theme Studio",group:"Appearance",icon:(0,X.jsx)(Ar,{...J}),keywords:"theme color radius",run:()=>n("appearance")},{id:"settings",label:"Open Settings",group:"Actions",icon:(0,X.jsx)(Tr,{...J}),run:()=>n("general")},{id:"insights",label:"Open Insights",group:"Actions",icon:(0,X.jsx)(wr,{...J}),run:()=>a("insights")},{id:"clear-filters",label:"Reset API filters",group:"Actions",icon:(0,X.jsx)(Cr,{...J}),run:s},{id:"clear-console",label:"Clear console stream",group:"Actions",icon:(0,X.jsx)(Ef,{...J}),run:()=>d({title:"Clear console stream?",message:"This clears console UI events but keeps captured API requests.",confirmLabel:"Clear console",tone:"danger",onConfirm:l})},{id:"clear-all",label:"Clear all captured entries",group:"Actions",icon:(0,X.jsx)(Ef,{...J}),run:()=>d({title:"Clear all captured entries?",message:"This removes requests, logs, console events, and pins.",confirmLabel:"Clear all",tone:"danger",onConfirm:i})},{id:"theme-random",label:"Randomize theme",group:"Appearance",icon:(0,X.jsx)(ns,{...J}),keywords:"surprise color",run:()=>{y({theme:"custom",customTheme:Ki(Math.random())}),g("Rolled a fresh theme.")}},{id:"theme-dark",label:"Custom theme: dark from accent",group:"Appearance",icon:(0,X.jsx)(Er,{...J}),run:()=>y({theme:"custom",customTheme:gr(c.accent,"dark")})},{id:"theme-light",label:"Custom theme: light from accent",group:"Appearance",icon:(0,X.jsx)(Er,{...J}),run:()=>y({theme:"custom",customTheme:gr(c.accent,"light")})},{id:"hacker",label:m?"Turn off hacker mode":"Turn on hacker mode",group:"Appearance",icon:(0,X.jsx)(zn,{...J}),keywords:"crt scanline",run:()=>{y({hacker:!m}),g(m?"Hacker mode off.":"Hacker mode on \u2014 close this to see it.")}},{id:"cmd-errors",label:"Prepare $errors()",group:"Console",icon:(0,X.jsx)(rt,{...J}),run:()=>f("$errors()")},{id:"cmd-slow",label:"Prepare $slow(500)",group:"Console",icon:(0,X.jsx)(rt,{...J}),run:()=>f("$slow(500)")},{id:"cmd-schema",label:"Prepare schema(res)",group:"Console",icon:(0,X.jsx)(rt,{...J}),run:()=>f("schema(res)")},{id:"cmd-diff",label:"Prepare diff(prev, res)",group:"Console",icon:(0,X.jsx)(rt,{...J}),run:()=>f("diff(prev, res)")}),O},[s,l,i,c,m,f,E,w,n,v,d,P,a,o,r,g,y]),dt=(0,Yt.useMemo)(()=>x.slice(-300).reverse().map(O=>{let K=ne(O),Le=String(O.method||O.logLevel||"GET").toUpperCase();return{id:`req-${O.id}`,label:`${Le} ${K}`,group:"Requests",icon:(0,X.jsx)("span",{className:`xray-cmd-method ${fa(O.method)}`,children:Le.slice(0,4)}),hint:O.status?String(O.status):void 0,keywords:`${O.url||""} ${O.status||""}`,run:()=>{p(O.id),a(O.type==="api"?"api":"logs")}}}),[x,p,a]),pt=(0,Yt.useMemo)(()=>{let O=k.trim(),K=(B,de)=>{let gt=Qv.indexOf(B.command.group),so=Qv.indexOf(de.command.group),z=gt<0?99:gt,Re=so<0?99:so;return z!==Re?z-Re:de.score-B.score};if(!O){let B=le.filter(gt=>gt.group!=="Requests"),de=dt.slice(0,5);return[...B,...de].map(gt=>({command:gt,ranges:[],score:0})).sort(K)}let Le=[...le,...dt],L=[];for(let B of Le){let de=tm(O,B.label);if(de){L.push({command:B,ranges:de.ranges,score:de.score+25});continue}let gt=tm(O,`${B.group} ${B.keywords||""}`);gt&&L.push({command:B,ranges:[],score:gt.score})}return L.sort(K).slice(0,60)},[le,k,dt]);Yt.default.useEffect(()=>{D(0)},[k,e]),Yt.default.useEffect(()=>{if(!e){N("");return}},[e]),Yt.default.useEffect(()=>{S.current?.querySelector(`[data-cmd-index="${b}"]`)?.scrollIntoView({block:"nearest"})},[b]);function lo(O){let K=pt[O];K&&(K.command.run(),t(!1))}function Qo(O){O.key==="ArrowDown"?(O.preventDefault(),D(K=>(K+1)%Math.max(1,pt.length))):O.key==="ArrowUp"?(O.preventDefault(),D(K=>(K-1+pt.length)%Math.max(1,pt.length))):O.key==="Enter"?(O.preventDefault(),lo(b)):O.key==="Home"?(O.preventDefault(),D(0)):O.key==="End"&&(O.preventDefault(),D(pt.length-1))}if(!e)return null;let ha=[];return pt.forEach((O,K)=>{let Le=ha[ha.length-1];Le&&Le.group===O.command.group?Le.items.push({scored:O,index:K}):ha.push({group:O.command.group,items:[{scored:O,index:K}]})}),(0,X.jsxs)(Dt,{title:"Command center",subtitle:"Jump anywhere \xB7 run actions \xB7 find requests",icon:(0,X.jsx)(zn,{...J}),className:"xray-command-modal",onClose:()=>t(!1),children:[(0,X.jsxs)("label",{className:"xray-search xray-command-search",children:[(0,X.jsx)(ot,{...J}),(0,X.jsx)("input",{className:"xray-input",autoFocus:!0,value:k,onChange:O=>N(O.currentTarget.value),onKeyDown:Qo,placeholder:"Type a command, tab, or search captured requests\u2026"})]}),(0,X.jsxs)("div",{className:"xray-modal-body xray-command-list",ref:S,children:[pt.length===0&&(0,X.jsxs)("div",{className:"xray-command-empty",children:[(0,X.jsx)(ot,{size:20,stroke:1.6}),(0,X.jsxs)("span",{children:["No matches for \u201C",k,"\u201D"]}),(0,X.jsx)("small",{children:"Try a tab name, an action, or part of a request path."})]}),ha.map(O=>(0,X.jsxs)("div",{className:"xray-command-group",children:[(0,X.jsx)("div",{className:"xray-command-group-label",children:O.group}),O.items.map(({scored:K,index:Le})=>(0,X.jsxs)("button",{"data-cmd-index":Le,className:`xray-command-row ${Le===b?"active":""}`,onMouseMove:()=>D(Le),onClick:()=>lo(Le),children:[(0,X.jsx)("span",{className:"xray-command-icon",children:K.command.icon}),(0,X.jsx)("span",{className:"xray-command-label",children:Vv(K.command.label,K.ranges).map((L,B)=>L.match?(0,X.jsx)("mark",{children:L.text},B):(0,X.jsx)("span",{children:L.text},B))}),K.command.hint&&(0,X.jsx)("span",{className:`xray-command-hint ${Xt(Number(K.command.hint))}`,children:K.command.hint}),Le===b&&(0,X.jsx)(ts,{size:14,stroke:2,className:"xray-command-enter"})]},K.command.id))]},O.group))]}),(0,X.jsxs)("div",{className:"xray-command-foot",children:[(0,X.jsxs)("span",{children:[(0,X.jsx)("kbd",{children:"\u2191"}),(0,X.jsx)("kbd",{children:"\u2193"})," navigate"]}),(0,X.jsxs)("span",{children:[(0,X.jsx)("kbd",{children:"\u21B5"})," run"]}),(0,X.jsxs)("span",{children:[(0,X.jsx)("kbd",{children:"esc"})," close"]}),(0,X.jsx)("span",{className:"xray-spacer"}),(0,X.jsxs)("span",{children:[pt.length," result",pt.length===1?"":"s"]})]})]})}var Yt,X,Qv,Zv=T(()=>{"use strict";Yt=_(ze());qe();$e();xs();Vo();Yv();br();Gt();Ae();X=_(j()),Qv=["Selection","Go to","Requests","Actions","Appearance","Console"]});function NR(e){let t=[],a=(l,s)=>{s&&t.push([l,s.length>am?s.slice(0,am):s])},o=l=>typeof l=="string"?l:Z(l,0,am);a("Method",e.method?String(e.method).toUpperCase():""),a("URL",String(e.url||e.urlPath||"")),e.status&&a("Status",String(e.status)),e.requestHeaders&&typeof e.requestHeaders=="object"&&a("Request headers",o(e.requestHeaders));let r=sa(e);r!=null&&a("Request body",o(r)),e.responseHeaders&&typeof e.responseHeaders=="object"&&a("Response headers",o(e.responseHeaders));let n=se(e);return n!=null&&a("Response body",o(n)),e.message&&a("Message",String(e.message)),t}function BR(e,t,a,o,r){if(o){o.lastIndex=0;let s=o.exec(e);return s?{index:s.index,length:s[0].length||1}:null}let l=(r?e:e.toLowerCase()).indexOf(r?a:t);return l>=0?{index:l,length:a.length}:null}function $v(e,t,a={}){let o=String(t||"").trim();if(!o)return{matches:[],error:null,truncated:!1};let r=!!a.caseSensitive,n=null;if(a.regex)try{n=new RegExp(o,r?"":"i")}catch{return{matches:[],error:"Invalid regular expression",truncated:!1}}let l=o.toLowerCase(),s=[],i=!1;for(let f=e.length-1;f>=0;f--){if(s.length>=DR){i=!0;break}let d=e[f];for(let[x,u]of NR(d)){let p=BR(u,l,o,n,r);if(!p)continue;let v=Math.max(0,p.index-Wv),w=Math.min(u.length,p.index+p.length+Wv),E=v>0?"\u2026":"",y=w<u.length?"\u2026":"",c=u.slice(v,w).replace(/[\n\r\t]/g," ");s.push({id:d.id,entry:d,field:x,snippet:E+c+y,matchStart:E.length+(p.index-v),matchLength:Math.min(p.length,w-p.index)});break}}return{matches:s,error:null,truncated:i}}var DR,Wv,am,Jv=T(()=>{"use strict";Ae();DR=200,Wv=44,am=2e4});function OR({match:e}){let{snippet:t,matchStart:a,matchLength:o}=e;if(a<0||a>=t.length)return(0,Y.jsx)("span",{className:"xray-gsearch-snippet",children:t});let r=t.slice(0,a),n=t.slice(a,a+o),l=t.slice(a+o);return(0,Y.jsxs)("span",{className:"xray-gsearch-snippet",children:[r,(0,Y.jsx)("mark",{children:n}),l]})}function e1(){let e=I(c=>c.globalSearchOpen),t=I(c=>c.setGlobalSearchOpen),a=I(c=>c.entries),o=I(c=>c.selectEntry),r=I(c=>c.setActiveTab),[n,l]=(0,Qt.useState)(""),[s,i]=(0,Qt.useState)(!1),[f,d]=(0,Qt.useState)(!1),[x,u]=(0,Qt.useState)(0),p=(0,Qt.useRef)(null),v=(0,Qt.useMemo)(()=>$v(a,n,{regex:s,caseSensitive:f}),[a,n,s,f]),w=v.matches;Qt.default.useEffect(()=>{u(0)},[n,s,f,e]),Qt.default.useEffect(()=>{e||l("")},[e]),Qt.default.useEffect(()=>{p.current?.querySelector(`[data-match-index="${x}"]`)?.scrollIntoView({block:"nearest"})},[x]);function E(c){let m=w[c];m&&(o(m.entry.id),r(m.entry.type==="api"?"api":"logs"),t(!1))}function y(c){c.key==="ArrowDown"?(c.preventDefault(),u(m=>(m+1)%Math.max(1,w.length))):c.key==="ArrowUp"?(c.preventDefault(),u(m=>(m-1+w.length)%Math.max(1,w.length))):c.key==="Enter"?(c.preventDefault(),E(x)):c.key==="Home"?(c.preventDefault(),u(0)):c.key==="End"&&(c.preventDefault(),u(w.length-1))}return e?(0,Y.jsxs)(Dt,{title:"Find in traffic",subtitle:"Search across every captured URL, header, and request/response body",icon:(0,Y.jsx)(ot,{...Uf}),className:"xray-gsearch-modal",onClose:()=>t(!1),children:[(0,Y.jsxs)("div",{className:"xray-gsearch-controls",children:[(0,Y.jsxs)("label",{className:"xray-search xray-gsearch-input",children:[(0,Y.jsx)(ot,{...Uf}),(0,Y.jsx)("input",{className:"xray-input",autoFocus:!0,value:n,onChange:c=>l(c.currentTarget.value),onKeyDown:y,placeholder:s?"Regular expression\u2026":"Search text across all captured traffic\u2026",spellCheck:!1})]}),(0,Y.jsxs)("button",{className:`xray-chip ${s?"active":""}`,onClick:()=>i(c=>!c),"aria-pressed":s,title:"Match with a regular expression",children:[(0,Y.jsx)(Np,{...Uf}),"Regex"]}),(0,Y.jsxs)("button",{className:`xray-chip ${f?"active":""}`,onClick:()=>d(c=>!c),"aria-pressed":f,title:"Case-sensitive matching",children:[(0,Y.jsx)(kp,{...Uf}),"Case"]})]}),(0,Y.jsxs)("div",{className:"xray-modal-body xray-gsearch-list",ref:p,children:[v.error&&(0,Y.jsx)("div",{className:"xray-gsearch-error",children:v.error}),!v.error&&!n.trim()&&(0,Y.jsxs)("div",{className:"xray-command-empty",children:[(0,Y.jsx)(ot,{size:20,stroke:1.6}),(0,Y.jsx)("span",{children:"Search inside your captured traffic"}),(0,Y.jsx)("small",{children:"Matches URLs, methods, status, headers, and request & response bodies. Toggle Regex for patterns."})]}),!v.error&&n.trim()&&w.length===0&&(0,Y.jsxs)("div",{className:"xray-command-empty",children:[(0,Y.jsx)(ot,{size:20,stroke:1.6}),(0,Y.jsxs)("span",{children:["No matches for \u201C",n,"\u201D"]}),(0,Y.jsx)("small",{children:"Try different text, or enable Regex."})]}),w.map((c,m)=>{let g=String(c.entry.method||c.entry.logLevel||"GET").toUpperCase();return(0,Y.jsxs)("button",{"data-match-index":m,className:`xray-gsearch-row ${m===x?"active":""}`,onMouseMove:()=>u(m),onClick:()=>E(m),children:[(0,Y.jsx)("span",{className:`xray-cmd-method ${fa(c.entry.method)}`,children:g.slice(0,4)}),(0,Y.jsxs)("span",{className:"xray-gsearch-main",children:[(0,Y.jsxs)("span",{className:"xray-gsearch-path",children:[ne(c.entry),(0,Y.jsx)("span",{className:"xray-gsearch-field",children:c.field})]}),(0,Y.jsx)(OR,{match:c})]}),c.entry.status?(0,Y.jsx)("span",{className:`xray-gsearch-status ${Xt(Number(c.entry.status))}`,children:c.entry.status}):null,m===x&&(0,Y.jsx)(ts,{size:14,stroke:2,className:"xray-command-enter"})]},`${c.id}-${m}`)})]}),(0,Y.jsxs)("div",{className:"xray-command-foot",children:[(0,Y.jsxs)("span",{children:[(0,Y.jsx)("kbd",{children:"\u2191"}),(0,Y.jsx)("kbd",{children:"\u2193"})," navigate"]}),(0,Y.jsxs)("span",{children:[(0,Y.jsx)("kbd",{children:"\u21B5"})," open"]}),(0,Y.jsxs)("span",{children:[(0,Y.jsx)("kbd",{children:"esc"})," close"]}),(0,Y.jsx)("span",{className:"xray-spacer"}),(0,Y.jsxs)("span",{children:[w.length,v.truncated?"+":""," match",w.length===1?"":"es"]})]})]}):null}var Qt,Y,Uf,t1=T(()=>{"use strict";Qt=_(ze());qe();$e();Vo();Jv();Gt();Ae();Y=_(j()),Uf={size:16,stroke:1.8}});function a1(e){let t=e.filter(Pe);return{apiCount:t.length,logCount:e.filter(Gd).length,errorCount:t.filter(a=>Number(a.status)>=400).length,totalBytes:t.reduce((a,o)=>a+(Number(o.size)||0),0)}}var o1=T(()=>{"use strict";Gt()});function r1(){let e=I(t=>t.openSettings);return(0,om.jsx)("button",{className:"xray-icon-btn",title:"Theme & appearance","aria-label":"Theme and appearance",onClick:()=>e("appearance"),children:(0,om.jsx)(Ar,{...LR})})}var om,LR,n1=T(()=>{"use strict";qe();$e();om=_(j()),LR={size:16,stroke:1.8}});function s1(){let e=typeof window<"u"?Math.round(window.innerWidth*.96):nf;return Math.min(nf,e)}function rm(e){return Math.max(rf,Math.min(s1(),Math.round(e)))}function i1({children:e,mode:t}){let a=I(z=>z.open),o=I(z=>z.devtoolsMode),r=I(z=>z.activeTab),n=I(z=>z.setActiveTab),l=I(z=>z.entries),s=I(z=>z.settings),i=I(z=>z.updateSettings),f=I(z=>z.setExportOpen),d=I(z=>z.setSettingsOpen),x=I(z=>z.showToast),u=I(z=>z.toastMessage),p=I(z=>z.clearToast),v=I(z=>z.setOpen),{apiCount:w,logCount:E,errorCount:y,totalBytes:c}=a1(l),m=t==="hud",g=s.dockSide,[k,N]=Nr.default.useState(null),b=Nr.default.useRef(null),D=Nr.default.useRef(0),S=k??s.panelWidth;Nr.default.useEffect(()=>()=>{D.current&&cancelAnimationFrame(D.current)},[]);function P(z){z.button===0&&(z.preventDefault(),z.currentTarget.setPointerCapture(z.pointerId),b.current={startX:z.clientX,startWidth:s.panelWidth,latest:s.panelWidth},N(s.panelWidth))}function le(z){let Re=b.current;if(!Re)return;let Ta=g==="right"?Re.startX-z.clientX:z.clientX-Re.startX;Re.latest=rm(Re.startWidth+Ta),!D.current&&(D.current=requestAnimationFrame(()=>{D.current=0,b.current&&N(b.current.latest)}))}function dt(z){let Re=b.current;if(Re){b.current=null,D.current&&(cancelAnimationFrame(D.current),D.current=0);try{z.currentTarget.releasePointerCapture(z.pointerId)}catch{}N(null),Re.latest!==s.panelWidth&&i({panelWidth:Re.latest})}}function pt(z){let Re=g==="right"?"ArrowLeft":"ArrowRight",Ta=g==="right"?"ArrowRight":"ArrowLeft";if(z.key===Re||z.key===Ta){z.preventDefault();let Ko=z.key===Re?l1:-l1;i({panelWidth:rm(s.panelWidth+Ko)})}}function lo(){i({panelWidth:rm(We.panelWidth)})}function Qo(){i({dockSide:g==="right"?"left":"right"})}function ha(){let z=window.XRAY_Panel;z?.hide?z.hide():v(!1)}let[O,K]=Nr.default.useState(!1);Nr.default.useEffect(()=>{if(!u||O)return;let z=window.setTimeout(p,2800);return()=>window.clearTimeout(z)},[u,O,p]);function Le(z,Re){if(typeof chrome<"u"&&chrome?.runtime?.sendMessage)try{chrome.runtime.sendMessage(z,()=>{});return}catch{}x(Re)}function L(){x("Press F12, then open the XRAY tab.")}function B(){if(window.XRAY_HUD?.isVisible?.()){window.XRAY_HUD.collapse();return}Le({type:"XRAY_HUD_TOGGLE_ACTIVE"},"Open a normal page tab, then use XRAY from the extension icon.")}function de(){Le({type:"XRAY_OPEN_WINDOW"},"Pop-out window is available when the extension runtime is loaded.")}function gt(z,Re){if(!["ArrowLeft","ArrowRight","Home","End"].includes(z.key))return;z.preventDefault();let Ko=Fr.findIndex(S1=>S1.id===Re);if(Ko<0)return;let Xf=Fr.length-1,v1=z.key==="Home"?0:z.key==="End"?Xf:z.key==="ArrowLeft"?Ko===0?Xf:Ko-1:Ko===Xf?0:Ko+1,Gf=Fr[v1];if(!Gf)return;n(Gf.id),z.currentTarget.getRootNode().getElementById?.(`xray-tab-${Gf.id}`)?.focus()}let so=s.theme==="custom"?Ir(s.customTheme):{};return(0,ee.jsxs)("div",{className:`xray-panel xray-mode-${t} ${m?`xray-dock-${g}`:""} xray-theme-${s.theme} xray-density-${s.density} xray-font-${s.font} ${s.glow?"xray-glow":"xray-no-glow"} ${s.hacker?"xray-hacker":""} ${a?"xray-open":""} ${o?"xray-devtools":""} ${s.compactRows?"xray-compact-rows":""}`,style:{"--xray-accent":Fn(s),"--xray-font":lf[s.font],"--xray-radius":`${s.radius}px`,"--xray-panel-width":`${S}px`,...so},children:[m&&(0,ee.jsx)("div",{className:`xray-resize-handle ${k!==null?"dragging":""}`,role:"separator","aria-orientation":"vertical","aria-label":"Resize panel \u2014 drag, or use arrow keys","aria-valuenow":S,"aria-valuemin":rf,"aria-valuemax":s1(),tabIndex:0,onPointerDown:P,onPointerMove:le,onPointerUp:dt,onPointerCancel:dt,onKeyDown:pt,onDoubleClick:lo,title:"Drag to resize \xB7 double-click to reset"}),(0,ee.jsxs)("header",{className:"xray-topbar",children:[(0,ee.jsxs)("div",{className:"xray-brand xray-drag-handle",children:[(0,ee.jsx)("span",{className:"xray-brand-mark",children:(0,ee.jsx)(rt,{size:18,stroke:2})}),(0,ee.jsx)("span",{children:"CONSOLE"}),(0,ee.jsxs)("span",{className:"xray-brand-ver",title:`XRAY ${gs} \xB7 built ${_f}`,children:["v",gs]}),(0,ee.jsx)("span",{className:`xray-live-dot ${a?"on":""}`})]}),(0,ee.jsx)("nav",{className:"xray-tabs",role:"tablist","aria-label":"XRAY panel tabs",children:Fr.map(z=>(0,ee.jsxs)("button",{id:`xray-tab-${z.id}`,role:"tab","aria-selected":r===z.id,"aria-controls":"xray-tabpanel",tabIndex:r===z.id?0:-1,className:`xray-tab ${r===z.id?"active":""}`,onClick:()=>n(z.id),onKeyDown:Re=>gt(Re,z.id),children:[z.icon,(0,ee.jsx)("span",{children:z.label}),z.id==="api"&&w>0&&(0,ee.jsx)("span",{className:"xray-badge",children:w}),z.id==="logs"&&E>0&&(0,ee.jsx)("span",{className:"xray-badge",children:E})]},z.id))}),(0,ee.jsx)("div",{className:"xray-spacer"}),(0,ee.jsxs)("div",{className:"xray-summary",children:[w," APIs \xB7 ",y," Errors \xB7 ",Tt(c)]}),(0,ee.jsxs)("div",{className:"xray-mode-switcher","aria-label":"XRAY display mode",children:[(0,ee.jsx)("button",{className:`xray-icon-btn ${t==="devtools"?"active":""}`,title:"Open in DevTools","aria-label":"Open in DevTools",onClick:L,children:(0,ee.jsx)(up,{...jn})}),(0,ee.jsx)("button",{className:`xray-icon-btn ${t==="hud"?"active":""}`,title:"Float over page","aria-label":"Float over page",onClick:B,children:(0,ee.jsx)(Rp,{...jn})}),(0,ee.jsx)("button",{className:`xray-icon-btn ${t==="window"?"active":""}`,title:"Open in separate window","aria-label":"Open in separate window",onClick:de,children:(0,ee.jsx)(op,{...jn})})]}),(0,ee.jsx)(r1,{}),(0,ee.jsx)("button",{className:"xray-icon-btn","aria-label":"Open export modal",onClick:()=>f(!0),children:(0,ee.jsx)(Ft,{size:16,stroke:1.8})}),(0,ee.jsx)("button",{className:"xray-icon-btn","aria-label":"Open settings",onClick:()=>d(!0),children:(0,ee.jsx)(Tr,{size:16,stroke:1.8})}),m&&(0,ee.jsxs)("div",{className:"xray-dock-controls","aria-label":"Panel position",children:[(0,ee.jsx)("button",{className:"xray-icon-btn",title:g==="right"?"Dock to left edge":"Dock to right edge","aria-label":g==="right"?"Dock to left edge":"Dock to right edge",onClick:Qo,children:g==="right"?(0,ee.jsx)(wp,{...jn}):(0,ee.jsx)(Cp,{...jn})}),(0,ee.jsx)("button",{className:"xray-icon-btn xray-close-btn",title:"Close panel (Esc)","aria-label":"Close panel",onClick:ha,children:(0,ee.jsx)(to,{...jn})})]})]}),(0,ee.jsx)("main",{className:"xray-body",id:"xray-tabpanel",role:"tabpanel","aria-labelledby":`xray-tab-${r}`,children:e}),(0,ee.jsx)("div",{className:"xray-toast-region",role:"status","aria-live":"polite","aria-atomic":"true",children:u&&(0,ee.jsx)("button",{className:"xray-toast",onClick:p,onMouseEnter:()=>K(!0),onMouseLeave:()=>K(!1),onFocus:()=>K(!0),onBlur:()=>K(!1),"aria-label":"Dismiss notification",children:u})})]})}var Nr,ee,jn,l1,f1=T(()=>{"use strict";Nr=_(ze());qe();$e();Dn();o1();br();Ae();$p();xs();n1();ee=_(j()),jn={size:16,stroke:1.8},l1=24});function c1({mode:e="hud"}){let t=I(r=>r.activeTab),a=I(r=>r.settings),o={"--xray-accent":Fn(a),"--xray-font":lf[a.font],"--xray-radius":`${a.radius}px`,...a.theme==="custom"?Ir(a.customTheme):{}};return(0,yt.jsxs)("div",{className:`xray-theme-scope xray-theme-${a.theme} xray-font-${a.font}`,style:o,children:[(0,yt.jsxs)(i1,{mode:e,children:[t==="console"&&(0,yt.jsx)(dv,{}),t==="api"&&(0,yt.jsx)(Vp,{mode:"api"}),t==="logs"&&(0,yt.jsx)(Vp,{mode:"logs"}),t==="rules"&&(0,yt.jsx)(Fv,{}),t==="insights"&&(0,yt.jsx)(Tv,{})]}),(0,yt.jsx)(wv,{}),(0,yt.jsx)(Bv,{}),(0,yt.jsx)(zv,{}),(0,yt.jsx)(Xv,{}),(0,yt.jsx)(Kv,{}),(0,yt.jsx)(e1,{}),(0,yt.jsx)(kv,{})]})}var yt,u1=T(()=>{"use strict";$e();Dn();br();cv();pv();Cv();Av();Ev();Dv();Ov();Hv();Gv();Zv();t1();f1();yt=_(j())});function p1({dismissible:e}){d1||(d1=!0,document.addEventListener("keydown",t=>{let a=t.key?.toLowerCase();if((t.ctrlKey||t.metaKey)&&a==="k"&&(t.preventDefault(),I.getState().setCommandOpen(!0)),(t.ctrlKey||t.metaKey)&&t.shiftKey&&a==="f"&&(t.preventDefault(),I.getState().setGlobalSearchOpen(!0)),a==="escape"){let o=I.getState();o.pendingConfirmation?o.closeConfirmation():o.exportOpen?o.setExportOpen(!1):o.commandOpen?o.setCommandOpen(!1):o.globalSearchOpen?o.setGlobalSearchOpen(!1):o.settingsOpen?o.setSettingsOpen(!1):o.replayEditorEntry?o.closeReplayEditor():o.apiDetailOpen&&o.activeTab==="api"?o.setApiDetailOpen(!1):e&&o.open&&!o.devtoolsMode&&o.setOpen(!1)}},!0))}var d1,m1=T(()=>{"use strict";$e();d1=!1});var x1,y1=T(()=>{x1=`:host,
.xray-app-root {
  --xray-bg: #1e1e2e;
  --xray-surface: #181825;
  --xray-surface2: #313244;
  /* RGB triples so translucent surfaces (rgba(var(--\u2026-rgb), a)) adapt per theme */
  --xray-bg-rgb: 30, 30, 46;
  --xray-surface-rgb: 24, 24, 37;
  --xray-surface2-rgb: 49, 50, 68;
  --xray-text-rgb: 205, 214, 244;
  /* corner-radius scale \u2014 base is set inline per-panel from settings.radius */
  --xray-radius: 10px;
  --xray-radius-sm: calc(var(--xray-radius) * 0.6);
  --xray-radius-lg: calc(var(--xray-radius) * 1.4);
  /* motion system \u2014 one easing/duration language across the UI */
  --xray-ease: cubic-bezier(0.22, 0.8, 0.28, 1);
  --xray-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --xray-dur-fast: 120ms;
  --xray-dur: 180ms;
  --xray-text: #cdd6f4;
  --xray-green: #a6e3a1;
  --xray-blue: #89b4fa;
  --xray-yellow: #f9e2af;
  --xray-red: #f38ba8;
  --xray-mauve: #cba6f7;
  --xray-teal: #94e2d5;
  --xray-peach: #fab387;
  --xray-hint: #6c7086;
  --xray-subtext: #a6adc8;
  --xray-font: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
}
`});var g1,h1=T(()=>{g1=`* {
  box-sizing: border-box;
}

.xray-app-root {
  all: initial;
  color: var(--xray-text);
  font-family: var(--xray-font);
}

.xray-app-root *,
.xray-hud * {
  scrollbar-color: color-mix(in srgb, var(--xray-hint) 62%, transparent) rgba(var(--xray-bg-rgb), .44);
  scrollbar-width: thin;
  /* Absorb overscroll inside the panel so scrolling a list/detail to its edge
     never chains through to the website behind an injected side panel or HUD. */
  overscroll-behavior: contain;
}

.xray-app-root *::-webkit-scrollbar,
.xray-hud *::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.xray-app-root *::-webkit-scrollbar-track,
.xray-hud *::-webkit-scrollbar-track {
  background: rgba(var(--xray-bg-rgb), .44);
}

.xray-app-root *::-webkit-scrollbar-thumb,
.xray-hud *::-webkit-scrollbar-thumb {
  border: 2px solid rgba(var(--xray-bg-rgb), .44);
  border-radius: 999px;
  background: color-mix(in srgb, var(--xray-hint) 72%, transparent);
}

.xray-app-root *::-webkit-scrollbar-thumb:hover,
.xray-hud *::-webkit-scrollbar-thumb:hover {
  background: color-mix(in srgb, var(--xray-blue) 72%, transparent);
}

.xray-panel {
  /* The panel is a size container: everything inside responds to the PANEL's
     width via @container rules, not the window's \u2014 a 380px docked panel on a
     4K monitor must stack exactly like a small window. Modals are DOM siblings
     of the panel (see App.tsx), so the layout containment this creates never
     affects their fixed positioning. */
  container-type: inline-size;
  container-name: xray;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 2147483647;
  width: var(--xray-panel-width, min(960px, 94vw));
  max-width: 96vw;
  height: 100vh;
  display: none;
  flex-direction: column;
  color: var(--xray-text);
  background: var(--xray-bg);
  border-left: 1px solid color-mix(in srgb, var(--xray-hint) 42%, transparent);
  box-shadow: -20px 0 80px rgba(0, 0, 0, .38);
  font: 12px/1.45 var(--xray-font);
  overflow: hidden;
}

/* Left-dock mirror of the base (right-docked) side panel. Only added in the docked
   side panel; the floating HUD's hud.css neutralizes it, and devtools/window modes
   never get the dock class. */
.xray-panel.xray-dock-left {
  right: auto;
  left: 0;
  border-left: 0;
  border-right: 1px solid color-mix(in srgb, var(--xray-hint) 42%, transparent);
  box-shadow: 20px 0 80px rgba(0, 0, 0, .38);
}

/* Slide-in on open (docked side panel). One-shot animation, not a persistent
   transform, so it never leaves a containing block behind for fixed children.
   The right/left keyframes match the dock edge. Neutralized by reduced-motion. */
@keyframes xray-panel-slide-right {
  from { transform: translateX(24px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes xray-panel-slide-left {
  from { transform: translateX(-24px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.xray-panel.xray-mode-hud.xray-dock-right.xray-open {
  animation: xray-panel-slide-right .22s var(--xray-ease-out, cubic-bezier(.2, .7, .3, 1));
}

.xray-panel.xray-mode-hud.xray-dock-left.xray-open {
  animation: xray-panel-slide-left .22s var(--xray-ease-out, cubic-bezier(.2, .7, .3, 1));
}

/* Drag grabber on the panel's inner edge (toward the page). Scoped as a direct
   child of .xray-panel so it outranks the broad \`.xray-panel > * { position:
   relative }\` rule below \u2014 otherwise the handle collapses to 0 height (top:0 +
   bottom:0 on a position:relative box) and can't be grabbed. */
.xray-panel > .xray-resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8px;
  z-index: 6;
  cursor: ew-resize;
  touch-action: none;
  background: transparent;
  transition: background var(--xray-dur-fast, .12s) ease;
}

.xray-panel.xray-dock-right .xray-resize-handle { left: -1px; }
.xray-panel.xray-dock-left .xray-resize-handle { right: -1px; }

.xray-resize-handle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 3px;
  height: 44px;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background: var(--xray-hint);
  opacity: 0;
  transition: opacity var(--xray-dur-fast, .12s) ease, background var(--xray-dur-fast, .12s) ease;
}

.xray-resize-handle:hover,
.xray-resize-handle:focus-visible,
.xray-resize-handle.dragging {
  background: color-mix(in srgb, var(--xray-accent) 22%, transparent);
  outline: none;
}

.xray-resize-handle:hover::after,
.xray-resize-handle:focus-visible::after,
.xray-resize-handle.dragging::after {
  opacity: 1;
  background: var(--xray-accent);
}

/* Dock / close cluster, separated from the mode switcher by a hairline. */
.xray-dock-controls {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: 2px;
  padding-left: 6px;
  border-left: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 30%, transparent));
}

.xray-close-btn:hover {
  color: var(--xray-red, #ff5c7a);
  background: color-mix(in srgb, var(--xray-red, #ff5c7a) 16%, transparent);
}

/* The theme scope carries color tokens to the panel AND its sibling modals via
   inheritance; display:contents means it adds no layout box. */
.xray-theme-scope {
  display: contents;
}

/* Theme token blocks key off the theme class alone (present on both .xray-theme-scope
   and .xray-panel), so popups rendered outside .xray-panel inherit the active theme. */
.xray-theme-operator {
  --xray-bg: #0b0f14;
  --xray-surface: #101720;
  --xray-surface2: #151f2b;
  --xray-surface3: #1b2836;
  --xray-bg-rgb: 11, 15, 20;
  --xray-surface-rgb: 16, 23, 32;
  --xray-surface2-rgb: 21, 31, 43;
  --xray-text-rgb: 216, 226, 239;
  --xray-text: #d8e2ef;
  --xray-subtext: #8fa1b7;
  --xray-hint: #536274;
  --xray-blue: #37d5ff;
  --xray-mauve: #8b5cf6;
  --xray-green: #38f29b;
  --xray-yellow: #f6c76f;
  --xray-red: #ff5c7a;
  --xray-teal: #2ee6c5;
  --xray-peach: #ff9e64;
  --xray-border: rgba(80, 114, 148, .42);
  --xray-operator-grid: rgba(55, 213, 255, .035);
}

.xray-theme-dev-edition {
  --xray-bg: #11131f;
  --xray-surface: #171a2b;
  --xray-surface2: #20243a;
  --xray-surface3: #282d49;
  --xray-bg-rgb: 17, 19, 31;
  --xray-surface-rgb: 23, 26, 43;
  --xray-surface2-rgb: 32, 36, 58;
  --xray-text-rgb: 225, 231, 255;
  --xray-text: #e1e7ff;
  --xray-subtext: #a8b0cf;
  --xray-hint: #6f789d;
  --xray-blue: #75ddff;
  --xray-mauve: #b18cff;
  --xray-green: #62e6a8;
  --xray-yellow: #ffd37a;
  --xray-red: #ff6f91;
  --xray-teal: #5fe3d0;
  --xray-peach: #ffab70;
  --xray-border: rgba(124, 138, 189, .36);
  --xray-operator-grid: rgba(177, 140, 255, .04);
}

.xray-theme-midnight {
  --xray-bg: #05070a;
  --xray-surface: #090d12;
  --xray-surface2: #0f151d;
  --xray-surface3: #151d29;
  --xray-bg-rgb: 5, 7, 10;
  --xray-surface-rgb: 9, 13, 18;
  --xray-surface2-rgb: 15, 21, 29;
  --xray-text-rgb: 215, 247, 255;
  --xray-text: #d7f7ff;
  --xray-subtext: #83a4ad;
  --xray-hint: #49626b;
  --xray-blue: #00e5ff;
  --xray-mauve: #7c3aed;
  --xray-green: #00ff95;
  --xray-yellow: #ffd166;
  --xray-red: #ff3b6b;
  --xray-teal: #00e5c7;
  --xray-peach: #ff9e5e;
  --xray-border: rgba(0, 229, 255, .28);
  --xray-operator-grid: rgba(0, 229, 255, .045);
}

.xray-theme-light-lab {
  --xray-bg: #edf3fb;
  --xray-surface: #f8fbff;
  --xray-surface2: #e6eef9;
  --xray-surface3: #d9e5f5;
  --xray-bg-rgb: 237, 243, 251;
  --xray-surface-rgb: 248, 251, 255;
  --xray-surface2-rgb: 230, 238, 249;
  --xray-text-rgb: 23, 32, 51;
  --xray-text: #172033;
  --xray-subtext: #526173;
  --xray-hint: #75869a;
  --xray-blue: #006adc;
  --xray-mauve: #7048e8;
  --xray-green: #087f5b;
  --xray-yellow: #8f6212;
  --xray-red: #b5195a;
  --xray-teal: #0b7285;
  --xray-peach: #c2410c;
  --xray-border: rgba(82, 97, 115, .28);
  --xray-operator-grid: rgba(0, 106, 220, .035);
}

.xray-theme-claude {
  --xray-bg: #f0eee6;
  --xray-surface: #faf9f5;
  --xray-surface2: #eceae0;
  --xray-surface3: #e4e1d5;
  --xray-bg-rgb: 240, 238, 230;
  --xray-surface-rgb: 250, 249, 245;
  --xray-surface2-rgb: 236, 234, 224;
  --xray-text-rgb: 35, 34, 31;
  --xray-text: #23221f;
  --xray-subtext: #6b675f;
  --xray-hint: #9a968c;
  --xray-blue: #4a6fa5;
  --xray-mauve: #8a5cc4;
  --xray-green: #3f8a4f;
  --xray-yellow: #8a6215;
  --xray-red: #c0392b;
  --xray-teal: #1c6b6b;
  --xray-peach: #d97757;
  --xray-border: rgba(60, 55, 48, .18);
  --xray-operator-grid: rgba(217, 119, 87, .05);
}

.xray-panel.xray-density-compact {
  --xray-density-scale: .88;
  --xray-row-h: 42px;
  --xray-chrome-h: 40px;
}

.xray-panel.xray-density-comfortable {
  --xray-density-scale: 1;
  --xray-row-h: 52px;
  --xray-chrome-h: 46px;
}

.xray-panel.xray-density-spacious {
  --xray-density-scale: 1.14;
  --xray-row-h: 64px;
  --xray-chrome-h: 52px;
}

.xray-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, var(--xray-operator-grid, transparent) 1px, transparent 1px),
    linear-gradient(180deg, var(--xray-operator-grid, transparent) 1px, transparent 1px),
    radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--xray-accent) 16%, transparent), transparent 32%),
    radial-gradient(circle at 88% 8%, color-mix(in srgb, var(--xray-mauve) 12%, transparent), transparent 30%);
  background-size: 28px 28px, 28px 28px, auto, auto;
  opacity: .8;
}

.xray-panel.xray-no-glow::before {
  opacity: .28;
}

.xray-panel > * {
  position: relative;
  z-index: 1;
}

.xray-panel.xray-open,
.xray-panel.xray-devtools {
  display: flex;
}

.xray-panel.xray-devtools {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  border: 0;
  box-shadow: none;
}

.xray-panel.xray-mode-window {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  border: 0;
  box-shadow: none;
}

.xray-topbar {
  height: var(--xray-chrome-h, 44px);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--xray-surface) 94%, white 6%), var(--xray-surface));
  border-bottom: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
  box-shadow: inset 0 -1px 0 color-mix(in srgb, var(--xray-accent) 18%, transparent);
  flex-shrink: 0;
}

.xray-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
  font-weight: 900;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.xray-drag-handle {
  cursor: grab;
}

.xray-drag-handle:active {
  cursor: grabbing;
}

.xray-brand-mark {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: linear-gradient(135deg, var(--xray-accent, var(--xray-blue)), var(--xray-mauve));
  border-radius: var(--xray-radius);
  box-shadow: 0 0 22px color-mix(in srgb, var(--xray-accent, var(--xray-blue)) 32%, transparent);
}

.xray-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--xray-hint);
}

.xray-live-dot.on {
  background: var(--xray-green);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--xray-green) 18%, transparent), 0 0 16px color-mix(in srgb, var(--xray-green) 55%, transparent);
}

.xray-tabs,
.xray-console-tabs,
.xray-filter-chips {
  display: flex;
  align-items: center;
  gap: 4px;
}

.xray-tab,
.xray-mini-tab,
.xray-btn,
.xray-chip,
.xray-icon-btn {
  border: 1px solid transparent;
  color: var(--xray-subtext);
  background: transparent;
  font: 800 12px/1 var(--xray-font);
  cursor: pointer;
  transition: background .15s ease, border-color .15s ease, color .15s ease, transform .15s ease;
}

.xray-tab {
  height: calc(var(--xray-chrome-h, 44px) - 12px);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  border-radius: var(--xray-radius);
  text-transform: uppercase;
  letter-spacing: .04em;
  font-size: calc(11px * var(--xray-density-scale, 1));
}

.xray-tab:hover,
.xray-mini-tab:hover,
.xray-btn:hover,
.xray-chip:hover,
.xray-icon-btn:hover {
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .06);
}

.xray-tab.active,
.xray-mini-tab.active,
.xray-chip.active {
  color: var(--xray-text);
  border-color: color-mix(in srgb, var(--xray-accent, var(--xray-blue)) 64%, transparent);
  background: color-mix(in srgb, var(--xray-accent, var(--xray-blue)) 15%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--xray-accent) 16%, transparent), 0 0 22px color-mix(in srgb, var(--xray-accent) 12%, transparent);
}

.xray-no-glow .xray-tab.active,
.xray-no-glow .xray-mini-tab.active,
.xray-no-glow .xray-chip.active,
.xray-no-glow .xray-brand-mark,
.xray-no-glow .xray-live-dot.on {
  box-shadow: none;
}

.xray-badge {
  min-width: 18px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border-radius: 999px;
  color: var(--xray-text);
  background: color-mix(in srgb, var(--xray-hint) 28%, transparent);
  font-size: 9px;
}

.xray-spacer {
  flex: 1;
}

.xray-summary {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--xray-subtext);
  font-size: calc(10px * var(--xray-density-scale, 1));
  text-transform: uppercase;
  letter-spacing: .08em;
}

.xray-mode-switcher {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.xray-mode-switcher .xray-icon-btn.active {
  color: var(--xray-accent, var(--xray-blue));
  border-color: color-mix(in srgb, var(--xray-accent) 55%, transparent);
  background: color-mix(in srgb, var(--xray-accent) 14%, transparent);
}

.xray-body {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: color-mix(in srgb, var(--xray-bg) 96%, var(--xray-accent) 4%);
}

.xray-console-head {
  display: flex;
  align-items: center;
  min-height: 44px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background: var(--xray-surface);
}

.xray-mini-tab {
  height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 16px;
  border-right: 1px solid color-mix(in srgb, var(--xray-hint) 28%, transparent);
  border-bottom: 2px solid transparent;
}

.xray-mini-tab.active {
  border-bottom-color: var(--xray-blue);
}

.xray-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  padding-right: 8px;
}

.xray-btn,
.xray-icon-btn {
  height: 32px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 12px;
  border-color: color-mix(in srgb, var(--xray-hint) 50%, transparent);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-surface-rgb), .74);
  color: var(--xray-text);
}

.xray-btn.primary {
  color: var(--xray-accent, var(--xray-blue));
  border-color: color-mix(in srgb, var(--xray-accent, var(--xray-blue)) 48%, transparent);
  background: color-mix(in srgb, var(--xray-accent, var(--xray-blue)) 13%, transparent);
}

.xray-btn.danger {
  color: var(--xray-red);
  border-color: color-mix(in srgb, var(--xray-red) 42%, transparent);
  background: color-mix(in srgb, var(--xray-red) 8%, transparent);
}

.xray-icon-btn {
  width: 32px;
  justify-content: center;
  padding: 0;
}

.xray-filterbar {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) auto;
  gap: 8px;
  padding: 12px;
  background: var(--xray-surface);
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
}

.xray-search {
  position: relative;
  min-width: 0;
}

.xray-search svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--xray-hint);
}

.xray-input {
  width: 100%;
  height: 40px;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 55%, transparent);
  border-radius: var(--xray-radius);
  outline: none;
  padding: 0 12px 0 38px;
  color: var(--xray-text);
  background: rgba(var(--xray-surface2-rgb), .5);
  font: 800 13px/1 var(--xray-font);
}

.xray-input:focus,
.xray-prompt input:focus,
.xray-prompt textarea:focus {
  border-color: var(--xray-accent, var(--xray-blue));
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--xray-accent, var(--xray-blue)) 48%, transparent);
}

/* Chips wrap onto multiple rows rather than overflowing/clipping \u2014 a narrow
   panel must never hide filters behind an invisible horizontal scroll. */
.xray-filter-chips {
  flex-wrap: wrap;
  row-gap: 5px;
}

.xray-filter-chips.compact {
  gap: 6px;
  flex-wrap: wrap;
}

.xray-chip {
  height: 40px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 14px;
  border-color: color-mix(in srgb, var(--xray-hint) 50%, transparent);
  border-radius: var(--xray-radius);
  white-space: nowrap;
}

.xray-filter-chips.compact .xray-chip {
  height: 28px;
  padding: 0 10px;
  font-size: 10px;
}

.xray-network {
  position: relative;
  min-height: 180px;
  max-height: min(44vh, 380px);
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background: var(--xray-bg);
  overflow: hidden;
}

.xray-network-head,
.xray-network-row {
  display: grid;
  /* Status \xB7 Method \xB7 Name \xB7 Type \xB7 Size \xB7 Waterfall \u2014 the waterfall takes the
     remaining flexible width (2fr) so wide rows have no dead gap. */
  grid-template-columns: 52px 52px minmax(120px, 1.3fr) 76px 66px minmax(140px, 2fr);
  align-items: center;
  gap: 10px;
}

.xray-network-head {
  height: 28px;
  padding: 0 12px;
  color: var(--xray-mauve);
  text-transform: uppercase;
  letter-spacing: .08em;
  font-size: 10px;
  font-weight: 900;
}

.xray-virtual-list {
  position: relative;
  overflow: auto;
  height: calc(100% - 28px);
}

.xray-network-row {
  min-height: 32px;
  padding: 0 12px;
  cursor: pointer;
  font-weight: 800;
}

.xray-network-row:hover {
  background: rgba(var(--xray-text-rgb), .04);
}

.xray-network-row.selected {
  background: color-mix(in srgb, var(--xray-accent) 15%, transparent);
  box-shadow: inset 2px 0 0 var(--xray-accent, var(--xray-blue));
}

.xray-method {
  color: var(--xray-green);
}

.xray-method.post,
.xray-method.put {
  color: var(--xray-yellow);
}

.xray-method.delete,
.xray-method.del {
  color: var(--xray-red);
}

.xray-status.ok {
  color: var(--xray-green);
}

.xray-status.warn {
  color: var(--xray-yellow);
}

.xray-status.error {
  color: var(--xray-red);
}

.xray-path {
  min-width: 0;
  /* Inside the panel this is overridden by \`.xray-panel .xray-path\` below, which
     is why the Catppuccin lavender that used to sit here was invisible in an
     audit of the rendered UI \u2014 it only ever painted outside a .xray-panel
     ancestor. Same formula as that rule so the two cannot drift apart. */
  color: color-mix(in srgb, var(--xray-text) 86%, var(--xray-accent, var(--xray-mauve)) 14%);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-muted {
  color: var(--xray-hint);
}

.xray-timing {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 6px;
}

.xray-bar-track {
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--xray-hint) 34%, transparent);
  overflow: hidden;
}

.xray-bar {
  height: 100%;
  border-radius: 999px;
  background: var(--xray-blue);
}

.xray-bar.slow {
  background: var(--xray-yellow);
}

.xray-bar.error {
  background: var(--xray-red);
}

.xray-console-stream-wrap {
  position: relative;
  min-height: 0;
  flex: 1;
  display: flex;
}

/* overflow: hidden here made the stream wheel-unscrollable \u2014 the virtualizer
   could move it programmatically but the user could not. */
.xray-console-stream {
  min-height: 0;
  flex: 1;
  background: var(--xray-surface);
  overflow-y: auto;
}

.xray-newmsg-pill {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border: 1px solid rgba(var(--xray-accent-rgb), .6);
  border-radius: 999px;
  color: var(--xray-text);
  background: rgba(var(--xray-surface2-rgb), .95);
  box-shadow: 0 6px 18px rgba(0, 0, 0, .3);
  cursor: pointer;
  font: 800 11px/1 var(--xray-font);
}

.xray-newmsg-pill:hover {
  background: rgba(var(--xray-accent-rgb), .2);
}

.xray-repeat-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 1px 7px;
  border-radius: 999px;
  border: 1px solid rgba(var(--xray-accent-rgb), .45);
  background: rgba(var(--xray-accent-rgb), .14);
  color: var(--xray-text);
  font-size: 10px;
  font-weight: 800;
}

.xray-truncated-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 1px 7px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--xray-yellow) 50%, transparent);
  background: color-mix(in srgb, var(--xray-yellow) 12%, transparent);
  color: var(--xray-yellow);
  font-size: 10px;
  font-weight: 800;
}

.xray-error-stack {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--xray-red);
  font: 600 11px/1.5 var(--xray-font);
}

.xray-chip-count {
  margin-left: 5px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(var(--xray-surface2-rgb), .9);
  font-size: 10px;
}

.xray-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@keyframes xray-spin {
  to { transform: rotate(360deg); }
}

.xray-spin {
  animation: xray-spin 1s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .xray-spin { animation: none; }
}

.xray-console-row {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: start;
  /* Denser rows for a log stream where scan-density matters (research). */
  min-height: 26px;
  padding: 4px 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 16%, transparent);
}

/* Right-side cell: optional source location + timestamp. Timestamps read as
   optional clutter (Firefox/Chrome default them off), so keep them quiet and
   reveal on row hover; the source location stays for error provenance. */
.xray-console-aside {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
}

.xray-console-source {
  color: var(--xray-subtext, var(--xray-hint));
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.xray-console-time {
  color: var(--xray-hint, var(--xray-subtext));
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  opacity: 0;
  transition: opacity var(--xray-dur-fast, .12s) ease;
}

.xray-console-row:hover .xray-console-time,
.xray-console-row.command .xray-console-time,
.xray-console-row.result .xray-console-time {
  opacity: .65;
}

.xray-console-row.error {
  color: var(--xray-red);
  background: color-mix(in srgb, var(--xray-red) 8%, transparent);
  border-left: 2px solid var(--xray-red);
}

.xray-console-row.warn {
  color: var(--xray-yellow);
  background: color-mix(in srgb, var(--xray-yellow) 7%, transparent);
  border-left: 2px solid var(--xray-yellow);
}

.xray-console-row.command {
  color: var(--xray-mauve);
  /* Set the REPL input/output apart from page-log noise the way DevTools tints
     its own prompt echo \u2014 the command/result pair reads as one "turn". */
  background: color-mix(in srgb, var(--xray-mauve) 7%, transparent);
}

.xray-console-row.result {
  border-left: 2px solid rgba(var(--xray-accent-rgb), .55);
  background: color-mix(in srgb, var(--xray-accent) 5%, transparent);
}

/* Leading gutter marker: quiet by default, colored only where it carries
   meaning (input, output, error, warning). Centered on the first text line. */
.xray-console-glyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  color: var(--xray-hint);
}

.xray-console-row.error .xray-console-glyph { color: var(--xray-red); }
.xray-console-row.warn .xray-console-glyph { color: var(--xray-yellow); }
.xray-console-row.command .xray-console-glyph { color: var(--xray-mauve); }
.xray-console-row.result .xray-console-glyph { color: var(--xray-accent); }

/* A plain page log needs no icon \u2014 a small dot holds the gutter rhythm without
   stamping a terminal glyph on every single line. */
.xray-console-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--xray-hint) 70%, transparent);
}

.xray-console-message {
  min-width: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Soften ordinary logs so errors, warnings and REPL results carry the eye. */
.xray-console-row.log .xray-console-message {
  color: color-mix(in srgb, var(--xray-text) 78%, var(--xray-hint));
}

.xray-detail {
  grid-column: 2 / 4;
  min-width: 0;
  max-height: 360px;
  overflow: auto;
  padding: 10px;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-surface-rgb), .72);
}

.xray-prompt {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto auto;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  border-top: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background: var(--xray-surface);
  flex-shrink: 0;
}

.xray-prompt input,
.xray-prompt textarea {
  min-height: 34px;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 55%, transparent);
  border-radius: var(--xray-radius);
  outline: none;
  padding: 9px 10px;
  color: var(--xray-text);
  background: var(--xray-surface2);
  font: 800 12px/1.3 var(--xray-font);
  resize: none;
  overflow-y: auto;
  max-height: 110px;
}

.xray-context-chip {
  max-width: 260px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  border: 1px solid color-mix(in srgb, var(--xray-blue) 50%, transparent);
  border-radius: 999px;
  color: var(--xray-text);
  background: color-mix(in srgb, var(--xray-blue) 12%, transparent);
  cursor: pointer;
  font: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
}

.xray-statusbar {
  min-height: 24px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 10px;
  color: var(--xray-subtext);
  background: var(--xray-bg);
  border-top: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  font-size: 10px;
  font-weight: 900;
}

.xray-page {
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 12px;
  background: var(--xray-bg);
}

.xray-page-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.xray-page-head h3 {
  margin: 0 0 3px;
}

.xray-page-head p {
  margin: 0;
  color: var(--xray-hint);
  font-size: 11px;
}

.xray-split {
  min-height: 0;
  flex: 1;
  display: grid;
  /* Split is the MAX of a minmax, never a fixed track: the list caps at the
     dragged width but yields down to its min when the panel shrinks, so a wide
     split can't starve the detail pane. */
  grid-template-columns: minmax(240px, var(--xray-logs-split, 42%)) minmax(300px, 1fr);
}

.xray-list-panel {
  position: relative;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  overflow: hidden;
}

.xray-list-panel > .xray-virtual-list {
  flex: 1;
  min-height: 0;
  height: auto;
}

.xray-list-controls {
  display: grid;
  gap: 8px;
  padding: 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--xray-mauve) 10%, transparent), transparent 36%),
    var(--xray-surface);
}

.xray-api-summary {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr)) minmax(180px, 1.4fr);
  gap: 6px;
  padding: 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background: var(--xray-bg);
}

.xray-api-metric,
.xray-api-top-endpoint {
  min-width: 0;
  min-height: 44px;
  display: grid;
  align-content: center;
  gap: 2px;
  padding: 7px 9px;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 30%, transparent);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-surface-rgb), .64);
}

.xray-api-top-endpoint {
  min-height: 36px;
}

.xray-api-metric {
  grid-template-columns: 18px minmax(0, 1fr);
}

.xray-api-metric svg {
  grid-row: 1 / 3;
  align-self: center;
  color: var(--xray-blue);
}

.xray-api-metric span,
.xray-api-top-endpoint span {
  min-width: 0;
  color: var(--xray-hint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 9px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .07em;
}

.xray-api-metric strong,
.xray-api-top-endpoint strong {
  min-width: 0;
  color: var(--xray-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

.xray-api-metric.ok strong,
.xray-api-metric.ok svg {
  color: var(--xray-green);
}

.xray-api-metric.warn strong,
.xray-api-metric.warn svg {
  color: var(--xray-yellow);
}

.xray-api-metric.error strong,
.xray-api-metric.error svg {
  color: var(--xray-red);
}

.xray-api-workspace {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(var(--xray-bg-rgb), .24), transparent 180px),
    var(--xray-bg);
}

.xray-api-body {
  position: relative;
  min-width: 0;
  min-height: 0;
  flex: 1;
  display: grid;
  /* First track = list pane. --xray-api-split (set inline when the user drags
     the divider) replaces the auto min/max; container queries below override
     the whole property, so the split is dropped when the panel stacks. */
  grid-template-columns: minmax(260px, var(--xray-api-split, 440px)) minmax(260px, .64fr) minmax(400px, 1.55fr);
  overflow: hidden;
}

.xray-api-collection-pane,
.xray-request-context-pane,
.xray-api-detail-drawer {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Anchors the draggable list/detail divider on the pane's trailing edge. */
.xray-api-collection-pane {
  position: relative;
}

.xray-pane-divider {
  position: absolute;
  top: 0;
  bottom: 0;
  right: -4px;
  width: 9px;
  z-index: 4;
  cursor: ew-resize;
  touch-action: none;
  background: transparent;
}

.xray-pane-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 3px;
  height: 46px;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background: var(--xray-hint);
  opacity: 0;
  transition: opacity var(--xray-dur-fast, .12s) ease, background var(--xray-dur-fast, .12s) ease;
}

.xray-pane-divider:hover,
.xray-pane-divider:focus-visible,
.xray-pane-divider.dragging {
  background: color-mix(in srgb, var(--xray-accent) 20%, transparent);
  outline: none;
}

.xray-pane-divider:hover::after,
.xray-pane-divider:focus-visible::after,
.xray-pane-divider.dragging::after {
  opacity: 1;
  background: var(--xray-accent);
}

.xray-api-collection-pane {
  border-right: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background: rgba(var(--xray-bg-rgb), .42);
}

.xray-api-collection-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  padding: 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 32%, transparent);
  background:
    radial-gradient(circle at 20% -20%, color-mix(in srgb, var(--xray-blue) 15%, transparent), transparent 42%),
    rgba(var(--xray-surface-rgb), .88);
}

.xray-api-collection-title {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.xray-api-collection-title span,
.xray-pane-kicker,
.xray-api-summary-pill span {
  color: var(--xray-hint);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.xray-api-collection-title strong {
  min-width: 0;
  overflow: hidden;
  color: var(--xray-text);
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.xray-api-env-pill {
  height: 28px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 9px;
  border: 1px solid color-mix(in srgb, var(--xray-teal) 30%, transparent);
  border-radius: var(--xray-radius);
  color: var(--xray-teal);
  background: color-mix(in srgb, var(--xray-teal) 8%, transparent);
  font-size: 10px;
  font-weight: 900;
}

.xray-api-stats-collapsible {
  grid-column: 1 / -1;
  min-width: 0;
}

/* The stats collapsible carries its own header, so drop the strip's padding. */
.xray-api-stats-collapsible .xray-collapsible-header {
  padding: 2px 0 6px;
}

.xray-api-summary-strip {
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

.xray-api-summary-pill {
  min-width: 0;
  height: 38px;
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr);
  align-content: center;
  align-items: center;
  gap: 1px 6px;
  padding: 5px 7px;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 30%, transparent);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-bg-rgb), .66);
}

.xray-api-summary-pill svg {
  grid-row: 1 / 3;
  color: var(--xray-blue);
}

.xray-api-summary-pill strong {
  min-width: 0;
  overflow: hidden;
  color: var(--xray-text);
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
}

.xray-api-summary-pill.ok svg,
.xray-api-summary-pill.ok strong {
  color: var(--xray-green);
}

.xray-api-summary-pill.warn svg,
.xray-api-summary-pill.warn strong {
  color: var(--xray-yellow);
}

.xray-api-summary-pill.error svg,
.xray-api-summary-pill.error strong {
  color: var(--xray-red);
}

.xray-api-main {
  position: relative;
  min-width: 0;
  min-height: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* New requests insert at the top under LATEST sort \u2014 the pill floats near the
   top of the list, unlike the console variant that anchors at the bottom. */
.xray-newreq-pill {
  top: 46px;
  bottom: auto;
}

.xray-api-toolbar {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background: rgba(var(--xray-surface-rgb), .72);
}

.xray-api-search {
  min-width: 0;
  height: 36px;
  align-self: start;
}

.xray-api-search .xray-input {
  height: 36px;
  font-size: 11px;
}

.xray-api-primary-filters {
  justify-content: flex-start;
  min-width: 0;
  flex-wrap: wrap;
  overflow: visible;
}

.xray-api-secondary-controls {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.xray-filter-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--xray-hint);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
}

.xray-api-table-head,
.xray-api-row {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 48px 76px 66px;
  align-items: center;
  gap: 7px;
}

.xray-api-table-head {
  position: sticky;
  top: 0;
  z-index: 2;
  height: 30px;
  padding: 0 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  color: var(--xray-hint);
  background: rgba(var(--xray-surface-rgb), .96);
  font: 900 10px/1 var(--xray-font);
  text-transform: uppercase;
  letter-spacing: .08em;
}

.xray-api-table-scroll {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: auto;
  scrollbar-width: thin;
}

.xray-api-row {
  width: 100%;
  min-height: 68px;
  padding: 9px 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 18%, transparent);
  color: var(--xray-text);
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: 800 11px/1.28 var(--xray-font);
  outline: none;
  transition: background .15s ease, box-shadow .15s ease, border-color .15s ease;
}

.xray-api-row:hover,
.xray-api-row:focus-visible {
  background: rgba(var(--xray-text-rgb), .055);
}

.xray-api-row.selected {
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--xray-accent) 27%, transparent), color-mix(in srgb, var(--xray-accent) 8%, transparent)),
    rgba(var(--xray-surface2-rgb), .42);
  box-shadow:
    inset 4px 0 0 var(--xray-accent, var(--xray-blue)),
    inset 0 0 0 1px color-mix(in srgb, var(--xray-accent) 30%, transparent),
    0 8px 22px rgba(0, 0, 0, .14);
}

.xray-api-row.has-error {
  box-shadow: inset 2px 0 0 color-mix(in srgb, var(--xray-red) 82%, transparent);
}

.xray-api-row.has-slow:not(.has-error) {
  box-shadow: inset 2px 0 0 color-mix(in srgb, var(--xray-yellow) 72%, transparent);
}

.xray-api-row.selected.has-error,
.xray-api-row.selected.has-slow {
  box-shadow:
    inset 4px 0 0 var(--xray-accent, var(--xray-blue)),
    inset 0 0 0 1px color-mix(in srgb, var(--xray-accent) 30%, transparent),
    0 8px 22px rgba(0, 0, 0, .14);
}

.xray-api-row.group {
  background: rgba(var(--xray-surface-rgb), .55);
}

.xray-api-row.child {
  padding-left: 24px;
  background: rgba(var(--xray-surface-rgb), .46);
}

.xray-api-row.pinned {
  background-image: linear-gradient(90deg, color-mix(in srgb, var(--xray-yellow) 10%, transparent), transparent 52%);
}

.xray-api-path-cell {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.xray-api-flags {
  min-width: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  overflow: hidden;
}

.xray-api-flags.muted {
  display: none;
}

.xray-api-flag {
  min-width: 0;
  max-width: 78px;
  padding: 3px 6px;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 36%, transparent);
  border-radius: 999px;
  color: var(--xray-subtext);
  background: rgba(var(--xray-surface-rgb), .72);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 9px;
  font-weight: 900;
  text-transform: uppercase;
}

.xray-method.post {
  color: var(--xray-teal);
}

.xray-method.patch {
  color: var(--xray-peach);
}

.xray-method.put {
  color: var(--xray-yellow);
}

.xray-api-flag.error {
  color: var(--xray-red);
  border-color: color-mix(in srgb, var(--xray-red) 38%, transparent);
  background: color-mix(in srgb, var(--xray-red) 10%, transparent);
}

.xray-api-flag.slow,
.xray-api-flag.repeated,
.xray-api-flag.large {
  color: var(--xray-yellow);
  border-color: color-mix(in srgb, var(--xray-yellow) 34%, transparent);
  background: color-mix(in srgb, var(--xray-yellow) 10%, transparent);
}

.xray-api-flag.empty {
  color: var(--xray-peach);
  border-color: color-mix(in srgb, var(--xray-peach) 34%, transparent);
  background: color-mix(in srgb, var(--xray-peach) 10%, transparent);
}

.xray-api-flag.pinned {
  color: var(--xray-mauve);
  border-color: color-mix(in srgb, var(--xray-mauve) 36%, transparent);
  background: color-mix(in srgb, var(--xray-mauve) 10%, transparent);
}

.xray-api-row-actions {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  opacity: .62;
  transition: opacity .15s ease;
}

.xray-api-row:hover .xray-api-row-actions,
.xray-api-row:focus-visible .xray-api-row-actions,
.xray-api-row.selected .xray-api-row-actions {
  opacity: 1;
}

.xray-icon-btn {
  width: 28px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 36%, transparent);
  border-radius: var(--xray-radius);
  color: var(--xray-subtext);
  background: rgba(var(--xray-surface-rgb), .72);
  cursor: pointer;
}

.xray-icon-btn:hover,
.xray-icon-btn:focus-visible,
.xray-icon-btn.active {
  color: var(--xray-accent, var(--xray-blue));
  border-color: color-mix(in srgb, var(--xray-accent) 42%, transparent);
  background: color-mix(in srgb, var(--xray-accent) 12%, transparent);
}

.xray-request-context-pane {
  border-right: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background:
    linear-gradient(180deg, rgba(var(--xray-surface2-rgb), .30), transparent 160px),
    rgba(var(--xray-surface-rgb), .78);
}

.xray-request-context-pane.empty {
  justify-content: center;
}

.xray-request-context-head {
  flex-shrink: 0;
  display: grid;
  gap: 10px;
  padding: 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
}

.xray-request-line {
  min-width: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}

.xray-request-line code {
  min-width: 0;
  height: 32px;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 0 10px;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 44%, transparent);
  border-radius: var(--xray-radius);
  color: var(--xray-text);
  background: rgba(var(--xray-bg-rgb), .76);
  text-overflow: ellipsis;
  white-space: nowrap;
  font: 800 11px/1 var(--xray-font);
}

.xray-request-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.xray-request-meta-grid span {
  min-width: 0;
  display: grid;
  gap: 2px;
  padding: 7px 8px;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 28%, transparent);
  border-radius: var(--xray-radius);
  color: var(--xray-subtext);
  background: rgba(var(--xray-bg-rgb), .48);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
}

.xray-request-meta-grid strong {
  color: var(--xray-hint);
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: .07em;
}

.xray-request-context-content {
  min-width: 0;
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 12px;
  background: rgba(var(--xray-bg-rgb), .45);
}

.xray-request-context-content .xray-json-editor {
  min-width: 0;
}

.xray-request-context-content .xray-json-line-text {
  overflow-wrap: anywhere;
}

.xray-request-context-footer {
  flex-shrink: 0;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px solid color-mix(in srgb, var(--xray-hint) 30%, transparent);
  color: var(--xray-hint);
  background: rgba(var(--xray-bg-rgb), .35);
  font-size: 10px;
}

.xray-request-context-footer span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-request-tabs {
  flex-shrink: 0;
  padding: 0 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 30%, transparent);
  background: rgba(var(--xray-bg-rgb), .30);
}

.xray-api-detail-drawer {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--xray-surface);
}

.xray-api-drawer-body {
  min-height: 0;
  flex: 1;
  overflow: hidden;
  padding: 0;
}

.xray-entry-row {
  width: 100%;
  min-height: 58px;
  display: grid;
  grid-template-columns: 10px 50px 48px minmax(0, 1fr) 92px auto 30px;
  align-items: center;
  gap: 7px;
  padding: 8px 10px;
  border: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 20%, transparent);
  color: var(--xray-text);
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: 800 11px/1.35 var(--xray-font);
}

.xray-entry-row:hover {
  background: rgba(var(--xray-text-rgb), .05);
}

.xray-entry-row.selected {
  background: color-mix(in srgb, var(--xray-blue) 16%, transparent);
  box-shadow: inset 3px 0 0 var(--xray-blue);
}

.xray-entry-row.child {
  padding-left: 24px;
  background: rgba(var(--xray-surface-rgb), .45);
}

.xray-entry-row.pinned {
  background-image: linear-gradient(90deg, color-mix(in srgb, var(--xray-yellow) 8%, transparent), transparent 45%);
}

.xray-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--xray-hint);
}

.xray-status-dot.ok {
  background: var(--xray-green);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--xray-green) 12%, transparent);
}

.xray-status-dot.warn {
  background: var(--xray-yellow);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--xray-yellow) 12%, transparent);
}

.xray-status-dot.error {
  background: var(--xray-red);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--xray-red) 12%, transparent);
}

.xray-entry-main {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.xray-entry-meta {
  /* subtext, not hint: this 10px line carries the row's key facts and the
     hint gray fell below WCAG AA contrast on the dark surfaces */
  color: var(--xray-subtext, var(--xray-hint));
  font-size: 10px;
  font-weight: 700;
}

.xray-entry-duration {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(24px, 1fr) auto;
  align-items: center;
  gap: 6px;
  color: var(--xray-subtext);
  font-size: 10px;
}

.xray-count-pill,
.xray-pin {
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 40%, transparent);
  border-radius: 999px;
  color: var(--xray-subtext);
  background: rgba(var(--xray-surface-rgb), .74);
  font-size: 10px;
  white-space: nowrap;
}

.xray-pin {
  width: 26px;
  padding: 0;
  color: var(--xray-hint);
}

.xray-pin.active {
  color: var(--xray-yellow);
  border-color: color-mix(in srgb, var(--xray-yellow) 34%, transparent);
  background: color-mix(in srgb, var(--xray-yellow) 10%, transparent);
}

.xray-detail-panel {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 12px;
  background: var(--xray-surface);
}

.xray-mobile-detail-panel {
  display: none;
}

.xray-request-detail {
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--xray-mauve) 6%, transparent), transparent 220px),
    var(--xray-bg);
}

.xray-detail-hero {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-shrink: 0;
  margin: 0;
  padding: 10px 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background: var(--xray-surface);
}

.xray-response-heading {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}

.xray-response-heading h3 {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--xray-text);
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

.xray-response-chips {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.xray-response-chip {
  height: 28px;
  display: inline-flex;
  align-items: center;
  padding: 0 9px;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 32%, transparent);
  border-radius: var(--xray-radius);
  color: var(--xray-subtext);
  background: rgba(var(--xray-bg-rgb), .68);
  font-size: 10px;
  font-weight: 900;
  white-space: nowrap;
}

.xray-response-chip.ok {
  color: var(--xray-green);
  border-color: color-mix(in srgb, var(--xray-green) 30%, transparent);
  background: color-mix(in srgb, var(--xray-green) 10%, transparent);
}

.xray-response-chip.warn {
  color: var(--xray-yellow);
  border-color: color-mix(in srgb, var(--xray-yellow) 30%, transparent);
  background: color-mix(in srgb, var(--xray-yellow) 10%, transparent);
}

.xray-response-chip.error {
  color: var(--xray-red);
  border-color: color-mix(in srgb, var(--xray-red) 30%, transparent);
  background: color-mix(in srgb, var(--xray-red) 10%, transparent);
}

.xray-detail-nav {
  flex-shrink: 0;
  display: grid;
  gap: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background: rgba(var(--xray-surface-rgb), .92);
}

.xray-detail-tabs,
.xray-detail-views {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}

.xray-detail-tabs::-webkit-scrollbar,
.xray-detail-views::-webkit-scrollbar {
  display: none;
}

.xray-detail-tabs {
  padding: 0 12px;
}

.xray-detail-tab {
  height: 38px;
  padding: 0 12px;
  border: 0;
  border-bottom: 2px solid transparent;
  color: var(--xray-hint);
  background: transparent;
  cursor: pointer;
  font: 900 11px/1 var(--xray-font);
  text-transform: capitalize;
}

.xray-detail-tab:hover,
.xray-detail-tab.active {
  color: var(--xray-text);
  border-bottom-color: var(--xray-mauve);
}

.xray-detail-views {
  padding: 7px 12px;
  border-top: 1px solid color-mix(in srgb, var(--xray-hint) 20%, transparent);
}

.xray-detail-content {
  min-width: 0;
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 12px;
  background:
    radial-gradient(circle at 82% 12%, color-mix(in srgb, var(--xray-blue) 6%, transparent), transparent 30%),
    rgba(var(--xray-bg-rgb), .74);
}

.xray-detail-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-top: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background: var(--xray-surface);
  overflow-x: auto;
}

.xray-smart-ops {
  min-width: 0;
}

.xray-action-btn {
  min-width: 0;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 12px;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 42%, transparent);
  border-radius: var(--xray-radius);
  color: var(--xray-subtext);
  background: transparent;
  cursor: pointer;
  font: 900 11px/1 var(--xray-font);
}

.xray-action-btn:hover,
.xray-action-btn:focus-visible {
  color: var(--xray-text);
  border-color: color-mix(in srgb, var(--xray-blue) 44%, transparent);
  background: color-mix(in srgb, var(--xray-blue) 10%, transparent);
}

.xray-action-btn.primary {
  color: var(--xray-accent, var(--xray-blue));
  border-color: color-mix(in srgb, var(--xray-accent, var(--xray-blue)) 46%, transparent);
  background: color-mix(in srgb, var(--xray-accent, var(--xray-blue)) 12%, transparent);
}

.xray-operation-groups {
  flex-shrink: 0;
  display: grid;
  gap: 6px;
  padding: 8px 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background: rgba(var(--xray-bg-rgb), .45);
}

.xray-operation-group {
  min-width: 0;
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  align-items: center;
  gap: 6px;
}

.xray-operation-group > span {
  color: var(--xray-hint);
  font-size: 9px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .08em;
}

.xray-operation-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  overflow: visible;
}

.xray-operation-bar .xray-chip {
  min-width: 0;
  height: 30px;
  padding: 0 10px;
  border-radius: var(--xray-radius);
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 10px;
}

.xray-operation-chip.view {
  color: var(--xray-mauve);
  border-color: color-mix(in srgb, var(--xray-mauve) 28%, transparent);
  background: color-mix(in srgb, var(--xray-mauve) 7%, transparent);
}

.xray-operation-chip.console {
  color: var(--xray-blue);
  border-color: color-mix(in srgb, var(--xray-blue) 30%, transparent);
  background: color-mix(in srgb, var(--xray-blue) 8%, transparent);
}

.xray-operation-chip.snippet {
  color: var(--xray-teal);
  border-color: color-mix(in srgb, var(--xray-teal) 30%, transparent);
  background: color-mix(in srgb, var(--xray-teal) 8%, transparent);
}

.xray-operation-chip.copy {
  color: var(--xray-subtext);
}

.xray-operation-chip.export {
  color: var(--xray-peach);
  border-color: color-mix(in srgb, var(--xray-peach) 32%, transparent);
  background: color-mix(in srgb, var(--xray-peach) 8%, transparent);
}

.xray-api-drawer-body .xray-filter-chips {
  flex-wrap: wrap;
  overflow: visible;
}

.xray-card,
.xray-modal {
  border: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  border-radius: var(--xray-radius);
  background: var(--xray-surface);
}

.xray-card {
  padding: 12px;
}

.xray-card h3,
.xray-detail-panel h3,
.xray-page h3 {
  margin: 0 0 10px;
  color: var(--xray-text);
  font-size: 13px;
}

.xray-json {
  margin: 0;
  color: var(--xray-text);
  white-space: pre-wrap;
  word-break: break-word;
  font: 700 11px/1.6 var(--xray-font);
}

.xray-json-editor {
  min-width: max-content;
  padding: 10px 0;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 22%, transparent);
  border-radius: var(--xray-radius);
  background:
    linear-gradient(90deg, rgba(var(--xray-bg-rgb), .84) 0 42px, rgba(var(--xray-surface-rgb), .52) 42px),
    rgba(var(--xray-bg-rgb), .52);
  box-shadow: inset 0 1px 0 rgba(var(--xray-text-rgb), .04);
}

.xray-json-line {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  min-height: 18px;
}

.xray-json-line:hover {
  background: color-mix(in srgb, var(--xray-blue) 6%, transparent);
}

.xray-json-line-no {
  padding: 0 10px 0 0;
  color: var(--xray-hint);
  text-align: right;
  user-select: none;
  border-right: 1px solid color-mix(in srgb, var(--xray-hint) 20%, transparent);
}

.xray-json-line-text {
  min-width: 0;
  padding: 0 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

.xray-json-key {
  color: var(--xray-mauve);
}

.xray-json-string {
  color: var(--xray-green);
}

.xray-json-number {
  color: var(--xray-teal);
}

.xray-json-bool {
  color: var(--xray-peach);
}

.xray-json-null {
  color: var(--xray-hint);
}

.xray-json-punct {
  color: var(--xray-subtext);
}

.xray-table {
  width: 100%;
  border-collapse: collapse;
  font: 700 11px/1.4 var(--xray-font);
}

.xray-table th,
.xray-table td {
  padding: 6px 8px;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 28%, transparent);
  text-align: left;
  vertical-align: top;
}

.xray-table th {
  color: var(--xray-mauve);
  background: var(--xray-bg);
}

.xray-modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(var(--xray-bg-rgb), .72);
  z-index: 2147483647;
}

.xray-modal {
  width: min(820px, 92vw);
  max-height: 82vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.xray-modal h3 {
  margin: 0;
  color: var(--xray-text);
  font-size: 13px;
}

.xray-modal-title-icon {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--xray-accent, var(--xray-blue));
  border: 1px solid color-mix(in srgb, var(--xray-accent, var(--xray-blue)) 28%, transparent);
  border-radius: var(--xray-radius);
  background: color-mix(in srgb, var(--xray-accent, var(--xray-blue)) 11%, transparent);
}

.xray-export-modal {
  width: min(980px, 94vw);
}

.xray-modal-head,
.xray-modal-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
}

.xray-modal-foot {
  border-top: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  border-bottom: 0;
}

.xray-modal-body {
  min-height: 0;
  overflow: auto;
  padding: 12px;
}

.xray-modal-subtitle,
.xray-export-subtitle {
  max-width: 520px;
  margin-top: 2px;
  color: var(--xray-hint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
  font-weight: 800;
}

.xray-modal-version {
  color: var(--xray-hint);
  font-size: 10px;
  font-weight: 800;
}

.xray-export-body {
  min-height: 0;
  flex: 1;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
}

.xray-export-rail {
  min-height: 0;
  overflow: auto;
  padding: 10px;
  border-right: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background: rgba(var(--xray-surface-rgb), .55);
}

.xray-export-mode {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 12px;
}

.xray-export-group {
  margin-bottom: 12px;
}

.xray-export-group-label {
  margin: 0 0 6px;
  color: var(--xray-hint);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.xray-export-format {
  width: 100%;
  min-height: 38px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  border: 1px solid transparent;
  border-radius: var(--xray-radius);
  padding: 0 10px;
  color: var(--xray-subtext);
  background: transparent;
  cursor: pointer;
  font: 800 11px/1.2 var(--xray-font);
  text-align: left;
}

.xray-export-format:hover {
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .06);
}

.xray-export-format.active {
  color: var(--xray-text);
  border-color: color-mix(in srgb, var(--xray-blue) 55%, transparent);
  background: color-mix(in srgb, var(--xray-blue) 13%, transparent);
}

.xray-export-format:disabled {
  opacity: .42;
  cursor: not-allowed;
}

.xray-export-format small {
  color: var(--xray-hint);
  font-size: 9px;
  text-transform: uppercase;
}

.xray-export-preview {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.xray-export-preview-head {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
}

.xray-export-preview-head h3 {
  margin: 0;
  color: var(--xray-text);
  font-size: 13px;
}

.xray-export-preview-head p {
  margin: 3px 0 0;
  color: var(--xray-hint);
  font-size: 11px;
}

.xray-export-code {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
  background: rgba(var(--xray-bg-rgb), .54);
}

.xray-textarea {
  width: 100%;
  min-height: 96px;
  resize: vertical;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 50%, transparent);
  border-radius: var(--xray-radius);
  padding: 10px;
  color: var(--xray-text);
  background: var(--xray-surface);
  font: 800 12px/1.45 var(--xray-font);
}

.xray-toast {
  position: absolute;
  right: 14px;
  bottom: 38px;
  max-width: min(420px, calc(100% - 28px));
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid color-mix(in srgb, var(--xray-teal) 42%, transparent);
  border-radius: var(--xray-radius);
  color: var(--xray-text);
  background: rgba(var(--xray-surface-rgb), .94);
  box-shadow: 0 12px 38px rgba(0, 0, 0, .32);
  font: 800 11px/1.35 var(--xray-font);
  cursor: pointer;
}

.xray-insight-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.xray-insight-columns,
.xray-settings-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.xray-insight-row {
  width: 100%;
  min-height: 34px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  border: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 20%, transparent);
  padding: 7px 0;
  color: var(--xray-text);
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: 800 11px/1.35 var(--xray-font);
}

.xray-insight-row:hover {
  color: var(--xray-blue);
}

.xray-insight-row span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-status-mix-row {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 28px;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  color: var(--xray-subtext);
  font: 800 11px/1.35 var(--xray-font);
}

.xray-settings-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.xray-settings-modal {
  width: min(620px, 94vw);
}

.xray-settings-modal-body {
  min-height: 400px;
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  overflow: hidden;
}

.xray-settings-nav {
  padding: 8px 0;
  border-right: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background: rgba(var(--xray-surface-rgb), .72);
}

.xray-settings-nav-item {
  width: 100%;
  min-height: 34px;
  display: flex;
  align-items: center;
  gap: 9px;
  border: 0;
  border-left: 2px solid transparent;
  padding: 0 14px;
  color: var(--xray-hint);
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: 800 11px/1 var(--xray-font);
}

.xray-settings-nav-item:hover {
  color: var(--xray-subtext);
  background: rgba(var(--xray-surface2-rgb), .55);
}

.xray-settings-nav-item.active {
  color: var(--xray-text);
  border-left-color: var(--xray-accent, var(--xray-mauve));
  background: color-mix(in srgb, var(--xray-accent, var(--xray-mauve)) 8%, transparent);
}

.xray-settings-content {
  min-height: 0;
  overflow: auto;
  padding: 16px;
}

.xray-settings-section-title {
  margin: 0 0 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  color: var(--xray-hint);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .10em;
  text-transform: uppercase;
}

.xray-settings-row {
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 8px 0;
  border-bottom: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 25%, transparent));
  color: var(--xray-text);
  font: 800 11px/1.35 var(--xray-font);
}

.xray-settings-row.read-only {
  align-items: flex-start;
}

.xray-settings-row strong,
.xray-settings-row small {
  display: block;
}

.xray-settings-row small {
  margin-top: 2px;
  color: var(--xray-hint);
  font-size: 10px;
  font-weight: 800;
}

.xray-toggle {
  width: 36px;
  height: 20px;
  flex: 0 0 auto;
  position: relative;
  border: 0;
  border-radius: 999px;
  background: var(--xray-surface2);
  cursor: pointer;
}

.xray-toggle::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: var(--xray-hint);
  transition: transform .15s ease, background .15s ease;
}

.xray-toggle.on {
  background: var(--xray-accent, var(--xray-blue));
}

.xray-toggle.on::after {
  transform: translateX(16px);
  /* The "on" track is --xray-accent, which resolveAccentValue() flips between a
     light pastel (dark themes) and a darkened variant (light themes). --xray-bg
     inverts with it, so the knob is dark-on-pastel or light-on-ink. Measured
     against the track: 9.13 on Operator, 8.77 Dev Edition, 9.58 Midnight, where
     the flat white it replaces managed 2.11. Light Lab/Claude give up a little
     (4.91 -> 4.40/4.23) because --xray-bg is near-white there anyway. */
  background: var(--xray-bg);
}

.xray-number-input {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.xray-number-input input,
.xray-select {
  height: 30px;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 45%, transparent);
  border-radius: var(--xray-radius-sm);
  color: var(--xray-text);
  background: var(--xray-surface2);
  font: 800 11px/1 var(--xray-font);
}

.xray-number-input input {
  width: 76px;
  padding: 0 8px;
  text-align: right;
}

.xray-select {
  min-width: 118px;
  padding: 0 8px;
}

.xray-color-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.xray-color-swatch {
  width: 23px;
  height: 23px;
  border: 2px solid transparent;
  border-radius: var(--xray-radius-sm);
  cursor: pointer;
}

.xray-color-swatch.active {
  border-color: var(--xray-text);
}

.xray-settings-danger {
  margin-top: 18px;
  padding: 12px;
  border: 1px solid color-mix(in srgb, var(--xray-red) 22%, transparent);
  border-radius: var(--xray-radius);
  background: color-mix(in srgb, var(--xray-red) 4%, transparent);
}

.xray-danger-title {
  margin-bottom: 8px;
  color: var(--xray-red);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .10em;
  text-transform: uppercase;
}

.xray-danger-row {
  width: 100%;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 0;
  border-radius: var(--xray-radius-sm);
  padding: 0 8px;
  color: var(--xray-red);
  background: transparent;
  cursor: pointer;
  font: 800 11px/1 var(--xray-font);
}

.xray-danger-row:hover {
  background: color-mix(in srgb, var(--xray-red) 8%, transparent);
}

.xray-confirm-modal {
  width: min(460px, 92vw);
}

.xray-confirm-message {
  margin: 0;
  color: var(--xray-subtext);
  font: 800 12px/1.55 var(--xray-font);
}

.xray-compact-rows .xray-api-row {
  min-height: 42px;
}

.xray-compact-rows .xray-api-row .xray-entry-meta,
.xray-compact-rows .xray-api-row .xray-api-flags {
  display: none;
}

.xray-command-modal {
  width: min(680px, 92vw);
}

.xray-command-search {
  display: block;
  padding: 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
}

.xray-command-list {
  display: grid;
  gap: 4px;
}

.xray-command-row {
  width: 100%;
  min-height: 40px;
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: var(--xray-radius);
  padding: 0 10px;
  color: var(--xray-text);
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: 800 12px/1.25 var(--xray-font);
}

.xray-command-row:hover {
  border-color: color-mix(in srgb, var(--xray-blue) 42%, transparent);
  background: color-mix(in srgb, var(--xray-blue) 10%, transparent);
}

.xray-command-row small {
  color: var(--xray-hint);
  font-size: 10px;
}

@container xray (max-width: 1700px) {
  .xray-api-body {
    grid-template-columns: minmax(260px, var(--xray-api-split, 480px)) minmax(340px, 1fr);
  }

  .xray-request-context-pane {
    display: none;
  }

  .xray-api-summary-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Window-coupled rules stay media-based: the panel's own width, and the modal
   overlays that live OUTSIDE the panel and size against the viewport. */
@media (max-width: 760px) {
  .xray-panel {
    width: 100vw;
  }

  .xray-export-modal {
    width: 96vw;
  }

  .xray-settings-modal {
    width: 96vw;
    max-height: 88vh;
  }

  .xray-settings-modal-body {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .xray-settings-nav {
    display: flex;
    overflow-x: auto;
    border-right: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  }

  .xray-settings-nav-item {
    flex: 0 0 auto;
    width: auto;
    border-left: 0;
    border-bottom: 2px solid transparent;
  }

  .xray-settings-nav-item.active {
    border-bottom-color: var(--xray-accent, var(--xray-mauve));
  }

  .xray-export-body {
    grid-template-columns: 1fr;
  }

  .xray-export-rail {
    display: flex;
    gap: 8px;
    border-right: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
    overflow-x: auto;
  }

  .xray-export-group {
    min-width: 170px;
    margin-bottom: 0;
  }

  .xray-export-preview-head {
    display: grid;
  }

  .xray-settings-grid {
    grid-template-columns: 1fr;
  }
}

@container xray (max-width: 760px) {
  /* Stacked layout: the panes are full-width, so there's nothing to split. */
  .xray-pane-divider {
    display: none;
  }

  .xray-topbar {
    gap: 6px;
    padding: 0 8px;
    overflow: hidden;
  }

  .xray-brand {
    min-width: 112px;
  }

  .xray-tabs {
    min-width: 0;
    flex: 1;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .xray-tabs::-webkit-scrollbar,
  .xray-console-head::-webkit-scrollbar,
  .xray-filter-chips::-webkit-scrollbar {
    display: none;
  }

  .xray-tab {
    flex: 0 0 auto;
    padding: 0 10px;
  }

  .xray-console-head {
    overflow-x: auto;
  }

  .xray-console-tabs,
  .xray-toolbar {
    flex: 0 0 auto;
  }

  .xray-toolbar {
    padding-right: 8px;
  }

  .xray-summary,
  .xray-network-row > :nth-child(5),
  .xray-network-row > :nth-child(6),
  .xray-network-head > :nth-child(5),
  .xray-network-head > :nth-child(6) {
    display: none;
  }

  .xray-filterbar {
    grid-template-columns: 1fr;
  }

  .xray-filter-chips {
    padding-bottom: 2px;
  }

  .xray-network-head,
  .xray-network-row {
    grid-template-columns: 52px 46px minmax(120px, 1fr) 92px;
  }

  .xray-split {
    grid-template-columns: 1fr;
  }

  .xray-detail-panel {
    display: none;
  }

  .xray-api-workspace {
    overflow: hidden;
  }

  .xray-api-body {
    grid-template-columns: 1fr;
  }

  .xray-api-toolbar {
    grid-template-columns: 1fr;
    padding: 8px;
  }

  .xray-api-collection-pane {
    border-right: 0;
  }

  .xray-api-collection-head {
    grid-template-columns: minmax(0, 1fr);
  }

  .xray-api-env-pill {
    justify-self: start;
  }

  .xray-api-summary-strip {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .xray-api-summary-strip::-webkit-scrollbar {
    display: none;
  }

  .xray-api-summary-pill {
    flex: 0 0 112px;
  }

  .xray-api-primary-filters,
  .xray-api-secondary-controls,
  .xray-api-secondary-controls .xray-filter-chips {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .xray-api-secondary-controls {
    display: grid;
    gap: 6px;
  }

  .xray-api-table-head,
  .xray-api-row {
    grid-template-columns: 48px minmax(0, 1fr) 46px 58px;
  }

  .xray-api-table-head > :nth-child(4),
  .xray-api-row > .xray-entry-duration {
    display: none;
  }

  .xray-api-row-actions {
    gap: 2px;
  }

  .xray-api-row-actions .xray-icon-btn[aria-label="Copy request URL"] {
    display: none;
  }

  .xray-api-detail-drawer {
    position: absolute;
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    height: min(68vh, 560px);
    border-left: 0;
    border-top: 1px solid color-mix(in srgb, var(--xray-blue) 34%, transparent);
    border-radius: var(--xray-radius-lg) var(--xray-radius-lg) 0 0;
    background: var(--xray-surface);
    box-shadow: 0 -22px 44px rgba(0, 0, 0, .28);
    z-index: 8;
    overflow: hidden;
  }

  .xray-api-drawer-body,
  .xray-request-detail,
  .xray-detail-content {
    max-width: 100%;
    overflow-x: hidden;
  }

  .xray-detail-content .xray-json-editor {
    min-width: 0;
  }

  .xray-json-line {
    grid-template-columns: 34px minmax(0, 1fr);
  }

  .xray-json-line-no {
    padding-right: 8px;
  }

  .xray-json-line-text {
    padding: 0 9px;
    overflow-wrap: anywhere;
  }

  .xray-detail-tabs,
  .xray-detail-views,
  .xray-operation-bar {
    max-width: 100%;
  }

  .xray-detail-views {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    overflow-x: visible;
  }

  .xray-detail-views .xray-chip {
    min-width: 0;
    justify-content: center;
  }

  .xray-operation-group {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .xray-operation-bar {
    display: grid;
    grid-template-columns: 1fr;
  }

  .xray-operation-bar .xray-chip {
    justify-content: center;
  }

  .xray-detail-footer {
    display: grid;
    grid-template-columns: 1fr;
    overflow-x: visible;
    align-items: stretch;
  }

  .xray-detail-footer .xray-action-btn {
    min-width: 0;
    overflow: hidden;
  }

  .xray-api-detail-drawer.empty {
    display: none;
  }

  .xray-entry-row {
    grid-template-columns: 9px 44px 42px minmax(0, 1fr) auto 28px;
  }

  .xray-list-panel > .xray-virtual-list {
    min-height: 168px;
  }

  .xray-entry-duration {
    display: none;
  }

  .xray-mobile-detail-panel {
    display: block;
    flex-shrink: 0;
    max-height: 38vh;
    overflow: auto;
    border-top: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
    background: var(--xray-surface);
  }

  .xray-prompt {
    grid-template-columns: 20px minmax(120px, 1fr) auto;
    gap: 6px;
    padding: 8px;
  }

  .xray-context-chip {
    display: none;
  }

  .xray-insight-grid,
  .xray-insight-columns {
    grid-template-columns: 1fr;
  }

  .xray-page-head {
    display: grid;
  }
}

@container xray (max-width: 420px) {
  .xray-api-table-head,
  .xray-api-row {
    grid-template-columns: 42px minmax(0, 1fr) 42px 48px;
    gap: 5px;
    padding-left: 8px;
    padding-right: 8px;
  }

  .xray-api-table-head > :nth-child(4),
  .xray-api-row > .xray-entry-duration {
    display: none;
  }

  .xray-response-chips,
  .xray-detail-footer {
    flex-wrap: wrap;
  }

  .xray-detail-footer {
    overflow-x: visible;
    align-items: stretch;
  }

  .xray-detail-footer .xray-action-btn {
    flex: 1 1 calc(50% - 8px);
  }

  .xray-detail-views {
    flex-wrap: wrap;
    overflow-x: visible;
  }

  .xray-detail-views .xray-chip {
    flex: 1 1 auto;
    justify-content: center;
  }

  .xray-operation-group {
    grid-template-columns: 1fr;
  }

  .xray-api-row-actions .xray-icon-btn {
    width: 25px;
  }
}

/* \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   XRAY Operator UI override layer
   Configurable developer cockpit skin applied across existing tabs.
   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.xray-panel .xray-api-workspace,
.xray-panel .xray-console-workspace,
.xray-panel .xray-insights,
.xray-panel .xray-settings-page,
.xray-panel .xray-logs-workspace {
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--xray-bg) 92%, var(--xray-accent) 8%), var(--xray-bg));
}

.xray-panel .xray-api-collection-pane,
.xray-panel .xray-api-detail-pane,
.xray-panel .xray-console-main,
.xray-panel .xray-card,
.xray-panel .xray-settings-card,
.xray-panel .xray-modal-card {
  border-color: var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
  background: linear-gradient(180deg, color-mix(in srgb, var(--xray-surface) 94%, white 6%), var(--xray-surface));
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--xray-text) 3.5%, transparent), 0 18px 50px rgba(0,0,0,.18);
}

.xray-panel .xray-api-row,
.xray-panel .xray-entry-row,
.xray-panel .xray-console-row,
.xray-panel .xray-log-row {
  min-height: var(--xray-row-h, 52px);
  border-color: color-mix(in srgb, var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent)) 72%, transparent);
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--xray-accent) 2%, transparent));
  transition: background .12s ease, border-color .12s ease, transform .12s ease, box-shadow .12s ease;
}

.xray-panel .xray-api-row:hover,
.xray-panel .xray-entry-row:hover,
.xray-panel .xray-console-row:hover,
.xray-panel .xray-log-row:hover {
  background: linear-gradient(90deg, color-mix(in srgb, var(--xray-accent) 9%, transparent), color-mix(in srgb, var(--xray-surface2) 72%, transparent));
  border-color: color-mix(in srgb, var(--xray-accent) 45%, transparent);
}

.xray-glow .xray-api-row.selected,
.xray-glow .xray-entry-row.selected,
.xray-glow .xray-console-row.selected,
.xray-glow .xray-log-row.selected {
  box-shadow: inset 3px 0 0 var(--xray-accent), 0 0 28px color-mix(in srgb, var(--xray-accent) 12%, transparent);
}

.xray-panel .xray-method,
.xray-panel .xray-status,
.xray-panel .xray-response-chip,
.xray-panel .xray-chip,
.xray-panel .xray-badge {
  border: 1px solid color-mix(in srgb, currentColor 28%, transparent);
  font-weight: 900;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.xray-panel .xray-method.get { color: var(--xray-green); }
.xray-panel .xray-method.post { color: var(--xray-blue); }
.xray-panel .xray-method.put,
.xray-panel .xray-method.patch { color: var(--xray-yellow); }
.xray-panel .xray-method.delete { color: var(--xray-red); }

.xray-panel .xray-input,
.xray-panel .xray-select,
.xray-panel textarea,
.xray-panel input,
.xray-panel select {
  background: color-mix(in srgb, var(--xray-surface2) 88%, black 12%);
  border-color: var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
  color: var(--xray-text);
  font-family: var(--xray-font);
}

.xray-panel .xray-input:focus,
.xray-panel .xray-select:focus,
.xray-panel textarea:focus,
.xray-panel input:focus,
.xray-panel select:focus {
  outline: none;
  border-color: var(--xray-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--xray-accent) 18%, transparent);
}

.xray-panel .xray-json,
.xray-panel .xray-json-editor,
.xray-panel pre,
.xray-panel code,
.xray-panel kbd {
  font-family: var(--xray-font);
}

.xray-panel .xray-json,
.xray-panel .xray-json-editor {
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--xray-accent) 5%, transparent), transparent 16%),
    color-mix(in srgb, var(--xray-bg) 86%, black 14%);
  border: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
  border-radius: var(--xray-radius);
}

.xray-panel .xray-json-line-no {
  color: color-mix(in srgb, var(--xray-hint) 82%, transparent);
  border-right: 1px solid color-mix(in srgb, var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent)) 72%, transparent);
}

.xray-panel .xray-json-key { color: var(--xray-blue); }
.xray-panel .xray-json-string { color: var(--xray-green); }
.xray-panel .xray-json-number { color: var(--xray-peach); }
.xray-panel .xray-json-bool { color: var(--xray-mauve); }
.xray-panel .xray-json-null { color: var(--xray-hint); }

.xray-panel .xray-detail-hero,
.xray-panel .xray-console-head,
.xray-panel .xray-api-toolbar,
.xray-panel .xray-api-command-bar,
.xray-panel .xray-detail-nav {
  background: linear-gradient(180deg, color-mix(in srgb, var(--xray-surface) 92%, var(--xray-accent) 8%), var(--xray-surface));
  border-color: var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
}

.xray-panel .xray-detail-tabs button,
.xray-panel .xray-view-btn,
.xray-panel .xray-operation-btn,
.xray-panel .xray-action-btn,
.xray-panel .xray-btn,
.xray-panel .xray-icon-btn {
  border-radius: var(--xray-radius);
}

.xray-panel .xray-operation-btn,
.xray-panel .xray-action-btn.primary,
.xray-panel .xray-btn.primary {
  background: linear-gradient(135deg, color-mix(in srgb, var(--xray-accent) 20%, transparent), color-mix(in srgb, var(--xray-mauve) 14%, transparent));
  border-color: color-mix(in srgb, var(--xray-accent) 48%, transparent);
}

.xray-glow .xray-operation-btn:hover,
.xray-glow .xray-action-btn.primary:hover,
.xray-glow .xray-btn.primary:hover {
  box-shadow: 0 0 24px color-mix(in srgb, var(--xray-accent) 18%, transparent);
}

.xray-panel .xray-settings-section-title,
.xray-panel .xray-danger-title,
.xray-panel h3,
.xray-panel h4 {
  text-transform: uppercase;
  letter-spacing: .12em;
  color: color-mix(in srgb, var(--xray-text) 88%, var(--xray-accent) 12%);
}

.xray-panel.xray-density-compact .xray-api-row,
.xray-panel.xray-density-compact .xray-console-row,
.xray-panel.xray-density-compact .xray-settings-row {
  font-size: 11px;
}

.xray-panel.xray-density-spacious .xray-api-row,
.xray-panel.xray-density-spacious .xray-console-row,
.xray-panel.xray-density-spacious .xray-settings-row {
  font-size: 13px;
}

@media (prefers-reduced-motion: reduce) {
  .xray-panel,
  .xray-panel *,
  .xray-panel *::before,
  .xray-panel *::after {
    transition: none !important;
    animation: none !important;
  }
}

/* \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   XRAY Operator UI tab-specific polish
   Firefox DevTools density + terminal-grade inspector ergonomics.
   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.xray-panel .xray-filterbar {
  gap: 10px;
  padding: 14px;
  border-bottom: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
  background: color-mix(in srgb, var(--xray-surface) 84%, transparent);
}

.xray-panel .xray-search {
  min-height: 38px;
  border: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
  border-radius: var(--xray-radius);
  background: color-mix(in srgb, var(--xray-bg) 72%, var(--xray-surface2) 28%);
}

.xray-panel .xray-network-head,
.xray-panel .xray-api-table-head {
  min-height: 32px;
  color: var(--xray-accent);
  background: color-mix(in srgb, var(--xray-bg) 86%, black 14%);
  border-bottom: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .14em;
  text-transform: uppercase;
}

.xray-panel .xray-network-row,
.xray-panel .xray-api-row {
  font-variant-numeric: tabular-nums;
}

.xray-panel .xray-network-row.selected,
.xray-panel .xray-api-row.selected {
  background: linear-gradient(90deg, color-mix(in srgb, var(--xray-accent) 18%, transparent), color-mix(in srgb, var(--xray-surface2) 80%, transparent));
  border-color: color-mix(in srgb, var(--xray-accent) 55%, transparent);
}

.xray-panel .xray-path,
.xray-panel .xray-api-path,
.xray-panel .xray-response-heading h3 {
  color: color-mix(in srgb, var(--xray-text) 86%, var(--xray-accent) 14%);
  font-weight: 800;
}

.xray-panel .xray-bar-track {
  background: color-mix(in srgb, var(--xray-surface3, var(--xray-surface2)) 78%, black 22%);
  border: 1px solid color-mix(in srgb, var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent)) 70%, transparent);
  overflow: hidden;
}

.xray-panel .xray-bar {
  background: linear-gradient(90deg, var(--xray-accent), var(--xray-green));
  box-shadow: 0 0 16px color-mix(in srgb, var(--xray-accent) 28%, transparent);
}

.xray-panel .xray-bar.slow { background: linear-gradient(90deg, var(--xray-yellow), var(--xray-peach)); }
.xray-panel .xray-bar.error { background: linear-gradient(90deg, var(--xray-red), color-mix(in srgb, var(--xray-red) 62%, var(--xray-peach))); }

.xray-panel .xray-request-detail {
  background: color-mix(in srgb, var(--xray-bg) 92%, black 8%);
}

.xray-panel .xray-detail-hero {
  padding: calc(14px * var(--xray-density-scale, 1));
  box-shadow: inset 3px 0 0 var(--xray-accent);
}

.xray-panel .xray-detail-tab,
.xray-panel .xray-detail-views .xray-chip {
  height: 30px;
  border: 1px solid transparent;
  color: var(--xray-subtext);
  background: transparent;
  font: 900 10px/1 var(--xray-font);
  letter-spacing: .1em;
  text-transform: uppercase;
}

.xray-panel .xray-detail-tab.active,
.xray-panel .xray-detail-views .xray-chip.active {
  color: var(--xray-text);
  border-color: color-mix(in srgb, var(--xray-accent) 55%, transparent);
  background: color-mix(in srgb, var(--xray-accent) 12%, transparent);
}

.xray-panel .xray-operation-groups {
  padding: 10px 12px;
  background: color-mix(in srgb, var(--xray-surface) 75%, transparent);
  border-bottom: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
}

.xray-panel .xray-operation-group-label {
  color: var(--xray-hint);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .14em;
  text-transform: uppercase;
}

.xray-panel .xray-operation-btn {
  min-height: 30px;
  color: var(--xray-text);
  font-size: 10px;
}

.xray-panel .xray-console-head {
  min-height: var(--xray-chrome-h, 44px);
}

.xray-panel .xray-console-tabs .xray-mini-tab {
  text-transform: none;
  letter-spacing: .04em;
}

.xray-panel .xray-console-row {
  font-variant-numeric: tabular-nums;
  /* Message stream scans best dense \u2014 override the shared 52px operator row
     height (that height is tuned for the API/log tables, not a log stream). */
  min-height: 28px;
}

.xray-panel .xray-prompt {
  gap: 10px;
  padding: 10px 12px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--xray-surface) 82%, transparent), color-mix(in srgb, var(--xray-bg) 96%, black 4%));
  border-top: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
}

.xray-panel .xray-prompt::before {
  content: '>';
  color: var(--xray-accent);
  font: 900 18px/1 var(--xray-font);
  text-shadow: 0 0 12px color-mix(in srgb, var(--xray-accent) 55%, transparent);
}

.xray-panel .xray-prompt .xray-input {
  min-height: 40px;
  border-radius: var(--xray-radius);
}

.xray-panel .xray-statusbar {
  min-height: 28px;
  padding: 0 12px;
  color: var(--xray-subtext);
  background: color-mix(in srgb, var(--xray-bg) 90%, black 10%);
  border-top: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .08em;
  text-transform: lowercase;
}

.xray-panel .xray-page-head {
  border-bottom: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
  background: linear-gradient(180deg, color-mix(in srgb, var(--xray-surface) 88%, var(--xray-accent) 12%), var(--xray-surface));
}

.xray-panel .xray-page-head h3 {
  margin: 0;
  font-size: 14px;
}

.xray-panel .xray-page-head p {
  color: var(--xray-subtext);
}

.xray-panel .xray-insight-columns,
.xray-panel .xray-insight-grid {
  padding: 14px;
}

.xray-panel .xray-card::before,
.xray-panel .xray-api-metric::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: linear-gradient(180deg, var(--xray-accent), transparent);
  opacity: .75;
}

.xray-panel .xray-card {
  position: relative;
  overflow: hidden;
}

.xray-panel .xray-insight-row {
  border: 1px solid transparent;
  border-radius: var(--xray-radius);
  background: color-mix(in srgb, var(--xray-surface2) 44%, transparent);
}

.xray-panel .xray-insight-row:hover {
  border-color: color-mix(in srgb, var(--xray-accent) 42%, transparent);
  background: color-mix(in srgb, var(--xray-accent) 10%, var(--xray-surface2) 60%);
}

.xray-panel .xray-api-metric {
  position: relative;
  overflow: hidden;
  border-color: var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
  background: linear-gradient(145deg, color-mix(in srgb, var(--xray-surface) 88%, white 7%), color-mix(in srgb, var(--xray-bg) 90%, black 10%));
}

.xray-panel .xray-api-metric strong {
  font-size: 18px;
  color: var(--xray-text);
  text-shadow: 0 0 16px color-mix(in srgb, var(--xray-accent) 20%, transparent);
}

/* XRAY Operator UI prompt layout hardening */
.xray-panel .xray-prompt {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) minmax(180px, auto);
  gap: 10px;
  align-items: center;
  padding: 10px 14px;
  border-top: 1px solid color-mix(in srgb, var(--xray-border) 78%, transparent);
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--xray-bg-elevated) 92%, transparent), color-mix(in srgb, var(--xray-bg) 92%, transparent)),
    linear-gradient(180deg, color-mix(in srgb, var(--xray-accent) 12%, transparent), transparent 60%);
}

.xray-panel .xray-prompt::before {
  display: none;
}

.xray-panel .xray-prompt > svg {
  color: var(--xray-accent-2);
  filter: drop-shadow(0 0 8px color-mix(in srgb, var(--xray-accent-2) 32%, transparent));
}

.xray-panel .xray-prompt-command {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 10px;
  align-items: center;
}

.xray-panel .xray-prompt input,
.xray-panel .xray-prompt textarea {
  min-width: 0;
  width: 100%;
  min-height: 38px;
  padding: 10px 13px;
  border: 1px solid color-mix(in srgb, var(--xray-border) 90%, var(--xray-accent));
  border-radius: var(--xray-radius-lg);
  color: var(--xray-text);
  background: color-mix(in srgb, var(--xray-bg-elevated) 82%, transparent);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--xray-text) 4%, transparent);
  font: inherit;
}

.xray-panel .xray-prompt input:focus,
.xray-panel .xray-prompt textarea:focus {
  outline: none;
  border-color: color-mix(in srgb, var(--xray-accent) 78%, var(--xray-border));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--xray-accent) 16%, transparent);
}

.xray-panel .xray-context-chip {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: end;
  max-width: min(28vw, 460px);
  padding: 8px 13px;
  border: 1px solid color-mix(in srgb, var(--xray-accent) 55%, var(--xray-border));
  border-radius: 999px;
  color: var(--xray-text);
  background: color-mix(in srgb, var(--xray-accent) 10%, transparent);
}

@container xray (max-width: 860px) {
  .xray-panel .xray-prompt {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .xray-panel .xray-prompt-command {
    grid-column: 2 / -1;
  }

  .xray-panel .xray-context-chip {
    grid-column: 2 / -1;
    justify-self: stretch;
    max-width: none;
  }
}


/* \u2500\u2500 God-tier feature styling: flags, drift, actions, waterfall, frames, tokens, rules, replay, AI \u2500\u2500 */

.xray-api-flag.drift,
.xray-api-flag.graphql {
  color: var(--xray-mauve);
  border-color: color-mix(in srgb, var(--xray-mauve) 40%, transparent);
  background: color-mix(in srgb, var(--xray-mauve) 12%, transparent);
}

.xray-api-flag.ws {
  color: var(--xray-teal);
  border-color: color-mix(in srgb, var(--xray-teal) 38%, transparent);
  background: color-mix(in srgb, var(--xray-teal) 12%, transparent);
}

.xray-api-flag.mocked,
.xray-api-flag.replayed {
  color: var(--xray-blue);
  border-color: color-mix(in srgb, var(--xray-blue) 38%, transparent);
  background: color-mix(in srgb, var(--xray-blue) 12%, transparent);
}

.xray-drift-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 12px 0;
  padding: 8px 12px;
  border: 1px solid color-mix(in srgb, var(--xray-mauve) 40%, transparent);
  border-radius: var(--xray-radius);
  color: var(--xray-mauve);
  background: color-mix(in srgb, var(--xray-mauve) 10%, transparent);
  font-size: 11px;
}

.xray-drift-banner span {
  flex: 1;
}

.xray-detail-actionbar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 12px 0;
}

.xray-waterfall-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.xray-waterfall-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.xray-waterfall-track {
  display: flex;
  width: 100%;
  height: 16px;
  border-radius: var(--xray-radius-sm);
  overflow: hidden;
  background: rgba(var(--xray-bg-rgb), .55);
}

.xray-waterfall-seg {
  height: 100%;
  min-width: 2px;
}

.xray-waterfall-seg.dns,
.xray-waterfall-dot.dns { background: var(--xray-mauve); }
.xray-waterfall-seg.connect,
.xray-waterfall-dot.connect { background: var(--xray-blue); }
.xray-waterfall-seg.tls,
.xray-waterfall-dot.tls { background: var(--xray-teal); }
.xray-waterfall-seg.ttfb,
.xray-waterfall-dot.ttfb { background: var(--xray-yellow); }
.xray-waterfall-seg.download,
.xray-waterfall-dot.download { background: var(--xray-green); }
.xray-waterfall-seg.total,
.xray-waterfall-dot.total { background: var(--xray-accent, var(--xray-blue)); }

.xray-waterfall-legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.xray-waterfall-legend li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--xray-subtext);
}

.xray-waterfall-legend strong {
  color: var(--xray-text);
}

.xray-waterfall-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--xray-radius-sm);
}

/* Frames (WebSocket / SSE) */
.xray-frames {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.xray-frames-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 4px;
}

.xray-ws-state {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--xray-subtext);
  background: color-mix(in srgb, var(--xray-hint) 20%, transparent);
}

.xray-ws-state.open { color: var(--xray-green); background: color-mix(in srgb, var(--xray-green) 14%, transparent); }
.xray-ws-state.closed { color: var(--xray-subtext); }
.xray-ws-state.error { color: var(--xray-red); background: color-mix(in srgb, var(--xray-red) 14%, transparent); }

.xray-frames-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: auto;
}

.xray-frame-row {
  display: grid;
  grid-template-columns: 52px 64px 56px 1fr;
  gap: 8px;
  align-items: center;
  padding: 5px 8px;
  border-radius: var(--xray-radius-sm);
  background: rgba(var(--xray-bg-rgb), .4);
  font-size: 11px;
}

.xray-frame-row.out { background: color-mix(in srgb, var(--xray-blue) 8%, transparent); }

.xray-frame-dir {
  font-weight: 800;
  font-size: 10px;
}

.xray-frame-dir.in { color: var(--xray-green); }
.xray-frame-dir.out { color: var(--xray-blue); }

.xray-frame-time,
.xray-frame-size {
  color: var(--xray-hint);
}

.xray-frame-preview {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--xray-text);
}

.xray-initiator-list {
  margin: 8px 0 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.xray-initiator-list code {
  color: var(--xray-subtext);
  font-size: 11px;
}

/* JWT tokens */
.xray-tokens {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.xray-token-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.xray-token-source {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  color: var(--xray-text);
}

.xray-token-exp {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 999px;
}

.xray-token-exp.valid { color: var(--xray-green); background: color-mix(in srgb, var(--xray-green) 14%, transparent); }
.xray-token-exp.expired { color: var(--xray-red); background: color-mix(in srgb, var(--xray-red) 14%, transparent); }

.xray-token-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.xray-token-label {
  display: block;
  margin-bottom: 4px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--xray-hint);
}

/* Rules tab */
.xray-rules-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-border, color-mix(in srgb, var(--xray-hint) 30%, transparent)) 70%, transparent);
}

.xray-rules-toolbar-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--xray-subtext);
  margin-right: 2px;
}

.xray-rules-import {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.xray-rules-import-field {
  min-height: 96px;
  resize: vertical;
  font-family: var(--xray-font);
  font-size: 11px;
}

.xray-rules-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.xray-rules-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  color: var(--xray-subtext);
  padding: 32px;
}

.xray-rule-card.disabled {
  opacity: .6;
}

.xray-rule-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.xray-rule-label {
  flex: 1;
  font-weight: 700;
}

.xray-rule-summary {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--xray-accent, var(--xray-blue));
  white-space: nowrap;
}

.xray-rule-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.xray-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 180px;
}

.xray-field > span {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--xray-hint);
}

.xray-field-narrow {
  flex: 0 0 120px;
  min-width: 120px;
}

.xray-rule-body,
.xray-replay-headers,
.xray-replay-bodyfield {
  min-height: 96px;
  resize: vertical;
  font-family: var(--xray-font);
  line-height: 1.5;
}

.xray-rule-body {
  margin-top: 10px;
}

/* Replay modal */
.xray-replay-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 2px;
}

.xray-replay-line {
  display: flex;
  gap: 8px;
}

.xray-replay-line .xray-select {
  flex: 0 0 110px;
}

.xray-replay-line .xray-input {
  flex: 1;
}

/* AI Explain modal */
.xray-explain-body {
  min-height: 160px;
  padding: 6px 2px;
}

.xray-explain-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--xray-subtext);
  padding: 24px 0;
}

.xray-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid color-mix(in srgb, var(--xray-blue) 30%, transparent);
  border-top-color: var(--xray-accent, var(--xray-blue));
  border-radius: 50%;
  animation: xray-spin .7s linear infinite;
}

@keyframes xray-spin {
  to { transform: rotate(360deg); }
}

.xray-explain-error {
  display: flex;
  gap: 10px;
  color: var(--xray-red);
  padding: 16px 0;
}

.xray-explain-error .xray-btn {
  margin-top: 8px;
}

.xray-explain-result {
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--xray-text);
  font-size: 12px;
}

/* \u2500\u2500 Console snippet bar (folded-in Notebook) \u2500\u2500 */
.xray-snippet-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-top: 1px solid color-mix(in srgb, var(--xray-surface2) 70%, transparent);
  background: color-mix(in srgb, var(--xray-surface) 82%, transparent);
  overflow: hidden;
}

.xray-snippet-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .4px;
  color: var(--xray-hint);
}

.xray-snippet-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.xray-snippet-chips::-webkit-scrollbar { display: none; }

.xray-snippet-chip {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  max-width: 220px;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 36%, transparent);
  border-radius: 999px;
  background: rgba(var(--xray-surface-rgb), .6);
  overflow: hidden;
}

.xray-snippet-load {
  max-width: 190px;
  padding: 4px 4px 4px 10px;
  border: none;
  background: transparent;
  color: var(--xray-subtext);
  font: inherit;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.xray-snippet-load:hover {
  color: var(--xray-accent, var(--xray-blue));
}

.xray-snippet-remove {
  display: inline-flex;
  align-items: center;
  padding: 0 7px;
  height: 100%;
  border: none;
  background: transparent;
  color: var(--xray-hint);
  cursor: pointer;
}

.xray-snippet-remove:hover { color: var(--xray-red); }

.xray-snippet-save {
  flex-shrink: 0;
  padding: 5px 10px;
}

/* \u2500\u2500 Console live/paused stream toggle \u2500\u2500 */
.xray-btn.xray-live {
  color: var(--xray-green);
  border-color: color-mix(in srgb, var(--xray-green) 32%, transparent);
  background: color-mix(in srgb, var(--xray-green) 8%, transparent);
}

.xray-btn.xray-paused {
  color: var(--xray-hint);
}

.xray-btn.xray-paused svg {
  opacity: .6;
}

/* \u2500\u2500 Log detail (Logs tab) \u2500\u2500 */
.xray-log-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
  gap: 10px;
}

.xray-log-detail-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.xray-log-level {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--xray-subtext);
  background: color-mix(in srgb, var(--xray-hint) 18%, transparent);
}

.xray-log-level.error { color: var(--xray-red); background: color-mix(in srgb, var(--xray-red) 14%, transparent); }
.xray-log-level.warn { color: var(--xray-yellow); background: color-mix(in srgb, var(--xray-yellow) 14%, transparent); }
.xray-log-level.info { color: var(--xray-blue); background: color-mix(in srgb, var(--xray-blue) 14%, transparent); }

.xray-log-load {
  margin-left: auto;
}

.xray-log-message {
  padding: 8px 10px;
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-bg-rgb), .5);
  color: var(--xray-text);
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

.xray-log-detail-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.xray-log-hint {
  font-size: 11px;
}

/* \u2500\u2500 Visualize view: single-series horizontal bars \u2500\u2500 */
.xray-viz {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 2px;
}

.xray-viz-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.xray-viz-head h3 {
  margin: 0;
  font-size: 13px;
}

.xray-viz-bars {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.xray-viz-row {
  display: grid;
  grid-template-columns: minmax(60px, 160px) 1fr minmax(48px, auto);
  align-items: center;
  gap: 10px;
  padding: 2px 0;
}

.xray-viz-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  color: var(--xray-subtext);
}

.xray-viz-track {
  position: relative;
  height: 14px;
  border-radius: var(--xray-radius-sm);
  background: color-mix(in srgb, var(--xray-surface2) 60%, transparent);
}

.xray-viz-fill {
  display: block;
  height: 100%;
  min-width: 3px;
  border-radius: var(--xray-radius-sm);
  background: var(--xray-accent, var(--xray-blue));
}

.xray-viz-fill.negative {
  background: var(--xray-red);
}

.xray-viz-value {
  font-size: 11px;
  font-weight: 700;
  color: var(--xray-text);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.xray-viz-foot {
  font-size: 11px;
}

/* \u2500\u2500 Theme picker swatches (Settings \u2192 Appearance) \u2500\u2500 */
.xray-theme-picker-row {
  align-items: flex-start;
}

.xray-theme-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  min-width: 220px;
}

.xray-theme-swatch {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 28%, transparent));
  border-radius: var(--xray-radius);
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: transform .12s ease, border-color .12s ease, box-shadow .12s ease;
}

.xray-theme-swatch:hover {
  transform: translateY(-1px);
}

.xray-theme-swatch.active {
  border-color: var(--xray-accent, var(--xray-blue));
  box-shadow: 0 0 0 1px var(--xray-accent, var(--xray-blue)), 0 6px 18px rgba(0, 0, 0, .3);
}

.xray-theme-swatch-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 8px currentColor;
}

.xray-theme-swatch-label {
  flex: 1;
  text-align: left;
}

/* \u2500\u2500 Toast: slide in, auto-dismiss \u2500\u2500 */
.xray-toast {
  animation: xray-toast-in .18s cubic-bezier(.2, .8, .3, 1);
}

@keyframes xray-toast-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* \u2500\u2500 Visualize bars: grow-in for perceived speed \u2500\u2500 */
.xray-viz-fill {
  transform-origin: left center;
  animation: xray-bar-grow .32s cubic-bezier(.2, .8, .3, 1);
}

@keyframes xray-bar-grow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* \u2500\u2500 Consistent focus-visible + interaction transitions \u2500\u2500 */
.xray-app-root button:focus-visible,
.xray-hud button:focus-visible,
.xray-app-root [role="button"]:focus-visible,
.xray-hud [role="button"]:focus-visible,
.xray-app-root .xray-input:focus-visible,
.xray-hud .xray-input:focus-visible {
  outline: 2px solid var(--xray-accent, var(--xray-blue));
  outline-offset: 1px;
}

.xray-chip,
.xray-icon-btn,
.xray-btn,
.xray-api-row,
.xray-network-row,
.xray-entry-row {
  transition: background-color .12s ease, border-color .12s ease, color .12s ease, transform .12s ease, box-shadow .12s ease;
}

.xray-icon-btn:hover {
  transform: translateY(-1px);
}

/* In-row action buttons live inside a scrolling virtualized list; the hover lift
   reads as jitter there while the row itself stays put. Keep them flat. */
.xray-api-row .xray-icon-btn:hover,
.xray-api-row-actions .xray-icon-btn:hover,
.xray-network-row .xray-icon-btn:hover,
.xray-console-row .xray-icon-btn:hover,
.xray-log-row .xray-icon-btn:hover {
  transform: none;
}

.xray-api-table-scroll:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--xray-accent, var(--xray-blue)) 45%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .xray-toast,
  .xray-viz-fill {
    animation: none;
  }
}

/* \u2500\u2500 Custom theme builder (Settings \u2192 Appearance) \u2500\u2500 */
.xray-custom-theme {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 8px 0 4px;
  padding: 14px;
  border: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 30%, transparent));
  border-radius: var(--xray-radius-lg);
  background: rgba(var(--xray-surface-rgb), .5);
}

.xray-custom-presets {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding-bottom: 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-surface2) 70%, transparent);
}

.xray-custom-presets-label {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .5px;
  color: var(--xray-hint);
  margin-right: 2px;
}

.xray-custom-preset-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
}

.xray-custom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.xray-custom-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.xray-custom-meta strong {
  font-size: 12px;
  color: var(--xray-text);
}

.xray-custom-meta small {
  font-size: 10px;
  color: var(--xray-hint);
}

.xray-custom-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.xray-color-input {
  width: 34px;
  height: 30px;
  padding: 0;
  border: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 40%, transparent));
  border-radius: var(--xray-radius);
  background: transparent;
  cursor: pointer;
}

.xray-color-input::-webkit-color-swatch-wrapper { padding: 3px; }
.xray-color-input::-webkit-color-swatch { border: none; border-radius: var(--xray-radius-sm); }

.xray-custom-hex {
  width: 92px;
  text-transform: lowercase;
  font-variant-ligatures: none;
}

.xray-custom-hex.invalid {
  border-color: var(--xray-red);
}

.xray-custom-note {
  margin: 2px 0 0;
  font-size: 10px;
  line-height: 1.5;
  color: var(--xray-hint);
}

/* \u2500\u2500 Live theme preview (painted with the resolved theme vars) \u2500\u2500 */
.xray-theme-preview {
  border: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 30%, transparent));
  border-radius: var(--xray-radius);
  background: var(--xray-bg);
  color: var(--xray-text);
  overflow: hidden;
  font-size: 11px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, .18);
}

.xray-tp-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--xray-surface) 94%, white 6%), var(--xray-surface));
  border-bottom: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 30%, transparent));
  box-shadow: inset 0 -1px 0 color-mix(in srgb, var(--xray-accent) 18%, transparent);
}

.xray-tp-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--xray-accent);
  box-shadow: 0 0 8px var(--xray-accent);
}

.xray-tp-brand {
  font-weight: 900;
  letter-spacing: .12em;
  font-size: 10px;
}

.xray-tp-tab {
  padding: 2px 8px;
  border-radius: 999px;
  color: var(--xray-subtext);
}

.xray-tp-tab.active {
  color: var(--xray-accent);
  background: color-mix(in srgb, var(--xray-accent) 14%, transparent);
}

.xray-tp-grow { flex: 1; }

.xray-tp-btn {
  padding: 2px 10px;
  border-radius: var(--xray-radius-sm, 6px);
  font-weight: 700;
  color: var(--xray-bg);
  background: var(--xray-accent);
}

.xray-tp-rows {
  display: flex;
  flex-direction: column;
}

.xray-tp-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-border, color-mix(in srgb, var(--xray-hint) 30%, transparent)) 55%, transparent);
}

.xray-tp-row.selected {
  background: color-mix(in srgb, var(--xray-accent) 16%, transparent);
  box-shadow: inset 2px 0 0 var(--xray-accent);
}

.xray-tp-method {
  font-weight: 800;
  font-size: 10px;
  min-width: 44px;
}

.xray-tp-method.get { color: var(--xray-green); }
.xray-tp-method.post { color: var(--xray-blue); }
.xray-tp-method.delete { color: var(--xray-red); }

.xray-tp-path {
  flex: 1;
  color: var(--xray-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-tp-code {
  font-weight: 800;
  font-size: 10px;
}

.xray-tp-code.ok { color: var(--xray-green); }
.xray-tp-code.warn { color: var(--xray-yellow); }
.xray-tp-code.err { color: var(--xray-red); }

.xray-tp-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 9px 10px;
  background: var(--xray-surface);
}

.xray-tp-badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .3px;
  text-transform: uppercase;
}

.xray-tp-badge.green { color: var(--xray-green); background: color-mix(in srgb, var(--xray-green) 16%, transparent); }
.xray-tp-badge.yellow { color: var(--xray-yellow); background: color-mix(in srgb, var(--xray-yellow) 16%, transparent); }
.xray-tp-badge.red { color: var(--xray-red); background: color-mix(in srgb, var(--xray-red) 16%, transparent); }
.xray-tp-badge.blue { color: var(--xray-blue); background: color-mix(in srgb, var(--xray-blue) 16%, transparent); }
.xray-tp-badge.mauve { color: var(--xray-mauve); background: color-mix(in srgb, var(--xray-mauve) 16%, transparent); }

/* \u2500\u2500 Full-freedom token editor (grouped swatch grid) \u2500\u2500 */
.xray-custom-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.xray-custom-group-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.xray-custom-group-title {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .6px;
  color: var(--xray-subtext);
}

.xray-custom-group-hint {
  font-size: 10px;
  color: var(--xray-hint);
}

.xray-custom-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.xray-token-field {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: 1px solid color-mix(in srgb, var(--xray-border, color-mix(in srgb, var(--xray-hint) 30%, transparent)) 60%, transparent);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-surface-rgb), .45);
  transition: border-color var(--xray-dur-fast) var(--xray-ease), background var(--xray-dur-fast) var(--xray-ease);
}

.xray-token-field.pinned {
  border-color: color-mix(in srgb, var(--xray-accent) 45%, transparent);
  background: color-mix(in srgb, var(--xray-accent) 7%, rgba(var(--xray-surface-rgb), .45));
}

.xray-token-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.xray-token-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--xray-text);
}

.xray-token-state {
  font-size: 8px;
  font-weight: 800;
  letter-spacing: .5px;
  text-transform: uppercase;
  padding: 1px 4px;
  border-radius: 999px;
  color: var(--xray-hint);
  background: color-mix(in srgb, var(--xray-surface2) 70%, transparent);
}

.xray-token-field.pinned .xray-token-state {
  color: var(--xray-accent);
  background: color-mix(in srgb, var(--xray-accent) 16%, transparent);
}

.xray-token-meta .xray-custom-hex {
  width: 100%;
  height: 24px;
  padding: 2px 6px;
  font-size: 11px;
}

.xray-token-actions {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  flex-shrink: 0;
}

.xray-token-btn,
.xray-token-reset {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  padding: 0;
  border: none;
  border-radius: var(--xray-radius-sm);
  background: transparent;
  color: var(--xray-hint);
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--xray-dur-fast) var(--xray-ease), color var(--xray-dur-fast) var(--xray-ease), background var(--xray-dur-fast) var(--xray-ease);
}

.xray-token-field:hover .xray-token-btn,
.xray-token-field:focus-within .xray-token-btn,
.xray-token-field:hover .xray-token-reset,
.xray-token-field:focus-within .xray-token-reset,
.xray-token-field.pinned .xray-token-reset {
  opacity: 1;
}

.xray-token-btn:hover,
.xray-token-reset:hover:not(:disabled) {
  color: var(--xray-accent);
  background: color-mix(in srgb, var(--xray-accent) 14%, transparent);
}

.xray-token-reset:disabled {
  opacity: 0;
  cursor: default;
}

.xray-custom-footnote {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px solid color-mix(in srgb, var(--xray-surface2) 70%, transparent);
  font-size: 10px;
  color: var(--xray-subtext);
}

@media (max-width: 560px) {
  .xray-custom-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* Themeable corner radius: every rounded-rect radius across the stylesheet is
   driven by the --xray-radius scale (pills at 999px and 50% circles keep their
   shape). The base --xray-radius is set inline per panel from settings.radius. */

/* \u2500\u2500 Range slider (radius) \u2500\u2500 */
.xray-range-control {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.xray-range {
  width: 120px;
  height: 4px;
  appearance: none;
  -webkit-appearance: none;
  border-radius: 999px;
  background: color-mix(in srgb, var(--xray-surface2) 80%, transparent);
  outline: none;
  cursor: pointer;
}

.xray-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: var(--xray-accent, var(--xray-blue));
  border: 2px solid var(--xray-surface);
  box-shadow: 0 0 0 1px var(--xray-accent, var(--xray-blue));
}

.xray-range::-moz-range-thumb {
  width: 15px;
  height: 15px;
  border: 2px solid var(--xray-surface);
  border-radius: 50%;
  background: var(--xray-accent, var(--xray-blue));
}

.xray-range-value {
  min-width: 34px;
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: var(--xray-subtext);
}

/* \u2500\u2500 Theme Studio toolbar + import \u2500\u2500 */
.xray-custom-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding-bottom: 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-surface2) 70%, transparent);
}

.xray-custom-import {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.xray-custom-import-field {
  width: 100%;
  min-height: 84px;
  resize: vertical;
  font-family: var(--xray-font);
  font-size: 11px;
  line-height: 1.5;
}

/* \u2500\u2500 Hacker mode: CRT scanlines + vignette + moving scan sweep + phosphor bloom \u2500\u2500
   Cosmetic, opt-in, pointer-events:none. Layer 1 (sweep) is the only layer the
   keyframes move; scanlines and vignette stay put. \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.xray-panel.xray-hacker::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 6;
  pointer-events: none;
  background:
    linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--xray-accent) 16%, transparent) 45%, transparent 90%),
    linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, .18) 50%),
    radial-gradient(ellipse 130% 100% at 50% 50%, transparent 50%, rgba(0, 0, 0, .34) 100%);
  background-size: 100% 42%, 100% 3px, 100% 100%;
  background-repeat: no-repeat, repeat, no-repeat;
  background-position: 0 -42%, 0 0, 0 0;
}

/* phosphor bloom on text + a faint scanned tint over the whole panel */
.xray-panel.xray-hacker {
  text-shadow: 0 0 4px color-mix(in srgb, var(--xray-accent) 30%, transparent);
}

.xray-panel.xray-hacker .xray-json-line-text,
.xray-panel.xray-hacker .xray-console-message,
.xray-panel.xray-hacker .xray-path,
.xray-panel.xray-hacker .xray-method {
  text-shadow: 0 0 7px color-mix(in srgb, var(--xray-green) 42%, transparent);
}

.xray-panel.xray-hacker .xray-brand-mark {
  box-shadow: 0 0 18px color-mix(in srgb, var(--xray-accent) 55%, transparent);
}

@keyframes xray-crt-sweep {
  0% { background-position: 0 -42%, 0 0, 0 0; }
  100% { background-position: 0 142%, 0 0, 0 0; }
}

@keyframes xray-crt-flicker {
  0%, 96%, 100% { opacity: 1; }
  97% { opacity: .82; }
  98% { opacity: 1; }
  99% { opacity: .9; }
}

@media (prefers-reduced-motion: no-preference) {
  .xray-panel.xray-hacker::after {
    animation: xray-crt-sweep 5.5s linear infinite, xray-crt-flicker 7s steps(1) infinite;
  }
}

/* \u2500\u2500 Contrast report (Theme Studio) \u2500\u2500 */
.xray-contrast {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
  padding: 10px 12px;
  border: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 30%, transparent));
  border-radius: var(--xray-radius, 8px);
  background: rgba(var(--xray-bg-rgb), .4);
}

.xray-contrast-title {
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .6px;
  color: var(--xray-hint);
  margin-bottom: 2px;
}

.xray-contrast-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 10px;
  font-size: 11px;
}

.xray-contrast-label {
  color: var(--xray-subtext);
}

.xray-contrast-row strong {
  color: var(--xray-text);
  font-variant-numeric: tabular-nums;
}

.xray-contrast-grade {
  min-width: 58px;
  text-align: center;
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
}

.xray-contrast-grade.ok {
  color: var(--xray-green);
  background: color-mix(in srgb, var(--xray-green) 16%, transparent);
}

.xray-contrast-grade.warn {
  color: var(--xray-yellow);
  background: color-mix(in srgb, var(--xray-yellow) 16%, transparent);
}

.xray-contrast-grade.fail {
  color: var(--xray-red);
  background: color-mix(in srgb, var(--xray-red) 18%, transparent);
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   Frontend elevation \u2014 command center, empty states, motion, micro-interactions
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */

/* \u2500\u2500 Command center \u2500\u2500 */
.xray-command-modal {
  width: min(620px, 94vw);
}

.xray-command-search {
  margin: 0;
  padding: 14px 16px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-surface2) 70%, transparent);
  border-radius: 0;
  background: transparent;
}

.xray-command-search .xray-input {
  font-size: 14px;
  border: none;
  background: transparent;
  padding: 0;
}

.xray-command-search .xray-input:focus {
  box-shadow: none;
  outline: none;
}

.xray-command-list {
  max-height: min(56vh, 460px);
  overflow-y: auto;
  padding: 6px;
  scroll-padding: 40px 0;
}

.xray-command-group + .xray-command-group {
  margin-top: 2px;
}

.xray-command-group-label {
  padding: 8px 10px 4px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .7px;
  text-transform: uppercase;
  color: var(--xray-hint);
}

.xray-command-row {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  padding: 9px 10px;
  border: none;
  border-radius: var(--xray-radius-sm);
  background: transparent;
  color: var(--xray-text);
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background-color var(--xray-dur-fast) var(--xray-ease);
}

.xray-command-row.active {
  background: color-mix(in srgb, var(--xray-accent) 15%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--xray-accent) 40%, transparent);
}

.xray-command-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  flex-shrink: 0;
  color: var(--xray-subtext);
}

.xray-command-row.active .xray-command-icon {
  color: var(--xray-accent);
}

.xray-command-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-command-label mark {
  background: transparent;
  color: var(--xray-accent);
  font-weight: 800;
}

.xray-cmd-method {
  min-width: 34px;
  padding: 2px 5px;
  border-radius: var(--xray-radius-sm);
  background: color-mix(in srgb, var(--xray-surface2) 60%, transparent);
  font-size: 9px;
  font-weight: 800;
  text-align: center;
  color: currentColor;
}

.xray-command-hint {
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--xray-hint);
}

.xray-command-enter {
  color: var(--xray-accent);
  flex-shrink: 0;
}

.xray-command-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 36px 16px;
  text-align: center;
  color: var(--xray-subtext);
}

.xray-command-empty svg { color: var(--xray-hint); }
.xray-command-empty small { color: var(--xray-hint); font-size: 11px; }

.xray-command-foot {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 9px 14px;
  border-top: 1px solid color-mix(in srgb, var(--xray-surface2) 70%, transparent);
  font-size: 10px;
  color: var(--xray-hint);
}

.xray-command-foot kbd {
  display: inline-block;
  min-width: 16px;
  margin-right: 2px;
  padding: 1px 5px;
  border: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 40%, transparent));
  border-radius: var(--xray-radius-sm);
  background: rgba(var(--xray-surface-rgb), .8);
  font-family: var(--xray-font);
  font-size: 10px;
  color: var(--xray-subtext);
}

/* \u2500\u2500 Global search (Find in traffic) \u2500\u2500 */
.xray-gsearch-modal {
  width: min(720px, 94vw);
}

.xray-gsearch-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-surface2) 70%, transparent);
}

.xray-gsearch-input {
  flex: 1;
  margin: 0;
}

.xray-gsearch-list {
  max-height: min(56vh, 520px);
  overflow-y: auto;
  padding: 6px;
}

.xray-gsearch-error {
  padding: 14px 16px;
  color: var(--xray-red);
  font-size: 12px;
}

.xray-gsearch-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  border: none;
  border-radius: var(--xray-radius-sm);
  background: transparent;
  color: var(--xray-text);
  text-align: left;
  cursor: pointer;
}

.xray-gsearch-row.active {
  background: color-mix(in srgb, var(--xray-accent) 14%, transparent);
}

.xray-gsearch-row .xray-cmd-method {
  margin-top: 1px;
  flex-shrink: 0;
}

.xray-gsearch-main {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.xray-gsearch-path {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.xray-gsearch-field {
  flex-shrink: 0;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: .4px;
  text-transform: uppercase;
  padding: 1px 5px;
  border-radius: 999px;
  color: var(--xray-subtext);
  background: color-mix(in srgb, var(--xray-surface2) 70%, transparent);
}

.xray-gsearch-snippet {
  font-family: var(--xray-font);
  font-size: 11px;
  line-height: 1.4;
  color: var(--xray-subtext);
  word-break: break-word;
}

.xray-gsearch-snippet mark {
  background: color-mix(in srgb, var(--xray-accent) 34%, transparent);
  color: var(--xray-text);
  border-radius: var(--xray-radius-sm);
  padding: 0 1px;
}

.xray-gsearch-status {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* \u2500\u2500 Elegant empty states \u2500\u2500 */
.xray-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 160px;
  padding: 28px 20px;
  margin: auto;
  text-align: center;
  animation: xray-empty-in 320ms var(--xray-ease-out);
}

@keyframes xray-empty-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.xray-empty-glyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  color: var(--xray-accent);
  background: color-mix(in srgb, var(--xray-accent) 12%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--xray-accent) 22%, transparent), 0 0 28px color-mix(in srgb, var(--xray-accent) 16%, transparent);
}

.xray-empty-title {
  margin: 4px 0 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--xray-text);
}

.xray-empty-hint {
  margin: 0;
  max-width: 320px;
  font-size: 11px;
  line-height: 1.55;
  color: var(--xray-subtext);
}

.xray-empty-action {
  margin-top: 6px;
}

/* \u2500\u2500 Animated active-tab indicator \u2500\u2500 */
.xray-tab {
  position: relative;
}

.xray-tab::after {
  content: '';
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: -1px;
  height: 2px;
  border-radius: 999px;
  background: var(--xray-accent, var(--xray-blue));
  transform: scaleX(0);
  transform-origin: center;
  opacity: 0;
  transition: transform var(--xray-dur) var(--xray-ease-out), opacity var(--xray-dur) var(--xray-ease-out);
}

.xray-tab.active::after {
  transform: scaleX(1);
  opacity: 1;
}

/* \u2500\u2500 Refined modal entrance \u2500\u2500 */
.xray-modal {
  animation: xray-modal-in 200ms var(--xray-ease-out);
}

.xray-modal-backdrop {
  animation: xray-fade-in 160ms ease-out;
  backdrop-filter: blur(3px);
}

@keyframes xray-modal-in {
  from { opacity: 0; transform: translateY(10px) scale(.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes xray-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* \u2500\u2500 Selection & row micro-interactions \u2500\u2500 */
.xray-api-row.selected,
.xray-network-row.selected,
.xray-entry-row.selected {
  box-shadow: inset 3px 0 0 var(--xray-accent, var(--xray-blue));
}

.xray-live-dot.on {
  animation: xray-pulse 2.4s var(--xray-ease) infinite;
}

@keyframes xray-pulse {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--xray-green) 55%, transparent); }
  50% { box-shadow: 0 0 0 4px color-mix(in srgb, var(--xray-green) 0%, transparent); }
}

@media (prefers-reduced-motion: reduce) {
  .xray-empty,
  .xray-modal,
  .xray-modal-backdrop,
  .xray-live-dot.on {
    animation: none;
  }
  .xray-tab::after {
    transition: none;
  }
}

/* \u2500\u2500 Version tag in the header brand \u2500\u2500 */
.xray-brand-ver {
  padding: 1px 6px;
  border-radius: 999px;
  border: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
  background: rgba(var(--xray-surface2-rgb), .5);
  color: var(--xray-hint);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: none;
  cursor: help;
}

/* \u2500\u2500 API tab rework: headers grid, structural diff, initiator frames \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.xray-headers-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.xray-headers-filter {
  max-width: 340px;
}

.xray-headers-section h4 {
  margin: 0 0 6px;
  font-size: 11px;
  letter-spacing: .4px;
  text-transform: uppercase;
  color: var(--xray-subtext, var(--xray-text));
}

.xray-headers-grid {
  display: flex;
  flex-direction: column;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 30%, transparent);
  border-radius: var(--xray-radius);
  overflow: hidden;
}

.xray-header-row {
  display: grid;
  grid-template-columns: minmax(120px, 220px) minmax(0, 1fr) 26px;
  gap: 8px;
  align-items: center;
  padding: 5px 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 18%, transparent);
  font-size: 11px;
}

.xray-header-row:last-child {
  border-bottom: none;
}

.xray-header-row:hover {
  background: rgba(var(--xray-surface2-rgb), .55);
}

.xray-header-name {
  color: var(--xray-accent, var(--xray-blue));
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-header-value {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--xray-text);
}

.xray-header-row .xray-icon-btn {
  opacity: 0;
}

.xray-header-row:hover .xray-icon-btn,
.xray-header-row .xray-icon-btn:focus-visible {
  opacity: 1;
}

.xray-diff {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.xray-diff-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.xray-diff-lines {
  display: flex;
  flex-direction: column;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 30%, transparent);
  border-radius: var(--xray-radius);
  overflow: hidden;
  font-size: 11px;
}

.xray-diff-line {
  display: grid;
  grid-template-columns: 18px minmax(120px, 1fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  padding: 4px 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 16%, transparent);
}

.xray-diff-line:last-child {
  border-bottom: none;
}

.xray-diff-line.added {
  background: color-mix(in srgb, var(--xray-green) 9%, transparent);
}

.xray-diff-line.removed {
  background: color-mix(in srgb, var(--xray-red) 9%, transparent);
}

.xray-diff-line.changed {
  background: color-mix(in srgb, var(--xray-yellow) 7%, transparent);
}

.xray-diff-kind {
  font-weight: 900;
}

.xray-diff-line.added .xray-diff-kind { color: var(--xray-green); }
.xray-diff-line.removed .xray-diff-kind { color: var(--xray-red); }
.xray-diff-line.changed .xray-diff-kind { color: var(--xray-yellow); }

.xray-diff-path {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--xray-text);
  font-weight: 700;
}

.xray-diff-before,
.xray-diff-after {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-diff-before { color: var(--xray-red); }
.xray-diff-after { color: var(--xray-green); }

.xray-initiator-frame {
  display: grid;
  grid-template-columns: minmax(90px, auto) minmax(0, 1fr) 26px;
  gap: 8px;
  align-items: center;
  padding: 2px 0;
}

.xray-initiator-fn {
  font-weight: 800;
  color: var(--xray-text);
}

.xray-initiator-loc {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--xray-subtext, var(--xray-hint));
}

.xray-initiator-frame .xray-icon-btn {
  opacity: 0;
}

.xray-initiator-frame:hover .xray-icon-btn,
.xray-initiator-frame .xray-icon-btn:focus-visible {
  opacity: 1;
}

.xray-json-text {
  white-space: pre-wrap;
  word-break: break-word;
}

/* Closed drawer: give the space back to the list and context panes instead of
   parking a 560px "Nothing selected" column (the detail-open hook previously
   matched no CSS at all). */
.xray-api-workspace:not(.detail-open) .xray-api-detail-drawer.empty {
  display: none;
}

.xray-api-workspace:not(.detail-open) .xray-api-body {
  grid-template-columns: minmax(260px, var(--xray-api-split, 1fr)) minmax(300px, 1.1fr);
}

/* Nothing selected at all: the (auto-hidden) context pane frees its column too. */
.xray-api-workspace:not(.detail-open) .xray-api-body:has(.xray-request-context-pane.empty) {
  grid-template-columns: minmax(0, 1fr);
}

/* \u2500\u2500 Collapsible section primitive (CollapsibleSection.tsx) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.xray-collapsible {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.xray-collapsible-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 10px;
  border: 0;
  background: transparent;
  color: var(--xray-subtext, var(--xray-text));
  cursor: pointer;
  font: 800 10px/1 var(--xray-font);
  letter-spacing: .07em;
  text-transform: uppercase;
  text-align: left;
}

.xray-collapsible-header:hover {
  color: var(--xray-text);
}

/* One knob for the whole collapse/expand feel. Deliberately slow + even-paced
   so sections unfold like a drawer, not a snap. */
.xray-collapsible {
  --xray-collapse-dur: 420ms;
  --xray-collapse-ease: cubic-bezier(.4, 0, .2, 1);
}

.xray-collapsible-chevron {
  flex: 0 0 auto;
  color: var(--xray-hint, var(--xray-subtext));
  transition: transform var(--xray-collapse-dur) var(--xray-collapse-ease);
}

.xray-collapsible.collapsed .xray-collapsible-chevron {
  transform: rotate(-90deg);
}

.xray-collapsible-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-collapsible-right {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-transform: none;
  letter-spacing: 0;
}

.xray-collapsible-body {
  min-height: 0;
  /* grid trick animates height from 0 without knowing the content height */
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows var(--xray-collapse-dur) var(--xray-collapse-ease);
}

.xray-collapsible.collapsed > .xray-collapsible-body {
  grid-template-rows: 0fr;
}

.xray-collapsible-body > .xray-collapsible-inner {
  min-height: 0;
  overflow: hidden;
  /* Fade + slight rise so content eases in with the height, rather than being
     hard-clipped \u2014 this reads far gentler than a pure height reveal. */
  opacity: 1;
  transform: translateY(0);
  transition: opacity var(--xray-collapse-dur) var(--xray-collapse-ease),
              transform var(--xray-collapse-dur) var(--xray-collapse-ease);
}

.xray-collapsible.collapsed > .xray-collapsible-body > .xray-collapsible-inner {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .xray-collapsible-chevron,
  .xray-collapsible-body,
  .xray-collapsible-body > .xray-collapsible-inner {
    transition: none;
  }
}

/* API filters collapsible: keep the chip blocks spaced like the old toolbar. */
.xray-api-filters-collapsible .xray-collapsible-header {
  padding: 0 0 2px;
}

.xray-api-filters-collapsible .xray-collapsible-inner {
  display: grid;
  gap: 8px;
}

/* Insight cards use the collapsible header in place of the old <h3>. Keep the
   card's inner padding but let the header title read like the old heading. */
.xray-card.xray-collapsible {
  padding: 12px;
}

.xray-card.xray-collapsible > .xray-collapsible-header {
  padding: 0 0 8px;
  font-size: 12px;
}

.xray-insight-overview .xray-collapsible-header {
  padding: 0 0 6px;
}

/* Density toggle in the API table header (last column, right-aligned). */
.xray-api-table-tools {
  display: flex;
  justify-content: flex-end;
}

.xray-density-toggle {
  width: 24px;
  height: 24px;
}

/* \u2500\u2500 Interactive JSON tree (JsonView.tsx) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.xray-json-tree {
  display: flex;
  flex-direction: column;
  min-height: 0;
  font: 600 11.5px/1.6 var(--xray-font);
}

.xray-json-tree-toolbar {
  display: flex;
  gap: 6px;
  padding: 0 0 6px;
  position: sticky;
  top: 0;
  z-index: 1;
}

.xray-json-tree-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 40%, transparent);
  border-radius: 999px;
  background: rgba(var(--xray-surface2-rgb), .6);
  color: var(--xray-subtext, var(--xray-text));
  cursor: pointer;
  font: 800 10px/1 var(--xray-font);
  letter-spacing: .02em;
}

.xray-json-tree-btn:hover {
  color: var(--xray-text);
  border-color: color-mix(in srgb, var(--xray-accent) 45%, transparent);
}

.xray-json-tree-body {
  min-width: 0;
  overflow-x: auto;
}

.xray-json-row {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
  padding-right: 8px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  text-align: left;
}

.xray-json-branch {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
}

.xray-json-branch:hover {
  background: rgba(var(--xray-surface2-rgb), .4);
}

.xray-json-gutter {
  flex: 0 0 13px;
}

.xray-json-chevron {
  flex: 0 0 auto;
  margin-top: 3px;
  color: var(--xray-hint, var(--xray-subtext));
  transition: transform var(--xray-dur-fast, .12s) var(--xray-ease, ease);
}

.xray-json-chevron.closed {
  transform: rotate(-90deg);
}

.xray-json-summary {
  margin: 0 6px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(var(--xray-surface2-rgb), .7);
  color: var(--xray-hint);
  font-size: 10px;
  font-weight: 800;
}

.xray-json-scalar {
  margin: 0;
}

@media (prefers-reduced-motion: reduce) {
  .xray-json-chevron {
    transition: none;
  }
}

/* \u2500\u2500 Console: rendered errors (ErrorBlock) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.xray-error-name {
  color: var(--xray-red);
  font-weight: 900;
}

.xray-error-frames {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font: 600 11px/1.5 var(--xray-font);
}

.xray-error-frames li {
  display: grid;
  grid-template-columns: minmax(90px, auto) minmax(0, 1fr);
  gap: 10px;
  align-items: baseline;
  padding: 1px 0;
}

.xray-error-fn {
  color: var(--xray-text);
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.xray-error-loc {
  min-width: 0;
  color: var(--xray-subtext, var(--xray-hint));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* \u2500\u2500 Network sub-tab: status swatch, stream chip, type, waterfall \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.xray-status-swatch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  padding: 1px 6px;
  border-radius: var(--xray-radius-sm);
  font-weight: 900;
  font-size: 11px;
  /* tinted background so unusual codes pop (Firefox Network Monitor) */
  background: color-mix(in srgb, currentColor 16%, transparent);
}

.xray-status-swatch.ok { color: var(--xray-green); }
.xray-status-swatch.redirect { color: var(--xray-yellow); }
.xray-status-swatch.warn { color: var(--xray-peach); }
.xray-status-swatch.error { color: var(--xray-red); }
.xray-status-swatch.pending { color: var(--xray-subtext, var(--xray-hint)); }

.xray-status-chip.stream {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
  border: 1px solid color-mix(in srgb, var(--xray-mauve) 45%, transparent);
  color: var(--xray-mauve);
  background: color-mix(in srgb, var(--xray-mauve) 12%, transparent);
}

.xray-stream-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.xray-status-chip.stream.open .xray-stream-dot {
  box-shadow: 0 0 0 2px color-mix(in srgb, currentColor 30%, transparent);
}

.xray-status-chip.stream.closed {
  color: var(--xray-subtext, var(--xray-hint));
  border-color: color-mix(in srgb, var(--xray-hint) 40%, transparent);
  background: transparent;
}

.xray-net-type {
  color: var(--xray-subtext, var(--xray-hint));
  font-weight: 700;
  font-size: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-net-size {
  text-align: right;
  font-size: 11px;
}

.xray-waterfall-cell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.xray-waterfall-track {
  position: relative;
  height: 12px;
  min-width: 0;
  border-radius: var(--xray-radius-sm);
  background: color-mix(in srgb, var(--xray-surface2) 60%, transparent);
  overflow: hidden;
}

/* Positioned on the shared time axis; the outer bar = downloading, the inner
   contrasting segment = waiting/TTFB (Chrome's two-tone waterfall). */
.xray-waterfall-bar {
  position: absolute;
  top: 2px;
  bottom: 2px;
  /* Floor the width so a fast, near-instant request still reads as a legible
     pill instead of a 2px dot; slow requests stay proportionally wider. */
  min-width: 10px;
  border-radius: var(--xray-radius-sm);
  background: var(--xray-accent, var(--xray-blue));
}

.xray-waterfall-bar.slow { background: var(--xray-yellow); }
.xray-waterfall-bar.error { background: var(--xray-red); }

.xray-waterfall-wait {
  display: block;
  height: 100%;
  border-radius: var(--xray-radius-sm) 0 0 var(--xray-radius-sm);
  /* Sits on top of the bar, which is painted --xray-accent (a light pastel on
     dark themes, a darkened variant on light ones). Washing toward --xray-bg
     tracks that inversion. Measured against the bar, the dark themes go
     1.39 -> 2.36/2.43/2.55; the light ones stay level (2.04 -> ~1.9) since
     --xray-bg is close to the white this replaces. */
  background: color-mix(in srgb, var(--xray-bg) 42%, transparent);
}

.xray-waterfall-ms {
  color: var(--xray-subtext, var(--xray-hint));
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.xray-network-row.expanded {
  background: color-mix(in srgb, var(--xray-accent) 8%, transparent);
}
`});var HR=ua(()=>{var I1=_(Kh());u1();$e();br();m1();y1();h1();var b1=_(j()),nm=document.getElementById("xray-window-root");function zR(){try{let e=window.location.hash||"";if(!/theme=/.test(e))return;let t=Wi(e);if(!t)return;I.getState().updateSettings(Zi(t))}catch{}}nm&&(async()=>{let e=document.createElement("style");e.setAttribute("data-xray-window-ui","1"),e.textContent=`${x1.replace(/:host/g,"#xray-window-root")}
${g1}`,document.head.appendChild(e),nm.className="xray-app-root",await I.getState().restorePreferences(),zR(),I.getState().setOpen(!0),I.getState().setDevtoolsMode(!1),I.getState().setInitialized(!0),p1({dismissible:!1}),(0,I1.createRoot)(nm).render((0,b1.jsx)(c1,{mode:"window"}))})()});return HR();})();
/*! Bundled license information:

scheduler/cjs/scheduler.production.js:
  (**
   * @license React
   * scheduler.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react.production.js:
  (**
   * @license React
   * react.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.production.js:
  (**
   * @license React
   * react-dom.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom-client.production.js:
  (**
   * @license React
   * react-dom-client.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

@tabler/icons-react/dist/esm/defaultAttributes.mjs:
@tabler/icons-react/dist/esm/createReactComponent.mjs:
@tabler/icons-react/dist/esm/icons/IconAdjustments.mjs:
@tabler/icons-react/dist/esm/icons/IconAlertTriangle.mjs:
@tabler/icons-react/dist/esm/icons/IconArrowBackUp.mjs:
@tabler/icons-react/dist/esm/icons/IconArrowDownLeft.mjs:
@tabler/icons-react/dist/esm/icons/IconArrowDown.mjs:
@tabler/icons-react/dist/esm/icons/IconArrowRight.mjs:
@tabler/icons-react/dist/esm/icons/IconArrowUpRight.mjs:
@tabler/icons-react/dist/esm/icons/IconArrowUp.mjs:
@tabler/icons-react/dist/esm/icons/IconArrowsMaximize.mjs:
@tabler/icons-react/dist/esm/icons/IconBolt.mjs:
@tabler/icons-react/dist/esm/icons/IconBookmarkPlus.mjs:
@tabler/icons-react/dist/esm/icons/IconBookmark.mjs:
@tabler/icons-react/dist/esm/icons/IconBraces.mjs:
@tabler/icons-react/dist/esm/icons/IconChartBar.mjs:
@tabler/icons-react/dist/esm/icons/IconCheck.mjs:
@tabler/icons-react/dist/esm/icons/IconChevronDown.mjs:
@tabler/icons-react/dist/esm/icons/IconChevronLeft.mjs:
@tabler/icons-react/dist/esm/icons/IconChevronRight.mjs:
@tabler/icons-react/dist/esm/icons/IconCircleCheck.mjs:
@tabler/icons-react/dist/esm/icons/IconCircleX.mjs:
@tabler/icons-react/dist/esm/icons/IconClipboard.mjs:
@tabler/icons-react/dist/esm/icons/IconClock.mjs:
@tabler/icons-react/dist/esm/icons/IconCode.mjs:
@tabler/icons-react/dist/esm/icons/IconColorPicker.mjs:
@tabler/icons-react/dist/esm/icons/IconCopy.mjs:
@tabler/icons-react/dist/esm/icons/IconDatabaseImport.mjs:
@tabler/icons-react/dist/esm/icons/IconDatabase.mjs:
@tabler/icons-react/dist/esm/icons/IconDeviceLaptop.mjs:
@tabler/icons-react/dist/esm/icons/IconDice.mjs:
@tabler/icons-react/dist/esm/icons/IconDownload.mjs:
@tabler/icons-react/dist/esm/icons/IconEraser.mjs:
@tabler/icons-react/dist/esm/icons/IconFileDiff.mjs:
@tabler/icons-react/dist/esm/icons/IconFileExport.mjs:
@tabler/icons-react/dist/esm/icons/IconFileImport.mjs:
@tabler/icons-react/dist/esm/icons/IconFilterOff.mjs:
@tabler/icons-react/dist/esm/icons/IconFilter.mjs:
@tabler/icons-react/dist/esm/icons/IconFoldDown.mjs:
@tabler/icons-react/dist/esm/icons/IconFold.mjs:
@tabler/icons-react/dist/esm/icons/IconHelp.mjs:
@tabler/icons-react/dist/esm/icons/IconInfoCircle.mjs:
@tabler/icons-react/dist/esm/icons/IconKey.mjs:
@tabler/icons-react/dist/esm/icons/IconKeyboard.mjs:
@tabler/icons-react/dist/esm/icons/IconLayoutList.mjs:
@tabler/icons-react/dist/esm/icons/IconLayoutRows.mjs:
@tabler/icons-react/dist/esm/icons/IconLayoutSidebarLeftExpand.mjs:
@tabler/icons-react/dist/esm/icons/IconLayoutSidebarRightExpand.mjs:
@tabler/icons-react/dist/esm/icons/IconLetterCase.mjs:
@tabler/icons-react/dist/esm/icons/IconLock.mjs:
@tabler/icons-react/dist/esm/icons/IconNetwork.mjs:
@tabler/icons-react/dist/esm/icons/IconPalette.mjs:
@tabler/icons-react/dist/esm/icons/IconPictureInPicture.mjs:
@tabler/icons-react/dist/esm/icons/IconPin.mjs:
@tabler/icons-react/dist/esm/icons/IconPinnedOff.mjs:
@tabler/icons-react/dist/esm/icons/IconPlayerPlay.mjs:
@tabler/icons-react/dist/esm/icons/IconPlayerRecord.mjs:
@tabler/icons-react/dist/esm/icons/IconPlugConnected.mjs:
@tabler/icons-react/dist/esm/icons/IconPlus.mjs:
@tabler/icons-react/dist/esm/icons/IconRadar2.mjs:
@tabler/icons-react/dist/esm/icons/IconRefresh.mjs:
@tabler/icons-react/dist/esm/icons/IconRegex.mjs:
@tabler/icons-react/dist/esm/icons/IconRepeat.mjs:
@tabler/icons-react/dist/esm/icons/IconRoute.mjs:
@tabler/icons-react/dist/esm/icons/IconSearch.mjs:
@tabler/icons-react/dist/esm/icons/IconSend.mjs:
@tabler/icons-react/dist/esm/icons/IconServer.mjs:
@tabler/icons-react/dist/esm/icons/IconSettings.mjs:
@tabler/icons-react/dist/esm/icons/IconShare.mjs:
@tabler/icons-react/dist/esm/icons/IconSparkles.mjs:
@tabler/icons-react/dist/esm/icons/IconTable.mjs:
@tabler/icons-react/dist/esm/icons/IconTerminal2.mjs:
@tabler/icons-react/dist/esm/icons/IconTimeline.mjs:
@tabler/icons-react/dist/esm/icons/IconTrash.mjs:
@tabler/icons-react/dist/esm/icons/IconWand.mjs:
@tabler/icons-react/dist/esm/icons/IconWorld.mjs:
@tabler/icons-react/dist/esm/icons/IconX.mjs:
@tabler/icons-react/dist/esm/tabler-icons-react.mjs:
  (**
   * @license @tabler/icons-react v3.44.0 - MIT
   *
   * This source code is licensed under the MIT license.
   * See the LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.js:
  (**
   * @license React
   * react-jsx-runtime.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
