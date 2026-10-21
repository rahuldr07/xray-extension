"use strict";var XRAYSqlUI=(()=>{var eO=Object.create;var zd=Object.defineProperty;var tO=Object.getOwnPropertyDescriptor;var nO=Object.getOwnPropertyNames;var rO=Object.getPrototypeOf,oO=Object.prototype.hasOwnProperty;var aO=(t,e,n)=>e in t?zd(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var F=(t,e,n)=>()=>{if(n)throw n[0];try{return t&&(e=t(t=0)),e}catch(r){throw n=[r],r}};var In=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(n){throw e=0,n}};var iO=(t,e,n,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of nO(e))!oO.call(t,o)&&o!==n&&zd(t,o,{get:()=>e[o],enumerable:!(r=tO(e,o))||r.enumerable});return t};var $=(t,e,n)=>(n=t!=null?eO(rO(t)):{},iO(e||!t||!t.__esModule?zd(n,"default",{value:t,enumerable:!0}):n,t));var er=(t,e,n)=>aO(t,typeof e!="symbol"?e+"":e,n);var yb=In(Se=>{"use strict";function Vd(t,e){var n=t.length;t.push(e);e:for(;0<n;){var r=n-1>>>1,o=t[r];if(0<Af(o,e))t[r]=e,t[n]=o,n=r;else break e}}function qn(t){return t.length===0?null:t[0]}function Of(t){if(t.length===0)return null;var e=t[0],n=t.pop();if(n!==e){t[0]=n;e:for(var r=0,o=t.length,a=o>>>1;r<a;){var i=2*(r+1)-1,l=t[i],s=i+1,f=t[s];if(0>Af(l,n))s<o&&0>Af(f,l)?(t[r]=f,t[s]=n,r=s):(t[r]=l,t[i]=n,r=i);else if(s<o&&0>Af(f,n))t[r]=f,t[s]=n,r=s;else break e}}return e}function Af(t,e){var n=t.sortIndex-e.sortIndex;return n!==0?n:t.id-e.id}Se.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(fb=performance,Se.unstable_now=function(){return fb.now()}):(Hd=Date,cb=Hd.now(),Se.unstable_now=function(){return Hd.now()-cb});var fb,Hd,cb,tr=[],Er=[],lO=1,Zt=null,ot=3,Gd=!1,ml=!1,hl=!1,Wd=!1,pb=typeof setTimeout=="function"?setTimeout:null,mb=typeof clearTimeout=="function"?clearTimeout:null,ub=typeof setImmediate<"u"?setImmediate:null;function Tf(t){for(var e=qn(Er);e!==null;){if(e.callback===null)Of(Er);else if(e.startTime<=t)Of(Er),e.sortIndex=e.expirationTime,Vd(tr,e);else break;e=qn(Er)}}function Xd(t){if(hl=!1,Tf(t),!ml)if(qn(tr)!==null)ml=!0,Da||(Da=!0,Ba());else{var e=qn(Er);e!==null&&Qd(Xd,e.startTime-t)}}var Da=!1,xl=-1,hb=5,xb=-1;function gb(){return Wd?!0:!(Se.unstable_now()-xb<hb)}function Ud(){if(Wd=!1,Da){var t=Se.unstable_now();xb=t;var e=!0;try{e:{ml=!1,hl&&(hl=!1,mb(xl),xl=-1),Gd=!0;var n=ot;try{t:{for(Tf(t),Zt=qn(tr);Zt!==null&&!(Zt.expirationTime>t&&gb());){var r=Zt.callback;if(typeof r=="function"){Zt.callback=null,ot=Zt.priorityLevel;var o=r(Zt.expirationTime<=t);if(t=Se.unstable_now(),typeof o=="function"){Zt.callback=o,Tf(t),e=!0;break t}Zt===qn(tr)&&Of(tr),Tf(t)}else Of(tr);Zt=qn(tr)}if(Zt!==null)e=!0;else{var a=qn(Er);a!==null&&Qd(Xd,a.startTime-t),e=!1}}break e}finally{Zt=null,ot=n,Gd=!1}e=void 0}}finally{e?Ba():Da=!1}}}var Ba;typeof ub=="function"?Ba=function(){ub(Ud)}:typeof MessageChannel<"u"?(jd=new MessageChannel,db=jd.port2,jd.port1.onmessage=Ud,Ba=function(){db.postMessage(null)}):Ba=function(){pb(Ud,0)};var jd,db;function Qd(t,e){xl=pb(function(){t(Se.unstable_now())},e)}Se.unstable_IdlePriority=5;Se.unstable_ImmediatePriority=1;Se.unstable_LowPriority=4;Se.unstable_NormalPriority=3;Se.unstable_Profiling=null;Se.unstable_UserBlockingPriority=2;Se.unstable_cancelCallback=function(t){t.callback=null};Se.unstable_forceFrameRate=function(t){0>t||125<t?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):hb=0<t?Math.floor(1e3/t):5};Se.unstable_getCurrentPriorityLevel=function(){return ot};Se.unstable_next=function(t){switch(ot){case 1:case 2:case 3:var e=3;break;default:e=ot}var n=ot;ot=e;try{return t()}finally{ot=n}};Se.unstable_requestPaint=function(){Wd=!0};Se.unstable_runWithPriority=function(t,e){switch(t){case 1:case 2:case 3:case 4:case 5:break;default:t=3}var n=ot;ot=t;try{return e()}finally{ot=n}};Se.unstable_scheduleCallback=function(t,e,n){var r=Se.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?r+n:r):n=r,t){case 1:var o=-1;break;case 2:o=250;break;case 5:o=1073741823;break;case 4:o=1e4;break;default:o=5e3}return o=n+o,t={id:lO++,callback:e,priorityLevel:t,startTime:n,expirationTime:o,sortIndex:-1},n>r?(t.sortIndex=n,Vd(Er,t),qn(tr)===null&&t===qn(Er)&&(hl?(mb(xl),xl=-1):hl=!0,Qd(Xd,n-r))):(t.sortIndex=o,Vd(tr,t),ml||Gd||(ml=!0,Da||(Da=!0,Ba()))),t};Se.unstable_shouldYield=gb;Se.unstable_wrapCallback=function(t){var e=ot;return function(){var n=ot;ot=e;try{return t.apply(this,arguments)}finally{ot=n}}}});var Ib=In((B3,bb)=>{"use strict";bb.exports=yb()});var Mb=In(V=>{"use strict";var Jd=Symbol.for("react.transitional.element"),sO=Symbol.for("react.portal"),fO=Symbol.for("react.fragment"),cO=Symbol.for("react.strict_mode"),uO=Symbol.for("react.profiler"),dO=Symbol.for("react.consumer"),pO=Symbol.for("react.context"),mO=Symbol.for("react.forward_ref"),hO=Symbol.for("react.suspense"),xO=Symbol.for("react.memo"),Cb=Symbol.for("react.lazy"),gO=Symbol.for("react.activity"),vb=Symbol.iterator;function yO(t){return t===null||typeof t!="object"?null:(t=vb&&t[vb]||t["@@iterator"],typeof t=="function"?t:null)}var Ab={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Tb=Object.assign,Ob={};function Ra(t,e,n){this.props=t,this.context=e,this.refs=Ob,this.updater=n||Ab}Ra.prototype.isReactComponent={};Ra.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};Ra.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function Bb(){}Bb.prototype=Ra.prototype;function Zd(t,e,n){this.props=t,this.context=e,this.refs=Ob,this.updater=n||Ab}var $d=Zd.prototype=new Bb;$d.constructor=Zd;Tb($d,Ra.prototype);$d.isPureReactComponent=!0;var wb=Array.isArray;function Yd(){}var be={H:null,A:null,T:null,S:null},Db=Object.prototype.hasOwnProperty;function ep(t,e,n){var r=n.ref;return{$$typeof:Jd,type:t,key:e,ref:r!==void 0?r:null,props:n}}function bO(t,e){return ep(t.type,e,t.props)}function tp(t){return typeof t=="object"&&t!==null&&t.$$typeof===Jd}function IO(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var Sb=/\/+/g;function Kd(t,e){return typeof t=="object"&&t!==null&&t.key!=null?IO(""+t.key):e.toString(36)}function vO(t){switch(t.status){case"fulfilled":return t.value;case"rejected":throw t.reason;default:switch(typeof t.status=="string"?t.then(Yd,Yd):(t.status="pending",t.then(function(e){t.status==="pending"&&(t.status="fulfilled",t.value=e)},function(e){t.status==="pending"&&(t.status="rejected",t.reason=e)})),t.status){case"fulfilled":return t.value;case"rejected":throw t.reason}}throw t}function Ma(t,e,n,r,o){var a=typeof t;(a==="undefined"||a==="boolean")&&(t=null);var i=!1;if(t===null)i=!0;else switch(a){case"bigint":case"string":case"number":i=!0;break;case"object":switch(t.$$typeof){case Jd:case sO:i=!0;break;case Cb:return i=t._init,Ma(i(t._payload),e,n,r,o)}}if(i)return o=o(t),i=r===""?"."+Kd(t,0):r,wb(o)?(n="",i!=null&&(n=i.replace(Sb,"$&/")+"/"),Ma(o,e,n,"",function(f){return f})):o!=null&&(tp(o)&&(o=bO(o,n+(o.key==null||t&&t.key===o.key?"":(""+o.key).replace(Sb,"$&/")+"/")+i)),e.push(o)),1;i=0;var l=r===""?".":r+":";if(wb(t))for(var s=0;s<t.length;s++)r=t[s],a=l+Kd(r,s),i+=Ma(r,e,n,a,o);else if(s=yO(t),typeof s=="function")for(t=s.call(t),s=0;!(r=t.next()).done;)r=r.value,a=l+Kd(r,s++),i+=Ma(r,e,n,a,o);else if(a==="object"){if(typeof t.then=="function")return Ma(vO(t),e,n,r,o);throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.")}return i}function Bf(t,e,n){if(t==null)return t;var r=[],o=0;return Ma(t,r,"","",function(a){return e.call(n,a,o++)}),r}function wO(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var kb=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},SO={map:Bf,forEach:function(t,e,n){Bf(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return Bf(t,function(){e++}),e},toArray:function(t){return Bf(t,function(e){return e})||[]},only:function(t){if(!tp(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};V.Activity=gO;V.Children=SO;V.Component=Ra;V.Fragment=fO;V.Profiler=uO;V.PureComponent=Zd;V.StrictMode=cO;V.Suspense=hO;V.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=be;V.__COMPILER_RUNTIME={__proto__:null,c:function(t){return be.H.useMemoCache(t)}};V.cache=function(t){return function(){return t.apply(null,arguments)}};V.cacheSignal=function(){return null};V.cloneElement=function(t,e,n){if(t==null)throw Error("The argument must be a React element, but you passed "+t+".");var r=Tb({},t.props),o=t.key;if(e!=null)for(a in e.key!==void 0&&(o=""+e.key),e)!Db.call(e,a)||a==="key"||a==="__self"||a==="__source"||a==="ref"&&e.ref===void 0||(r[a]=e[a]);var a=arguments.length-2;if(a===1)r.children=n;else if(1<a){for(var i=Array(a),l=0;l<a;l++)i[l]=arguments[l+2];r.children=i}return ep(t.type,o,r)};V.createContext=function(t){return t={$$typeof:pO,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null},t.Provider=t,t.Consumer={$$typeof:dO,_context:t},t};V.createElement=function(t,e,n){var r,o={},a=null;if(e!=null)for(r in e.key!==void 0&&(a=""+e.key),e)Db.call(e,r)&&r!=="key"&&r!=="__self"&&r!=="__source"&&(o[r]=e[r]);var i=arguments.length-2;if(i===1)o.children=n;else if(1<i){for(var l=Array(i),s=0;s<i;s++)l[s]=arguments[s+2];o.children=l}if(t&&t.defaultProps)for(r in i=t.defaultProps,i)o[r]===void 0&&(o[r]=i[r]);return ep(t,a,o)};V.createRef=function(){return{current:null}};V.forwardRef=function(t){return{$$typeof:mO,render:t}};V.isValidElement=tp;V.lazy=function(t){return{$$typeof:Cb,_payload:{_status:-1,_result:t},_init:wO}};V.memo=function(t,e){return{$$typeof:xO,type:t,compare:e===void 0?null:e}};V.startTransition=function(t){var e=be.T,n={};be.T=n;try{var r=t(),o=be.S;o!==null&&o(n,r),typeof r=="object"&&r!==null&&typeof r.then=="function"&&r.then(Yd,kb)}catch(a){kb(a)}finally{e!==null&&n.types!==null&&(e.types=n.types),be.T=e}};V.unstable_useCacheRefresh=function(){return be.H.useCacheRefresh()};V.use=function(t){return be.H.use(t)};V.useActionState=function(t,e,n){return be.H.useActionState(t,e,n)};V.useCallback=function(t,e){return be.H.useCallback(t,e)};V.useContext=function(t){return be.H.useContext(t)};V.useDebugValue=function(){};V.useDeferredValue=function(t,e){return be.H.useDeferredValue(t,e)};V.useEffect=function(t,e){return be.H.useEffect(t,e)};V.useEffectEvent=function(t){return be.H.useEffectEvent(t)};V.useId=function(){return be.H.useId()};V.useImperativeHandle=function(t,e,n){return be.H.useImperativeHandle(t,e,n)};V.useInsertionEffect=function(t,e){return be.H.useInsertionEffect(t,e)};V.useLayoutEffect=function(t,e){return be.H.useLayoutEffect(t,e)};V.useMemo=function(t,e){return be.H.useMemo(t,e)};V.useOptimistic=function(t,e){return be.H.useOptimistic(t,e)};V.useReducer=function(t,e,n){return be.H.useReducer(t,e,n)};V.useRef=function(t){return be.H.useRef(t)};V.useState=function(t){return be.H.useState(t)};V.useSyncExternalStore=function(t,e,n){return be.H.useSyncExternalStore(t,e,n)};V.useTransition=function(){return be.H.useTransition()};V.version="19.2.6"});var ct=In((M3,Rb)=>{"use strict";Rb.exports=Mb()});var Fb=In(dt=>{"use strict";var kO=ct();function Eb(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Fr(){}var ut={d:{f:Fr,r:function(){throw Error(Eb(522))},D:Fr,C:Fr,L:Fr,m:Fr,X:Fr,S:Fr,M:Fr},p:0,findDOMNode:null},CO=Symbol.for("react.portal");function AO(t,e,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:CO,key:r==null?null:""+r,children:t,containerInfo:e,implementation:n}}var gl=kO.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Df(t,e){if(t==="font")return"";if(typeof e=="string")return e==="use-credentials"?e:""}dt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=ut;dt.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)throw Error(Eb(299));return AO(t,e,null,n)};dt.flushSync=function(t){var e=gl.T,n=ut.p;try{if(gl.T=null,ut.p=2,t)return t()}finally{gl.T=e,ut.p=n,ut.d.f()}};dt.preconnect=function(t,e){typeof t=="string"&&(e?(e=e.crossOrigin,e=typeof e=="string"?e==="use-credentials"?e:"":void 0):e=null,ut.d.C(t,e))};dt.prefetchDNS=function(t){typeof t=="string"&&ut.d.D(t)};dt.preinit=function(t,e){if(typeof t=="string"&&e&&typeof e.as=="string"){var n=e.as,r=Df(n,e.crossOrigin),o=typeof e.integrity=="string"?e.integrity:void 0,a=typeof e.fetchPriority=="string"?e.fetchPriority:void 0;n==="style"?ut.d.S(t,typeof e.precedence=="string"?e.precedence:void 0,{crossOrigin:r,integrity:o,fetchPriority:a}):n==="script"&&ut.d.X(t,{crossOrigin:r,integrity:o,fetchPriority:a,nonce:typeof e.nonce=="string"?e.nonce:void 0})}};dt.preinitModule=function(t,e){if(typeof t=="string")if(typeof e=="object"&&e!==null){if(e.as==null||e.as==="script"){var n=Df(e.as,e.crossOrigin);ut.d.M(t,{crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0})}}else e==null&&ut.d.M(t)};dt.preload=function(t,e){if(typeof t=="string"&&typeof e=="object"&&e!==null&&typeof e.as=="string"){var n=e.as,r=Df(n,e.crossOrigin);ut.d.L(t,n,{crossOrigin:r,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0,type:typeof e.type=="string"?e.type:void 0,fetchPriority:typeof e.fetchPriority=="string"?e.fetchPriority:void 0,referrerPolicy:typeof e.referrerPolicy=="string"?e.referrerPolicy:void 0,imageSrcSet:typeof e.imageSrcSet=="string"?e.imageSrcSet:void 0,imageSizes:typeof e.imageSizes=="string"?e.imageSizes:void 0,media:typeof e.media=="string"?e.media:void 0})}};dt.preloadModule=function(t,e){if(typeof t=="string")if(e){var n=Df(e.as,e.crossOrigin);ut.d.m(t,{as:typeof e.as=="string"&&e.as!=="script"?e.as:void 0,crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0})}else ut.d.m(t)};dt.requestFormReset=function(t){ut.d.r(t)};dt.unstable_batchedUpdates=function(t,e){return t(e)};dt.useFormState=function(t,e,n){return gl.H.useFormState(t,e,n)};dt.useFormStatus=function(){return gl.H.useHostTransitionStatus()};dt.version="19.2.6"});var np=In((E3,Nb)=>{"use strict";function Lb(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Lb)}catch(t){console.error(t)}}Lb(),Nb.exports=Fb()});var Q1=In(tu=>{"use strict";var je=Ib(),sI=ct(),TO=np();function A(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function fI(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function rs(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,(e.flags&4098)!==0&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function cI(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function uI(t){if(t.tag===31){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function _b(t){if(rs(t)!==t)throw Error(A(188))}function OO(t){var e=t.alternate;if(!e){if(e=rs(t),e===null)throw Error(A(188));return e!==t?null:t}for(var n=t,r=e;;){var o=n.return;if(o===null)break;var a=o.alternate;if(a===null){if(r=o.return,r!==null){n=r;continue}break}if(o.child===a.child){for(a=o.child;a;){if(a===n)return _b(o),t;if(a===r)return _b(o),e;a=a.sibling}throw Error(A(188))}if(n.return!==r.return)n=o,r=a;else{for(var i=!1,l=o.child;l;){if(l===n){i=!0,n=o,r=a;break}if(l===r){i=!0,r=o,n=a;break}l=l.sibling}if(!i){for(l=a.child;l;){if(l===n){i=!0,n=a,r=o;break}if(l===r){i=!0,r=a,n=o;break}l=l.sibling}if(!i)throw Error(A(189))}}if(n.alternate!==r)throw Error(A(190))}if(n.tag!==3)throw Error(A(188));return n.stateNode.current===n?t:e}function dI(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t;for(t=t.child;t!==null;){if(e=dI(t),e!==null)return e;t=t.sibling}return null}var we=Object.assign,BO=Symbol.for("react.element"),Mf=Symbol.for("react.transitional.element"),Cl=Symbol.for("react.portal"),qa=Symbol.for("react.fragment"),pI=Symbol.for("react.strict_mode"),Np=Symbol.for("react.profiler"),mI=Symbol.for("react.consumer"),fr=Symbol.for("react.context"),Mm=Symbol.for("react.forward_ref"),_p=Symbol.for("react.suspense"),qp=Symbol.for("react.suspense_list"),Rm=Symbol.for("react.memo"),Lr=Symbol.for("react.lazy"),Pp=Symbol.for("react.activity"),DO=Symbol.for("react.memo_cache_sentinel"),qb=Symbol.iterator;function yl(t){return t===null||typeof t!="object"?null:(t=qb&&t[qb]||t["@@iterator"],typeof t=="function"?t:null)}var MO=Symbol.for("react.client.reference");function zp(t){if(t==null)return null;if(typeof t=="function")return t.$$typeof===MO?null:t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case qa:return"Fragment";case Np:return"Profiler";case pI:return"StrictMode";case _p:return"Suspense";case qp:return"SuspenseList";case Pp:return"Activity"}if(typeof t=="object")switch(t.$$typeof){case Cl:return"Portal";case fr:return t.displayName||"Context";case mI:return(t._context.displayName||"Context")+".Consumer";case Mm:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case Rm:return e=t.displayName||null,e!==null?e:zp(t.type)||"Memo";case Lr:e=t._payload,t=t._init;try{return zp(t(e))}catch{}}return null}var Al=Array.isArray,H=sI.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,re=TO.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Fo={pending:!1,data:null,method:null,action:null},Hp=[],Pa=-1;function jn(t){return{current:t}}function Xe(t){0>Pa||(t.current=Hp[Pa],Hp[Pa]=null,Pa--)}function he(t,e){Pa++,Hp[Pa]=t.current,t.current=e}var Un=jn(null),jl=jn(null),Wr=jn(null),cc=jn(null);function uc(t,e){switch(he(Wr,e),he(jl,t),he(Un,null),e.nodeType){case 9:case 11:t=(t=e.documentElement)&&(t=t.namespaceURI)?G0(t):0;break;default:if(t=e.tagName,e=e.namespaceURI)e=G0(e),t=F1(e,t);else switch(t){case"svg":t=1;break;case"math":t=2;break;default:t=0}}Xe(Un),he(Un,t)}function ri(){Xe(Un),Xe(jl),Xe(Wr)}function Up(t){t.memoizedState!==null&&he(cc,t);var e=Un.current,n=F1(e,t.type);e!==n&&(he(jl,t),he(Un,n))}function dc(t){jl.current===t&&(Xe(Un),Xe(jl)),cc.current===t&&(Xe(cc),es._currentValue=Fo)}var rp,Pb;function Do(t){if(rp===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);rp=e&&e[1]||"",Pb=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+rp+t+Pb}var op=!1;function ap(t,e){if(!t||op)return"";op=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var r={DetermineComponentFrameRoot:function(){try{if(e){var u=function(){throw Error()};if(Object.defineProperty(u.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(u,[])}catch(p){var d=p}Reflect.construct(t,[],u)}else{try{u.call()}catch(p){d=p}t.call(u.prototype)}}else{try{throw Error()}catch(p){d=p}(u=t())&&typeof u.catch=="function"&&u.catch(function(){})}}catch(p){if(p&&d&&typeof p.stack=="string")return[p.stack,d.stack]}return[null,null]}};r.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var o=Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot,"name");o&&o.configurable&&Object.defineProperty(r.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var a=r.DetermineComponentFrameRoot(),i=a[0],l=a[1];if(i&&l){var s=i.split(`
`),f=l.split(`
`);for(o=r=0;r<s.length&&!s[r].includes("DetermineComponentFrameRoot");)r++;for(;o<f.length&&!f[o].includes("DetermineComponentFrameRoot");)o++;if(r===s.length||o===f.length)for(r=s.length-1,o=f.length-1;1<=r&&0<=o&&s[r]!==f[o];)o--;for(;1<=r&&0<=o;r--,o--)if(s[r]!==f[o]){if(r!==1||o!==1)do if(r--,o--,0>o||s[r]!==f[o]){var c=`
`+s[r].replace(" at new "," at ");return t.displayName&&c.includes("<anonymous>")&&(c=c.replace("<anonymous>",t.displayName)),c}while(1<=r&&0<=o);break}}}finally{op=!1,Error.prepareStackTrace=n}return(n=t?t.displayName||t.name:"")?Do(n):""}function RO(t,e){switch(t.tag){case 26:case 27:case 5:return Do(t.type);case 16:return Do("Lazy");case 13:return t.child!==e&&e!==null?Do("Suspense Fallback"):Do("Suspense");case 19:return Do("SuspenseList");case 0:case 15:return ap(t.type,!1);case 11:return ap(t.type.render,!1);case 1:return ap(t.type,!0);case 31:return Do("Activity");default:return""}}function zb(t){try{var e="",n=null;do e+=RO(t,n),n=t,t=t.return;while(t);return e}catch(r){return`
Error generating stack: `+r.message+`
`+r.stack}}var jp=Object.prototype.hasOwnProperty,Em=je.unstable_scheduleCallback,ip=je.unstable_cancelCallback,EO=je.unstable_shouldYield,FO=je.unstable_requestPaint,qt=je.unstable_now,LO=je.unstable_getCurrentPriorityLevel,hI=je.unstable_ImmediatePriority,xI=je.unstable_UserBlockingPriority,pc=je.unstable_NormalPriority,NO=je.unstable_LowPriority,gI=je.unstable_IdlePriority,_O=je.log,qO=je.unstable_setDisableYieldValue,os=null,Pt=null;function Hr(t){if(typeof _O=="function"&&qO(t),Pt&&typeof Pt.setStrictMode=="function")try{Pt.setStrictMode(os,t)}catch{}}var zt=Math.clz32?Math.clz32:HO,PO=Math.log,zO=Math.LN2;function HO(t){return t>>>=0,t===0?32:31-(PO(t)/zO|0)|0}var Rf=256,Ef=262144,Ff=4194304;function Mo(t){var e=t&42;if(e!==0)return e;switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return t&261888;case 262144:case 524288:case 1048576:case 2097152:return t&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return t&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return t}}function Pc(t,e,n){var r=t.pendingLanes;if(r===0)return 0;var o=0,a=t.suspendedLanes,i=t.pingedLanes;t=t.warmLanes;var l=r&134217727;return l!==0?(r=l&~a,r!==0?o=Mo(r):(i&=l,i!==0?o=Mo(i):n||(n=l&~t,n!==0&&(o=Mo(n))))):(l=r&~a,l!==0?o=Mo(l):i!==0?o=Mo(i):n||(n=r&~t,n!==0&&(o=Mo(n)))),o===0?0:e!==0&&e!==o&&(e&a)===0&&(a=o&-o,n=e&-e,a>=n||a===32&&(n&4194048)!==0)?e:o}function as(t,e){return(t.pendingLanes&~(t.suspendedLanes&~t.pingedLanes)&e)===0}function UO(t,e){switch(t){case 1:case 2:case 4:case 8:case 64:return e+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function yI(){var t=Ff;return Ff<<=1,(Ff&62914560)===0&&(Ff=4194304),t}function lp(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function is(t,e){t.pendingLanes|=e,e!==268435456&&(t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0)}function jO(t,e,n,r,o,a){var i=t.pendingLanes;t.pendingLanes=n,t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0,t.expiredLanes&=n,t.entangledLanes&=n,t.errorRecoveryDisabledLanes&=n,t.shellSuspendCounter=0;var l=t.entanglements,s=t.expirationTimes,f=t.hiddenUpdates;for(n=i&~n;0<n;){var c=31-zt(n),u=1<<c;l[c]=0,s[c]=-1;var d=f[c];if(d!==null)for(f[c]=null,c=0;c<d.length;c++){var p=d[c];p!==null&&(p.lane&=-536870913)}n&=~u}r!==0&&bI(t,r,0),a!==0&&o===0&&t.tag!==0&&(t.suspendedLanes|=a&~(i&~e))}function bI(t,e,n){t.pendingLanes|=e,t.suspendedLanes&=~e;var r=31-zt(e);t.entangledLanes|=e,t.entanglements[r]=t.entanglements[r]|1073741824|n&261930}function II(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var r=31-zt(n),o=1<<r;o&e|t[r]&e&&(t[r]|=e),n&=~o}}function vI(t,e){var n=e&-e;return n=(n&42)!==0?1:Fm(n),(n&(t.suspendedLanes|e))!==0?0:n}function Fm(t){switch(t){case 2:t=1;break;case 8:t=4;break;case 32:t=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:t=128;break;case 268435456:t=134217728;break;default:t=0}return t}function Lm(t){return t&=-t,2<t?8<t?(t&134217727)!==0?32:268435456:8:2}function wI(){var t=re.p;return t!==0?t:(t=window.event,t===void 0?32:G1(t.type))}function Hb(t,e){var n=re.p;try{return re.p=t,e()}finally{re.p=n}}var ao=Math.random().toString(36).slice(2),et="__reactFiber$"+ao,At="__reactProps$"+ao,mi="__reactContainer$"+ao,Vp="__reactEvents$"+ao,VO="__reactListeners$"+ao,GO="__reactHandles$"+ao,Ub="__reactResources$"+ao,ls="__reactMarker$"+ao;function Nm(t){delete t[et],delete t[At],delete t[Vp],delete t[VO],delete t[GO]}function za(t){var e=t[et];if(e)return e;for(var n=t.parentNode;n;){if(e=n[mi]||n[et]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=Y0(t);t!==null;){if(n=t[et])return n;t=Y0(t)}return e}t=n,n=t.parentNode}return null}function hi(t){if(t=t[et]||t[mi]){var e=t.tag;if(e===5||e===6||e===13||e===31||e===26||e===27||e===3)return t}return null}function Tl(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t.stateNode;throw Error(A(33))}function Ya(t){var e=t[Ub];return e||(e=t[Ub]={hoistableStyles:new Map,hoistableScripts:new Map}),e}function We(t){t[ls]=!0}var SI=new Set,kI={};function Vo(t,e){oi(t,e),oi(t+"Capture",e)}function oi(t,e){for(kI[t]=e,t=0;t<e.length;t++)SI.add(e[t])}var WO=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),jb={},Vb={};function XO(t){return jp.call(Vb,t)?!0:jp.call(jb,t)?!1:WO.test(t)?Vb[t]=!0:(jb[t]=!0,!1)}function Kf(t,e,n){if(XO(e))if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":t.removeAttribute(e);return;case"boolean":var r=e.toLowerCase().slice(0,5);if(r!=="data-"&&r!=="aria-"){t.removeAttribute(e);return}}t.setAttribute(e,""+n)}}function Lf(t,e,n){if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(e);return}t.setAttribute(e,""+n)}}function nr(t,e,n,r){if(r===null)t.removeAttribute(n);else{switch(typeof r){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(n);return}t.setAttributeNS(e,n,""+r)}}function en(t){switch(typeof t){case"bigint":case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function CI(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function QO(t,e,n){var r=Object.getOwnPropertyDescriptor(t.constructor.prototype,e);if(!t.hasOwnProperty(e)&&typeof r<"u"&&typeof r.get=="function"&&typeof r.set=="function"){var o=r.get,a=r.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return o.call(this)},set:function(i){n=""+i,a.call(this,i)}}),Object.defineProperty(t,e,{enumerable:r.enumerable}),{getValue:function(){return n},setValue:function(i){n=""+i},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function Gp(t){if(!t._valueTracker){var e=CI(t)?"checked":"value";t._valueTracker=QO(t,e,""+t[e])}}function AI(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),r="";return t&&(r=CI(t)?t.checked?"true":"false":t.value),t=r,t!==n?(e.setValue(t),!0):!1}function mc(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}var KO=/[\n"\\]/g;function rn(t){return t.replace(KO,function(e){return"\\"+e.charCodeAt(0).toString(16)+" "})}function Wp(t,e,n,r,o,a,i,l){t.name="",i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"?t.type=i:t.removeAttribute("type"),e!=null?i==="number"?(e===0&&t.value===""||t.value!=e)&&(t.value=""+en(e)):t.value!==""+en(e)&&(t.value=""+en(e)):i!=="submit"&&i!=="reset"||t.removeAttribute("value"),e!=null?Xp(t,i,en(e)):n!=null?Xp(t,i,en(n)):r!=null&&t.removeAttribute("value"),o==null&&a!=null&&(t.defaultChecked=!!a),o!=null&&(t.checked=o&&typeof o!="function"&&typeof o!="symbol"),l!=null&&typeof l!="function"&&typeof l!="symbol"&&typeof l!="boolean"?t.name=""+en(l):t.removeAttribute("name")}function TI(t,e,n,r,o,a,i,l){if(a!=null&&typeof a!="function"&&typeof a!="symbol"&&typeof a!="boolean"&&(t.type=a),e!=null||n!=null){if(!(a!=="submit"&&a!=="reset"||e!=null)){Gp(t);return}n=n!=null?""+en(n):"",e=e!=null?""+en(e):n,l||e===t.value||(t.value=e),t.defaultValue=e}r=r??o,r=typeof r!="function"&&typeof r!="symbol"&&!!r,t.checked=l?t.checked:!!r,t.defaultChecked=!!r,i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"&&(t.name=i),Gp(t)}function Xp(t,e,n){e==="number"&&mc(t.ownerDocument)===t||t.defaultValue===""+n||(t.defaultValue=""+n)}function Ja(t,e,n,r){if(t=t.options,e){e={};for(var o=0;o<n.length;o++)e["$"+n[o]]=!0;for(n=0;n<t.length;n++)o=e.hasOwnProperty("$"+t[n].value),t[n].selected!==o&&(t[n].selected=o),o&&r&&(t[n].defaultSelected=!0)}else{for(n=""+en(n),e=null,o=0;o<t.length;o++){if(t[o].value===n){t[o].selected=!0,r&&(t[o].defaultSelected=!0);return}e!==null||t[o].disabled||(e=t[o])}e!==null&&(e.selected=!0)}}function OI(t,e,n){if(e!=null&&(e=""+en(e),e!==t.value&&(t.value=e),n==null)){t.defaultValue!==e&&(t.defaultValue=e);return}t.defaultValue=n!=null?""+en(n):""}function BI(t,e,n,r){if(e==null){if(r!=null){if(n!=null)throw Error(A(92));if(Al(r)){if(1<r.length)throw Error(A(93));r=r[0]}n=r}n==null&&(n=""),e=n}n=en(e),t.defaultValue=n,r=t.textContent,r===n&&r!==""&&r!==null&&(t.value=r),Gp(t)}function ai(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var YO=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function Gb(t,e,n){var r=e.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?r?t.setProperty(e,""):e==="float"?t.cssFloat="":t[e]="":r?t.setProperty(e,n):typeof n!="number"||n===0||YO.has(e)?e==="float"?t.cssFloat=n:t[e]=(""+n).trim():t[e]=n+"px"}function DI(t,e,n){if(e!=null&&typeof e!="object")throw Error(A(62));if(t=t.style,n!=null){for(var r in n)!n.hasOwnProperty(r)||e!=null&&e.hasOwnProperty(r)||(r.indexOf("--")===0?t.setProperty(r,""):r==="float"?t.cssFloat="":t[r]="");for(var o in e)r=e[o],e.hasOwnProperty(o)&&n[o]!==r&&Gb(t,o,r)}else for(var a in e)e.hasOwnProperty(a)&&Gb(t,a,e[a])}function _m(t){if(t.indexOf("-")===-1)return!1;switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var JO=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),ZO=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Yf(t){return ZO.test(""+t)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":t}function cr(){}var Qp=null;function qm(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var Ha=null,Za=null;function Wb(t){var e=hi(t);if(e&&(t=e.stateNode)){var n=t[At]||null;e:switch(t=e.stateNode,e.type){case"input":if(Wp(t,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+rn(""+e)+'"][type="radio"]'),e=0;e<n.length;e++){var r=n[e];if(r!==t&&r.form===t.form){var o=r[At]||null;if(!o)throw Error(A(90));Wp(r,o.value,o.defaultValue,o.defaultValue,o.checked,o.defaultChecked,o.type,o.name)}}for(e=0;e<n.length;e++)r=n[e],r.form===t.form&&AI(r)}break e;case"textarea":OI(t,n.value,n.defaultValue);break e;case"select":e=n.value,e!=null&&Ja(t,!!n.multiple,e,!1)}}}var sp=!1;function MI(t,e,n){if(sp)return t(e,n);sp=!0;try{var r=t(e);return r}finally{if(sp=!1,(Ha!==null||Za!==null)&&(Jc(),Ha&&(e=Ha,t=Za,Za=Ha=null,Wb(e),t)))for(e=0;e<t.length;e++)Wb(t[e])}}function Vl(t,e){var n=t.stateNode;if(n===null)return null;var r=n[At]||null;if(r===null)return null;n=r[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(t=t.type,r=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!r;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(A(231,e,typeof n));return n}var hr=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Kp=!1;if(hr)try{Ea={},Object.defineProperty(Ea,"passive",{get:function(){Kp=!0}}),window.addEventListener("test",Ea,Ea),window.removeEventListener("test",Ea,Ea)}catch{Kp=!1}var Ea,Ur=null,Pm=null,Jf=null;function RI(){if(Jf)return Jf;var t,e=Pm,n=e.length,r,o="value"in Ur?Ur.value:Ur.textContent,a=o.length;for(t=0;t<n&&e[t]===o[t];t++);var i=n-t;for(r=1;r<=i&&e[n-r]===o[a-r];r++);return Jf=o.slice(t,1<r?1-r:void 0)}function Zf(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function Nf(){return!0}function Xb(){return!1}function Tt(t){function e(n,r,o,a,i){this._reactName=n,this._targetInst=o,this.type=r,this.nativeEvent=a,this.target=i,this.currentTarget=null;for(var l in t)t.hasOwnProperty(l)&&(n=t[l],this[l]=n?n(a):a[l]);return this.isDefaultPrevented=(a.defaultPrevented!=null?a.defaultPrevented:a.returnValue===!1)?Nf:Xb,this.isPropagationStopped=Xb,this}return we(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Nf)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Nf)},persist:function(){},isPersistent:Nf}),e}var Go={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},zc=Tt(Go),ss=we({},Go,{view:0,detail:0}),$O=Tt(ss),fp,cp,bl,Hc=we({},ss,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:zm,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==bl&&(bl&&t.type==="mousemove"?(fp=t.screenX-bl.screenX,cp=t.screenY-bl.screenY):cp=fp=0,bl=t),fp)},movementY:function(t){return"movementY"in t?t.movementY:cp}}),Qb=Tt(Hc),eB=we({},Hc,{dataTransfer:0}),tB=Tt(eB),nB=we({},ss,{relatedTarget:0}),up=Tt(nB),rB=we({},Go,{animationName:0,elapsedTime:0,pseudoElement:0}),oB=Tt(rB),aB=we({},Go,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),iB=Tt(aB),lB=we({},Go,{data:0}),Kb=Tt(lB),sB={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},fB={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},cB={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function uB(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=cB[t])?!!e[t]:!1}function zm(){return uB}var dB=we({},ss,{key:function(t){if(t.key){var e=sB[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=Zf(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?fB[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:zm,charCode:function(t){return t.type==="keypress"?Zf(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?Zf(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),pB=Tt(dB),mB=we({},Hc,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Yb=Tt(mB),hB=we({},ss,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:zm}),xB=Tt(hB),gB=we({},Go,{propertyName:0,elapsedTime:0,pseudoElement:0}),yB=Tt(gB),bB=we({},Hc,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),IB=Tt(bB),vB=we({},Go,{newState:0,oldState:0}),wB=Tt(vB),SB=[9,13,27,32],Hm=hr&&"CompositionEvent"in window,Dl=null;hr&&"documentMode"in document&&(Dl=document.documentMode);var kB=hr&&"TextEvent"in window&&!Dl,EI=hr&&(!Hm||Dl&&8<Dl&&11>=Dl),Jb=" ",Zb=!1;function FI(t,e){switch(t){case"keyup":return SB.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function LI(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var Ua=!1;function CB(t,e){switch(t){case"compositionend":return LI(e);case"keypress":return e.which!==32?null:(Zb=!0,Jb);case"textInput":return t=e.data,t===Jb&&Zb?null:t;default:return null}}function AB(t,e){if(Ua)return t==="compositionend"||!Hm&&FI(t,e)?(t=RI(),Jf=Pm=Ur=null,Ua=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return EI&&e.locale!=="ko"?null:e.data;default:return null}}var TB={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function $b(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!TB[t.type]:e==="textarea"}function NI(t,e,n,r){Ha?Za?Za.push(r):Za=[r]:Ha=r,e=Rc(e,"onChange"),0<e.length&&(n=new zc("onChange","change",null,n,r),t.push({event:n,listeners:e}))}var Ml=null,Gl=null;function OB(t){M1(t,0)}function Uc(t){var e=Tl(t);if(AI(e))return t}function e0(t,e){if(t==="change")return e}var _I=!1;hr&&(hr?(qf="oninput"in document,qf||(dp=document.createElement("div"),dp.setAttribute("oninput","return;"),qf=typeof dp.oninput=="function"),_f=qf):_f=!1,_I=_f&&(!document.documentMode||9<document.documentMode));var _f,qf,dp;function t0(){Ml&&(Ml.detachEvent("onpropertychange",qI),Gl=Ml=null)}function qI(t){if(t.propertyName==="value"&&Uc(Gl)){var e=[];NI(e,Gl,t,qm(t)),MI(OB,e)}}function BB(t,e,n){t==="focusin"?(t0(),Ml=e,Gl=n,Ml.attachEvent("onpropertychange",qI)):t==="focusout"&&t0()}function DB(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return Uc(Gl)}function MB(t,e){if(t==="click")return Uc(e)}function RB(t,e){if(t==="input"||t==="change")return Uc(e)}function EB(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var Ut=typeof Object.is=="function"?Object.is:EB;function Wl(t,e){if(Ut(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),r=Object.keys(e);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var o=n[r];if(!jp.call(e,o)||!Ut(t[o],e[o]))return!1}return!0}function n0(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function r0(t,e){var n=n0(t);t=0;for(var r;n;){if(n.nodeType===3){if(r=t+n.textContent.length,t<=e&&r>=e)return{node:n,offset:e-t};t=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=n0(n)}}function PI(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?PI(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function zI(t){t=t!=null&&t.ownerDocument!=null&&t.ownerDocument.defaultView!=null?t.ownerDocument.defaultView:window;for(var e=mc(t.document);e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=mc(t.document)}return e}function Um(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}var FB=hr&&"documentMode"in document&&11>=document.documentMode,ja=null,Yp=null,Rl=null,Jp=!1;function o0(t,e,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Jp||ja==null||ja!==mc(r)||(r=ja,"selectionStart"in r&&Um(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),Rl&&Wl(Rl,r)||(Rl=r,r=Rc(Yp,"onSelect"),0<r.length&&(e=new zc("onSelect","select",null,e,n),t.push({event:e,listeners:r}),e.target=ja)))}function Bo(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var Va={animationend:Bo("Animation","AnimationEnd"),animationiteration:Bo("Animation","AnimationIteration"),animationstart:Bo("Animation","AnimationStart"),transitionrun:Bo("Transition","TransitionRun"),transitionstart:Bo("Transition","TransitionStart"),transitioncancel:Bo("Transition","TransitionCancel"),transitionend:Bo("Transition","TransitionEnd")},pp={},HI={};hr&&(HI=document.createElement("div").style,"AnimationEvent"in window||(delete Va.animationend.animation,delete Va.animationiteration.animation,delete Va.animationstart.animation),"TransitionEvent"in window||delete Va.transitionend.transition);function Wo(t){if(pp[t])return pp[t];if(!Va[t])return t;var e=Va[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in HI)return pp[t]=e[n];return t}var UI=Wo("animationend"),jI=Wo("animationiteration"),VI=Wo("animationstart"),LB=Wo("transitionrun"),NB=Wo("transitionstart"),_B=Wo("transitioncancel"),GI=Wo("transitionend"),WI=new Map,Zp="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Zp.push("scrollEnd");function Sn(t,e){WI.set(t,e),Vo(e,[t])}var hc=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},$t=[],Ga=0,jm=0;function jc(){for(var t=Ga,e=jm=Ga=0;e<t;){var n=$t[e];$t[e++]=null;var r=$t[e];$t[e++]=null;var o=$t[e];$t[e++]=null;var a=$t[e];if($t[e++]=null,r!==null&&o!==null){var i=r.pending;i===null?o.next=o:(o.next=i.next,i.next=o),r.pending=o}a!==0&&XI(n,o,a)}}function Vc(t,e,n,r){$t[Ga++]=t,$t[Ga++]=e,$t[Ga++]=n,$t[Ga++]=r,jm|=r,t.lanes|=r,t=t.alternate,t!==null&&(t.lanes|=r)}function Vm(t,e,n,r){return Vc(t,e,n,r),xc(t)}function Xo(t,e){return Vc(t,null,null,e),xc(t)}function XI(t,e,n){t.lanes|=n;var r=t.alternate;r!==null&&(r.lanes|=n);for(var o=!1,a=t.return;a!==null;)a.childLanes|=n,r=a.alternate,r!==null&&(r.childLanes|=n),a.tag===22&&(t=a.stateNode,t===null||t._visibility&1||(o=!0)),t=a,a=a.return;return t.tag===3?(a=t.stateNode,o&&e!==null&&(o=31-zt(n),t=a.hiddenUpdates,r=t[o],r===null?t[o]=[e]:r.push(e),e.lane=n|536870912),a):null}function xc(t){if(50<Hl)throw Hl=0,bm=null,Error(A(185));for(var e=t.return;e!==null;)t=e,e=t.return;return t.tag===3?t.stateNode:null}var Wa={};function qB(t,e,n,r){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Nt(t,e,n,r){return new qB(t,e,n,r)}function Gm(t){return t=t.prototype,!(!t||!t.isReactComponent)}function dr(t,e){var n=t.alternate;return n===null?(n=Nt(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&65011712,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n.refCleanup=t.refCleanup,n}function QI(t,e){t.flags&=65011714;var n=t.alternate;return n===null?(t.childLanes=0,t.lanes=e,t.child=null,t.subtreeFlags=0,t.memoizedProps=null,t.memoizedState=null,t.updateQueue=null,t.dependencies=null,t.stateNode=null):(t.childLanes=n.childLanes,t.lanes=n.lanes,t.child=n.child,t.subtreeFlags=0,t.deletions=null,t.memoizedProps=n.memoizedProps,t.memoizedState=n.memoizedState,t.updateQueue=n.updateQueue,t.type=n.type,e=n.dependencies,t.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),t}function $f(t,e,n,r,o,a){var i=0;if(r=t,typeof t=="function")Gm(t)&&(i=1);else if(typeof t=="string")i=HD(t,n,Un.current)?26:t==="html"||t==="head"||t==="body"?27:5;else e:switch(t){case Pp:return t=Nt(31,n,e,o),t.elementType=Pp,t.lanes=a,t;case qa:return Lo(n.children,o,a,e);case pI:i=8,o|=24;break;case Np:return t=Nt(12,n,e,o|2),t.elementType=Np,t.lanes=a,t;case _p:return t=Nt(13,n,e,o),t.elementType=_p,t.lanes=a,t;case qp:return t=Nt(19,n,e,o),t.elementType=qp,t.lanes=a,t;default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case fr:i=10;break e;case mI:i=9;break e;case Mm:i=11;break e;case Rm:i=14;break e;case Lr:i=16,r=null;break e}i=29,n=Error(A(130,t===null?"null":typeof t,"")),r=null}return e=Nt(i,n,e,o),e.elementType=t,e.type=r,e.lanes=a,e}function Lo(t,e,n,r){return t=Nt(7,t,r,e),t.lanes=n,t}function mp(t,e,n){return t=Nt(6,t,null,e),t.lanes=n,t}function KI(t){var e=Nt(18,null,null,0);return e.stateNode=t,e}function hp(t,e,n){return e=Nt(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}var a0=new WeakMap;function on(t,e){if(typeof t=="object"&&t!==null){var n=a0.get(t);return n!==void 0?n:(e={value:t,source:e,stack:zb(e)},a0.set(t,e),e)}return{value:t,source:e,stack:zb(e)}}var Xa=[],Qa=0,gc=null,Xl=0,tn=[],nn=0,to=null,Pn=1,zn="";function lr(t,e){Xa[Qa++]=Xl,Xa[Qa++]=gc,gc=t,Xl=e}function YI(t,e,n){tn[nn++]=Pn,tn[nn++]=zn,tn[nn++]=to,to=t;var r=Pn;t=zn;var o=32-zt(r)-1;r&=~(1<<o),n+=1;var a=32-zt(e)+o;if(30<a){var i=o-o%5;a=(r&(1<<i)-1).toString(32),r>>=i,o-=i,Pn=1<<32-zt(e)+o|n<<o|r,zn=a+t}else Pn=1<<a|n<<o|r,zn=t}function Wm(t){t.return!==null&&(lr(t,1),YI(t,1,0))}function Xm(t){for(;t===gc;)gc=Xa[--Qa],Xa[Qa]=null,Xl=Xa[--Qa],Xa[Qa]=null;for(;t===to;)to=tn[--nn],tn[nn]=null,zn=tn[--nn],tn[nn]=null,Pn=tn[--nn],tn[nn]=null}function JI(t,e){tn[nn++]=Pn,tn[nn++]=zn,tn[nn++]=to,Pn=e.id,zn=e.overflow,to=t}var tt=null,ve=null,Z=!1,Xr=null,an=!1,$p=Error(A(519));function no(t){var e=Error(A(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Ql(on(e,t)),$p}function i0(t){var e=t.stateNode,n=t.type,r=t.memoizedProps;switch(e[et]=t,e[At]=r,n){case"dialog":X("cancel",e),X("close",e);break;case"iframe":case"object":case"embed":X("load",e);break;case"video":case"audio":for(n=0;n<Zl.length;n++)X(Zl[n],e);break;case"source":X("error",e);break;case"img":case"image":case"link":X("error",e),X("load",e);break;case"details":X("toggle",e);break;case"input":X("invalid",e),TI(e,r.value,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name,!0);break;case"select":X("invalid",e);break;case"textarea":X("invalid",e),BI(e,r.value,r.defaultValue,r.children)}n=r.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||e.textContent===""+n||r.suppressHydrationWarning===!0||E1(e.textContent,n)?(r.popover!=null&&(X("beforetoggle",e),X("toggle",e)),r.onScroll!=null&&X("scroll",e),r.onScrollEnd!=null&&X("scrollend",e),r.onClick!=null&&(e.onclick=cr),e=!0):e=!1,e||no(t,!0)}function l0(t){for(tt=t.return;tt;)switch(tt.tag){case 5:case 31:case 13:an=!1;return;case 27:case 3:an=!0;return;default:tt=tt.return}}function Fa(t){if(t!==tt)return!1;if(!Z)return l0(t),Z=!0,!1;var e=t.tag,n;if((n=e!==3&&e!==27)&&((n=e===5)&&(n=t.type,n=!(n!=="form"&&n!=="button")||km(t.type,t.memoizedProps)),n=!n),n&&ve&&no(t),l0(t),e===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(A(317));ve=K0(t)}else if(e===31){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(A(317));ve=K0(t)}else e===27?(e=ve,io(t.type)?(t=Om,Om=null,ve=t):ve=e):ve=tt?sn(t.stateNode.nextSibling):null;return!0}function Po(){ve=tt=null,Z=!1}function xp(){var t=Xr;return t!==null&&(kt===null?kt=t:kt.push.apply(kt,t),Xr=null),t}function Ql(t){Xr===null?Xr=[t]:Xr.push(t)}var em=jn(null),Qo=null,ur=null;function _r(t,e,n){he(em,e._currentValue),e._currentValue=n}function pr(t){t._currentValue=em.current,Xe(em)}function tm(t,e,n){for(;t!==null;){var r=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,r!==null&&(r.childLanes|=e)):r!==null&&(r.childLanes&e)!==e&&(r.childLanes|=e),t===n)break;t=t.return}}function nm(t,e,n,r){var o=t.child;for(o!==null&&(o.return=t);o!==null;){var a=o.dependencies;if(a!==null){var i=o.child;a=a.firstContext;e:for(;a!==null;){var l=a;a=o;for(var s=0;s<e.length;s++)if(l.context===e[s]){a.lanes|=n,l=a.alternate,l!==null&&(l.lanes|=n),tm(a.return,n,t),r||(i=null);break e}a=l.next}}else if(o.tag===18){if(i=o.return,i===null)throw Error(A(341));i.lanes|=n,a=i.alternate,a!==null&&(a.lanes|=n),tm(i,n,t),i=null}else i=o.child;if(i!==null)i.return=o;else for(i=o;i!==null;){if(i===t){i=null;break}if(o=i.sibling,o!==null){o.return=i.return,i=o;break}i=i.return}o=i}}function xi(t,e,n,r){t=null;for(var o=e,a=!1;o!==null;){if(!a){if((o.flags&524288)!==0)a=!0;else if((o.flags&262144)!==0)break}if(o.tag===10){var i=o.alternate;if(i===null)throw Error(A(387));if(i=i.memoizedProps,i!==null){var l=o.type;Ut(o.pendingProps.value,i.value)||(t!==null?t.push(l):t=[l])}}else if(o===cc.current){if(i=o.alternate,i===null)throw Error(A(387));i.memoizedState.memoizedState!==o.memoizedState.memoizedState&&(t!==null?t.push(es):t=[es])}o=o.return}t!==null&&nm(e,t,n,r),e.flags|=262144}function yc(t){for(t=t.firstContext;t!==null;){if(!Ut(t.context._currentValue,t.memoizedValue))return!0;t=t.next}return!1}function zo(t){Qo=t,ur=null,t=t.dependencies,t!==null&&(t.firstContext=null)}function nt(t){return ZI(Qo,t)}function Pf(t,e){return Qo===null&&zo(t),ZI(t,e)}function ZI(t,e){var n=e._currentValue;if(e={context:e,memoizedValue:n,next:null},ur===null){if(t===null)throw Error(A(308));ur=e,t.dependencies={lanes:0,firstContext:e},t.flags|=524288}else ur=ur.next=e;return n}var PB=typeof AbortController<"u"?AbortController:function(){var t=[],e=this.signal={aborted:!1,addEventListener:function(n,r){t.push(r)}};this.abort=function(){e.aborted=!0,t.forEach(function(n){return n()})}},zB=je.unstable_scheduleCallback,HB=je.unstable_NormalPriority,Pe={$$typeof:fr,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Qm(){return{controller:new PB,data:new Map,refCount:0}}function fs(t){t.refCount--,t.refCount===0&&zB(HB,function(){t.controller.abort()})}var El=null,rm=0,ii=0,$a=null;function UB(t,e){if(El===null){var n=El=[];rm=0,ii=bh(),$a={status:"pending",value:void 0,then:function(r){n.push(r)}}}return rm++,e.then(s0,s0),e}function s0(){if(--rm===0&&El!==null){$a!==null&&($a.status="fulfilled");var t=El;El=null,ii=0,$a=null;for(var e=0;e<t.length;e++)(0,t[e])()}}function jB(t,e){var n=[],r={status:"pending",value:null,reason:null,then:function(o){n.push(o)}};return t.then(function(){r.status="fulfilled",r.value=e;for(var o=0;o<n.length;o++)(0,n[o])(e)},function(o){for(r.status="rejected",r.reason=o,o=0;o<n.length;o++)(0,n[o])(void 0)}),r}var f0=H.S;H.S=function(t,e){d1=qt(),typeof e=="object"&&e!==null&&typeof e.then=="function"&&UB(t,e),f0!==null&&f0(t,e)};var No=jn(null);function Km(){var t=No.current;return t!==null?t:ue.pooledCache}function ec(t,e){e===null?he(No,No.current):he(No,e.pool)}function $I(){var t=Km();return t===null?null:{parent:Pe._currentValue,pool:t}}var gi=Error(A(460)),Ym=Error(A(474)),Gc=Error(A(542)),bc={then:function(){}};function c0(t){return t=t.status,t==="fulfilled"||t==="rejected"}function ev(t,e,n){switch(n=t[n],n===void 0?t.push(e):n!==e&&(e.then(cr,cr),e=n),e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,d0(t),t;default:if(typeof e.status=="string")e.then(cr,cr);else{if(t=ue,t!==null&&100<t.shellSuspendCounter)throw Error(A(482));t=e,t.status="pending",t.then(function(r){if(e.status==="pending"){var o=e;o.status="fulfilled",o.value=r}},function(r){if(e.status==="pending"){var o=e;o.status="rejected",o.reason=r}})}switch(e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,d0(t),t}throw _o=e,gi}}function Ro(t){try{var e=t._init;return e(t._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(_o=n,gi):n}}var _o=null;function u0(){if(_o===null)throw Error(A(459));var t=_o;return _o=null,t}function d0(t){if(t===gi||t===Gc)throw Error(A(483))}var ei=null,Kl=0;function zf(t){var e=Kl;return Kl+=1,ei===null&&(ei=[]),ev(ei,t,e)}function Il(t,e){e=e.props.ref,t.ref=e!==void 0?e:null}function Hf(t,e){throw e.$$typeof===BO?Error(A(525)):(t=Object.prototype.toString.call(e),Error(A(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)))}function tv(t){function e(h,y){if(t){var g=h.deletions;g===null?(h.deletions=[y],h.flags|=16):g.push(y)}}function n(h,y){if(!t)return null;for(;y!==null;)e(h,y),y=y.sibling;return null}function r(h){for(var y=new Map;h!==null;)h.key!==null?y.set(h.key,h):y.set(h.index,h),h=h.sibling;return y}function o(h,y){return h=dr(h,y),h.index=0,h.sibling=null,h}function a(h,y,g){return h.index=g,t?(g=h.alternate,g!==null?(g=g.index,g<y?(h.flags|=67108866,y):g):(h.flags|=67108866,y)):(h.flags|=1048576,y)}function i(h){return t&&h.alternate===null&&(h.flags|=67108866),h}function l(h,y,g,I){return y===null||y.tag!==6?(y=mp(g,h.mode,I),y.return=h,y):(y=o(y,g),y.return=h,y)}function s(h,y,g,I){var v=g.type;return v===qa?c(h,y,g.props.children,I,g.key):y!==null&&(y.elementType===v||typeof v=="object"&&v!==null&&v.$$typeof===Lr&&Ro(v)===y.type)?(y=o(y,g.props),Il(y,g),y.return=h,y):(y=$f(g.type,g.key,g.props,null,h.mode,I),Il(y,g),y.return=h,y)}function f(h,y,g,I){return y===null||y.tag!==4||y.stateNode.containerInfo!==g.containerInfo||y.stateNode.implementation!==g.implementation?(y=hp(g,h.mode,I),y.return=h,y):(y=o(y,g.children||[]),y.return=h,y)}function c(h,y,g,I,v){return y===null||y.tag!==7?(y=Lo(g,h.mode,I,v),y.return=h,y):(y=o(y,g),y.return=h,y)}function u(h,y,g){if(typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint")return y=mp(""+y,h.mode,g),y.return=h,y;if(typeof y=="object"&&y!==null){switch(y.$$typeof){case Mf:return g=$f(y.type,y.key,y.props,null,h.mode,g),Il(g,y),g.return=h,g;case Cl:return y=hp(y,h.mode,g),y.return=h,y;case Lr:return y=Ro(y),u(h,y,g)}if(Al(y)||yl(y))return y=Lo(y,h.mode,g,null),y.return=h,y;if(typeof y.then=="function")return u(h,zf(y),g);if(y.$$typeof===fr)return u(h,Pf(h,y),g);Hf(h,y)}return null}function d(h,y,g,I){var v=y!==null?y.key:null;if(typeof g=="string"&&g!==""||typeof g=="number"||typeof g=="bigint")return v!==null?null:l(h,y,""+g,I);if(typeof g=="object"&&g!==null){switch(g.$$typeof){case Mf:return g.key===v?s(h,y,g,I):null;case Cl:return g.key===v?f(h,y,g,I):null;case Lr:return g=Ro(g),d(h,y,g,I)}if(Al(g)||yl(g))return v!==null?null:c(h,y,g,I,null);if(typeof g.then=="function")return d(h,y,zf(g),I);if(g.$$typeof===fr)return d(h,y,Pf(h,g),I);Hf(h,g)}return null}function p(h,y,g,I,v){if(typeof I=="string"&&I!==""||typeof I=="number"||typeof I=="bigint")return h=h.get(g)||null,l(y,h,""+I,v);if(typeof I=="object"&&I!==null){switch(I.$$typeof){case Mf:return h=h.get(I.key===null?g:I.key)||null,s(y,h,I,v);case Cl:return h=h.get(I.key===null?g:I.key)||null,f(y,h,I,v);case Lr:return I=Ro(I),p(h,y,g,I,v)}if(Al(I)||yl(I))return h=h.get(g)||null,c(y,h,I,v,null);if(typeof I.then=="function")return p(h,y,g,zf(I),v);if(I.$$typeof===fr)return p(h,y,g,Pf(y,I),v);Hf(y,I)}return null}function m(h,y,g,I){for(var v=null,S=null,w=y,k=y=0,D=null;w!==null&&k<g.length;k++){w.index>k?(D=w,w=null):D=w.sibling;var L=d(h,w,g[k],I);if(L===null){w===null&&(w=D);break}t&&w&&L.alternate===null&&e(h,w),y=a(L,y,k),S===null?v=L:S.sibling=L,S=L,w=D}if(k===g.length)return n(h,w),Z&&lr(h,k),v;if(w===null){for(;k<g.length;k++)w=u(h,g[k],I),w!==null&&(y=a(w,y,k),S===null?v=w:S.sibling=w,S=w);return Z&&lr(h,k),v}for(w=r(w);k<g.length;k++)D=p(w,h,k,g[k],I),D!==null&&(t&&D.alternate!==null&&w.delete(D.key===null?k:D.key),y=a(D,y,k),S===null?v=D:S.sibling=D,S=D);return t&&w.forEach(function(P){return e(h,P)}),Z&&lr(h,k),v}function x(h,y,g,I){if(g==null)throw Error(A(151));for(var v=null,S=null,w=y,k=y=0,D=null,L=g.next();w!==null&&!L.done;k++,L=g.next()){w.index>k?(D=w,w=null):D=w.sibling;var P=d(h,w,L.value,I);if(P===null){w===null&&(w=D);break}t&&w&&P.alternate===null&&e(h,w),y=a(P,y,k),S===null?v=P:S.sibling=P,S=P,w=D}if(L.done)return n(h,w),Z&&lr(h,k),v;if(w===null){for(;!L.done;k++,L=g.next())L=u(h,L.value,I),L!==null&&(y=a(L,y,k),S===null?v=L:S.sibling=L,S=L);return Z&&lr(h,k),v}for(w=r(w);!L.done;k++,L=g.next())L=p(w,h,k,L.value,I),L!==null&&(t&&L.alternate!==null&&w.delete(L.key===null?k:L.key),y=a(L,y,k),S===null?v=L:S.sibling=L,S=L);return t&&w.forEach(function(E){return e(h,E)}),Z&&lr(h,k),v}function b(h,y,g,I){if(typeof g=="object"&&g!==null&&g.type===qa&&g.key===null&&(g=g.props.children),typeof g=="object"&&g!==null){switch(g.$$typeof){case Mf:e:{for(var v=g.key;y!==null;){if(y.key===v){if(v=g.type,v===qa){if(y.tag===7){n(h,y.sibling),I=o(y,g.props.children),I.return=h,h=I;break e}}else if(y.elementType===v||typeof v=="object"&&v!==null&&v.$$typeof===Lr&&Ro(v)===y.type){n(h,y.sibling),I=o(y,g.props),Il(I,g),I.return=h,h=I;break e}n(h,y);break}else e(h,y);y=y.sibling}g.type===qa?(I=Lo(g.props.children,h.mode,I,g.key),I.return=h,h=I):(I=$f(g.type,g.key,g.props,null,h.mode,I),Il(I,g),I.return=h,h=I)}return i(h);case Cl:e:{for(v=g.key;y!==null;){if(y.key===v)if(y.tag===4&&y.stateNode.containerInfo===g.containerInfo&&y.stateNode.implementation===g.implementation){n(h,y.sibling),I=o(y,g.children||[]),I.return=h,h=I;break e}else{n(h,y);break}else e(h,y);y=y.sibling}I=hp(g,h.mode,I),I.return=h,h=I}return i(h);case Lr:return g=Ro(g),b(h,y,g,I)}if(Al(g))return m(h,y,g,I);if(yl(g)){if(v=yl(g),typeof v!="function")throw Error(A(150));return g=v.call(g),x(h,y,g,I)}if(typeof g.then=="function")return b(h,y,zf(g),I);if(g.$$typeof===fr)return b(h,y,Pf(h,g),I);Hf(h,g)}return typeof g=="string"&&g!==""||typeof g=="number"||typeof g=="bigint"?(g=""+g,y!==null&&y.tag===6?(n(h,y.sibling),I=o(y,g),I.return=h,h=I):(n(h,y),I=mp(g,h.mode,I),I.return=h,h=I),i(h)):n(h,y)}return function(h,y,g,I){try{Kl=0;var v=b(h,y,g,I);return ei=null,v}catch(w){if(w===gi||w===Gc)throw w;var S=Nt(29,w,null,h.mode);return S.lanes=I,S.return=h,S}}}var Ho=tv(!0),nv=tv(!1),Nr=!1;function Jm(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function om(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,callbacks:null})}function Qr(t){return{lane:t,tag:0,payload:null,callback:null,next:null}}function Kr(t,e,n){var r=t.updateQueue;if(r===null)return null;if(r=r.shared,(ne&2)!==0){var o=r.pending;return o===null?e.next=e:(e.next=o.next,o.next=e),r.pending=e,e=xc(t),XI(t,null,n),e}return Vc(t,r,e,n),xc(t)}function Fl(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194048)!==0)){var r=e.lanes;r&=t.pendingLanes,n|=r,e.lanes=n,II(t,n)}}function gp(t,e){var n=t.updateQueue,r=t.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var o=null,a=null;if(n=n.firstBaseUpdate,n!==null){do{var i={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};a===null?o=a=i:a=a.next=i,n=n.next}while(n!==null);a===null?o=a=e:a=a.next=e}else o=a=e;n={baseState:r.baseState,firstBaseUpdate:o,lastBaseUpdate:a,shared:r.shared,callbacks:r.callbacks},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}var am=!1;function Ll(){if(am){var t=$a;if(t!==null)throw t}}function Nl(t,e,n,r){am=!1;var o=t.updateQueue;Nr=!1;var a=o.firstBaseUpdate,i=o.lastBaseUpdate,l=o.shared.pending;if(l!==null){o.shared.pending=null;var s=l,f=s.next;s.next=null,i===null?a=f:i.next=f,i=s;var c=t.alternate;c!==null&&(c=c.updateQueue,l=c.lastBaseUpdate,l!==i&&(l===null?c.firstBaseUpdate=f:l.next=f,c.lastBaseUpdate=s))}if(a!==null){var u=o.baseState;i=0,c=f=s=null,l=a;do{var d=l.lane&-536870913,p=d!==l.lane;if(p?(Y&d)===d:(r&d)===d){d!==0&&d===ii&&(am=!0),c!==null&&(c=c.next={lane:0,tag:l.tag,payload:l.payload,callback:null,next:null});e:{var m=t,x=l;d=e;var b=n;switch(x.tag){case 1:if(m=x.payload,typeof m=="function"){u=m.call(b,u,d);break e}u=m;break e;case 3:m.flags=m.flags&-65537|128;case 0:if(m=x.payload,d=typeof m=="function"?m.call(b,u,d):m,d==null)break e;u=we({},u,d);break e;case 2:Nr=!0}}d=l.callback,d!==null&&(t.flags|=64,p&&(t.flags|=8192),p=o.callbacks,p===null?o.callbacks=[d]:p.push(d))}else p={lane:d,tag:l.tag,payload:l.payload,callback:l.callback,next:null},c===null?(f=c=p,s=u):c=c.next=p,i|=d;if(l=l.next,l===null){if(l=o.shared.pending,l===null)break;p=l,l=p.next,p.next=null,o.lastBaseUpdate=p,o.shared.pending=null}}while(!0);c===null&&(s=u),o.baseState=s,o.firstBaseUpdate=f,o.lastBaseUpdate=c,a===null&&(o.shared.lanes=0),oo|=i,t.lanes=i,t.memoizedState=u}}function rv(t,e){if(typeof t!="function")throw Error(A(191,t));t.call(e)}function ov(t,e){var n=t.callbacks;if(n!==null)for(t.callbacks=null,t=0;t<n.length;t++)rv(n[t],e)}var li=jn(null),Ic=jn(0);function p0(t,e){t=br,he(Ic,t),he(li,e),br=t|e.baseLanes}function im(){he(Ic,br),he(li,li.current)}function Zm(){br=Ic.current,Xe(li),Xe(Ic)}var jt=jn(null),ln=null;function qr(t){var e=t.alternate;he(Ee,Ee.current&1),he(jt,t),ln===null&&(e===null||li.current!==null||e.memoizedState!==null)&&(ln=t)}function lm(t){he(Ee,Ee.current),he(jt,t),ln===null&&(ln=t)}function av(t){t.tag===22?(he(Ee,Ee.current),he(jt,t),ln===null&&(ln=t)):Pr(t)}function Pr(){he(Ee,Ee.current),he(jt,jt.current)}function Lt(t){Xe(jt),ln===t&&(ln=null),Xe(Ee)}var Ee=jn(0);function vc(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||Am(n)||Tm(n)))return e}else if(e.tag===19&&(e.memoizedProps.revealOrder==="forwards"||e.memoizedProps.revealOrder==="backwards"||e.memoizedProps.revealOrder==="unstable_legacy-backwards"||e.memoizedProps.revealOrder==="together")){if((e.flags&128)!==0)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var xr=0,W=null,ce=null,_e=null,wc=!1,ti=!1,Uo=!1,Sc=0,Yl=0,ni=null,VB=0;function De(){throw Error(A(321))}function $m(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!Ut(t[n],e[n]))return!1;return!0}function eh(t,e,n,r,o,a){return xr=a,W=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,H.H=t===null||t.memoizedState===null?Nv:uh,Uo=!1,a=n(r,o),Uo=!1,ti&&(a=lv(e,n,r,o)),iv(t),a}function iv(t){H.H=Jl;var e=ce!==null&&ce.next!==null;if(xr=0,_e=ce=W=null,wc=!1,Yl=0,ni=null,e)throw Error(A(300));t===null||ze||(t=t.dependencies,t!==null&&yc(t)&&(ze=!0))}function lv(t,e,n,r){W=t;var o=0;do{if(ti&&(ni=null),Yl=0,ti=!1,25<=o)throw Error(A(301));if(o+=1,_e=ce=null,t.updateQueue!=null){var a=t.updateQueue;a.lastEffect=null,a.events=null,a.stores=null,a.memoCache!=null&&(a.memoCache.index=0)}H.H=_v,a=e(n,r)}while(ti);return a}function GB(){var t=H.H,e=t.useState()[0];return e=typeof e.then=="function"?cs(e):e,t=t.useState()[0],(ce!==null?ce.memoizedState:null)!==t&&(W.flags|=1024),e}function th(){var t=Sc!==0;return Sc=0,t}function nh(t,e,n){e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~n}function rh(t){if(wc){for(t=t.memoizedState;t!==null;){var e=t.queue;e!==null&&(e.pending=null),t=t.next}wc=!1}xr=0,_e=ce=W=null,ti=!1,Yl=Sc=0,ni=null}function pt(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return _e===null?W.memoizedState=_e=t:_e=_e.next=t,_e}function Fe(){if(ce===null){var t=W.alternate;t=t!==null?t.memoizedState:null}else t=ce.next;var e=_e===null?W.memoizedState:_e.next;if(e!==null)_e=e,ce=t;else{if(t===null)throw W.alternate===null?Error(A(467)):Error(A(310));ce=t,t={memoizedState:ce.memoizedState,baseState:ce.baseState,baseQueue:ce.baseQueue,queue:ce.queue,next:null},_e===null?W.memoizedState=_e=t:_e=_e.next=t}return _e}function Wc(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function cs(t){var e=Yl;return Yl+=1,ni===null&&(ni=[]),t=ev(ni,t,e),e=W,(_e===null?e.memoizedState:_e.next)===null&&(e=e.alternate,H.H=e===null||e.memoizedState===null?Nv:uh),t}function Xc(t){if(t!==null&&typeof t=="object"){if(typeof t.then=="function")return cs(t);if(t.$$typeof===fr)return nt(t)}throw Error(A(438,String(t)))}function oh(t){var e=null,n=W.updateQueue;if(n!==null&&(e=n.memoCache),e==null){var r=W.alternate;r!==null&&(r=r.updateQueue,r!==null&&(r=r.memoCache,r!=null&&(e={data:r.data.map(function(o){return o.slice()}),index:0})))}if(e==null&&(e={data:[],index:0}),n===null&&(n=Wc(),W.updateQueue=n),n.memoCache=e,n=e.data[e.index],n===void 0)for(n=e.data[e.index]=Array(t),r=0;r<t;r++)n[r]=DO;return e.index++,n}function gr(t,e){return typeof e=="function"?e(t):e}function tc(t){var e=Fe();return ah(e,ce,t)}function ah(t,e,n){var r=t.queue;if(r===null)throw Error(A(311));r.lastRenderedReducer=n;var o=t.baseQueue,a=r.pending;if(a!==null){if(o!==null){var i=o.next;o.next=a.next,a.next=i}e.baseQueue=o=a,r.pending=null}if(a=t.baseState,o===null)t.memoizedState=a;else{e=o.next;var l=i=null,s=null,f=e,c=!1;do{var u=f.lane&-536870913;if(u!==f.lane?(Y&u)===u:(xr&u)===u){var d=f.revertLane;if(d===0)s!==null&&(s=s.next={lane:0,revertLane:0,gesture:null,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null}),u===ii&&(c=!0);else if((xr&d)===d){f=f.next,d===ii&&(c=!0);continue}else u={lane:0,revertLane:f.revertLane,gesture:null,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null},s===null?(l=s=u,i=a):s=s.next=u,W.lanes|=d,oo|=d;u=f.action,Uo&&n(a,u),a=f.hasEagerState?f.eagerState:n(a,u)}else d={lane:u,revertLane:f.revertLane,gesture:f.gesture,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null},s===null?(l=s=d,i=a):s=s.next=d,W.lanes|=u,oo|=u;f=f.next}while(f!==null&&f!==e);if(s===null?i=a:s.next=l,!Ut(a,t.memoizedState)&&(ze=!0,c&&(n=$a,n!==null)))throw n;t.memoizedState=a,t.baseState=i,t.baseQueue=s,r.lastRenderedState=a}return o===null&&(r.lanes=0),[t.memoizedState,r.dispatch]}function yp(t){var e=Fe(),n=e.queue;if(n===null)throw Error(A(311));n.lastRenderedReducer=t;var r=n.dispatch,o=n.pending,a=e.memoizedState;if(o!==null){n.pending=null;var i=o=o.next;do a=t(a,i.action),i=i.next;while(i!==o);Ut(a,e.memoizedState)||(ze=!0),e.memoizedState=a,e.baseQueue===null&&(e.baseState=a),n.lastRenderedState=a}return[a,r]}function sv(t,e,n){var r=W,o=Fe(),a=Z;if(a){if(n===void 0)throw Error(A(407));n=n()}else n=e();var i=!Ut((ce||o).memoizedState,n);if(i&&(o.memoizedState=n,ze=!0),o=o.queue,ih(uv.bind(null,r,o,t),[t]),o.getSnapshot!==e||i||_e!==null&&_e.memoizedState.tag&1){if(r.flags|=2048,si(9,{destroy:void 0},cv.bind(null,r,o,n,e),null),ue===null)throw Error(A(349));a||(xr&127)!==0||fv(r,e,n)}return n}function fv(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=W.updateQueue,e===null?(e=Wc(),W.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function cv(t,e,n,r){e.value=n,e.getSnapshot=r,dv(e)&&pv(t)}function uv(t,e,n){return n(function(){dv(e)&&pv(t)})}function dv(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!Ut(t,n)}catch{return!0}}function pv(t){var e=Xo(t,2);e!==null&&Ct(e,t,2)}function sm(t){var e=pt();if(typeof t=="function"){var n=t;if(t=n(),Uo){Hr(!0);try{n()}finally{Hr(!1)}}}return e.memoizedState=e.baseState=t,e.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:gr,lastRenderedState:t},e}function mv(t,e,n,r){return t.baseState=n,ah(t,ce,typeof r=="function"?r:gr)}function WB(t,e,n,r,o){if(Kc(t))throw Error(A(485));if(t=e.action,t!==null){var a={payload:o,action:t,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(i){a.listeners.push(i)}};H.T!==null?n(!0):a.isTransition=!1,r(a),n=e.pending,n===null?(a.next=e.pending=a,hv(e,a)):(a.next=n.next,e.pending=n.next=a)}}function hv(t,e){var n=e.action,r=e.payload,o=t.state;if(e.isTransition){var a=H.T,i={};H.T=i;try{var l=n(o,r),s=H.S;s!==null&&s(i,l),m0(t,e,l)}catch(f){fm(t,e,f)}finally{a!==null&&i.types!==null&&(a.types=i.types),H.T=a}}else try{a=n(o,r),m0(t,e,a)}catch(f){fm(t,e,f)}}function m0(t,e,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(r){h0(t,e,r)},function(r){return fm(t,e,r)}):h0(t,e,n)}function h0(t,e,n){e.status="fulfilled",e.value=n,xv(e),t.state=n,e=t.pending,e!==null&&(n=e.next,n===e?t.pending=null:(n=n.next,e.next=n,hv(t,n)))}function fm(t,e,n){var r=t.pending;if(t.pending=null,r!==null){r=r.next;do e.status="rejected",e.reason=n,xv(e),e=e.next;while(e!==r)}t.action=null}function xv(t){t=t.listeners;for(var e=0;e<t.length;e++)(0,t[e])()}function gv(t,e){return e}function x0(t,e){if(Z){var n=ue.formState;if(n!==null){e:{var r=W;if(Z){if(ve){t:{for(var o=ve,a=an;o.nodeType!==8;){if(!a){o=null;break t}if(o=sn(o.nextSibling),o===null){o=null;break t}}a=o.data,o=a==="F!"||a==="F"?o:null}if(o){ve=sn(o.nextSibling),r=o.data==="F!";break e}}no(r)}r=!1}r&&(e=n[0])}}return n=pt(),n.memoizedState=n.baseState=e,r={pending:null,lanes:0,dispatch:null,lastRenderedReducer:gv,lastRenderedState:e},n.queue=r,n=Ev.bind(null,W,r),r.dispatch=n,r=sm(!1),a=ch.bind(null,W,!1,r.queue),r=pt(),o={state:e,dispatch:null,action:t,pending:null},r.queue=o,n=WB.bind(null,W,o,a,n),o.dispatch=n,r.memoizedState=t,[e,n,!1]}function g0(t){var e=Fe();return yv(e,ce,t)}function yv(t,e,n){if(e=ah(t,e,gv)[0],t=tc(gr)[0],typeof e=="object"&&e!==null&&typeof e.then=="function")try{var r=cs(e)}catch(i){throw i===gi?Gc:i}else r=e;e=Fe();var o=e.queue,a=o.dispatch;return n!==e.memoizedState&&(W.flags|=2048,si(9,{destroy:void 0},XB.bind(null,o,n),null)),[r,a,t]}function XB(t,e){t.action=e}function y0(t){var e=Fe(),n=ce;if(n!==null)return yv(e,n,t);Fe(),e=e.memoizedState,n=Fe();var r=n.queue.dispatch;return n.memoizedState=t,[e,r,!1]}function si(t,e,n,r){return t={tag:t,create:n,deps:r,inst:e,next:null},e=W.updateQueue,e===null&&(e=Wc(),W.updateQueue=e),n=e.lastEffect,n===null?e.lastEffect=t.next=t:(r=n.next,n.next=t,t.next=r,e.lastEffect=t),t}function bv(){return Fe().memoizedState}function nc(t,e,n,r){var o=pt();W.flags|=t,o.memoizedState=si(1|e,{destroy:void 0},n,r===void 0?null:r)}function Qc(t,e,n,r){var o=Fe();r=r===void 0?null:r;var a=o.memoizedState.inst;ce!==null&&r!==null&&$m(r,ce.memoizedState.deps)?o.memoizedState=si(e,a,n,r):(W.flags|=t,o.memoizedState=si(1|e,a,n,r))}function b0(t,e){nc(8390656,8,t,e)}function ih(t,e){Qc(2048,8,t,e)}function QB(t){W.flags|=4;var e=W.updateQueue;if(e===null)e=Wc(),W.updateQueue=e,e.events=[t];else{var n=e.events;n===null?e.events=[t]:n.push(t)}}function Iv(t){var e=Fe().memoizedState;return QB({ref:e,nextImpl:t}),function(){if((ne&2)!==0)throw Error(A(440));return e.impl.apply(void 0,arguments)}}function vv(t,e){return Qc(4,2,t,e)}function wv(t,e){return Qc(4,4,t,e)}function Sv(t,e){if(typeof e=="function"){t=t();var n=e(t);return function(){typeof n=="function"?n():e(null)}}if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function kv(t,e,n){n=n!=null?n.concat([t]):null,Qc(4,4,Sv.bind(null,e,t),n)}function lh(){}function Cv(t,e){var n=Fe();e=e===void 0?null:e;var r=n.memoizedState;return e!==null&&$m(e,r[1])?r[0]:(n.memoizedState=[t,e],t)}function Av(t,e){var n=Fe();e=e===void 0?null:e;var r=n.memoizedState;if(e!==null&&$m(e,r[1]))return r[0];if(r=t(),Uo){Hr(!0);try{t()}finally{Hr(!1)}}return n.memoizedState=[r,e],r}function sh(t,e,n){return n===void 0||(xr&1073741824)!==0&&(Y&261930)===0?t.memoizedState=e:(t.memoizedState=n,t=m1(),W.lanes|=t,oo|=t,n)}function Tv(t,e,n,r){return Ut(n,e)?n:li.current!==null?(t=sh(t,n,r),Ut(t,e)||(ze=!0),t):(xr&42)===0||(xr&1073741824)!==0&&(Y&261930)===0?(ze=!0,t.memoizedState=n):(t=m1(),W.lanes|=t,oo|=t,e)}function Ov(t,e,n,r,o){var a=re.p;re.p=a!==0&&8>a?a:8;var i=H.T,l={};H.T=l,ch(t,!1,e,n);try{var s=o(),f=H.S;if(f!==null&&f(l,s),s!==null&&typeof s=="object"&&typeof s.then=="function"){var c=jB(s,r);_l(t,e,c,Ht(t))}else _l(t,e,r,Ht(t))}catch(u){_l(t,e,{then:function(){},status:"rejected",reason:u},Ht())}finally{re.p=a,i!==null&&l.types!==null&&(i.types=l.types),H.T=i}}function KB(){}function cm(t,e,n,r){if(t.tag!==5)throw Error(A(476));var o=Bv(t).queue;Ov(t,o,e,Fo,n===null?KB:function(){return Dv(t),n(r)})}function Bv(t){var e=t.memoizedState;if(e!==null)return e;e={memoizedState:Fo,baseState:Fo,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:gr,lastRenderedState:Fo},next:null};var n={};return e.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:gr,lastRenderedState:n},next:null},t.memoizedState=e,t=t.alternate,t!==null&&(t.memoizedState=e),e}function Dv(t){var e=Bv(t);e.next===null&&(e=t.alternate.memoizedState),_l(t,e.next.queue,{},Ht())}function fh(){return nt(es)}function Mv(){return Fe().memoizedState}function Rv(){return Fe().memoizedState}function YB(t){for(var e=t.return;e!==null;){switch(e.tag){case 24:case 3:var n=Ht();t=Qr(n);var r=Kr(e,t,n);r!==null&&(Ct(r,e,n),Fl(r,e,n)),e={cache:Qm()},t.payload=e;return}e=e.return}}function JB(t,e,n){var r=Ht();n={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Kc(t)?Fv(e,n):(n=Vm(t,e,n,r),n!==null&&(Ct(n,t,r),Lv(n,e,r)))}function Ev(t,e,n){var r=Ht();_l(t,e,n,r)}function _l(t,e,n,r){var o={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(Kc(t))Fv(e,o);else{var a=t.alternate;if(t.lanes===0&&(a===null||a.lanes===0)&&(a=e.lastRenderedReducer,a!==null))try{var i=e.lastRenderedState,l=a(i,n);if(o.hasEagerState=!0,o.eagerState=l,Ut(l,i))return Vc(t,e,o,0),ue===null&&jc(),!1}catch{}if(n=Vm(t,e,o,r),n!==null)return Ct(n,t,r),Lv(n,e,r),!0}return!1}function ch(t,e,n,r){if(r={lane:2,revertLane:bh(),gesture:null,action:r,hasEagerState:!1,eagerState:null,next:null},Kc(t)){if(e)throw Error(A(479))}else e=Vm(t,n,r,2),e!==null&&Ct(e,t,2)}function Kc(t){var e=t.alternate;return t===W||e!==null&&e===W}function Fv(t,e){ti=wc=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function Lv(t,e,n){if((n&4194048)!==0){var r=e.lanes;r&=t.pendingLanes,n|=r,e.lanes=n,II(t,n)}}var Jl={readContext:nt,use:Xc,useCallback:De,useContext:De,useEffect:De,useImperativeHandle:De,useLayoutEffect:De,useInsertionEffect:De,useMemo:De,useReducer:De,useRef:De,useState:De,useDebugValue:De,useDeferredValue:De,useTransition:De,useSyncExternalStore:De,useId:De,useHostTransitionStatus:De,useFormState:De,useActionState:De,useOptimistic:De,useMemoCache:De,useCacheRefresh:De};Jl.useEffectEvent=De;var Nv={readContext:nt,use:Xc,useCallback:function(t,e){return pt().memoizedState=[t,e===void 0?null:e],t},useContext:nt,useEffect:b0,useImperativeHandle:function(t,e,n){n=n!=null?n.concat([t]):null,nc(4194308,4,Sv.bind(null,e,t),n)},useLayoutEffect:function(t,e){return nc(4194308,4,t,e)},useInsertionEffect:function(t,e){nc(4,2,t,e)},useMemo:function(t,e){var n=pt();e=e===void 0?null:e;var r=t();if(Uo){Hr(!0);try{t()}finally{Hr(!1)}}return n.memoizedState=[r,e],r},useReducer:function(t,e,n){var r=pt();if(n!==void 0){var o=n(e);if(Uo){Hr(!0);try{n(e)}finally{Hr(!1)}}}else o=e;return r.memoizedState=r.baseState=o,t={pending:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:o},r.queue=t,t=t.dispatch=JB.bind(null,W,t),[r.memoizedState,t]},useRef:function(t){var e=pt();return t={current:t},e.memoizedState=t},useState:function(t){t=sm(t);var e=t.queue,n=Ev.bind(null,W,e);return e.dispatch=n,[t.memoizedState,n]},useDebugValue:lh,useDeferredValue:function(t,e){var n=pt();return sh(n,t,e)},useTransition:function(){var t=sm(!1);return t=Ov.bind(null,W,t.queue,!0,!1),pt().memoizedState=t,[!1,t]},useSyncExternalStore:function(t,e,n){var r=W,o=pt();if(Z){if(n===void 0)throw Error(A(407));n=n()}else{if(n=e(),ue===null)throw Error(A(349));(Y&127)!==0||fv(r,e,n)}o.memoizedState=n;var a={value:n,getSnapshot:e};return o.queue=a,b0(uv.bind(null,r,a,t),[t]),r.flags|=2048,si(9,{destroy:void 0},cv.bind(null,r,a,n,e),null),n},useId:function(){var t=pt(),e=ue.identifierPrefix;if(Z){var n=zn,r=Pn;n=(r&~(1<<32-zt(r)-1)).toString(32)+n,e="_"+e+"R_"+n,n=Sc++,0<n&&(e+="H"+n.toString(32)),e+="_"}else n=VB++,e="_"+e+"r_"+n.toString(32)+"_";return t.memoizedState=e},useHostTransitionStatus:fh,useFormState:x0,useActionState:x0,useOptimistic:function(t){var e=pt();e.memoizedState=e.baseState=t;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return e.queue=n,e=ch.bind(null,W,!0,n),n.dispatch=e,[t,e]},useMemoCache:oh,useCacheRefresh:function(){return pt().memoizedState=YB.bind(null,W)},useEffectEvent:function(t){var e=pt(),n={impl:t};return e.memoizedState=n,function(){if((ne&2)!==0)throw Error(A(440));return n.impl.apply(void 0,arguments)}}},uh={readContext:nt,use:Xc,useCallback:Cv,useContext:nt,useEffect:ih,useImperativeHandle:kv,useInsertionEffect:vv,useLayoutEffect:wv,useMemo:Av,useReducer:tc,useRef:bv,useState:function(){return tc(gr)},useDebugValue:lh,useDeferredValue:function(t,e){var n=Fe();return Tv(n,ce.memoizedState,t,e)},useTransition:function(){var t=tc(gr)[0],e=Fe().memoizedState;return[typeof t=="boolean"?t:cs(t),e]},useSyncExternalStore:sv,useId:Mv,useHostTransitionStatus:fh,useFormState:g0,useActionState:g0,useOptimistic:function(t,e){var n=Fe();return mv(n,ce,t,e)},useMemoCache:oh,useCacheRefresh:Rv};uh.useEffectEvent=Iv;var _v={readContext:nt,use:Xc,useCallback:Cv,useContext:nt,useEffect:ih,useImperativeHandle:kv,useInsertionEffect:vv,useLayoutEffect:wv,useMemo:Av,useReducer:yp,useRef:bv,useState:function(){return yp(gr)},useDebugValue:lh,useDeferredValue:function(t,e){var n=Fe();return ce===null?sh(n,t,e):Tv(n,ce.memoizedState,t,e)},useTransition:function(){var t=yp(gr)[0],e=Fe().memoizedState;return[typeof t=="boolean"?t:cs(t),e]},useSyncExternalStore:sv,useId:Mv,useHostTransitionStatus:fh,useFormState:y0,useActionState:y0,useOptimistic:function(t,e){var n=Fe();return ce!==null?mv(n,ce,t,e):(n.baseState=t,[t,n.queue.dispatch])},useMemoCache:oh,useCacheRefresh:Rv};_v.useEffectEvent=Iv;function bp(t,e,n,r){e=t.memoizedState,n=n(r,e),n=n==null?e:we({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var um={enqueueSetState:function(t,e,n){t=t._reactInternals;var r=Ht(),o=Qr(r);o.payload=e,n!=null&&(o.callback=n),e=Kr(t,o,r),e!==null&&(Ct(e,t,r),Fl(e,t,r))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var r=Ht(),o=Qr(r);o.tag=1,o.payload=e,n!=null&&(o.callback=n),e=Kr(t,o,r),e!==null&&(Ct(e,t,r),Fl(e,t,r))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=Ht(),r=Qr(n);r.tag=2,e!=null&&(r.callback=e),e=Kr(t,r,n),e!==null&&(Ct(e,t,n),Fl(e,t,n))}};function I0(t,e,n,r,o,a,i){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(r,a,i):e.prototype&&e.prototype.isPureReactComponent?!Wl(n,r)||!Wl(o,a):!0}function v0(t,e,n,r){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,r),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,r),e.state!==t&&um.enqueueReplaceState(e,e.state,null)}function jo(t,e){var n=e;if("ref"in e){n={};for(var r in e)r!=="ref"&&(n[r]=e[r])}if(t=t.defaultProps){n===e&&(n=we({},n));for(var o in t)n[o]===void 0&&(n[o]=t[o])}return n}function qv(t){hc(t)}function Pv(t){console.error(t)}function zv(t){hc(t)}function kc(t,e){try{var n=t.onUncaughtError;n(e.value,{componentStack:e.stack})}catch(r){setTimeout(function(){throw r})}}function w0(t,e,n){try{var r=t.onCaughtError;r(n.value,{componentStack:n.stack,errorBoundary:e.tag===1?e.stateNode:null})}catch(o){setTimeout(function(){throw o})}}function dm(t,e,n){return n=Qr(n),n.tag=3,n.payload={element:null},n.callback=function(){kc(t,e)},n}function Hv(t){return t=Qr(t),t.tag=3,t}function Uv(t,e,n,r){var o=n.type.getDerivedStateFromError;if(typeof o=="function"){var a=r.value;t.payload=function(){return o(a)},t.callback=function(){w0(e,n,r)}}var i=n.stateNode;i!==null&&typeof i.componentDidCatch=="function"&&(t.callback=function(){w0(e,n,r),typeof o!="function"&&(Yr===null?Yr=new Set([this]):Yr.add(this));var l=r.stack;this.componentDidCatch(r.value,{componentStack:l!==null?l:""})})}function ZB(t,e,n,r,o){if(n.flags|=32768,r!==null&&typeof r=="object"&&typeof r.then=="function"){if(e=n.alternate,e!==null&&xi(e,n,o,!0),n=jt.current,n!==null){switch(n.tag){case 31:case 13:return ln===null?Bc():n.alternate===null&&Me===0&&(Me=3),n.flags&=-257,n.flags|=65536,n.lanes=o,r===bc?n.flags|=16384:(e=n.updateQueue,e===null?n.updateQueue=new Set([r]):e.add(r),Dp(t,r,o)),!1;case 22:return n.flags|=65536,r===bc?n.flags|=16384:(e=n.updateQueue,e===null?(e={transitions:null,markerInstances:null,retryQueue:new Set([r])},n.updateQueue=e):(n=e.retryQueue,n===null?e.retryQueue=new Set([r]):n.add(r)),Dp(t,r,o)),!1}throw Error(A(435,n.tag))}return Dp(t,r,o),Bc(),!1}if(Z)return e=jt.current,e!==null?((e.flags&65536)===0&&(e.flags|=256),e.flags|=65536,e.lanes=o,r!==$p&&(t=Error(A(422),{cause:r}),Ql(on(t,n)))):(r!==$p&&(e=Error(A(423),{cause:r}),Ql(on(e,n))),t=t.current.alternate,t.flags|=65536,o&=-o,t.lanes|=o,r=on(r,n),o=dm(t.stateNode,r,o),gp(t,o),Me!==4&&(Me=2)),!1;var a=Error(A(520),{cause:r});if(a=on(a,n),zl===null?zl=[a]:zl.push(a),Me!==4&&(Me=2),e===null)return!0;r=on(r,n),n=e;do{switch(n.tag){case 3:return n.flags|=65536,t=o&-o,n.lanes|=t,t=dm(n.stateNode,r,t),gp(n,t),!1;case 1:if(e=n.type,a=n.stateNode,(n.flags&128)===0&&(typeof e.getDerivedStateFromError=="function"||a!==null&&typeof a.componentDidCatch=="function"&&(Yr===null||!Yr.has(a))))return n.flags|=65536,o&=-o,n.lanes|=o,o=Hv(o),Uv(o,t,n,r),gp(n,o),!1}n=n.return}while(n!==null);return!1}var dh=Error(A(461)),ze=!1;function $e(t,e,n,r){e.child=t===null?nv(e,null,n,r):Ho(e,t.child,n,r)}function S0(t,e,n,r,o){n=n.render;var a=e.ref;if("ref"in r){var i={};for(var l in r)l!=="ref"&&(i[l]=r[l])}else i=r;return zo(e),r=eh(t,e,n,i,a,o),l=th(),t!==null&&!ze?(nh(t,e,o),yr(t,e,o)):(Z&&l&&Wm(e),e.flags|=1,$e(t,e,r,o),e.child)}function k0(t,e,n,r,o){if(t===null){var a=n.type;return typeof a=="function"&&!Gm(a)&&a.defaultProps===void 0&&n.compare===null?(e.tag=15,e.type=a,jv(t,e,a,r,o)):(t=$f(n.type,null,r,e,e.mode,o),t.ref=e.ref,t.return=e,e.child=t)}if(a=t.child,!ph(t,o)){var i=a.memoizedProps;if(n=n.compare,n=n!==null?n:Wl,n(i,r)&&t.ref===e.ref)return yr(t,e,o)}return e.flags|=1,t=dr(a,r),t.ref=e.ref,t.return=e,e.child=t}function jv(t,e,n,r,o){if(t!==null){var a=t.memoizedProps;if(Wl(a,r)&&t.ref===e.ref)if(ze=!1,e.pendingProps=r=a,ph(t,o))(t.flags&131072)!==0&&(ze=!0);else return e.lanes=t.lanes,yr(t,e,o)}return pm(t,e,n,r,o)}function Vv(t,e,n,r){var o=r.children,a=t!==null?t.memoizedState:null;if(t===null&&e.stateNode===null&&(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),r.mode==="hidden"){if((e.flags&128)!==0){if(a=a!==null?a.baseLanes|n:n,t!==null){for(r=e.child=t.child,o=0;r!==null;)o=o|r.lanes|r.childLanes,r=r.sibling;r=o&~a}else r=0,e.child=null;return C0(t,e,a,n,r)}if((n&536870912)!==0)e.memoizedState={baseLanes:0,cachePool:null},t!==null&&ec(e,a!==null?a.cachePool:null),a!==null?p0(e,a):im(),av(e);else return r=e.lanes=536870912,C0(t,e,a!==null?a.baseLanes|n:n,n,r)}else a!==null?(ec(e,a.cachePool),p0(e,a),Pr(e),e.memoizedState=null):(t!==null&&ec(e,null),im(),Pr(e));return $e(t,e,o,n),e.child}function Ol(t,e){return t!==null&&t.tag===22||e.stateNode!==null||(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),e.sibling}function C0(t,e,n,r,o){var a=Km();return a=a===null?null:{parent:Pe._currentValue,pool:a},e.memoizedState={baseLanes:n,cachePool:a},t!==null&&ec(e,null),im(),av(e),t!==null&&xi(t,e,r,!0),e.childLanes=o,null}function rc(t,e){return e=Cc({mode:e.mode,children:e.children},t.mode),e.ref=t.ref,t.child=e,e.return=t,e}function A0(t,e,n){return Ho(e,t.child,null,n),t=rc(e,e.pendingProps),t.flags|=2,Lt(e),e.memoizedState=null,t}function $B(t,e,n){var r=e.pendingProps,o=(e.flags&128)!==0;if(e.flags&=-129,t===null){if(Z){if(r.mode==="hidden")return t=rc(e,r),e.lanes=536870912,Ol(null,t);if(lm(e),(t=ve)?(t=N1(t,an),t=t!==null&&t.data==="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:to!==null?{id:Pn,overflow:zn}:null,retryLane:536870912,hydrationErrors:null},n=KI(t),n.return=e,e.child=n,tt=e,ve=null)):t=null,t===null)throw no(e);return e.lanes=536870912,null}return rc(e,r)}var a=t.memoizedState;if(a!==null){var i=a.dehydrated;if(lm(e),o)if(e.flags&256)e.flags&=-257,e=A0(t,e,n);else if(e.memoizedState!==null)e.child=t.child,e.flags|=128,e=null;else throw Error(A(558));else if(ze||xi(t,e,n,!1),o=(n&t.childLanes)!==0,ze||o){if(r=ue,r!==null&&(i=vI(r,n),i!==0&&i!==a.retryLane))throw a.retryLane=i,Xo(t,i),Ct(r,t,i),dh;Bc(),e=A0(t,e,n)}else t=a.treeContext,ve=sn(i.nextSibling),tt=e,Z=!0,Xr=null,an=!1,t!==null&&JI(e,t),e=rc(e,r),e.flags|=4096;return e}return t=dr(t.child,{mode:r.mode,children:r.children}),t.ref=e.ref,e.child=t,t.return=e,t}function oc(t,e){var n=e.ref;if(n===null)t!==null&&t.ref!==null&&(e.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error(A(284));(t===null||t.ref!==n)&&(e.flags|=4194816)}}function pm(t,e,n,r,o){return zo(e),n=eh(t,e,n,r,void 0,o),r=th(),t!==null&&!ze?(nh(t,e,o),yr(t,e,o)):(Z&&r&&Wm(e),e.flags|=1,$e(t,e,n,o),e.child)}function T0(t,e,n,r,o,a){return zo(e),e.updateQueue=null,n=lv(e,r,n,o),iv(t),r=th(),t!==null&&!ze?(nh(t,e,a),yr(t,e,a)):(Z&&r&&Wm(e),e.flags|=1,$e(t,e,n,a),e.child)}function O0(t,e,n,r,o){if(zo(e),e.stateNode===null){var a=Wa,i=n.contextType;typeof i=="object"&&i!==null&&(a=nt(i)),a=new n(r,a),e.memoizedState=a.state!==null&&a.state!==void 0?a.state:null,a.updater=um,e.stateNode=a,a._reactInternals=e,a=e.stateNode,a.props=r,a.state=e.memoizedState,a.refs={},Jm(e),i=n.contextType,a.context=typeof i=="object"&&i!==null?nt(i):Wa,a.state=e.memoizedState,i=n.getDerivedStateFromProps,typeof i=="function"&&(bp(e,n,i,r),a.state=e.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof a.getSnapshotBeforeUpdate=="function"||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(i=a.state,typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount(),i!==a.state&&um.enqueueReplaceState(a,a.state,null),Nl(e,r,a,o),Ll(),a.state=e.memoizedState),typeof a.componentDidMount=="function"&&(e.flags|=4194308),r=!0}else if(t===null){a=e.stateNode;var l=e.memoizedProps,s=jo(n,l);a.props=s;var f=a.context,c=n.contextType;i=Wa,typeof c=="object"&&c!==null&&(i=nt(c));var u=n.getDerivedStateFromProps;c=typeof u=="function"||typeof a.getSnapshotBeforeUpdate=="function",l=e.pendingProps!==l,c||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(l||f!==i)&&v0(e,a,r,i),Nr=!1;var d=e.memoizedState;a.state=d,Nl(e,r,a,o),Ll(),f=e.memoizedState,l||d!==f||Nr?(typeof u=="function"&&(bp(e,n,u,r),f=e.memoizedState),(s=Nr||I0(e,n,s,r,d,f,i))?(c||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount=="function"&&(e.flags|=4194308)):(typeof a.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=r,e.memoizedState=f),a.props=r,a.state=f,a.context=i,r=s):(typeof a.componentDidMount=="function"&&(e.flags|=4194308),r=!1)}else{a=e.stateNode,om(t,e),i=e.memoizedProps,c=jo(n,i),a.props=c,u=e.pendingProps,d=a.context,f=n.contextType,s=Wa,typeof f=="object"&&f!==null&&(s=nt(f)),l=n.getDerivedStateFromProps,(f=typeof l=="function"||typeof a.getSnapshotBeforeUpdate=="function")||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(i!==u||d!==s)&&v0(e,a,r,s),Nr=!1,d=e.memoizedState,a.state=d,Nl(e,r,a,o),Ll();var p=e.memoizedState;i!==u||d!==p||Nr||t!==null&&t.dependencies!==null&&yc(t.dependencies)?(typeof l=="function"&&(bp(e,n,l,r),p=e.memoizedState),(c=Nr||I0(e,n,c,r,d,p,s)||t!==null&&t.dependencies!==null&&yc(t.dependencies))?(f||typeof a.UNSAFE_componentWillUpdate!="function"&&typeof a.componentWillUpdate!="function"||(typeof a.componentWillUpdate=="function"&&a.componentWillUpdate(r,p,s),typeof a.UNSAFE_componentWillUpdate=="function"&&a.UNSAFE_componentWillUpdate(r,p,s)),typeof a.componentDidUpdate=="function"&&(e.flags|=4),typeof a.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof a.componentDidUpdate!="function"||i===t.memoizedProps&&d===t.memoizedState||(e.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||i===t.memoizedProps&&d===t.memoizedState||(e.flags|=1024),e.memoizedProps=r,e.memoizedState=p),a.props=r,a.state=p,a.context=s,r=c):(typeof a.componentDidUpdate!="function"||i===t.memoizedProps&&d===t.memoizedState||(e.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||i===t.memoizedProps&&d===t.memoizedState||(e.flags|=1024),r=!1)}return a=r,oc(t,e),r=(e.flags&128)!==0,a||r?(a=e.stateNode,n=r&&typeof n.getDerivedStateFromError!="function"?null:a.render(),e.flags|=1,t!==null&&r?(e.child=Ho(e,t.child,null,o),e.child=Ho(e,null,n,o)):$e(t,e,n,o),e.memoizedState=a.state,t=e.child):t=yr(t,e,o),t}function B0(t,e,n,r){return Po(),e.flags|=256,$e(t,e,n,r),e.child}var Ip={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function vp(t){return{baseLanes:t,cachePool:$I()}}function wp(t,e,n){return t=t!==null?t.childLanes&~n:0,e&&(t|=_t),t}function Gv(t,e,n){var r=e.pendingProps,o=!1,a=(e.flags&128)!==0,i;if((i=a)||(i=t!==null&&t.memoizedState===null?!1:(Ee.current&2)!==0),i&&(o=!0,e.flags&=-129),i=(e.flags&32)!==0,e.flags&=-33,t===null){if(Z){if(o?qr(e):Pr(e),(t=ve)?(t=N1(t,an),t=t!==null&&t.data!=="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:to!==null?{id:Pn,overflow:zn}:null,retryLane:536870912,hydrationErrors:null},n=KI(t),n.return=e,e.child=n,tt=e,ve=null)):t=null,t===null)throw no(e);return Tm(t)?e.lanes=32:e.lanes=536870912,null}var l=r.children;return r=r.fallback,o?(Pr(e),o=e.mode,l=Cc({mode:"hidden",children:l},o),r=Lo(r,o,n,null),l.return=e,r.return=e,l.sibling=r,e.child=l,r=e.child,r.memoizedState=vp(n),r.childLanes=wp(t,i,n),e.memoizedState=Ip,Ol(null,r)):(qr(e),mm(e,l))}var s=t.memoizedState;if(s!==null&&(l=s.dehydrated,l!==null)){if(a)e.flags&256?(qr(e),e.flags&=-257,e=Sp(t,e,n)):e.memoizedState!==null?(Pr(e),e.child=t.child,e.flags|=128,e=null):(Pr(e),l=r.fallback,o=e.mode,r=Cc({mode:"visible",children:r.children},o),l=Lo(l,o,n,null),l.flags|=2,r.return=e,l.return=e,r.sibling=l,e.child=r,Ho(e,t.child,null,n),r=e.child,r.memoizedState=vp(n),r.childLanes=wp(t,i,n),e.memoizedState=Ip,e=Ol(null,r));else if(qr(e),Tm(l)){if(i=l.nextSibling&&l.nextSibling.dataset,i)var f=i.dgst;i=f,r=Error(A(419)),r.stack="",r.digest=i,Ql({value:r,source:null,stack:null}),e=Sp(t,e,n)}else if(ze||xi(t,e,n,!1),i=(n&t.childLanes)!==0,ze||i){if(i=ue,i!==null&&(r=vI(i,n),r!==0&&r!==s.retryLane))throw s.retryLane=r,Xo(t,r),Ct(i,t,r),dh;Am(l)||Bc(),e=Sp(t,e,n)}else Am(l)?(e.flags|=192,e.child=t.child,e=null):(t=s.treeContext,ve=sn(l.nextSibling),tt=e,Z=!0,Xr=null,an=!1,t!==null&&JI(e,t),e=mm(e,r.children),e.flags|=4096);return e}return o?(Pr(e),l=r.fallback,o=e.mode,s=t.child,f=s.sibling,r=dr(s,{mode:"hidden",children:r.children}),r.subtreeFlags=s.subtreeFlags&65011712,f!==null?l=dr(f,l):(l=Lo(l,o,n,null),l.flags|=2),l.return=e,r.return=e,r.sibling=l,e.child=r,Ol(null,r),r=e.child,l=t.child.memoizedState,l===null?l=vp(n):(o=l.cachePool,o!==null?(s=Pe._currentValue,o=o.parent!==s?{parent:s,pool:s}:o):o=$I(),l={baseLanes:l.baseLanes|n,cachePool:o}),r.memoizedState=l,r.childLanes=wp(t,i,n),e.memoizedState=Ip,Ol(t.child,r)):(qr(e),n=t.child,t=n.sibling,n=dr(n,{mode:"visible",children:r.children}),n.return=e,n.sibling=null,t!==null&&(i=e.deletions,i===null?(e.deletions=[t],e.flags|=16):i.push(t)),e.child=n,e.memoizedState=null,n)}function mm(t,e){return e=Cc({mode:"visible",children:e},t.mode),e.return=t,t.child=e}function Cc(t,e){return t=Nt(22,t,null,e),t.lanes=0,t}function Sp(t,e,n){return Ho(e,t.child,null,n),t=mm(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function D0(t,e,n){t.lanes|=e;var r=t.alternate;r!==null&&(r.lanes|=e),tm(t.return,e,n)}function kp(t,e,n,r,o,a){var i=t.memoizedState;i===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:o,treeForkCount:a}:(i.isBackwards=e,i.rendering=null,i.renderingStartTime=0,i.last=r,i.tail=n,i.tailMode=o,i.treeForkCount=a)}function Wv(t,e,n){var r=e.pendingProps,o=r.revealOrder,a=r.tail;r=r.children;var i=Ee.current,l=(i&2)!==0;if(l?(i=i&1|2,e.flags|=128):i&=1,he(Ee,i),$e(t,e,r,n),r=Z?Xl:0,!l&&t!==null&&(t.flags&128)!==0)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&D0(t,n,e);else if(t.tag===19)D0(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}switch(o){case"forwards":for(n=e.child,o=null;n!==null;)t=n.alternate,t!==null&&vc(t)===null&&(o=n),n=n.sibling;n=o,n===null?(o=e.child,e.child=null):(o=n.sibling,n.sibling=null),kp(e,!1,o,n,a,r);break;case"backwards":case"unstable_legacy-backwards":for(n=null,o=e.child,e.child=null;o!==null;){if(t=o.alternate,t!==null&&vc(t)===null){e.child=o;break}t=o.sibling,o.sibling=n,n=o,o=t}kp(e,!0,n,null,a,r);break;case"together":kp(e,!1,null,null,void 0,r);break;default:e.memoizedState=null}return e.child}function yr(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),oo|=e.lanes,(n&e.childLanes)===0)if(t!==null){if(xi(t,e,n,!1),(n&e.childLanes)===0)return null}else return null;if(t!==null&&e.child!==t.child)throw Error(A(153));if(e.child!==null){for(t=e.child,n=dr(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=dr(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function ph(t,e){return(t.lanes&e)!==0?!0:(t=t.dependencies,!!(t!==null&&yc(t)))}function eD(t,e,n){switch(e.tag){case 3:uc(e,e.stateNode.containerInfo),_r(e,Pe,t.memoizedState.cache),Po();break;case 27:case 5:Up(e);break;case 4:uc(e,e.stateNode.containerInfo);break;case 10:_r(e,e.type,e.memoizedProps.value);break;case 31:if(e.memoizedState!==null)return e.flags|=128,lm(e),null;break;case 13:var r=e.memoizedState;if(r!==null)return r.dehydrated!==null?(qr(e),e.flags|=128,null):(n&e.child.childLanes)!==0?Gv(t,e,n):(qr(e),t=yr(t,e,n),t!==null?t.sibling:null);qr(e);break;case 19:var o=(t.flags&128)!==0;if(r=(n&e.childLanes)!==0,r||(xi(t,e,n,!1),r=(n&e.childLanes)!==0),o){if(r)return Wv(t,e,n);e.flags|=128}if(o=e.memoizedState,o!==null&&(o.rendering=null,o.tail=null,o.lastEffect=null),he(Ee,Ee.current),r)break;return null;case 22:return e.lanes=0,Vv(t,e,n,e.pendingProps);case 24:_r(e,Pe,t.memoizedState.cache)}return yr(t,e,n)}function Xv(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps)ze=!0;else{if(!ph(t,n)&&(e.flags&128)===0)return ze=!1,eD(t,e,n);ze=(t.flags&131072)!==0}else ze=!1,Z&&(e.flags&1048576)!==0&&YI(e,Xl,e.index);switch(e.lanes=0,e.tag){case 16:e:{var r=e.pendingProps;if(t=Ro(e.elementType),e.type=t,typeof t=="function")Gm(t)?(r=jo(t,r),e.tag=1,e=O0(null,e,t,r,n)):(e.tag=0,e=pm(null,e,t,r,n));else{if(t!=null){var o=t.$$typeof;if(o===Mm){e.tag=11,e=S0(null,e,t,r,n);break e}else if(o===Rm){e.tag=14,e=k0(null,e,t,r,n);break e}}throw e=zp(t)||t,Error(A(306,e,""))}}return e;case 0:return pm(t,e,e.type,e.pendingProps,n);case 1:return r=e.type,o=jo(r,e.pendingProps),O0(t,e,r,o,n);case 3:e:{if(uc(e,e.stateNode.containerInfo),t===null)throw Error(A(387));r=e.pendingProps;var a=e.memoizedState;o=a.element,om(t,e),Nl(e,r,null,n);var i=e.memoizedState;if(r=i.cache,_r(e,Pe,r),r!==a.cache&&nm(e,[Pe],n,!0),Ll(),r=i.element,a.isDehydrated)if(a={element:r,isDehydrated:!1,cache:i.cache},e.updateQueue.baseState=a,e.memoizedState=a,e.flags&256){e=B0(t,e,r,n);break e}else if(r!==o){o=on(Error(A(424)),e),Ql(o),e=B0(t,e,r,n);break e}else for(t=e.stateNode.containerInfo,t.nodeType===9?t=t.body:t=t.nodeName==="HTML"?t.ownerDocument.body:t,ve=sn(t.firstChild),tt=e,Z=!0,Xr=null,an=!0,n=nv(e,null,r,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(Po(),r===o){e=yr(t,e,n);break e}$e(t,e,r,n)}e=e.child}return e;case 26:return oc(t,e),t===null?(n=Z0(e.type,null,e.pendingProps,null))?e.memoizedState=n:Z||(n=e.type,t=e.pendingProps,r=Ec(Wr.current).createElement(n),r[et]=e,r[At]=t,rt(r,n,t),We(r),e.stateNode=r):e.memoizedState=Z0(e.type,t.memoizedProps,e.pendingProps,t.memoizedState),null;case 27:return Up(e),t===null&&Z&&(r=e.stateNode=_1(e.type,e.pendingProps,Wr.current),tt=e,an=!0,o=ve,io(e.type)?(Om=o,ve=sn(r.firstChild)):ve=o),$e(t,e,e.pendingProps.children,n),oc(t,e),t===null&&(e.flags|=4194304),e.child;case 5:return t===null&&Z&&((o=r=ve)&&(r=OD(r,e.type,e.pendingProps,an),r!==null?(e.stateNode=r,tt=e,ve=sn(r.firstChild),an=!1,o=!0):o=!1),o||no(e)),Up(e),o=e.type,a=e.pendingProps,i=t!==null?t.memoizedProps:null,r=a.children,km(o,a)?r=null:i!==null&&km(o,i)&&(e.flags|=32),e.memoizedState!==null&&(o=eh(t,e,GB,null,null,n),es._currentValue=o),oc(t,e),$e(t,e,r,n),e.child;case 6:return t===null&&Z&&((t=n=ve)&&(n=BD(n,e.pendingProps,an),n!==null?(e.stateNode=n,tt=e,ve=null,t=!0):t=!1),t||no(e)),null;case 13:return Gv(t,e,n);case 4:return uc(e,e.stateNode.containerInfo),r=e.pendingProps,t===null?e.child=Ho(e,null,r,n):$e(t,e,r,n),e.child;case 11:return S0(t,e,e.type,e.pendingProps,n);case 7:return $e(t,e,e.pendingProps,n),e.child;case 8:return $e(t,e,e.pendingProps.children,n),e.child;case 12:return $e(t,e,e.pendingProps.children,n),e.child;case 10:return r=e.pendingProps,_r(e,e.type,r.value),$e(t,e,r.children,n),e.child;case 9:return o=e.type._context,r=e.pendingProps.children,zo(e),o=nt(o),r=r(o),e.flags|=1,$e(t,e,r,n),e.child;case 14:return k0(t,e,e.type,e.pendingProps,n);case 15:return jv(t,e,e.type,e.pendingProps,n);case 19:return Wv(t,e,n);case 31:return $B(t,e,n);case 22:return Vv(t,e,n,e.pendingProps);case 24:return zo(e),r=nt(Pe),t===null?(o=Km(),o===null&&(o=ue,a=Qm(),o.pooledCache=a,a.refCount++,a!==null&&(o.pooledCacheLanes|=n),o=a),e.memoizedState={parent:r,cache:o},Jm(e),_r(e,Pe,o)):((t.lanes&n)!==0&&(om(t,e),Nl(e,null,null,n),Ll()),o=t.memoizedState,a=e.memoizedState,o.parent!==r?(o={parent:r,cache:r},e.memoizedState=o,e.lanes===0&&(e.memoizedState=e.updateQueue.baseState=o),_r(e,Pe,r)):(r=a.cache,_r(e,Pe,r),r!==o.cache&&nm(e,[Pe],n,!0))),$e(t,e,e.pendingProps.children,n),e.child;case 29:throw e.pendingProps}throw Error(A(156,e.tag))}function rr(t){t.flags|=4}function Cp(t,e,n,r,o){if((e=(t.mode&32)!==0)&&(e=!1),e){if(t.flags|=16777216,(o&335544128)===o)if(t.stateNode.complete)t.flags|=8192;else if(g1())t.flags|=8192;else throw _o=bc,Ym}else t.flags&=-16777217}function M0(t,e){if(e.type!=="stylesheet"||(e.state.loading&4)!==0)t.flags&=-16777217;else if(t.flags|=16777216,!z1(e))if(g1())t.flags|=8192;else throw _o=bc,Ym}function Uf(t,e){e!==null&&(t.flags|=4),t.flags&16384&&(e=t.tag!==22?yI():536870912,t.lanes|=e,fi|=e)}function vl(t,e){if(!Z)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:r.sibling=null}}function Ie(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,r=0;if(e)for(var o=t.child;o!==null;)n|=o.lanes|o.childLanes,r|=o.subtreeFlags&65011712,r|=o.flags&65011712,o.return=t,o=o.sibling;else for(o=t.child;o!==null;)n|=o.lanes|o.childLanes,r|=o.subtreeFlags,r|=o.flags,o.return=t,o=o.sibling;return t.subtreeFlags|=r,t.childLanes=n,e}function tD(t,e,n){var r=e.pendingProps;switch(Xm(e),e.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Ie(e),null;case 1:return Ie(e),null;case 3:return n=e.stateNode,r=null,t!==null&&(r=t.memoizedState.cache),e.memoizedState.cache!==r&&(e.flags|=2048),pr(Pe),ri(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(t===null||t.child===null)&&(Fa(e)?rr(e):t===null||t.memoizedState.isDehydrated&&(e.flags&256)===0||(e.flags|=1024,xp())),Ie(e),null;case 26:var o=e.type,a=e.memoizedState;return t===null?(rr(e),a!==null?(Ie(e),M0(e,a)):(Ie(e),Cp(e,o,null,r,n))):a?a!==t.memoizedState?(rr(e),Ie(e),M0(e,a)):(Ie(e),e.flags&=-16777217):(t=t.memoizedProps,t!==r&&rr(e),Ie(e),Cp(e,o,t,r,n)),null;case 27:if(dc(e),n=Wr.current,o=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==r&&rr(e);else{if(!r){if(e.stateNode===null)throw Error(A(166));return Ie(e),null}t=Un.current,Fa(e)?i0(e,t):(t=_1(o,r,n),e.stateNode=t,rr(e))}return Ie(e),null;case 5:if(dc(e),o=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==r&&rr(e);else{if(!r){if(e.stateNode===null)throw Error(A(166));return Ie(e),null}if(a=Un.current,Fa(e))i0(e,a);else{var i=Ec(Wr.current);switch(a){case 1:a=i.createElementNS("http://www.w3.org/2000/svg",o);break;case 2:a=i.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;default:switch(o){case"svg":a=i.createElementNS("http://www.w3.org/2000/svg",o);break;case"math":a=i.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;case"script":a=i.createElement("div"),a.innerHTML="<script><\/script>",a=a.removeChild(a.firstChild);break;case"select":a=typeof r.is=="string"?i.createElement("select",{is:r.is}):i.createElement("select"),r.multiple?a.multiple=!0:r.size&&(a.size=r.size);break;default:a=typeof r.is=="string"?i.createElement(o,{is:r.is}):i.createElement(o)}}a[et]=e,a[At]=r;e:for(i=e.child;i!==null;){if(i.tag===5||i.tag===6)a.appendChild(i.stateNode);else if(i.tag!==4&&i.tag!==27&&i.child!==null){i.child.return=i,i=i.child;continue}if(i===e)break e;for(;i.sibling===null;){if(i.return===null||i.return===e)break e;i=i.return}i.sibling.return=i.return,i=i.sibling}e.stateNode=a;e:switch(rt(a,o,r),o){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}r&&rr(e)}}return Ie(e),Cp(e,e.type,t===null?null:t.memoizedProps,e.pendingProps,n),null;case 6:if(t&&e.stateNode!=null)t.memoizedProps!==r&&rr(e);else{if(typeof r!="string"&&e.stateNode===null)throw Error(A(166));if(t=Wr.current,Fa(e)){if(t=e.stateNode,n=e.memoizedProps,r=null,o=tt,o!==null)switch(o.tag){case 27:case 5:r=o.memoizedProps}t[et]=e,t=!!(t.nodeValue===n||r!==null&&r.suppressHydrationWarning===!0||E1(t.nodeValue,n)),t||no(e,!0)}else t=Ec(t).createTextNode(r),t[et]=e,e.stateNode=t}return Ie(e),null;case 31:if(n=e.memoizedState,t===null||t.memoizedState!==null){if(r=Fa(e),n!==null){if(t===null){if(!r)throw Error(A(318));if(t=e.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(A(557));t[et]=e}else Po(),(e.flags&128)===0&&(e.memoizedState=null),e.flags|=4;Ie(e),t=!1}else n=xp(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=n),t=!0;if(!t)return e.flags&256?(Lt(e),e):(Lt(e),null);if((e.flags&128)!==0)throw Error(A(558))}return Ie(e),null;case 13:if(r=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(o=Fa(e),r!==null&&r.dehydrated!==null){if(t===null){if(!o)throw Error(A(318));if(o=e.memoizedState,o=o!==null?o.dehydrated:null,!o)throw Error(A(317));o[et]=e}else Po(),(e.flags&128)===0&&(e.memoizedState=null),e.flags|=4;Ie(e),o=!1}else o=xp(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=o),o=!0;if(!o)return e.flags&256?(Lt(e),e):(Lt(e),null)}return Lt(e),(e.flags&128)!==0?(e.lanes=n,e):(n=r!==null,t=t!==null&&t.memoizedState!==null,n&&(r=e.child,o=null,r.alternate!==null&&r.alternate.memoizedState!==null&&r.alternate.memoizedState.cachePool!==null&&(o=r.alternate.memoizedState.cachePool.pool),a=null,r.memoizedState!==null&&r.memoizedState.cachePool!==null&&(a=r.memoizedState.cachePool.pool),a!==o&&(r.flags|=2048)),n!==t&&n&&(e.child.flags|=8192),Uf(e,e.updateQueue),Ie(e),null);case 4:return ri(),t===null&&Ih(e.stateNode.containerInfo),Ie(e),null;case 10:return pr(e.type),Ie(e),null;case 19:if(Xe(Ee),r=e.memoizedState,r===null)return Ie(e),null;if(o=(e.flags&128)!==0,a=r.rendering,a===null)if(o)vl(r,!1);else{if(Me!==0||t!==null&&(t.flags&128)!==0)for(t=e.child;t!==null;){if(a=vc(t),a!==null){for(e.flags|=128,vl(r,!1),t=a.updateQueue,e.updateQueue=t,Uf(e,t),e.subtreeFlags=0,t=n,n=e.child;n!==null;)QI(n,t),n=n.sibling;return he(Ee,Ee.current&1|2),Z&&lr(e,r.treeForkCount),e.child}t=t.sibling}r.tail!==null&&qt()>Tc&&(e.flags|=128,o=!0,vl(r,!1),e.lanes=4194304)}else{if(!o)if(t=vc(a),t!==null){if(e.flags|=128,o=!0,t=t.updateQueue,e.updateQueue=t,Uf(e,t),vl(r,!0),r.tail===null&&r.tailMode==="hidden"&&!a.alternate&&!Z)return Ie(e),null}else 2*qt()-r.renderingStartTime>Tc&&n!==536870912&&(e.flags|=128,o=!0,vl(r,!1),e.lanes=4194304);r.isBackwards?(a.sibling=e.child,e.child=a):(t=r.last,t!==null?t.sibling=a:e.child=a,r.last=a)}return r.tail!==null?(t=r.tail,r.rendering=t,r.tail=t.sibling,r.renderingStartTime=qt(),t.sibling=null,n=Ee.current,he(Ee,o?n&1|2:n&1),Z&&lr(e,r.treeForkCount),t):(Ie(e),null);case 22:case 23:return Lt(e),Zm(),r=e.memoizedState!==null,t!==null?t.memoizedState!==null!==r&&(e.flags|=8192):r&&(e.flags|=8192),r?(n&536870912)!==0&&(e.flags&128)===0&&(Ie(e),e.subtreeFlags&6&&(e.flags|=8192)):Ie(e),n=e.updateQueue,n!==null&&Uf(e,n.retryQueue),n=null,t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),r=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(r=e.memoizedState.cachePool.pool),r!==n&&(e.flags|=2048),t!==null&&Xe(No),null;case 24:return n=null,t!==null&&(n=t.memoizedState.cache),e.memoizedState.cache!==n&&(e.flags|=2048),pr(Pe),Ie(e),null;case 25:return null;case 30:return null}throw Error(A(156,e.tag))}function nD(t,e){switch(Xm(e),e.tag){case 1:return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return pr(Pe),ri(),t=e.flags,(t&65536)!==0&&(t&128)===0?(e.flags=t&-65537|128,e):null;case 26:case 27:case 5:return dc(e),null;case 31:if(e.memoizedState!==null){if(Lt(e),e.alternate===null)throw Error(A(340));Po()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 13:if(Lt(e),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(A(340));Po()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return Xe(Ee),null;case 4:return ri(),null;case 10:return pr(e.type),null;case 22:case 23:return Lt(e),Zm(),t!==null&&Xe(No),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 24:return pr(Pe),null;case 25:return null;default:return null}}function Qv(t,e){switch(Xm(e),e.tag){case 3:pr(Pe),ri();break;case 26:case 27:case 5:dc(e);break;case 4:ri();break;case 31:e.memoizedState!==null&&Lt(e);break;case 13:Lt(e);break;case 19:Xe(Ee);break;case 10:pr(e.type);break;case 22:case 23:Lt(e),Zm(),t!==null&&Xe(No);break;case 24:pr(Pe)}}function us(t,e){try{var n=e.updateQueue,r=n!==null?n.lastEffect:null;if(r!==null){var o=r.next;n=o;do{if((n.tag&t)===t){r=void 0;var a=n.create,i=n.inst;r=a(),i.destroy=r}n=n.next}while(n!==o)}}catch(l){ie(e,e.return,l)}}function ro(t,e,n){try{var r=e.updateQueue,o=r!==null?r.lastEffect:null;if(o!==null){var a=o.next;r=a;do{if((r.tag&t)===t){var i=r.inst,l=i.destroy;if(l!==void 0){i.destroy=void 0,o=e;var s=n,f=l;try{f()}catch(c){ie(o,s,c)}}}r=r.next}while(r!==a)}}catch(c){ie(e,e.return,c)}}function Kv(t){var e=t.updateQueue;if(e!==null){var n=t.stateNode;try{ov(e,n)}catch(r){ie(t,t.return,r)}}}function Yv(t,e,n){n.props=jo(t.type,t.memoizedProps),n.state=t.memoizedState;try{n.componentWillUnmount()}catch(r){ie(t,e,r)}}function ql(t,e){try{var n=t.ref;if(n!==null){switch(t.tag){case 26:case 27:case 5:var r=t.stateNode;break;case 30:r=t.stateNode;break;default:r=t.stateNode}typeof n=="function"?t.refCleanup=n(r):n.current=r}}catch(o){ie(t,e,o)}}function Hn(t,e){var n=t.ref,r=t.refCleanup;if(n!==null)if(typeof r=="function")try{r()}catch(o){ie(t,e,o)}finally{t.refCleanup=null,t=t.alternate,t!=null&&(t.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(o){ie(t,e,o)}else n.current=null}function Jv(t){var e=t.type,n=t.memoizedProps,r=t.stateNode;try{e:switch(e){case"button":case"input":case"select":case"textarea":n.autoFocus&&r.focus();break e;case"img":n.src?r.src=n.src:n.srcSet&&(r.srcset=n.srcSet)}}catch(o){ie(t,t.return,o)}}function Ap(t,e,n){try{var r=t.stateNode;wD(r,t.type,n,e),r[At]=e}catch(o){ie(t,t.return,o)}}function Zv(t){return t.tag===5||t.tag===3||t.tag===26||t.tag===27&&io(t.type)||t.tag===4}function Tp(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||Zv(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.tag===27&&io(t.type)||t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function hm(t,e,n){var r=t.tag;if(r===5||r===6)t=t.stateNode,e?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(t,e):(e=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,e.appendChild(t),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=cr));else if(r!==4&&(r===27&&io(t.type)&&(n=t.stateNode,e=null),t=t.child,t!==null))for(hm(t,e,n),t=t.sibling;t!==null;)hm(t,e,n),t=t.sibling}function Ac(t,e,n){var r=t.tag;if(r===5||r===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(r!==4&&(r===27&&io(t.type)&&(n=t.stateNode),t=t.child,t!==null))for(Ac(t,e,n),t=t.sibling;t!==null;)Ac(t,e,n),t=t.sibling}function $v(t){var e=t.stateNode,n=t.memoizedProps;try{for(var r=t.type,o=e.attributes;o.length;)e.removeAttributeNode(o[0]);rt(e,r,n),e[et]=t,e[At]=n}catch(a){ie(t,t.return,a)}}var sr=!1,qe=!1,Op=!1,R0=typeof WeakSet=="function"?WeakSet:Set,Ge=null;function rD(t,e){if(t=t.containerInfo,wm=_c,t=zI(t),Um(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var o=r.anchorOffset,a=r.focusNode;r=r.focusOffset;try{n.nodeType,a.nodeType}catch{n=null;break e}var i=0,l=-1,s=-1,f=0,c=0,u=t,d=null;t:for(;;){for(var p;u!==n||o!==0&&u.nodeType!==3||(l=i+o),u!==a||r!==0&&u.nodeType!==3||(s=i+r),u.nodeType===3&&(i+=u.nodeValue.length),(p=u.firstChild)!==null;)d=u,u=p;for(;;){if(u===t)break t;if(d===n&&++f===o&&(l=i),d===a&&++c===r&&(s=i),(p=u.nextSibling)!==null)break;u=d,d=u.parentNode}u=p}n=l===-1||s===-1?null:{start:l,end:s}}else n=null}n=n||{start:0,end:0}}else n=null;for(Sm={focusedElem:t,selectionRange:n},_c=!1,Ge=e;Ge!==null;)if(e=Ge,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,Ge=t;else for(;Ge!==null;){switch(e=Ge,a=e.alternate,t=e.flags,e.tag){case 0:if((t&4)!==0&&(t=e.updateQueue,t=t!==null?t.events:null,t!==null))for(n=0;n<t.length;n++)o=t[n],o.ref.impl=o.nextImpl;break;case 11:case 15:break;case 1:if((t&1024)!==0&&a!==null){t=void 0,n=e,o=a.memoizedProps,a=a.memoizedState,r=n.stateNode;try{var m=jo(n.type,o);t=r.getSnapshotBeforeUpdate(m,a),r.__reactInternalSnapshotBeforeUpdate=t}catch(x){ie(n,n.return,x)}}break;case 3:if((t&1024)!==0){if(t=e.stateNode.containerInfo,n=t.nodeType,n===9)Cm(t);else if(n===1)switch(t.nodeName){case"HEAD":case"HTML":case"BODY":Cm(t);break;default:t.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if((t&1024)!==0)throw Error(A(163))}if(t=e.sibling,t!==null){t.return=e.return,Ge=t;break}Ge=e.return}}function e1(t,e,n){var r=n.flags;switch(n.tag){case 0:case 11:case 15:ar(t,n),r&4&&us(5,n);break;case 1:if(ar(t,n),r&4)if(t=n.stateNode,e===null)try{t.componentDidMount()}catch(i){ie(n,n.return,i)}else{var o=jo(n.type,e.memoizedProps);e=e.memoizedState;try{t.componentDidUpdate(o,e,t.__reactInternalSnapshotBeforeUpdate)}catch(i){ie(n,n.return,i)}}r&64&&Kv(n),r&512&&ql(n,n.return);break;case 3:if(ar(t,n),r&64&&(t=n.updateQueue,t!==null)){if(e=null,n.child!==null)switch(n.child.tag){case 27:case 5:e=n.child.stateNode;break;case 1:e=n.child.stateNode}try{ov(t,e)}catch(i){ie(n,n.return,i)}}break;case 27:e===null&&r&4&&$v(n);case 26:case 5:ar(t,n),e===null&&r&4&&Jv(n),r&512&&ql(n,n.return);break;case 12:ar(t,n);break;case 31:ar(t,n),r&4&&r1(t,n);break;case 13:ar(t,n),r&4&&o1(t,n),r&64&&(t=n.memoizedState,t!==null&&(t=t.dehydrated,t!==null&&(n=dD.bind(null,n),DD(t,n))));break;case 22:if(r=n.memoizedState!==null||sr,!r){e=e!==null&&e.memoizedState!==null||qe,o=sr;var a=qe;sr=r,(qe=e)&&!a?ir(t,n,(n.subtreeFlags&8772)!==0):ar(t,n),sr=o,qe=a}break;case 30:break;default:ar(t,n)}}function t1(t){var e=t.alternate;e!==null&&(t.alternate=null,t1(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&Nm(e)),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}var ke=null,St=!1;function or(t,e,n){for(n=n.child;n!==null;)n1(t,e,n),n=n.sibling}function n1(t,e,n){if(Pt&&typeof Pt.onCommitFiberUnmount=="function")try{Pt.onCommitFiberUnmount(os,n)}catch{}switch(n.tag){case 26:qe||Hn(n,e),or(t,e,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:qe||Hn(n,e);var r=ke,o=St;io(n.type)&&(ke=n.stateNode,St=!1),or(t,e,n),Ul(n.stateNode),ke=r,St=o;break;case 5:qe||Hn(n,e);case 6:if(r=ke,o=St,ke=null,or(t,e,n),ke=r,St=o,ke!==null)if(St)try{(ke.nodeType===9?ke.body:ke.nodeName==="HTML"?ke.ownerDocument.body:ke).removeChild(n.stateNode)}catch(a){ie(n,e,a)}else try{ke.removeChild(n.stateNode)}catch(a){ie(n,e,a)}break;case 18:ke!==null&&(St?(t=ke,X0(t.nodeType===9?t.body:t.nodeName==="HTML"?t.ownerDocument.body:t,n.stateNode),pi(t)):X0(ke,n.stateNode));break;case 4:r=ke,o=St,ke=n.stateNode.containerInfo,St=!0,or(t,e,n),ke=r,St=o;break;case 0:case 11:case 14:case 15:ro(2,n,e),qe||ro(4,n,e),or(t,e,n);break;case 1:qe||(Hn(n,e),r=n.stateNode,typeof r.componentWillUnmount=="function"&&Yv(n,e,r)),or(t,e,n);break;case 21:or(t,e,n);break;case 22:qe=(r=qe)||n.memoizedState!==null,or(t,e,n),qe=r;break;default:or(t,e,n)}}function r1(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null))){t=t.dehydrated;try{pi(t)}catch(n){ie(e,e.return,n)}}}function o1(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null&&(t=t.dehydrated,t!==null))))try{pi(t)}catch(n){ie(e,e.return,n)}}function oD(t){switch(t.tag){case 31:case 13:case 19:var e=t.stateNode;return e===null&&(e=t.stateNode=new R0),e;case 22:return t=t.stateNode,e=t._retryCache,e===null&&(e=t._retryCache=new R0),e;default:throw Error(A(435,t.tag))}}function jf(t,e){var n=oD(t);e.forEach(function(r){if(!n.has(r)){n.add(r);var o=pD.bind(null,t,r);r.then(o,o)}})}function vt(t,e){var n=e.deletions;if(n!==null)for(var r=0;r<n.length;r++){var o=n[r],a=t,i=e,l=i;e:for(;l!==null;){switch(l.tag){case 27:if(io(l.type)){ke=l.stateNode,St=!1;break e}break;case 5:ke=l.stateNode,St=!1;break e;case 3:case 4:ke=l.stateNode.containerInfo,St=!0;break e}l=l.return}if(ke===null)throw Error(A(160));n1(a,i,o),ke=null,St=!1,a=o.alternate,a!==null&&(a.return=null),o.return=null}if(e.subtreeFlags&13886)for(e=e.child;e!==null;)a1(e,t),e=e.sibling}var wn=null;function a1(t,e){var n=t.alternate,r=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:vt(e,t),wt(t),r&4&&(ro(3,t,t.return),us(3,t),ro(5,t,t.return));break;case 1:vt(e,t),wt(t),r&512&&(qe||n===null||Hn(n,n.return)),r&64&&sr&&(t=t.updateQueue,t!==null&&(r=t.callbacks,r!==null&&(n=t.shared.hiddenCallbacks,t.shared.hiddenCallbacks=n===null?r:n.concat(r))));break;case 26:var o=wn;if(vt(e,t),wt(t),r&512&&(qe||n===null||Hn(n,n.return)),r&4){var a=n!==null?n.memoizedState:null;if(r=t.memoizedState,n===null)if(r===null)if(t.stateNode===null){e:{r=t.type,n=t.memoizedProps,o=o.ownerDocument||o;t:switch(r){case"title":a=o.getElementsByTagName("title")[0],(!a||a[ls]||a[et]||a.namespaceURI==="http://www.w3.org/2000/svg"||a.hasAttribute("itemprop"))&&(a=o.createElement(r),o.head.insertBefore(a,o.querySelector("head > title"))),rt(a,r,n),a[et]=t,We(a),r=a;break e;case"link":var i=eI("link","href",o).get(r+(n.href||""));if(i){for(var l=0;l<i.length;l++)if(a=i[l],a.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&a.getAttribute("rel")===(n.rel==null?null:n.rel)&&a.getAttribute("title")===(n.title==null?null:n.title)&&a.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){i.splice(l,1);break t}}a=o.createElement(r),rt(a,r,n),o.head.appendChild(a);break;case"meta":if(i=eI("meta","content",o).get(r+(n.content||""))){for(l=0;l<i.length;l++)if(a=i[l],a.getAttribute("content")===(n.content==null?null:""+n.content)&&a.getAttribute("name")===(n.name==null?null:n.name)&&a.getAttribute("property")===(n.property==null?null:n.property)&&a.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&a.getAttribute("charset")===(n.charSet==null?null:n.charSet)){i.splice(l,1);break t}}a=o.createElement(r),rt(a,r,n),o.head.appendChild(a);break;default:throw Error(A(468,r))}a[et]=t,We(a),r=a}t.stateNode=r}else tI(o,t.type,t.stateNode);else t.stateNode=$0(o,r,t.memoizedProps);else a!==r?(a===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):a.count--,r===null?tI(o,t.type,t.stateNode):$0(o,r,t.memoizedProps)):r===null&&t.stateNode!==null&&Ap(t,t.memoizedProps,n.memoizedProps)}break;case 27:vt(e,t),wt(t),r&512&&(qe||n===null||Hn(n,n.return)),n!==null&&r&4&&Ap(t,t.memoizedProps,n.memoizedProps);break;case 5:if(vt(e,t),wt(t),r&512&&(qe||n===null||Hn(n,n.return)),t.flags&32){o=t.stateNode;try{ai(o,"")}catch(m){ie(t,t.return,m)}}r&4&&t.stateNode!=null&&(o=t.memoizedProps,Ap(t,o,n!==null?n.memoizedProps:o)),r&1024&&(Op=!0);break;case 6:if(vt(e,t),wt(t),r&4){if(t.stateNode===null)throw Error(A(162));r=t.memoizedProps,n=t.stateNode;try{n.nodeValue=r}catch(m){ie(t,t.return,m)}}break;case 3:if(lc=null,o=wn,wn=Fc(e.containerInfo),vt(e,t),wn=o,wt(t),r&4&&n!==null&&n.memoizedState.isDehydrated)try{pi(e.containerInfo)}catch(m){ie(t,t.return,m)}Op&&(Op=!1,i1(t));break;case 4:r=wn,wn=Fc(t.stateNode.containerInfo),vt(e,t),wt(t),wn=r;break;case 12:vt(e,t),wt(t);break;case 31:vt(e,t),wt(t),r&4&&(r=t.updateQueue,r!==null&&(t.updateQueue=null,jf(t,r)));break;case 13:vt(e,t),wt(t),t.child.flags&8192&&t.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(Yc=qt()),r&4&&(r=t.updateQueue,r!==null&&(t.updateQueue=null,jf(t,r)));break;case 22:o=t.memoizedState!==null;var s=n!==null&&n.memoizedState!==null,f=sr,c=qe;if(sr=f||o,qe=c||s,vt(e,t),qe=c,sr=f,wt(t),r&8192)e:for(e=t.stateNode,e._visibility=o?e._visibility&-2:e._visibility|1,o&&(n===null||s||sr||qe||Eo(t)),n=null,e=t;;){if(e.tag===5||e.tag===26){if(n===null){s=n=e;try{if(a=s.stateNode,o)i=a.style,typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none";else{l=s.stateNode;var u=s.memoizedProps.style,d=u!=null&&u.hasOwnProperty("display")?u.display:null;l.style.display=d==null||typeof d=="boolean"?"":(""+d).trim()}}catch(m){ie(s,s.return,m)}}}else if(e.tag===6){if(n===null){s=e;try{s.stateNode.nodeValue=o?"":s.memoizedProps}catch(m){ie(s,s.return,m)}}}else if(e.tag===18){if(n===null){s=e;try{var p=s.stateNode;o?Q0(p,!0):Q0(s.stateNode,!1)}catch(m){ie(s,s.return,m)}}}else if((e.tag!==22&&e.tag!==23||e.memoizedState===null||e===t)&&e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;n===e&&(n=null),e=e.return}n===e&&(n=null),e.sibling.return=e.return,e=e.sibling}r&4&&(r=t.updateQueue,r!==null&&(n=r.retryQueue,n!==null&&(r.retryQueue=null,jf(t,n))));break;case 19:vt(e,t),wt(t),r&4&&(r=t.updateQueue,r!==null&&(t.updateQueue=null,jf(t,r)));break;case 30:break;case 21:break;default:vt(e,t),wt(t)}}function wt(t){var e=t.flags;if(e&2){try{for(var n,r=t.return;r!==null;){if(Zv(r)){n=r;break}r=r.return}if(n==null)throw Error(A(160));switch(n.tag){case 27:var o=n.stateNode,a=Tp(t);Ac(t,a,o);break;case 5:var i=n.stateNode;n.flags&32&&(ai(i,""),n.flags&=-33);var l=Tp(t);Ac(t,l,i);break;case 3:case 4:var s=n.stateNode.containerInfo,f=Tp(t);hm(t,f,s);break;default:throw Error(A(161))}}catch(c){ie(t,t.return,c)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function i1(t){if(t.subtreeFlags&1024)for(t=t.child;t!==null;){var e=t;i1(e),e.tag===5&&e.flags&1024&&e.stateNode.reset(),t=t.sibling}}function ar(t,e){if(e.subtreeFlags&8772)for(e=e.child;e!==null;)e1(t,e.alternate,e),e=e.sibling}function Eo(t){for(t=t.child;t!==null;){var e=t;switch(e.tag){case 0:case 11:case 14:case 15:ro(4,e,e.return),Eo(e);break;case 1:Hn(e,e.return);var n=e.stateNode;typeof n.componentWillUnmount=="function"&&Yv(e,e.return,n),Eo(e);break;case 27:Ul(e.stateNode);case 26:case 5:Hn(e,e.return),Eo(e);break;case 22:e.memoizedState===null&&Eo(e);break;case 30:Eo(e);break;default:Eo(e)}t=t.sibling}}function ir(t,e,n){for(n=n&&(e.subtreeFlags&8772)!==0,e=e.child;e!==null;){var r=e.alternate,o=t,a=e,i=a.flags;switch(a.tag){case 0:case 11:case 15:ir(o,a,n),us(4,a);break;case 1:if(ir(o,a,n),r=a,o=r.stateNode,typeof o.componentDidMount=="function")try{o.componentDidMount()}catch(f){ie(r,r.return,f)}if(r=a,o=r.updateQueue,o!==null){var l=r.stateNode;try{var s=o.shared.hiddenCallbacks;if(s!==null)for(o.shared.hiddenCallbacks=null,o=0;o<s.length;o++)rv(s[o],l)}catch(f){ie(r,r.return,f)}}n&&i&64&&Kv(a),ql(a,a.return);break;case 27:$v(a);case 26:case 5:ir(o,a,n),n&&r===null&&i&4&&Jv(a),ql(a,a.return);break;case 12:ir(o,a,n);break;case 31:ir(o,a,n),n&&i&4&&r1(o,a);break;case 13:ir(o,a,n),n&&i&4&&o1(o,a);break;case 22:a.memoizedState===null&&ir(o,a,n),ql(a,a.return);break;case 30:break;default:ir(o,a,n)}e=e.sibling}}function mh(t,e){var n=null;t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),t=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(t=e.memoizedState.cachePool.pool),t!==n&&(t!=null&&t.refCount++,n!=null&&fs(n))}function hh(t,e){t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&fs(t))}function vn(t,e,n,r){if(e.subtreeFlags&10256)for(e=e.child;e!==null;)l1(t,e,n,r),e=e.sibling}function l1(t,e,n,r){var o=e.flags;switch(e.tag){case 0:case 11:case 15:vn(t,e,n,r),o&2048&&us(9,e);break;case 1:vn(t,e,n,r);break;case 3:vn(t,e,n,r),o&2048&&(t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&fs(t)));break;case 12:if(o&2048){vn(t,e,n,r),t=e.stateNode;try{var a=e.memoizedProps,i=a.id,l=a.onPostCommit;typeof l=="function"&&l(i,e.alternate===null?"mount":"update",t.passiveEffectDuration,-0)}catch(s){ie(e,e.return,s)}}else vn(t,e,n,r);break;case 31:vn(t,e,n,r);break;case 13:vn(t,e,n,r);break;case 23:break;case 22:a=e.stateNode,i=e.alternate,e.memoizedState!==null?a._visibility&2?vn(t,e,n,r):Pl(t,e):a._visibility&2?vn(t,e,n,r):(a._visibility|=2,Na(t,e,n,r,(e.subtreeFlags&10256)!==0||!1)),o&2048&&mh(i,e);break;case 24:vn(t,e,n,r),o&2048&&hh(e.alternate,e);break;default:vn(t,e,n,r)}}function Na(t,e,n,r,o){for(o=o&&((e.subtreeFlags&10256)!==0||!1),e=e.child;e!==null;){var a=t,i=e,l=n,s=r,f=i.flags;switch(i.tag){case 0:case 11:case 15:Na(a,i,l,s,o),us(8,i);break;case 23:break;case 22:var c=i.stateNode;i.memoizedState!==null?c._visibility&2?Na(a,i,l,s,o):Pl(a,i):(c._visibility|=2,Na(a,i,l,s,o)),o&&f&2048&&mh(i.alternate,i);break;case 24:Na(a,i,l,s,o),o&&f&2048&&hh(i.alternate,i);break;default:Na(a,i,l,s,o)}e=e.sibling}}function Pl(t,e){if(e.subtreeFlags&10256)for(e=e.child;e!==null;){var n=t,r=e,o=r.flags;switch(r.tag){case 22:Pl(n,r),o&2048&&mh(r.alternate,r);break;case 24:Pl(n,r),o&2048&&hh(r.alternate,r);break;default:Pl(n,r)}e=e.sibling}}var Bl=8192;function La(t,e,n){if(t.subtreeFlags&Bl)for(t=t.child;t!==null;)s1(t,e,n),t=t.sibling}function s1(t,e,n){switch(t.tag){case 26:La(t,e,n),t.flags&Bl&&t.memoizedState!==null&&UD(n,wn,t.memoizedState,t.memoizedProps);break;case 5:La(t,e,n);break;case 3:case 4:var r=wn;wn=Fc(t.stateNode.containerInfo),La(t,e,n),wn=r;break;case 22:t.memoizedState===null&&(r=t.alternate,r!==null&&r.memoizedState!==null?(r=Bl,Bl=16777216,La(t,e,n),Bl=r):La(t,e,n));break;default:La(t,e,n)}}function f1(t){var e=t.alternate;if(e!==null&&(t=e.child,t!==null)){e.child=null;do e=t.sibling,t.sibling=null,t=e;while(t!==null)}}function wl(t){var e=t.deletions;if((t.flags&16)!==0){if(e!==null)for(var n=0;n<e.length;n++){var r=e[n];Ge=r,u1(r,t)}f1(t)}if(t.subtreeFlags&10256)for(t=t.child;t!==null;)c1(t),t=t.sibling}function c1(t){switch(t.tag){case 0:case 11:case 15:wl(t),t.flags&2048&&ro(9,t,t.return);break;case 3:wl(t);break;case 12:wl(t);break;case 22:var e=t.stateNode;t.memoizedState!==null&&e._visibility&2&&(t.return===null||t.return.tag!==13)?(e._visibility&=-3,ac(t)):wl(t);break;default:wl(t)}}function ac(t){var e=t.deletions;if((t.flags&16)!==0){if(e!==null)for(var n=0;n<e.length;n++){var r=e[n];Ge=r,u1(r,t)}f1(t)}for(t=t.child;t!==null;){switch(e=t,e.tag){case 0:case 11:case 15:ro(8,e,e.return),ac(e);break;case 22:n=e.stateNode,n._visibility&2&&(n._visibility&=-3,ac(e));break;default:ac(e)}t=t.sibling}}function u1(t,e){for(;Ge!==null;){var n=Ge;switch(n.tag){case 0:case 11:case 15:ro(8,n,e);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var r=n.memoizedState.cachePool.pool;r!=null&&r.refCount++}break;case 24:fs(n.memoizedState.cache)}if(r=n.child,r!==null)r.return=n,Ge=r;else e:for(n=t;Ge!==null;){r=Ge;var o=r.sibling,a=r.return;if(t1(r),r===n){Ge=null;break e}if(o!==null){o.return=a,Ge=o;break e}Ge=a}}}var aD={getCacheForType:function(t){var e=nt(Pe),n=e.data.get(t);return n===void 0&&(n=t(),e.data.set(t,n)),n},cacheSignal:function(){return nt(Pe).controller.signal}},iD=typeof WeakMap=="function"?WeakMap:Map,ne=0,ue=null,Q=null,Y=0,ae=0,Ft=null,jr=!1,yi=!1,xh=!1,br=0,Me=0,oo=0,qo=0,gh=0,_t=0,fi=0,zl=null,kt=null,xm=!1,Yc=0,d1=0,Tc=1/0,Oc=null,Yr=null,Ue=0,Jr=null,ci=null,mr=0,gm=0,ym=null,p1=null,Hl=0,bm=null;function Ht(){return(ne&2)!==0&&Y!==0?Y&-Y:H.T!==null?bh():wI()}function m1(){if(_t===0)if((Y&536870912)===0||Z){var t=Ef;Ef<<=1,(Ef&3932160)===0&&(Ef=262144),_t=t}else _t=536870912;return t=jt.current,t!==null&&(t.flags|=32),_t}function Ct(t,e,n){(t===ue&&(ae===2||ae===9)||t.cancelPendingCommit!==null)&&(ui(t,0),Vr(t,Y,_t,!1)),is(t,n),((ne&2)===0||t!==ue)&&(t===ue&&((ne&2)===0&&(qo|=n),Me===4&&Vr(t,Y,_t,!1)),Vn(t))}function h1(t,e,n){if((ne&6)!==0)throw Error(A(327));var r=!n&&(e&127)===0&&(e&t.expiredLanes)===0||as(t,e),o=r?fD(t,e):Bp(t,e,!0),a=r;do{if(o===0){yi&&!r&&Vr(t,e,0,!1);break}else{if(n=t.current.alternate,a&&!lD(n)){o=Bp(t,e,!1),a=!1;continue}if(o===2){if(a=e,t.errorRecoveryDisabledLanes&a)var i=0;else i=t.pendingLanes&-536870913,i=i!==0?i:i&536870912?536870912:0;if(i!==0){e=i;e:{var l=t;o=zl;var s=l.current.memoizedState.isDehydrated;if(s&&(ui(l,i).flags|=256),i=Bp(l,i,!1),i!==2){if(xh&&!s){l.errorRecoveryDisabledLanes|=a,qo|=a,o=4;break e}a=kt,kt=o,a!==null&&(kt===null?kt=a:kt.push.apply(kt,a))}o=i}if(a=!1,o!==2)continue}}if(o===1){ui(t,0),Vr(t,e,0,!0);break}e:{switch(r=t,a=o,a){case 0:case 1:throw Error(A(345));case 4:if((e&4194048)!==e)break;case 6:Vr(r,e,_t,!jr);break e;case 2:kt=null;break;case 3:case 5:break;default:throw Error(A(329))}if((e&62914560)===e&&(o=Yc+300-qt(),10<o)){if(Vr(r,e,_t,!jr),Pc(r,0,!0)!==0)break e;mr=e,r.timeoutHandle=L1(E0.bind(null,r,n,kt,Oc,xm,e,_t,qo,fi,jr,a,"Throttled",-0,0),o);break e}E0(r,n,kt,Oc,xm,e,_t,qo,fi,jr,a,null,-0,0)}}break}while(!0);Vn(t)}function E0(t,e,n,r,o,a,i,l,s,f,c,u,d,p){if(t.timeoutHandle=-1,u=e.subtreeFlags,u&8192||(u&16785408)===16785408){u={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:cr},s1(e,a,u);var m=(a&62914560)===a?Yc-qt():(a&4194048)===a?d1-qt():0;if(m=jD(u,m),m!==null){mr=a,t.cancelPendingCommit=m(L0.bind(null,t,e,a,n,r,o,i,l,s,c,u,null,d,p)),Vr(t,a,i,!f);return}}L0(t,e,a,n,r,o,i,l,s)}function lD(t){for(var e=t;;){var n=e.tag;if((n===0||n===11||n===15)&&e.flags&16384&&(n=e.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var r=0;r<n.length;r++){var o=n[r],a=o.getSnapshot;o=o.value;try{if(!Ut(a(),o))return!1}catch{return!1}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function Vr(t,e,n,r){e&=~gh,e&=~qo,t.suspendedLanes|=e,t.pingedLanes&=~e,r&&(t.warmLanes|=e),r=t.expirationTimes;for(var o=e;0<o;){var a=31-zt(o),i=1<<a;r[a]=-1,o&=~i}n!==0&&bI(t,n,e)}function Jc(){return(ne&6)===0?(ds(0,!1),!1):!0}function yh(){if(Q!==null){if(ae===0)var t=Q.return;else t=Q,ur=Qo=null,rh(t),ei=null,Kl=0,t=Q;for(;t!==null;)Qv(t.alternate,t),t=t.return;Q=null}}function ui(t,e){var n=t.timeoutHandle;n!==-1&&(t.timeoutHandle=-1,CD(n)),n=t.cancelPendingCommit,n!==null&&(t.cancelPendingCommit=null,n()),mr=0,yh(),ue=t,Q=n=dr(t.current,null),Y=e,ae=0,Ft=null,jr=!1,yi=as(t,e),xh=!1,fi=_t=gh=qo=oo=Me=0,kt=zl=null,xm=!1,(e&8)!==0&&(e|=e&32);var r=t.entangledLanes;if(r!==0)for(t=t.entanglements,r&=e;0<r;){var o=31-zt(r),a=1<<o;e|=t[o],r&=~a}return br=e,jc(),n}function x1(t,e){W=null,H.H=Jl,e===gi||e===Gc?(e=u0(),ae=3):e===Ym?(e=u0(),ae=4):ae=e===dh?8:e!==null&&typeof e=="object"&&typeof e.then=="function"?6:1,Ft=e,Q===null&&(Me=1,kc(t,on(e,t.current)))}function g1(){var t=jt.current;return t===null?!0:(Y&4194048)===Y?ln===null:(Y&62914560)===Y||(Y&536870912)!==0?t===ln:!1}function y1(){var t=H.H;return H.H=Jl,t===null?Jl:t}function b1(){var t=H.A;return H.A=aD,t}function Bc(){Me=4,jr||(Y&4194048)!==Y&&jt.current!==null||(yi=!0),(oo&134217727)===0&&(qo&134217727)===0||ue===null||Vr(ue,Y,_t,!1)}function Bp(t,e,n){var r=ne;ne|=2;var o=y1(),a=b1();(ue!==t||Y!==e)&&(Oc=null,ui(t,e)),e=!1;var i=Me;e:do try{if(ae!==0&&Q!==null){var l=Q,s=Ft;switch(ae){case 8:yh(),i=6;break e;case 3:case 2:case 9:case 6:jt.current===null&&(e=!0);var f=ae;if(ae=0,Ft=null,Ka(t,l,s,f),n&&yi){i=0;break e}break;default:f=ae,ae=0,Ft=null,Ka(t,l,s,f)}}sD(),i=Me;break}catch(c){x1(t,c)}while(!0);return e&&t.shellSuspendCounter++,ur=Qo=null,ne=r,H.H=o,H.A=a,Q===null&&(ue=null,Y=0,jc()),i}function sD(){for(;Q!==null;)I1(Q)}function fD(t,e){var n=ne;ne|=2;var r=y1(),o=b1();ue!==t||Y!==e?(Oc=null,Tc=qt()+500,ui(t,e)):yi=as(t,e);e:do try{if(ae!==0&&Q!==null){e=Q;var a=Ft;t:switch(ae){case 1:ae=0,Ft=null,Ka(t,e,a,1);break;case 2:case 9:if(c0(a)){ae=0,Ft=null,F0(e);break}e=function(){ae!==2&&ae!==9||ue!==t||(ae=7),Vn(t)},a.then(e,e);break e;case 3:ae=7;break e;case 4:ae=5;break e;case 7:c0(a)?(ae=0,Ft=null,F0(e)):(ae=0,Ft=null,Ka(t,e,a,7));break;case 5:var i=null;switch(Q.tag){case 26:i=Q.memoizedState;case 5:case 27:var l=Q;if(i?z1(i):l.stateNode.complete){ae=0,Ft=null;var s=l.sibling;if(s!==null)Q=s;else{var f=l.return;f!==null?(Q=f,Zc(f)):Q=null}break t}}ae=0,Ft=null,Ka(t,e,a,5);break;case 6:ae=0,Ft=null,Ka(t,e,a,6);break;case 8:yh(),Me=6;break e;default:throw Error(A(462))}}cD();break}catch(c){x1(t,c)}while(!0);return ur=Qo=null,H.H=r,H.A=o,ne=n,Q!==null?0:(ue=null,Y=0,jc(),Me)}function cD(){for(;Q!==null&&!EO();)I1(Q)}function I1(t){var e=Xv(t.alternate,t,br);t.memoizedProps=t.pendingProps,e===null?Zc(t):Q=e}function F0(t){var e=t,n=e.alternate;switch(e.tag){case 15:case 0:e=T0(n,e,e.pendingProps,e.type,void 0,Y);break;case 11:e=T0(n,e,e.pendingProps,e.type.render,e.ref,Y);break;case 5:rh(e);default:Qv(n,e),e=Q=QI(e,br),e=Xv(n,e,br)}t.memoizedProps=t.pendingProps,e===null?Zc(t):Q=e}function Ka(t,e,n,r){ur=Qo=null,rh(e),ei=null,Kl=0;var o=e.return;try{if(ZB(t,o,e,n,Y)){Me=1,kc(t,on(n,t.current)),Q=null;return}}catch(a){if(o!==null)throw Q=o,a;Me=1,kc(t,on(n,t.current)),Q=null;return}e.flags&32768?(Z||r===1?t=!0:yi||(Y&536870912)!==0?t=!1:(jr=t=!0,(r===2||r===9||r===3||r===6)&&(r=jt.current,r!==null&&r.tag===13&&(r.flags|=16384))),v1(e,t)):Zc(e)}function Zc(t){var e=t;do{if((e.flags&32768)!==0){v1(e,jr);return}t=e.return;var n=tD(e.alternate,e,br);if(n!==null){Q=n;return}if(e=e.sibling,e!==null){Q=e;return}Q=e=t}while(e!==null);Me===0&&(Me=5)}function v1(t,e){do{var n=nD(t.alternate,t);if(n!==null){n.flags&=32767,Q=n;return}if(n=t.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!e&&(t=t.sibling,t!==null)){Q=t;return}Q=t=n}while(t!==null);Me=6,Q=null}function L0(t,e,n,r,o,a,i,l,s){t.cancelPendingCommit=null;do $c();while(Ue!==0);if((ne&6)!==0)throw Error(A(327));if(e!==null){if(e===t.current)throw Error(A(177));if(a=e.lanes|e.childLanes,a|=jm,jO(t,n,a,i,l,s),t===ue&&(Q=ue=null,Y=0),ci=e,Jr=t,mr=n,gm=a,ym=o,p1=r,(e.subtreeFlags&10256)!==0||(e.flags&10256)!==0?(t.callbackNode=null,t.callbackPriority=0,mD(pc,function(){return A1(),null})):(t.callbackNode=null,t.callbackPriority=0),r=(e.flags&13878)!==0,(e.subtreeFlags&13878)!==0||r){r=H.T,H.T=null,o=re.p,re.p=2,i=ne,ne|=4;try{rD(t,e,n)}finally{ne=i,re.p=o,H.T=r}}Ue=1,w1(),S1(),k1()}}function w1(){if(Ue===1){Ue=0;var t=Jr,e=ci,n=(e.flags&13878)!==0;if((e.subtreeFlags&13878)!==0||n){n=H.T,H.T=null;var r=re.p;re.p=2;var o=ne;ne|=4;try{a1(e,t);var a=Sm,i=zI(t.containerInfo),l=a.focusedElem,s=a.selectionRange;if(i!==l&&l&&l.ownerDocument&&PI(l.ownerDocument.documentElement,l)){if(s!==null&&Um(l)){var f=s.start,c=s.end;if(c===void 0&&(c=f),"selectionStart"in l)l.selectionStart=f,l.selectionEnd=Math.min(c,l.value.length);else{var u=l.ownerDocument||document,d=u&&u.defaultView||window;if(d.getSelection){var p=d.getSelection(),m=l.textContent.length,x=Math.min(s.start,m),b=s.end===void 0?x:Math.min(s.end,m);!p.extend&&x>b&&(i=b,b=x,x=i);var h=r0(l,x),y=r0(l,b);if(h&&y&&(p.rangeCount!==1||p.anchorNode!==h.node||p.anchorOffset!==h.offset||p.focusNode!==y.node||p.focusOffset!==y.offset)){var g=u.createRange();g.setStart(h.node,h.offset),p.removeAllRanges(),x>b?(p.addRange(g),p.extend(y.node,y.offset)):(g.setEnd(y.node,y.offset),p.addRange(g))}}}}for(u=[],p=l;p=p.parentNode;)p.nodeType===1&&u.push({element:p,left:p.scrollLeft,top:p.scrollTop});for(typeof l.focus=="function"&&l.focus(),l=0;l<u.length;l++){var I=u[l];I.element.scrollLeft=I.left,I.element.scrollTop=I.top}}_c=!!wm,Sm=wm=null}finally{ne=o,re.p=r,H.T=n}}t.current=e,Ue=2}}function S1(){if(Ue===2){Ue=0;var t=Jr,e=ci,n=(e.flags&8772)!==0;if((e.subtreeFlags&8772)!==0||n){n=H.T,H.T=null;var r=re.p;re.p=2;var o=ne;ne|=4;try{e1(t,e.alternate,e)}finally{ne=o,re.p=r,H.T=n}}Ue=3}}function k1(){if(Ue===4||Ue===3){Ue=0,FO();var t=Jr,e=ci,n=mr,r=p1;(e.subtreeFlags&10256)!==0||(e.flags&10256)!==0?Ue=5:(Ue=0,ci=Jr=null,C1(t,t.pendingLanes));var o=t.pendingLanes;if(o===0&&(Yr=null),Lm(n),e=e.stateNode,Pt&&typeof Pt.onCommitFiberRoot=="function")try{Pt.onCommitFiberRoot(os,e,void 0,(e.current.flags&128)===128)}catch{}if(r!==null){e=H.T,o=re.p,re.p=2,H.T=null;try{for(var a=t.onRecoverableError,i=0;i<r.length;i++){var l=r[i];a(l.value,{componentStack:l.stack})}}finally{H.T=e,re.p=o}}(mr&3)!==0&&$c(),Vn(t),o=t.pendingLanes,(n&261930)!==0&&(o&42)!==0?t===bm?Hl++:(Hl=0,bm=t):Hl=0,ds(0,!1)}}function C1(t,e){(t.pooledCacheLanes&=e)===0&&(e=t.pooledCache,e!=null&&(t.pooledCache=null,fs(e)))}function $c(){return w1(),S1(),k1(),A1()}function A1(){if(Ue!==5)return!1;var t=Jr,e=gm;gm=0;var n=Lm(mr),r=H.T,o=re.p;try{re.p=32>n?32:n,H.T=null,n=ym,ym=null;var a=Jr,i=mr;if(Ue=0,ci=Jr=null,mr=0,(ne&6)!==0)throw Error(A(331));var l=ne;if(ne|=4,c1(a.current),l1(a,a.current,i,n),ne=l,ds(0,!1),Pt&&typeof Pt.onPostCommitFiberRoot=="function")try{Pt.onPostCommitFiberRoot(os,a)}catch{}return!0}finally{re.p=o,H.T=r,C1(t,e)}}function N0(t,e,n){e=on(n,e),e=dm(t.stateNode,e,2),t=Kr(t,e,2),t!==null&&(is(t,2),Vn(t))}function ie(t,e,n){if(t.tag===3)N0(t,t,n);else for(;e!==null;){if(e.tag===3){N0(e,t,n);break}else if(e.tag===1){var r=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(Yr===null||!Yr.has(r))){t=on(n,t),n=Hv(2),r=Kr(e,n,2),r!==null&&(Uv(n,r,e,t),is(r,2),Vn(r));break}}e=e.return}}function Dp(t,e,n){var r=t.pingCache;if(r===null){r=t.pingCache=new iD;var o=new Set;r.set(e,o)}else o=r.get(e),o===void 0&&(o=new Set,r.set(e,o));o.has(n)||(xh=!0,o.add(n),t=uD.bind(null,t,e,n),e.then(t,t))}function uD(t,e,n){var r=t.pingCache;r!==null&&r.delete(e),t.pingedLanes|=t.suspendedLanes&n,t.warmLanes&=~n,ue===t&&(Y&n)===n&&(Me===4||Me===3&&(Y&62914560)===Y&&300>qt()-Yc?(ne&2)===0&&ui(t,0):gh|=n,fi===Y&&(fi=0)),Vn(t)}function T1(t,e){e===0&&(e=yI()),t=Xo(t,e),t!==null&&(is(t,e),Vn(t))}function dD(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),T1(t,n)}function pD(t,e){var n=0;switch(t.tag){case 31:case 13:var r=t.stateNode,o=t.memoizedState;o!==null&&(n=o.retryLane);break;case 19:r=t.stateNode;break;case 22:r=t.stateNode._retryCache;break;default:throw Error(A(314))}r!==null&&r.delete(e),T1(t,n)}function mD(t,e){return Em(t,e)}var Dc=null,_a=null,Im=!1,Mc=!1,Mp=!1,Gr=0;function Vn(t){t!==_a&&t.next===null&&(_a===null?Dc=_a=t:_a=_a.next=t),Mc=!0,Im||(Im=!0,xD())}function ds(t,e){if(!Mp&&Mc){Mp=!0;do for(var n=!1,r=Dc;r!==null;){if(!e)if(t!==0){var o=r.pendingLanes;if(o===0)var a=0;else{var i=r.suspendedLanes,l=r.pingedLanes;a=(1<<31-zt(42|t)+1)-1,a&=o&~(i&~l),a=a&201326741?a&201326741|1:a?a|2:0}a!==0&&(n=!0,_0(r,a))}else a=Y,a=Pc(r,r===ue?a:0,r.cancelPendingCommit!==null||r.timeoutHandle!==-1),(a&3)===0||as(r,a)||(n=!0,_0(r,a));r=r.next}while(n);Mp=!1}}function hD(){O1()}function O1(){Mc=Im=!1;var t=0;Gr!==0&&kD()&&(t=Gr);for(var e=qt(),n=null,r=Dc;r!==null;){var o=r.next,a=B1(r,e);a===0?(r.next=null,n===null?Dc=o:n.next=o,o===null&&(_a=n)):(n=r,(t!==0||(a&3)!==0)&&(Mc=!0)),r=o}Ue!==0&&Ue!==5||ds(t,!1),Gr!==0&&(Gr=0)}function B1(t,e){for(var n=t.suspendedLanes,r=t.pingedLanes,o=t.expirationTimes,a=t.pendingLanes&-62914561;0<a;){var i=31-zt(a),l=1<<i,s=o[i];s===-1?((l&n)===0||(l&r)!==0)&&(o[i]=UO(l,e)):s<=e&&(t.expiredLanes|=l),a&=~l}if(e=ue,n=Y,n=Pc(t,t===e?n:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),r=t.callbackNode,n===0||t===e&&(ae===2||ae===9)||t.cancelPendingCommit!==null)return r!==null&&r!==null&&ip(r),t.callbackNode=null,t.callbackPriority=0;if((n&3)===0||as(t,n)){if(e=n&-n,e===t.callbackPriority)return e;switch(r!==null&&ip(r),Lm(n)){case 2:case 8:n=xI;break;case 32:n=pc;break;case 268435456:n=gI;break;default:n=pc}return r=D1.bind(null,t),n=Em(n,r),t.callbackPriority=e,t.callbackNode=n,e}return r!==null&&r!==null&&ip(r),t.callbackPriority=2,t.callbackNode=null,2}function D1(t,e){if(Ue!==0&&Ue!==5)return t.callbackNode=null,t.callbackPriority=0,null;var n=t.callbackNode;if($c()&&t.callbackNode!==n)return null;var r=Y;return r=Pc(t,t===ue?r:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),r===0?null:(h1(t,r,e),B1(t,qt()),t.callbackNode!=null&&t.callbackNode===n?D1.bind(null,t):null)}function _0(t,e){if($c())return null;h1(t,e,!0)}function xD(){AD(function(){(ne&6)!==0?Em(hI,hD):O1()})}function bh(){if(Gr===0){var t=ii;t===0&&(t=Rf,Rf<<=1,(Rf&261888)===0&&(Rf=256)),Gr=t}return Gr}function q0(t){return t==null||typeof t=="symbol"||typeof t=="boolean"?null:typeof t=="function"?t:Yf(""+t)}function P0(t,e){var n=e.ownerDocument.createElement("input");return n.name=e.name,n.value=e.value,t.id&&n.setAttribute("form",t.id),e.parentNode.insertBefore(n,e),t=new FormData(t),n.parentNode.removeChild(n),t}function gD(t,e,n,r,o){if(e==="submit"&&n&&n.stateNode===o){var a=q0((o[At]||null).action),i=r.submitter;i&&(e=(e=i[At]||null)?q0(e.formAction):i.getAttribute("formAction"),e!==null&&(a=e,i=null));var l=new zc("action","action",null,r,o);t.push({event:l,listeners:[{instance:null,listener:function(){if(r.defaultPrevented){if(Gr!==0){var s=i?P0(o,i):new FormData(o);cm(n,{pending:!0,data:s,method:o.method,action:a},null,s)}}else typeof a=="function"&&(l.preventDefault(),s=i?P0(o,i):new FormData(o),cm(n,{pending:!0,data:s,method:o.method,action:a},a,s))},currentTarget:o}]})}}for(Vf=0;Vf<Zp.length;Vf++)Gf=Zp[Vf],z0=Gf.toLowerCase(),H0=Gf[0].toUpperCase()+Gf.slice(1),Sn(z0,"on"+H0);var Gf,z0,H0,Vf;Sn(UI,"onAnimationEnd");Sn(jI,"onAnimationIteration");Sn(VI,"onAnimationStart");Sn("dblclick","onDoubleClick");Sn("focusin","onFocus");Sn("focusout","onBlur");Sn(LB,"onTransitionRun");Sn(NB,"onTransitionStart");Sn(_B,"onTransitionCancel");Sn(GI,"onTransitionEnd");oi("onMouseEnter",["mouseout","mouseover"]);oi("onMouseLeave",["mouseout","mouseover"]);oi("onPointerEnter",["pointerout","pointerover"]);oi("onPointerLeave",["pointerout","pointerover"]);Vo("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Vo("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Vo("onBeforeInput",["compositionend","keypress","textInput","paste"]);Vo("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Vo("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Vo("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Zl="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),yD=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Zl));function M1(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var r=t[n],o=r.event;r=r.listeners;e:{var a=void 0;if(e)for(var i=r.length-1;0<=i;i--){var l=r[i],s=l.instance,f=l.currentTarget;if(l=l.listener,s!==a&&o.isPropagationStopped())break e;a=l,o.currentTarget=f;try{a(o)}catch(c){hc(c)}o.currentTarget=null,a=s}else for(i=0;i<r.length;i++){if(l=r[i],s=l.instance,f=l.currentTarget,l=l.listener,s!==a&&o.isPropagationStopped())break e;a=l,o.currentTarget=f;try{a(o)}catch(c){hc(c)}o.currentTarget=null,a=s}}}}function X(t,e){var n=e[Vp];n===void 0&&(n=e[Vp]=new Set);var r=t+"__bubble";n.has(r)||(R1(e,t,2,!1),n.add(r))}function Rp(t,e,n){var r=0;e&&(r|=4),R1(n,t,r,e)}var Wf="_reactListening"+Math.random().toString(36).slice(2);function Ih(t){if(!t[Wf]){t[Wf]=!0,SI.forEach(function(n){n!=="selectionchange"&&(yD.has(n)||Rp(n,!1,t),Rp(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[Wf]||(e[Wf]=!0,Rp("selectionchange",!1,e))}}function R1(t,e,n,r){switch(G1(e)){case 2:var o=WD;break;case 8:o=XD;break;default:o=kh}n=o.bind(null,e,n,t),o=void 0,!Kp||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(o=!0),r?o!==void 0?t.addEventListener(e,n,{capture:!0,passive:o}):t.addEventListener(e,n,!0):o!==void 0?t.addEventListener(e,n,{passive:o}):t.addEventListener(e,n,!1)}function Ep(t,e,n,r,o){var a=r;if((e&1)===0&&(e&2)===0&&r!==null)e:for(;;){if(r===null)return;var i=r.tag;if(i===3||i===4){var l=r.stateNode.containerInfo;if(l===o)break;if(i===4)for(i=r.return;i!==null;){var s=i.tag;if((s===3||s===4)&&i.stateNode.containerInfo===o)return;i=i.return}for(;l!==null;){if(i=za(l),i===null)return;if(s=i.tag,s===5||s===6||s===26||s===27){r=a=i;continue e}l=l.parentNode}}r=r.return}MI(function(){var f=a,c=qm(n),u=[];e:{var d=WI.get(t);if(d!==void 0){var p=zc,m=t;switch(t){case"keypress":if(Zf(n)===0)break e;case"keydown":case"keyup":p=pB;break;case"focusin":m="focus",p=up;break;case"focusout":m="blur",p=up;break;case"beforeblur":case"afterblur":p=up;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":p=Qb;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":p=tB;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":p=xB;break;case UI:case jI:case VI:p=oB;break;case GI:p=yB;break;case"scroll":case"scrollend":p=$O;break;case"wheel":p=IB;break;case"copy":case"cut":case"paste":p=iB;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":p=Yb;break;case"toggle":case"beforetoggle":p=wB}var x=(e&4)!==0,b=!x&&(t==="scroll"||t==="scrollend"),h=x?d!==null?d+"Capture":null:d;x=[];for(var y=f,g;y!==null;){var I=y;if(g=I.stateNode,I=I.tag,I!==5&&I!==26&&I!==27||g===null||h===null||(I=Vl(y,h),I!=null&&x.push($l(y,I,g))),b)break;y=y.return}0<x.length&&(d=new p(d,m,null,n,c),u.push({event:d,listeners:x}))}}if((e&7)===0){e:{if(d=t==="mouseover"||t==="pointerover",p=t==="mouseout"||t==="pointerout",d&&n!==Qp&&(m=n.relatedTarget||n.fromElement)&&(za(m)||m[mi]))break e;if((p||d)&&(d=c.window===c?c:(d=c.ownerDocument)?d.defaultView||d.parentWindow:window,p?(m=n.relatedTarget||n.toElement,p=f,m=m?za(m):null,m!==null&&(b=rs(m),x=m.tag,m!==b||x!==5&&x!==27&&x!==6)&&(m=null)):(p=null,m=f),p!==m)){if(x=Qb,I="onMouseLeave",h="onMouseEnter",y="mouse",(t==="pointerout"||t==="pointerover")&&(x=Yb,I="onPointerLeave",h="onPointerEnter",y="pointer"),b=p==null?d:Tl(p),g=m==null?d:Tl(m),d=new x(I,y+"leave",p,n,c),d.target=b,d.relatedTarget=g,I=null,za(c)===f&&(x=new x(h,y+"enter",m,n,c),x.target=g,x.relatedTarget=b,I=x),b=I,p&&m)t:{for(x=bD,h=p,y=m,g=0,I=h;I;I=x(I))g++;I=0;for(var v=y;v;v=x(v))I++;for(;0<g-I;)h=x(h),g--;for(;0<I-g;)y=x(y),I--;for(;g--;){if(h===y||y!==null&&h===y.alternate){x=h;break t}h=x(h),y=x(y)}x=null}else x=null;p!==null&&U0(u,d,p,x,!1),m!==null&&b!==null&&U0(u,b,m,x,!0)}}e:{if(d=f?Tl(f):window,p=d.nodeName&&d.nodeName.toLowerCase(),p==="select"||p==="input"&&d.type==="file")var S=e0;else if($b(d))if(_I)S=RB;else{S=DB;var w=BB}else p=d.nodeName,!p||p.toLowerCase()!=="input"||d.type!=="checkbox"&&d.type!=="radio"?f&&_m(f.elementType)&&(S=e0):S=MB;if(S&&(S=S(t,f))){NI(u,S,n,c);break e}w&&w(t,d,f),t==="focusout"&&f&&d.type==="number"&&f.memoizedProps.value!=null&&Xp(d,"number",d.value)}switch(w=f?Tl(f):window,t){case"focusin":($b(w)||w.contentEditable==="true")&&(ja=w,Yp=f,Rl=null);break;case"focusout":Rl=Yp=ja=null;break;case"mousedown":Jp=!0;break;case"contextmenu":case"mouseup":case"dragend":Jp=!1,o0(u,n,c);break;case"selectionchange":if(FB)break;case"keydown":case"keyup":o0(u,n,c)}var k;if(Hm)e:{switch(t){case"compositionstart":var D="onCompositionStart";break e;case"compositionend":D="onCompositionEnd";break e;case"compositionupdate":D="onCompositionUpdate";break e}D=void 0}else Ua?FI(t,n)&&(D="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(D="onCompositionStart");D&&(EI&&n.locale!=="ko"&&(Ua||D!=="onCompositionStart"?D==="onCompositionEnd"&&Ua&&(k=RI()):(Ur=c,Pm="value"in Ur?Ur.value:Ur.textContent,Ua=!0)),w=Rc(f,D),0<w.length&&(D=new Kb(D,t,null,n,c),u.push({event:D,listeners:w}),k?D.data=k:(k=LI(n),k!==null&&(D.data=k)))),(k=kB?CB(t,n):AB(t,n))&&(D=Rc(f,"onBeforeInput"),0<D.length&&(w=new Kb("onBeforeInput","beforeinput",null,n,c),u.push({event:w,listeners:D}),w.data=k)),gD(u,t,f,n,c)}M1(u,e)})}function $l(t,e,n){return{instance:t,listener:e,currentTarget:n}}function Rc(t,e){for(var n=e+"Capture",r=[];t!==null;){var o=t,a=o.stateNode;if(o=o.tag,o!==5&&o!==26&&o!==27||a===null||(o=Vl(t,n),o!=null&&r.unshift($l(t,o,a)),o=Vl(t,e),o!=null&&r.push($l(t,o,a))),t.tag===3)return r;t=t.return}return[]}function bD(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5&&t.tag!==27);return t||null}function U0(t,e,n,r,o){for(var a=e._reactName,i=[];n!==null&&n!==r;){var l=n,s=l.alternate,f=l.stateNode;if(l=l.tag,s!==null&&s===r)break;l!==5&&l!==26&&l!==27||f===null||(s=f,o?(f=Vl(n,a),f!=null&&i.unshift($l(n,f,s))):o||(f=Vl(n,a),f!=null&&i.push($l(n,f,s)))),n=n.return}i.length!==0&&t.push({event:e,listeners:i})}var ID=/\r\n?/g,vD=/\u0000|\uFFFD/g;function j0(t){return(typeof t=="string"?t:""+t).replace(ID,`
`).replace(vD,"")}function E1(t,e){return e=j0(e),j0(t)===e}function fe(t,e,n,r,o,a){switch(n){case"children":typeof r=="string"?e==="body"||e==="textarea"&&r===""||ai(t,r):(typeof r=="number"||typeof r=="bigint")&&e!=="body"&&ai(t,""+r);break;case"className":Lf(t,"class",r);break;case"tabIndex":Lf(t,"tabindex",r);break;case"dir":case"role":case"viewBox":case"width":case"height":Lf(t,n,r);break;case"style":DI(t,r,a);break;case"data":if(e!=="object"){Lf(t,"data",r);break}case"src":case"href":if(r===""&&(e!=="a"||n!=="href")){t.removeAttribute(n);break}if(r==null||typeof r=="function"||typeof r=="symbol"||typeof r=="boolean"){t.removeAttribute(n);break}r=Yf(""+r),t.setAttribute(n,r);break;case"action":case"formAction":if(typeof r=="function"){t.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof a=="function"&&(n==="formAction"?(e!=="input"&&fe(t,e,"name",o.name,o,null),fe(t,e,"formEncType",o.formEncType,o,null),fe(t,e,"formMethod",o.formMethod,o,null),fe(t,e,"formTarget",o.formTarget,o,null)):(fe(t,e,"encType",o.encType,o,null),fe(t,e,"method",o.method,o,null),fe(t,e,"target",o.target,o,null)));if(r==null||typeof r=="symbol"||typeof r=="boolean"){t.removeAttribute(n);break}r=Yf(""+r),t.setAttribute(n,r);break;case"onClick":r!=null&&(t.onclick=cr);break;case"onScroll":r!=null&&X("scroll",t);break;case"onScrollEnd":r!=null&&X("scrollend",t);break;case"dangerouslySetInnerHTML":if(r!=null){if(typeof r!="object"||!("__html"in r))throw Error(A(61));if(n=r.__html,n!=null){if(o.children!=null)throw Error(A(60));t.innerHTML=n}}break;case"multiple":t.multiple=r&&typeof r!="function"&&typeof r!="symbol";break;case"muted":t.muted=r&&typeof r!="function"&&typeof r!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(r==null||typeof r=="function"||typeof r=="boolean"||typeof r=="symbol"){t.removeAttribute("xlink:href");break}n=Yf(""+r),t.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":r!=null&&typeof r!="function"&&typeof r!="symbol"?t.setAttribute(n,""+r):t.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":r&&typeof r!="function"&&typeof r!="symbol"?t.setAttribute(n,""):t.removeAttribute(n);break;case"capture":case"download":r===!0?t.setAttribute(n,""):r!==!1&&r!=null&&typeof r!="function"&&typeof r!="symbol"?t.setAttribute(n,r):t.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":r!=null&&typeof r!="function"&&typeof r!="symbol"&&!isNaN(r)&&1<=r?t.setAttribute(n,r):t.removeAttribute(n);break;case"rowSpan":case"start":r==null||typeof r=="function"||typeof r=="symbol"||isNaN(r)?t.removeAttribute(n):t.setAttribute(n,r);break;case"popover":X("beforetoggle",t),X("toggle",t),Kf(t,"popover",r);break;case"xlinkActuate":nr(t,"http://www.w3.org/1999/xlink","xlink:actuate",r);break;case"xlinkArcrole":nr(t,"http://www.w3.org/1999/xlink","xlink:arcrole",r);break;case"xlinkRole":nr(t,"http://www.w3.org/1999/xlink","xlink:role",r);break;case"xlinkShow":nr(t,"http://www.w3.org/1999/xlink","xlink:show",r);break;case"xlinkTitle":nr(t,"http://www.w3.org/1999/xlink","xlink:title",r);break;case"xlinkType":nr(t,"http://www.w3.org/1999/xlink","xlink:type",r);break;case"xmlBase":nr(t,"http://www.w3.org/XML/1998/namespace","xml:base",r);break;case"xmlLang":nr(t,"http://www.w3.org/XML/1998/namespace","xml:lang",r);break;case"xmlSpace":nr(t,"http://www.w3.org/XML/1998/namespace","xml:space",r);break;case"is":Kf(t,"is",r);break;case"innerText":case"textContent":break;default:(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(n=JO.get(n)||n,Kf(t,n,r))}}function vm(t,e,n,r,o,a){switch(n){case"style":DI(t,r,a);break;case"dangerouslySetInnerHTML":if(r!=null){if(typeof r!="object"||!("__html"in r))throw Error(A(61));if(n=r.__html,n!=null){if(o.children!=null)throw Error(A(60));t.innerHTML=n}}break;case"children":typeof r=="string"?ai(t,r):(typeof r=="number"||typeof r=="bigint")&&ai(t,""+r);break;case"onScroll":r!=null&&X("scroll",t);break;case"onScrollEnd":r!=null&&X("scrollend",t);break;case"onClick":r!=null&&(t.onclick=cr);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!kI.hasOwnProperty(n))e:{if(n[0]==="o"&&n[1]==="n"&&(o=n.endsWith("Capture"),e=n.slice(2,o?n.length-7:void 0),a=t[At]||null,a=a!=null?a[n]:null,typeof a=="function"&&t.removeEventListener(e,a,o),typeof r=="function")){typeof a!="function"&&a!==null&&(n in t?t[n]=null:t.hasAttribute(n)&&t.removeAttribute(n)),t.addEventListener(e,r,o);break e}n in t?t[n]=r:r===!0?t.setAttribute(n,""):Kf(t,n,r)}}}function rt(t,e,n){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":X("error",t),X("load",t);var r=!1,o=!1,a;for(a in n)if(n.hasOwnProperty(a)){var i=n[a];if(i!=null)switch(a){case"src":r=!0;break;case"srcSet":o=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(A(137,e));default:fe(t,e,a,i,n,null)}}o&&fe(t,e,"srcSet",n.srcSet,n,null),r&&fe(t,e,"src",n.src,n,null);return;case"input":X("invalid",t);var l=a=i=o=null,s=null,f=null;for(r in n)if(n.hasOwnProperty(r)){var c=n[r];if(c!=null)switch(r){case"name":o=c;break;case"type":i=c;break;case"checked":s=c;break;case"defaultChecked":f=c;break;case"value":a=c;break;case"defaultValue":l=c;break;case"children":case"dangerouslySetInnerHTML":if(c!=null)throw Error(A(137,e));break;default:fe(t,e,r,c,n,null)}}TI(t,a,l,s,f,i,o,!1);return;case"select":X("invalid",t),r=i=a=null;for(o in n)if(n.hasOwnProperty(o)&&(l=n[o],l!=null))switch(o){case"value":a=l;break;case"defaultValue":i=l;break;case"multiple":r=l;default:fe(t,e,o,l,n,null)}e=a,n=i,t.multiple=!!r,e!=null?Ja(t,!!r,e,!1):n!=null&&Ja(t,!!r,n,!0);return;case"textarea":X("invalid",t),a=o=r=null;for(i in n)if(n.hasOwnProperty(i)&&(l=n[i],l!=null))switch(i){case"value":r=l;break;case"defaultValue":o=l;break;case"children":a=l;break;case"dangerouslySetInnerHTML":if(l!=null)throw Error(A(91));break;default:fe(t,e,i,l,n,null)}BI(t,r,o,a);return;case"option":for(s in n)n.hasOwnProperty(s)&&(r=n[s],r!=null)&&(s==="selected"?t.selected=r&&typeof r!="function"&&typeof r!="symbol":fe(t,e,s,r,n,null));return;case"dialog":X("beforetoggle",t),X("toggle",t),X("cancel",t),X("close",t);break;case"iframe":case"object":X("load",t);break;case"video":case"audio":for(r=0;r<Zl.length;r++)X(Zl[r],t);break;case"image":X("error",t),X("load",t);break;case"details":X("toggle",t);break;case"embed":case"source":case"link":X("error",t),X("load",t);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(f in n)if(n.hasOwnProperty(f)&&(r=n[f],r!=null))switch(f){case"children":case"dangerouslySetInnerHTML":throw Error(A(137,e));default:fe(t,e,f,r,n,null)}return;default:if(_m(e)){for(c in n)n.hasOwnProperty(c)&&(r=n[c],r!==void 0&&vm(t,e,c,r,n,void 0));return}}for(l in n)n.hasOwnProperty(l)&&(r=n[l],r!=null&&fe(t,e,l,r,n,null))}function wD(t,e,n,r){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var o=null,a=null,i=null,l=null,s=null,f=null,c=null;for(p in n){var u=n[p];if(n.hasOwnProperty(p)&&u!=null)switch(p){case"checked":break;case"value":break;case"defaultValue":s=u;default:r.hasOwnProperty(p)||fe(t,e,p,null,r,u)}}for(var d in r){var p=r[d];if(u=n[d],r.hasOwnProperty(d)&&(p!=null||u!=null))switch(d){case"type":a=p;break;case"name":o=p;break;case"checked":f=p;break;case"defaultChecked":c=p;break;case"value":i=p;break;case"defaultValue":l=p;break;case"children":case"dangerouslySetInnerHTML":if(p!=null)throw Error(A(137,e));break;default:p!==u&&fe(t,e,d,p,r,u)}}Wp(t,i,l,s,f,c,a,o);return;case"select":p=i=l=d=null;for(a in n)if(s=n[a],n.hasOwnProperty(a)&&s!=null)switch(a){case"value":break;case"multiple":p=s;default:r.hasOwnProperty(a)||fe(t,e,a,null,r,s)}for(o in r)if(a=r[o],s=n[o],r.hasOwnProperty(o)&&(a!=null||s!=null))switch(o){case"value":d=a;break;case"defaultValue":l=a;break;case"multiple":i=a;default:a!==s&&fe(t,e,o,a,r,s)}e=l,n=i,r=p,d!=null?Ja(t,!!n,d,!1):!!r!=!!n&&(e!=null?Ja(t,!!n,e,!0):Ja(t,!!n,n?[]:"",!1));return;case"textarea":p=d=null;for(l in n)if(o=n[l],n.hasOwnProperty(l)&&o!=null&&!r.hasOwnProperty(l))switch(l){case"value":break;case"children":break;default:fe(t,e,l,null,r,o)}for(i in r)if(o=r[i],a=n[i],r.hasOwnProperty(i)&&(o!=null||a!=null))switch(i){case"value":d=o;break;case"defaultValue":p=o;break;case"children":break;case"dangerouslySetInnerHTML":if(o!=null)throw Error(A(91));break;default:o!==a&&fe(t,e,i,o,r,a)}OI(t,d,p);return;case"option":for(var m in n)d=n[m],n.hasOwnProperty(m)&&d!=null&&!r.hasOwnProperty(m)&&(m==="selected"?t.selected=!1:fe(t,e,m,null,r,d));for(s in r)d=r[s],p=n[s],r.hasOwnProperty(s)&&d!==p&&(d!=null||p!=null)&&(s==="selected"?t.selected=d&&typeof d!="function"&&typeof d!="symbol":fe(t,e,s,d,r,p));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var x in n)d=n[x],n.hasOwnProperty(x)&&d!=null&&!r.hasOwnProperty(x)&&fe(t,e,x,null,r,d);for(f in r)if(d=r[f],p=n[f],r.hasOwnProperty(f)&&d!==p&&(d!=null||p!=null))switch(f){case"children":case"dangerouslySetInnerHTML":if(d!=null)throw Error(A(137,e));break;default:fe(t,e,f,d,r,p)}return;default:if(_m(e)){for(var b in n)d=n[b],n.hasOwnProperty(b)&&d!==void 0&&!r.hasOwnProperty(b)&&vm(t,e,b,void 0,r,d);for(c in r)d=r[c],p=n[c],!r.hasOwnProperty(c)||d===p||d===void 0&&p===void 0||vm(t,e,c,d,r,p);return}}for(var h in n)d=n[h],n.hasOwnProperty(h)&&d!=null&&!r.hasOwnProperty(h)&&fe(t,e,h,null,r,d);for(u in r)d=r[u],p=n[u],!r.hasOwnProperty(u)||d===p||d==null&&p==null||fe(t,e,u,d,r,p)}function V0(t){switch(t){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function SD(){if(typeof performance.getEntriesByType=="function"){for(var t=0,e=0,n=performance.getEntriesByType("resource"),r=0;r<n.length;r++){var o=n[r],a=o.transferSize,i=o.initiatorType,l=o.duration;if(a&&l&&V0(i)){for(i=0,l=o.responseEnd,r+=1;r<n.length;r++){var s=n[r],f=s.startTime;if(f>l)break;var c=s.transferSize,u=s.initiatorType;c&&V0(u)&&(s=s.responseEnd,i+=c*(s<l?1:(l-f)/(s-f)))}if(--r,e+=8*(a+i)/(o.duration/1e3),t++,10<t)break}}if(0<t)return e/t/1e6}return navigator.connection&&(t=navigator.connection.downlink,typeof t=="number")?t:5}var wm=null,Sm=null;function Ec(t){return t.nodeType===9?t:t.ownerDocument}function G0(t){switch(t){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function F1(t,e){if(t===0)switch(e){case"svg":return 1;case"math":return 2;default:return 0}return t===1&&e==="foreignObject"?0:t}function km(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.children=="bigint"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var Fp=null;function kD(){var t=window.event;return t&&t.type==="popstate"?t===Fp?!1:(Fp=t,!0):(Fp=null,!1)}var L1=typeof setTimeout=="function"?setTimeout:void 0,CD=typeof clearTimeout=="function"?clearTimeout:void 0,W0=typeof Promise=="function"?Promise:void 0,AD=typeof queueMicrotask=="function"?queueMicrotask:typeof W0<"u"?function(t){return W0.resolve(null).then(t).catch(TD)}:L1;function TD(t){setTimeout(function(){throw t})}function io(t){return t==="head"}function X0(t,e){var n=e,r=0;do{var o=n.nextSibling;if(t.removeChild(n),o&&o.nodeType===8)if(n=o.data,n==="/$"||n==="/&"){if(r===0){t.removeChild(o),pi(e);return}r--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")r++;else if(n==="html")Ul(t.ownerDocument.documentElement);else if(n==="head"){n=t.ownerDocument.head,Ul(n);for(var a=n.firstChild;a;){var i=a.nextSibling,l=a.nodeName;a[ls]||l==="SCRIPT"||l==="STYLE"||l==="LINK"&&a.rel.toLowerCase()==="stylesheet"||n.removeChild(a),a=i}}else n==="body"&&Ul(t.ownerDocument.body);n=o}while(n);pi(e)}function Q0(t,e){var n=t;t=0;do{var r=n.nextSibling;if(n.nodeType===1?e?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(e?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),r&&r.nodeType===8)if(n=r.data,n==="/$"){if(t===0)break;t--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||t++;n=r}while(n)}function Cm(t){var e=t.firstChild;for(e&&e.nodeType===10&&(e=e.nextSibling);e;){var n=e;switch(e=e.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":Cm(n),Nm(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}t.removeChild(n)}}function OD(t,e,n,r){for(;t.nodeType===1;){var o=n;if(t.nodeName.toLowerCase()!==e.toLowerCase()){if(!r&&(t.nodeName!=="INPUT"||t.type!=="hidden"))break}else if(r){if(!t[ls])switch(e){case"meta":if(!t.hasAttribute("itemprop"))break;return t;case"link":if(a=t.getAttribute("rel"),a==="stylesheet"&&t.hasAttribute("data-precedence"))break;if(a!==o.rel||t.getAttribute("href")!==(o.href==null||o.href===""?null:o.href)||t.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin)||t.getAttribute("title")!==(o.title==null?null:o.title))break;return t;case"style":if(t.hasAttribute("data-precedence"))break;return t;case"script":if(a=t.getAttribute("src"),(a!==(o.src==null?null:o.src)||t.getAttribute("type")!==(o.type==null?null:o.type)||t.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin))&&a&&t.hasAttribute("async")&&!t.hasAttribute("itemprop"))break;return t;default:return t}}else if(e==="input"&&t.type==="hidden"){var a=o.name==null?null:""+o.name;if(o.type==="hidden"&&t.getAttribute("name")===a)return t}else return t;if(t=sn(t.nextSibling),t===null)break}return null}function BD(t,e,n){if(e==="")return null;for(;t.nodeType!==3;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!n||(t=sn(t.nextSibling),t===null))return null;return t}function N1(t,e){for(;t.nodeType!==8;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!e||(t=sn(t.nextSibling),t===null))return null;return t}function Am(t){return t.data==="$?"||t.data==="$~"}function Tm(t){return t.data==="$!"||t.data==="$?"&&t.ownerDocument.readyState!=="loading"}function DD(t,e){var n=t.ownerDocument;if(t.data==="$~")t._reactRetry=e;else if(t.data!=="$?"||n.readyState!=="loading")e();else{var r=function(){e(),n.removeEventListener("DOMContentLoaded",r)};n.addEventListener("DOMContentLoaded",r),t._reactRetry=r}}function sn(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?"||e==="$~"||e==="&"||e==="F!"||e==="F")break;if(e==="/$"||e==="/&")return null}}return t}var Om=null;function K0(t){t=t.nextSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"||n==="/&"){if(e===0)return sn(t.nextSibling);e--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||e++}t=t.nextSibling}return null}function Y0(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(e===0)return t;e--}else n!=="/$"&&n!=="/&"||e++}t=t.previousSibling}return null}function _1(t,e,n){switch(e=Ec(n),t){case"html":if(t=e.documentElement,!t)throw Error(A(452));return t;case"head":if(t=e.head,!t)throw Error(A(453));return t;case"body":if(t=e.body,!t)throw Error(A(454));return t;default:throw Error(A(451))}}function Ul(t){for(var e=t.attributes;e.length;)t.removeAttributeNode(e[0]);Nm(t)}var fn=new Map,J0=new Set;function Fc(t){return typeof t.getRootNode=="function"?t.getRootNode():t.nodeType===9?t:t.ownerDocument}var Ir=re.d;re.d={f:MD,r:RD,D:ED,C:FD,L:LD,m:ND,X:qD,S:_D,M:PD};function MD(){var t=Ir.f(),e=Jc();return t||e}function RD(t){var e=hi(t);e!==null&&e.tag===5&&e.type==="form"?Dv(e):Ir.r(t)}var bi=typeof document>"u"?null:document;function q1(t,e,n){var r=bi;if(r&&typeof e=="string"&&e){var o=rn(e);o='link[rel="'+t+'"][href="'+o+'"]',typeof n=="string"&&(o+='[crossorigin="'+n+'"]'),J0.has(o)||(J0.add(o),t={rel:t,crossOrigin:n,href:e},r.querySelector(o)===null&&(e=r.createElement("link"),rt(e,"link",t),We(e),r.head.appendChild(e)))}}function ED(t){Ir.D(t),q1("dns-prefetch",t,null)}function FD(t,e){Ir.C(t,e),q1("preconnect",t,e)}function LD(t,e,n){Ir.L(t,e,n);var r=bi;if(r&&t&&e){var o='link[rel="preload"][as="'+rn(e)+'"]';e==="image"&&n&&n.imageSrcSet?(o+='[imagesrcset="'+rn(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(o+='[imagesizes="'+rn(n.imageSizes)+'"]')):o+='[href="'+rn(t)+'"]';var a=o;switch(e){case"style":a=di(t);break;case"script":a=Ii(t)}fn.has(a)||(t=we({rel:"preload",href:e==="image"&&n&&n.imageSrcSet?void 0:t,as:e},n),fn.set(a,t),r.querySelector(o)!==null||e==="style"&&r.querySelector(ps(a))||e==="script"&&r.querySelector(ms(a))||(e=r.createElement("link"),rt(e,"link",t),We(e),r.head.appendChild(e)))}}function ND(t,e){Ir.m(t,e);var n=bi;if(n&&t){var r=e&&typeof e.as=="string"?e.as:"script",o='link[rel="modulepreload"][as="'+rn(r)+'"][href="'+rn(t)+'"]',a=o;switch(r){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":a=Ii(t)}if(!fn.has(a)&&(t=we({rel:"modulepreload",href:t},e),fn.set(a,t),n.querySelector(o)===null)){switch(r){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(ms(a)))return}r=n.createElement("link"),rt(r,"link",t),We(r),n.head.appendChild(r)}}}function _D(t,e,n){Ir.S(t,e,n);var r=bi;if(r&&t){var o=Ya(r).hoistableStyles,a=di(t);e=e||"default";var i=o.get(a);if(!i){var l={loading:0,preload:null};if(i=r.querySelector(ps(a)))l.loading=5;else{t=we({rel:"stylesheet",href:t,"data-precedence":e},n),(n=fn.get(a))&&vh(t,n);var s=i=r.createElement("link");We(s),rt(s,"link",t),s._p=new Promise(function(f,c){s.onload=f,s.onerror=c}),s.addEventListener("load",function(){l.loading|=1}),s.addEventListener("error",function(){l.loading|=2}),l.loading|=4,ic(i,e,r)}i={type:"stylesheet",instance:i,count:1,state:l},o.set(a,i)}}}function qD(t,e){Ir.X(t,e);var n=bi;if(n&&t){var r=Ya(n).hoistableScripts,o=Ii(t),a=r.get(o);a||(a=n.querySelector(ms(o)),a||(t=we({src:t,async:!0},e),(e=fn.get(o))&&wh(t,e),a=n.createElement("script"),We(a),rt(a,"link",t),n.head.appendChild(a)),a={type:"script",instance:a,count:1,state:null},r.set(o,a))}}function PD(t,e){Ir.M(t,e);var n=bi;if(n&&t){var r=Ya(n).hoistableScripts,o=Ii(t),a=r.get(o);a||(a=n.querySelector(ms(o)),a||(t=we({src:t,async:!0,type:"module"},e),(e=fn.get(o))&&wh(t,e),a=n.createElement("script"),We(a),rt(a,"link",t),n.head.appendChild(a)),a={type:"script",instance:a,count:1,state:null},r.set(o,a))}}function Z0(t,e,n,r){var o=(o=Wr.current)?Fc(o):null;if(!o)throw Error(A(446));switch(t){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(e=di(n.href),n=Ya(o).hoistableStyles,r=n.get(e),r||(r={type:"style",instance:null,count:0,state:null},n.set(e,r)),r):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){t=di(n.href);var a=Ya(o).hoistableStyles,i=a.get(t);if(i||(o=o.ownerDocument||o,i={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},a.set(t,i),(a=o.querySelector(ps(t)))&&!a._p&&(i.instance=a,i.state.loading=5),fn.has(t)||(n={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},fn.set(t,n),a||zD(o,t,n,i.state))),e&&r===null)throw Error(A(528,""));return i}if(e&&r!==null)throw Error(A(529,""));return null;case"script":return e=n.async,n=n.src,typeof n=="string"&&e&&typeof e!="function"&&typeof e!="symbol"?(e=Ii(n),n=Ya(o).hoistableScripts,r=n.get(e),r||(r={type:"script",instance:null,count:0,state:null},n.set(e,r)),r):{type:"void",instance:null,count:0,state:null};default:throw Error(A(444,t))}}function di(t){return'href="'+rn(t)+'"'}function ps(t){return'link[rel="stylesheet"]['+t+"]"}function P1(t){return we({},t,{"data-precedence":t.precedence,precedence:null})}function zD(t,e,n,r){t.querySelector('link[rel="preload"][as="style"]['+e+"]")?r.loading=1:(e=t.createElement("link"),r.preload=e,e.addEventListener("load",function(){return r.loading|=1}),e.addEventListener("error",function(){return r.loading|=2}),rt(e,"link",n),We(e),t.head.appendChild(e))}function Ii(t){return'[src="'+rn(t)+'"]'}function ms(t){return"script[async]"+t}function $0(t,e,n){if(e.count++,e.instance===null)switch(e.type){case"style":var r=t.querySelector('style[data-href~="'+rn(n.href)+'"]');if(r)return e.instance=r,We(r),r;var o=we({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return r=(t.ownerDocument||t).createElement("style"),We(r),rt(r,"style",o),ic(r,n.precedence,t),e.instance=r;case"stylesheet":o=di(n.href);var a=t.querySelector(ps(o));if(a)return e.state.loading|=4,e.instance=a,We(a),a;r=P1(n),(o=fn.get(o))&&vh(r,o),a=(t.ownerDocument||t).createElement("link"),We(a);var i=a;return i._p=new Promise(function(l,s){i.onload=l,i.onerror=s}),rt(a,"link",r),e.state.loading|=4,ic(a,n.precedence,t),e.instance=a;case"script":return a=Ii(n.src),(o=t.querySelector(ms(a)))?(e.instance=o,We(o),o):(r=n,(o=fn.get(a))&&(r=we({},n),wh(r,o)),t=t.ownerDocument||t,o=t.createElement("script"),We(o),rt(o,"link",r),t.head.appendChild(o),e.instance=o);case"void":return null;default:throw Error(A(443,e.type))}else e.type==="stylesheet"&&(e.state.loading&4)===0&&(r=e.instance,e.state.loading|=4,ic(r,n.precedence,t));return e.instance}function ic(t,e,n){for(var r=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),o=r.length?r[r.length-1]:null,a=o,i=0;i<r.length;i++){var l=r[i];if(l.dataset.precedence===e)a=l;else if(a!==o)break}a?a.parentNode.insertBefore(t,a.nextSibling):(e=n.nodeType===9?n.head:n,e.insertBefore(t,e.firstChild))}function vh(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.title==null&&(t.title=e.title)}function wh(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.integrity==null&&(t.integrity=e.integrity)}var lc=null;function eI(t,e,n){if(lc===null){var r=new Map,o=lc=new Map;o.set(n,r)}else o=lc,r=o.get(n),r||(r=new Map,o.set(n,r));if(r.has(t))return r;for(r.set(t,null),n=n.getElementsByTagName(t),o=0;o<n.length;o++){var a=n[o];if(!(a[ls]||a[et]||t==="link"&&a.getAttribute("rel")==="stylesheet")&&a.namespaceURI!=="http://www.w3.org/2000/svg"){var i=a.getAttribute(e)||"";i=t+i;var l=r.get(i);l?l.push(a):r.set(i,[a])}}return r}function tI(t,e,n){t=t.ownerDocument||t,t.head.insertBefore(n,e==="title"?t.querySelector("head > title"):null)}function HD(t,e,n){if(n===1||e.itemProp!=null)return!1;switch(t){case"meta":case"title":return!0;case"style":if(typeof e.precedence!="string"||typeof e.href!="string"||e.href==="")break;return!0;case"link":if(typeof e.rel!="string"||typeof e.href!="string"||e.href===""||e.onLoad||e.onError)break;return e.rel==="stylesheet"?(t=e.disabled,typeof e.precedence=="string"&&t==null):!0;case"script":if(e.async&&typeof e.async!="function"&&typeof e.async!="symbol"&&!e.onLoad&&!e.onError&&e.src&&typeof e.src=="string")return!0}return!1}function z1(t){return!(t.type==="stylesheet"&&(t.state.loading&3)===0)}function UD(t,e,n,r){if(n.type==="stylesheet"&&(typeof r.media!="string"||matchMedia(r.media).matches!==!1)&&(n.state.loading&4)===0){if(n.instance===null){var o=di(r.href),a=e.querySelector(ps(o));if(a){e=a._p,e!==null&&typeof e=="object"&&typeof e.then=="function"&&(t.count++,t=Lc.bind(t),e.then(t,t)),n.state.loading|=4,n.instance=a,We(a);return}a=e.ownerDocument||e,r=P1(r),(o=fn.get(o))&&vh(r,o),a=a.createElement("link"),We(a);var i=a;i._p=new Promise(function(l,s){i.onload=l,i.onerror=s}),rt(a,"link",r),n.instance=a}t.stylesheets===null&&(t.stylesheets=new Map),t.stylesheets.set(n,e),(e=n.state.preload)&&(n.state.loading&3)===0&&(t.count++,n=Lc.bind(t),e.addEventListener("load",n),e.addEventListener("error",n))}}var Lp=0;function jD(t,e){return t.stylesheets&&t.count===0&&sc(t,t.stylesheets),0<t.count||0<t.imgCount?function(n){var r=setTimeout(function(){if(t.stylesheets&&sc(t,t.stylesheets),t.unsuspend){var a=t.unsuspend;t.unsuspend=null,a()}},6e4+e);0<t.imgBytes&&Lp===0&&(Lp=62500*SD());var o=setTimeout(function(){if(t.waitingForImages=!1,t.count===0&&(t.stylesheets&&sc(t,t.stylesheets),t.unsuspend)){var a=t.unsuspend;t.unsuspend=null,a()}},(t.imgBytes>Lp?50:800)+e);return t.unsuspend=n,function(){t.unsuspend=null,clearTimeout(r),clearTimeout(o)}}:null}function Lc(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)sc(this,this.stylesheets);else if(this.unsuspend){var t=this.unsuspend;this.unsuspend=null,t()}}}var Nc=null;function sc(t,e){t.stylesheets=null,t.unsuspend!==null&&(t.count++,Nc=new Map,e.forEach(VD,t),Nc=null,Lc.call(t))}function VD(t,e){if(!(e.state.loading&4)){var n=Nc.get(t);if(n)var r=n.get(null);else{n=new Map,Nc.set(t,n);for(var o=t.querySelectorAll("link[data-precedence],style[data-precedence]"),a=0;a<o.length;a++){var i=o[a];(i.nodeName==="LINK"||i.getAttribute("media")!=="not all")&&(n.set(i.dataset.precedence,i),r=i)}r&&n.set(null,r)}o=e.instance,i=o.getAttribute("data-precedence"),a=n.get(i)||r,a===r&&n.set(null,o),n.set(i,o),this.count++,r=Lc.bind(this),o.addEventListener("load",r),o.addEventListener("error",r),a?a.parentNode.insertBefore(o,a.nextSibling):(t=t.nodeType===9?t.head:t,t.insertBefore(o,t.firstChild)),e.state.loading|=4}}var es={$$typeof:fr,Provider:null,Consumer:null,_currentValue:Fo,_currentValue2:Fo,_threadCount:0};function GD(t,e,n,r,o,a,i,l,s){this.tag=1,this.containerInfo=t,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=lp(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=lp(0),this.hiddenUpdates=lp(null),this.identifierPrefix=r,this.onUncaughtError=o,this.onCaughtError=a,this.onRecoverableError=i,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=s,this.incompleteTransitions=new Map}function H1(t,e,n,r,o,a,i,l,s,f,c,u){return t=new GD(t,e,n,i,s,f,c,u,l),e=1,a===!0&&(e|=24),a=Nt(3,null,null,e),t.current=a,a.stateNode=t,e=Qm(),e.refCount++,t.pooledCache=e,e.refCount++,a.memoizedState={element:r,isDehydrated:n,cache:e},Jm(a),t}function U1(t){return t?(t=Wa,t):Wa}function j1(t,e,n,r,o,a){o=U1(o),r.context===null?r.context=o:r.pendingContext=o,r=Qr(e),r.payload={element:n},a=a===void 0?null:a,a!==null&&(r.callback=a),n=Kr(t,r,e),n!==null&&(Ct(n,t,e),Fl(n,t,e))}function nI(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function Sh(t,e){nI(t,e),(t=t.alternate)&&nI(t,e)}function V1(t){if(t.tag===13||t.tag===31){var e=Xo(t,67108864);e!==null&&Ct(e,t,67108864),Sh(t,67108864)}}function rI(t){if(t.tag===13||t.tag===31){var e=Ht();e=Fm(e);var n=Xo(t,e);n!==null&&Ct(n,t,e),Sh(t,e)}}var _c=!0;function WD(t,e,n,r){var o=H.T;H.T=null;var a=re.p;try{re.p=2,kh(t,e,n,r)}finally{re.p=a,H.T=o}}function XD(t,e,n,r){var o=H.T;H.T=null;var a=re.p;try{re.p=8,kh(t,e,n,r)}finally{re.p=a,H.T=o}}function kh(t,e,n,r){if(_c){var o=Bm(r);if(o===null)Ep(t,e,r,qc,n),oI(t,r);else if(KD(o,t,e,n,r))r.stopPropagation();else if(oI(t,r),e&4&&-1<QD.indexOf(t)){for(;o!==null;){var a=hi(o);if(a!==null)switch(a.tag){case 3:if(a=a.stateNode,a.current.memoizedState.isDehydrated){var i=Mo(a.pendingLanes);if(i!==0){var l=a;for(l.pendingLanes|=2,l.entangledLanes|=2;i;){var s=1<<31-zt(i);l.entanglements[1]|=s,i&=~s}Vn(a),(ne&6)===0&&(Tc=qt()+500,ds(0,!1))}}break;case 31:case 13:l=Xo(a,2),l!==null&&Ct(l,a,2),Jc(),Sh(a,2)}if(a=Bm(r),a===null&&Ep(t,e,r,qc,n),a===o)break;o=a}o!==null&&r.stopPropagation()}else Ep(t,e,r,null,n)}}function Bm(t){return t=qm(t),Ch(t)}var qc=null;function Ch(t){if(qc=null,t=za(t),t!==null){var e=rs(t);if(e===null)t=null;else{var n=e.tag;if(n===13){if(t=cI(e),t!==null)return t;t=null}else if(n===31){if(t=uI(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null)}}return qc=t,null}function G1(t){switch(t){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(LO()){case hI:return 2;case xI:return 8;case pc:case NO:return 32;case gI:return 268435456;default:return 32}default:return 32}}var Dm=!1,Zr=null,$r=null,eo=null,ts=new Map,ns=new Map,zr=[],QD="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function oI(t,e){switch(t){case"focusin":case"focusout":Zr=null;break;case"dragenter":case"dragleave":$r=null;break;case"mouseover":case"mouseout":eo=null;break;case"pointerover":case"pointerout":ts.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":ns.delete(e.pointerId)}}function Sl(t,e,n,r,o,a){return t===null||t.nativeEvent!==a?(t={blockedOn:e,domEventName:n,eventSystemFlags:r,nativeEvent:a,targetContainers:[o]},e!==null&&(e=hi(e),e!==null&&V1(e)),t):(t.eventSystemFlags|=r,e=t.targetContainers,o!==null&&e.indexOf(o)===-1&&e.push(o),t)}function KD(t,e,n,r,o){switch(e){case"focusin":return Zr=Sl(Zr,t,e,n,r,o),!0;case"dragenter":return $r=Sl($r,t,e,n,r,o),!0;case"mouseover":return eo=Sl(eo,t,e,n,r,o),!0;case"pointerover":var a=o.pointerId;return ts.set(a,Sl(ts.get(a)||null,t,e,n,r,o)),!0;case"gotpointercapture":return a=o.pointerId,ns.set(a,Sl(ns.get(a)||null,t,e,n,r,o)),!0}return!1}function W1(t){var e=za(t.target);if(e!==null){var n=rs(e);if(n!==null){if(e=n.tag,e===13){if(e=cI(n),e!==null){t.blockedOn=e,Hb(t.priority,function(){rI(n)});return}}else if(e===31){if(e=uI(n),e!==null){t.blockedOn=e,Hb(t.priority,function(){rI(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function fc(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=Bm(t.nativeEvent);if(n===null){n=t.nativeEvent;var r=new n.constructor(n.type,n);Qp=r,n.target.dispatchEvent(r),Qp=null}else return e=hi(n),e!==null&&V1(e),t.blockedOn=n,!1;e.shift()}return!0}function aI(t,e,n){fc(t)&&n.delete(e)}function YD(){Dm=!1,Zr!==null&&fc(Zr)&&(Zr=null),$r!==null&&fc($r)&&($r=null),eo!==null&&fc(eo)&&(eo=null),ts.forEach(aI),ns.forEach(aI)}function Xf(t,e){t.blockedOn===e&&(t.blockedOn=null,Dm||(Dm=!0,je.unstable_scheduleCallback(je.unstable_NormalPriority,YD)))}var Qf=null;function iI(t){Qf!==t&&(Qf=t,je.unstable_scheduleCallback(je.unstable_NormalPriority,function(){Qf===t&&(Qf=null);for(var e=0;e<t.length;e+=3){var n=t[e],r=t[e+1],o=t[e+2];if(typeof r!="function"){if(Ch(r||n)===null)continue;break}var a=hi(n);a!==null&&(t.splice(e,3),e-=3,cm(a,{pending:!0,data:o,method:n.method,action:r},r,o))}}))}function pi(t){function e(s){return Xf(s,t)}Zr!==null&&Xf(Zr,t),$r!==null&&Xf($r,t),eo!==null&&Xf(eo,t),ts.forEach(e),ns.forEach(e);for(var n=0;n<zr.length;n++){var r=zr[n];r.blockedOn===t&&(r.blockedOn=null)}for(;0<zr.length&&(n=zr[0],n.blockedOn===null);)W1(n),n.blockedOn===null&&zr.shift();if(n=(t.ownerDocument||t).$$reactFormReplay,n!=null)for(r=0;r<n.length;r+=3){var o=n[r],a=n[r+1],i=o[At]||null;if(typeof a=="function")i||iI(n);else if(i){var l=null;if(a&&a.hasAttribute("formAction")){if(o=a,i=a[At]||null)l=i.formAction;else if(Ch(o)!==null)continue}else l=i.action;typeof l=="function"?n[r+1]=l:(n.splice(r,3),r-=3),iI(n)}}}function X1(){function t(a){a.canIntercept&&a.info==="react-transition"&&a.intercept({handler:function(){return new Promise(function(i){return o=i})},focusReset:"manual",scroll:"manual"})}function e(){o!==null&&(o(),o=null),r||setTimeout(n,20)}function n(){if(!r&&!navigation.transition){var a=navigation.currentEntry;a&&a.url!=null&&navigation.navigate(a.url,{state:a.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var r=!1,o=null;return navigation.addEventListener("navigate",t),navigation.addEventListener("navigatesuccess",e),navigation.addEventListener("navigateerror",e),setTimeout(n,100),function(){r=!0,navigation.removeEventListener("navigate",t),navigation.removeEventListener("navigatesuccess",e),navigation.removeEventListener("navigateerror",e),o!==null&&(o(),o=null)}}}function Ah(t){this._internalRoot=t}eu.prototype.render=Ah.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(A(409));var n=e.current,r=Ht();j1(n,r,t,e,null,null)};eu.prototype.unmount=Ah.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;j1(t.current,2,null,t,null,null),Jc(),e[mi]=null}};function eu(t){this._internalRoot=t}eu.prototype.unstable_scheduleHydration=function(t){if(t){var e=wI();t={blockedOn:null,target:t,priority:e};for(var n=0;n<zr.length&&e!==0&&e<zr[n].priority;n++);zr.splice(n,0,t),n===0&&W1(t)}};var lI=sI.version;if(lI!=="19.2.6")throw Error(A(527,lI,"19.2.6"));re.findDOMNode=function(t){var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(A(188)):(t=Object.keys(t).join(","),Error(A(268,t)));return t=OO(e),t=t!==null?dI(t):null,t=t===null?null:t.stateNode,t};var JD={bundleType:0,version:"19.2.6",rendererPackageName:"react-dom",currentDispatcherRef:H,reconcilerVersion:"19.2.6"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(kl=__REACT_DEVTOOLS_GLOBAL_HOOK__,!kl.isDisabled&&kl.supportsFiber))try{os=kl.inject(JD),Pt=kl}catch{}var kl;tu.createRoot=function(t,e){if(!fI(t))throw Error(A(299));var n=!1,r="",o=qv,a=Pv,i=zv;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(r=e.identifierPrefix),e.onUncaughtError!==void 0&&(o=e.onUncaughtError),e.onCaughtError!==void 0&&(a=e.onCaughtError),e.onRecoverableError!==void 0&&(i=e.onRecoverableError)),e=H1(t,1,!1,null,null,n,r,null,o,a,i,X1),t[mi]=e.current,Ih(t),new Ah(e)};tu.hydrateRoot=function(t,e,n){if(!fI(t))throw Error(A(299));var r=!1,o="",a=qv,i=Pv,l=zv,s=null;return n!=null&&(n.unstable_strictMode===!0&&(r=!0),n.identifierPrefix!==void 0&&(o=n.identifierPrefix),n.onUncaughtError!==void 0&&(a=n.onUncaughtError),n.onCaughtError!==void 0&&(i=n.onCaughtError),n.onRecoverableError!==void 0&&(l=n.onRecoverableError),n.formState!==void 0&&(s=n.formState)),e=H1(t,1,!0,e,n??null,r,o,s,a,i,l,X1),e.context=U1(null),n=e.current,r=Ht(),r=Fm(r),o=Qr(r),o.callback=null,Kr(n,o,r),n=r,e.current.lanes=n,is(e,n),Vn(e),t[mi]=e.current,Ih(t),new eu(e)};tu.version="19.2.6"});var J1=In((L3,Y1)=>{"use strict";function K1(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(K1)}catch(t){console.error(t)}}K1(),Y1.exports=Q1()});var Z1,$1=F(()=>{Z1={outline:{xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"},filled:{xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"currentColor",stroke:"none"}}});var vi,Ce,Vt=F(()=>{vi=$(ct(),1);$1();Ce=(t,e,n,r)=>{let o=(0,vi.forwardRef)(({color:a="currentColor",size:i=24,stroke:l=2,title:s,className:f,children:c,...u},d)=>(0,vi.createElement)("svg",{ref:d,...Z1[t],width:i,height:i,className:["tabler-icon",`tabler-icon-${e}`,f].join(" "),...t==="filled"?{fill:a}:{strokeWidth:l,stroke:a},...u},[s&&(0,vi.createElement)("title",{key:"svg-title"},s),...r.map(([p,m])=>(0,vi.createElement)(p,m)),...Array.isArray(c)?c:[c]]));return o.displayName=`${n}`,o}});var ZD,nu,ew=F(()=>{Vt();ZD=[["path",{d:"M12 9v4",key:"svg-0"}],["path",{d:"M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0",key:"svg-1"}],["path",{d:"M12 16h.01",key:"svg-2"}]],nu=Ce("outline","alert-triangle","AlertTriangle",ZD)});var $D,hs,tw=F(()=>{Vt();$D=[["path",{d:"M6 9l6 6l6 -6",key:"svg-0"}]],hs=Ce("outline","chevron-down","ChevronDown",$D)});var eM,Th,nw=F(()=>{Vt();eM=[["path",{d:"M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2",key:"svg-0"}],["path",{d:"M10 14a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",key:"svg-1"}],["path",{d:"M14 4l0 4l-6 0l0 -4",key:"svg-2"}]],Th=Ce("outline","device-floppy","DeviceFloppy",eM)});var tM,Oh,rw=F(()=>{Vt();tM=[["path",{d:"M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0",key:"svg-0"}],["path",{d:"M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6",key:"svg-1"}]],Oh=Ce("outline","eye","Eye",tM)});var nM,ru,ow=F(()=>{Vt();nM=[["path",{d:"M12 11v8l3 -3m-6 0l3 3",key:"svg-0"}],["path",{d:"M9 7l1 0",key:"svg-1"}],["path",{d:"M14 7l1 0",key:"svg-2"}],["path",{d:"M19 7l1 0",key:"svg-3"}],["path",{d:"M4 7l1 0",key:"svg-4"}]],ru=Ce("outline","fold-down","FoldDown",nM)});var rM,ou,aw=F(()=>{Vt();rM=[["path",{d:"M12 3v6l3 -3m-6 0l3 3",key:"svg-0"}],["path",{d:"M12 21v-6l3 3m-6 0l3 -3",key:"svg-1"}],["path",{d:"M4 12l1 0",key:"svg-2"}],["path",{d:"M9 12l1 0",key:"svg-3"}],["path",{d:"M14 12l1 0",key:"svg-4"}],["path",{d:"M19 12l1 0",key:"svg-5"}]],ou=Ce("outline","fold","Fold",rM)});var oM,Bh,iw=F(()=>{Vt();oM=[["path",{d:"M5 19l2.757 -7.351a1 1 0 0 1 .936 -.649h12.307a1 1 0 0 1 .986 1.164l-.996 5.211a2 2 0 0 1 -1.964 1.625h-14.026a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v2",key:"svg-0"}]],Bh=Ce("outline","folder-open","FolderOpen",oM)});var aM,Dh,lw=F(()=>{Vt();aM=[["path",{d:"M7 4v16l13 -8l-13 -8",key:"svg-0"}]],Dh=Ce("outline","player-play","PlayerPlay",aM)});var iM,Mh,sw=F(()=>{Vt();iM=[["path",{d:"M5 7a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2l0 -10",key:"svg-0"}]],Mh=Ce("outline","player-stop","PlayerStop",iM)});var lM,Rh,fw=F(()=>{Vt();lM=[["path",{d:"M12 5l0 14",key:"svg-0"}],["path",{d:"M5 12l14 0",key:"svg-1"}]],Rh=Ce("outline","plus","Plus",lM)});var sM,Eh,cw=F(()=>{Vt();sM=[["path",{d:"M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14",key:"svg-0"}],["path",{d:"M3 10h18",key:"svg-1"}],["path",{d:"M10 3v18",key:"svg-2"}]],Eh=Ce("outline","table","Table",sM)});var fM,Ko,uw=F(()=>{Vt();fM=[["path",{d:"M18 6l-12 12",key:"svg-0"}],["path",{d:"M6 6l12 12",key:"svg-1"}]],Ko=Ce("outline","x","X",fM)});var Yo=F(()=>{ew();tw();nw();rw();ow();aw();iw();lw();sw();fw();cw();uw();});var dw,pw,Fh=F(()=>{dw=t=>{let e,n=new Set,r=(f,c)=>{let u=typeof f=="function"?f(e):f;if(!Object.is(u,e)){let d=e;e=c??(typeof u!="object"||u===null)?u:Object.assign({},e,u),n.forEach(p=>p(e,d))}},o=()=>e,l={setState:r,getState:o,getInitialState:()=>s,subscribe:f=>(n.add(f),()=>n.delete(f))},s=e=t(r,o,l);return l},pw=(t=>t?dw(t):dw)});function uM(t,e=cM){let n=xs.default.useSyncExternalStore(t.subscribe,xs.default.useCallback(()=>e(t.getState()),[t,e]),xs.default.useCallback(()=>e(t.getInitialState()),[t,e]));return xs.default.useDebugValue(n),n}var xs,cM,mw,hw,xw=F(()=>{xs=$(ct(),1);Fh();cM=t=>t;mw=t=>{let e=pw(t),n=r=>uM(e,r);return Object.assign(n,e),n},hw=(t=>t?mw(t):mw)});var gw=F(()=>{Fh();xw()});function vw(t,e,n,r){switch(t){case-2:return n<e;case-1:return r>=e&&n<e;case 0:return n<e&&r>e;case 1:return n<=e&&r>e;case 2:return r>e;case 4:return!0}}function bs(t,e,n,r){for(var o;t.from==t.to||(n<1?t.from>=e:t.from>e)||(n>-1?t.to<=e:t.to<e);){let i=!r&&t instanceof Gn&&t.index<0?null:t.parent;if(!i)return t;t=i}let a=r?0:Ae.IgnoreOverlays;if(r)for(let i=t,l=i.parent;l;i=l,l=i.parent)i instanceof Gn&&i.index<0&&((o=l.enter(e,n,a))===null||o===void 0?void 0:o.from)!=i.from&&(t=l);for(;;){let i=t.enter(e,n,a);if(!i)return t;t=i}}function bw(t,e,n,r){let o=t.cursor(),a=[];if(!o.firstChild())return a;if(n!=null){for(let i=!1;!i;)if(i=o.type.is(n),!o.nextSibling())return a}for(;;){if(r!=null&&o.type.is(r))return a;if(o.type.is(e)&&a.push(o.node),!o.nextSibling())return r==null?a:[]}}function Nh(t,e,n=e.length-1){for(let r=t;n>=0;r=r.parent){if(!r)return!1;if(!r.type.isAnonymous){if(e[n]&&e[n]!=r.name)return!1;n--}}return!0}function ww(t){if(!t.length)return null;let e=0,n=t[0];for(let a=1;a<t.length;a++){let i=t[a];(i.from>n.from||i.to<n.to)&&(n=i,e=a)}let r=n instanceof Gn&&n.index<0?null:n.parent,o=t.slice();return r?o[e]=r:o.splice(e,1),new qh(o,n)}function mM(t,e,n){let r=t.resolveInner(e,n),o=null;for(let a=r instanceof Gn?r:r.context.parent;a;a=a.parent)if(a.index<0){let i=a.parent;(o||(o=[r])).push(i.resolve(e,n)),a=i}else{let i=Jo.get(a.tree);if(i&&i.overlay&&i.overlay[0].from<=e&&i.overlay[i.overlay.length-1].to>=e){let l=new Gn(i.tree,i.overlay[0].from+a.from,-1,a);(o||(o=[r])).push(bs(l,e,n,!1))}}return o?ww(o):r}function zh(t){return t.children.some(e=>e instanceof lo||!e.type.isAnonymous||zh(e))}function hM(t){var e;let{buffer:n,nodeSet:r,maxBufferLength:o=1024,reused:a=[],minRepeatType:i=r.types.length}=t,l=Array.isArray(n)?new Lh(n,n.length):n,s=r.types,f=0,c=0;function u(v,S,w,k,D,L){let{id:P,start:E,end:C,size:z}=l,K=c,te=f;if(z<0)if(l.next(),z==-1){let It=a[P];w.push(It),k.push(E-v);return}else if(z==-3){f=P;return}else if(z==-4){c=P;return}else throw new RangeError(`Unrecognized record size: ${z}`);let Ze=s[P],bn,Et,pl=E-v;if(C-E<=o&&(Et=b(l.pos-S,D))){let It=new Uint16Array(Et.size-Et.skip),Jt=l.pos-Et.size,_n=It.length;for(;l.pos>Jt;)_n=h(Et.start,It,_n);bn=new lo(It,C-Et.start,r),pl=Et.start-v}else{let It=l.pos-z;l.next();let Jt=[],_n=[],Oo=P>=i?P:-1,Oa=0,Cf=C;for(;l.pos>It;)Oo>=0&&l.id==Oo&&l.size>=0?(l.end<=Cf-o&&(m(Jt,_n,E,Oa,l.end,Cf,Oo,K,te),Oa=Jt.length,Cf=l.end),l.next()):L>2500?d(E,It,Jt,_n):u(E,It,Jt,_n,Oo,L+1);if(Oo>=0&&Oa>0&&Oa<Jt.length&&m(Jt,_n,E,Oa,E,Cf,Oo,K,te),Jt.reverse(),_n.reverse(),Oo>-1&&Oa>0){let sb=p(Ze,te);bn=Hh(Ze,Jt,_n,0,Jt.length,0,C-E,sb,sb)}else bn=x(Ze,Jt,_n,C-E,K-C,te)}w.push(bn),k.push(pl)}function d(v,S,w,k){let D=[],L=0,P=-1;for(;l.pos>S;){let{id:E,start:C,end:z,size:K}=l;if(K>4)l.next();else{if(P>-1&&C<P)break;P<0&&(P=z-o),D.push(E,C,z),L++,l.next()}}if(L){let E=new Uint16Array(L*4),C=D[D.length-2];for(let z=D.length-3,K=0;z>=0;z-=3)E[K++]=D[z],E[K++]=D[z+1]-C,E[K++]=D[z+2]-C,E[K++]=K;w.push(new lo(E,D[2]-C,r)),k.push(C-v)}}function p(v,S){return(w,k,D)=>{let L=0,P=w.length-1,E,C;if(P>=0&&(E=w[P])instanceof Le){if(!P&&E.type==v&&E.length==D)return E;(C=E.prop(j.lookAhead))&&(L=k[P]+E.length+C)}return x(v,w,k,D,L,S)}}function m(v,S,w,k,D,L,P,E,C){let z=[],K=[];for(;v.length>k;)z.push(v.pop()),K.push(S.pop()+w-D);v.push(x(r.types[P],z,K,L-D,E-L,C)),S.push(D-w)}function x(v,S,w,k,D,L,P){if(L){let E=[j.contextHash,L];P=P?[E].concat(P):[E]}if(D>25){let E=[j.lookAhead,D];P=P?[E].concat(P):[E]}return new Le(v,S,w,k,P)}function b(v,S){let w=l.fork(),k=0,D=0,L=0,P=w.end-o,E={size:0,start:0,skip:0};e:for(let C=w.pos-v;w.pos>C;){let z=w.size;if(w.id==S&&z>=0){E.size=k,E.start=D,E.skip=L,L+=4,k+=4,w.next();continue}let K=w.pos-z;if(z<0||K<C||w.start<P)break;let te=w.id>=i?4:0,Ze=w.start;for(w.next();w.pos>K;){if(w.size<0)if(w.size==-3||w.size==-4)te+=4;else break e;else w.id>=i&&(te+=4);w.next()}D=Ze,k+=z,L+=te}return(S<0||k==v)&&(E.size=k,E.start=D,E.skip=L),E.size>4?E:void 0}function h(v,S,w){let{id:k,start:D,end:L,size:P}=l;if(l.next(),P>=0&&k<i){let E=w;if(P>4){let C=l.pos-(P-4);for(;l.pos>C;)w=h(v,S,w)}S[--w]=E,S[--w]=L-v,S[--w]=D-v,S[--w]=k}else P==-3?f=k:P==-4&&(c=k);return w}let y=[],g=[];for(;l.pos>0;)u(t.start||0,t.bufferStart||0,y,g,-1,0);let I=(e=t.length)!==null&&e!==void 0?e:y.length?g[0]+y[0].length:0;return new Le(s[t.topID],y.reverse(),g.reverse(),I)}function iu(t,e){if(!t.isAnonymous||e instanceof lo||e.type!=t)return 1;let n=Iw.get(e);if(n==null){n=1;for(let r of e.children){if(r.type!=t||!(r instanceof Le)){n=1;break}n+=iu(t,r)}Iw.set(e,n)}return n}function Hh(t,e,n,r,o,a,i,l,s){let f=0;for(let m=r;m<o;m++)f+=iu(t,e[m]);let c=Math.ceil(f*1.5/8),u=[],d=[];function p(m,x,b,h,y){for(let g=b;g<h;){let I=g,v=x[g],S=iu(t,m[g]);for(g++;g<h;g++){let w=iu(t,m[g]);if(S+w>=c)break;S+=w}if(g==I+1){if(S>c){let w=m[I];p(w.children,w.positions,0,w.children.length,x[I]+y);continue}u.push(m[I])}else{let w=x[g-1]+m[g-1].length-v;u.push(Hh(t,m,x,I,g,v,w,null,s))}d.push(v+y-a)}}return p(e,n,r,o,0),(l||s)(u,d,i)}var dM,gs,j,Jo,pM,at,ys,au,yw,Ae,Le,Lh,lo,lu,Gn,_h,Is,qh,vs,Iw,Zo,wi,Ph,O6,ws=F(()=>{dM=0,gs=class{constructor(e,n){this.from=e,this.to=n}},j=class{constructor(e={}){this.id=dM++,this.perNode=!!e.perNode,this.deserialize=e.deserialize||(()=>{throw new Error("This node type doesn't define a deserialize function")}),this.combine=e.combine||null}add(e){if(this.perNode)throw new RangeError("Can't add per-node props to node types");return typeof e!="function"&&(e=at.match(e)),n=>{let r=e(n);return r===void 0?null:[this,r]}}};j.closedBy=new j({deserialize:t=>t.split(" ")});j.openedBy=new j({deserialize:t=>t.split(" ")});j.group=new j({deserialize:t=>t.split(" ")});j.isolate=new j({deserialize:t=>{if(t&&t!="rtl"&&t!="ltr"&&t!="auto")throw new RangeError("Invalid value for isolate: "+t);return t||"auto"}});j.contextHash=new j({perNode:!0});j.lookAhead=new j({perNode:!0});j.mounted=new j({perNode:!0});Jo=class{constructor(e,n,r,o=!1){this.tree=e,this.overlay=n,this.parser=r,this.bracketed=o}static get(e){return e&&e.props&&e.props[j.mounted.id]}},pM=Object.create(null),at=class t{constructor(e,n,r,o=0){this.name=e,this.props=n,this.id=r,this.flags=o}static define(e){let n=e.props&&e.props.length?Object.create(null):pM,r=(e.top?1:0)|(e.skipped?2:0)|(e.error?4:0)|(e.name==null?8:0),o=new t(e.name||"",n,e.id,r);if(e.props){for(let a of e.props)if(Array.isArray(a)||(a=a(o)),a){if(a[0].perNode)throw new RangeError("Can't store a per-node prop on a node type");n[a[0].id]=a[1]}}return o}prop(e){return this.props[e.id]}get isTop(){return(this.flags&1)>0}get isSkipped(){return(this.flags&2)>0}get isError(){return(this.flags&4)>0}get isAnonymous(){return(this.flags&8)>0}is(e){if(typeof e=="string"){if(this.name==e)return!0;let n=this.prop(j.group);return n?n.indexOf(e)>-1:!1}return this.id==e}static match(e){let n=Object.create(null);for(let r in e)for(let o of r.split(" "))n[o]=e[r];return r=>{for(let o=r.prop(j.group),a=-1;a<(o?o.length:0);a++){let i=n[a<0?r.name:o[a]];if(i)return i}}}};at.none=new at("",Object.create(null),0,8);ys=class t{constructor(e){this.types=e;for(let n=0;n<e.length;n++)if(e[n].id!=n)throw new RangeError("Node type ids should correspond to array positions when creating a node set")}extend(...e){let n=[];for(let r of this.types){let o=null;for(let a of e){let i=a(r);if(i){o||(o=Object.assign({},r.props));let l=i[1],s=i[0];s.combine&&s.id in o&&(l=s.combine(o[s.id],l)),o[s.id]=l}}n.push(o?new at(r.name,o,r.id,r.flags):r)}return new t(n)}},au=new WeakMap,yw=new WeakMap;(function(t){t[t.ExcludeBuffers=1]="ExcludeBuffers",t[t.IncludeAnonymous=2]="IncludeAnonymous",t[t.IgnoreMounts=4]="IgnoreMounts",t[t.IgnoreOverlays=8]="IgnoreOverlays",t[t.EnterBracketed=16]="EnterBracketed"})(Ae||(Ae={}));Le=class t{constructor(e,n,r,o,a){if(this.type=e,this.children=n,this.positions=r,this.length=o,this.props=null,a&&a.length){this.props=Object.create(null);for(let[i,l]of a)this.props[typeof i=="number"?i:i.id]=l}}toString(){let e=Jo.get(this);if(e&&!e.overlay)return e.tree.toString();let n="";for(let r of this.children){let o=r.toString();o&&(n&&(n+=","),n+=o)}return this.type.name?(/\W/.test(this.type.name)&&!this.type.isError?JSON.stringify(this.type.name):this.type.name)+(n.length?"("+n+")":""):n}cursor(e=0){return new vs(this.topNode,e)}cursorAt(e,n=0,r=0){let o=au.get(this)||this.topNode,a=new vs(o);return a.moveTo(e,n),au.set(this,a._tree),a}get topNode(){return new Gn(this,0,0,null)}resolve(e,n=0){let r=bs(au.get(this)||this.topNode,e,n,!1);return au.set(this,r),r}resolveInner(e,n=0){let r=bs(yw.get(this)||this.topNode,e,n,!0);return yw.set(this,r),r}resolveStack(e,n=0){return mM(this,e,n)}iterate(e){let{enter:n,leave:r,from:o=0,to:a=this.length}=e,i=e.mode||0,l=(i&Ae.IncludeAnonymous)>0;for(let s=this.cursor(i|Ae.IncludeAnonymous);;){let f=!1;if(s.from<=a&&s.to>=o&&(!l&&s.type.isAnonymous||n(s)!==!1)){if(s.firstChild())continue;f=!0}for(;f&&r&&(l||!s.type.isAnonymous)&&r(s),!s.nextSibling();){if(!s.parent())return;f=!0}}}prop(e){return e.perNode?this.props?this.props[e.id]:void 0:this.type.prop(e)}get propValues(){let e=[];if(this.props)for(let n in this.props)e.push([+n,this.props[n]]);return e}balance(e={}){return this.children.length<=8?this:Hh(at.none,this.children,this.positions,0,this.children.length,0,this.length,(n,r,o)=>new t(this.type,n,r,o,this.propValues),e.makeTree||((n,r,o)=>new t(at.none,n,r,o)))}static build(e){return hM(e)}};Le.empty=new Le(at.none,[],[],0);Lh=class t{constructor(e,n){this.buffer=e,this.index=n}get id(){return this.buffer[this.index-4]}get start(){return this.buffer[this.index-3]}get end(){return this.buffer[this.index-2]}get size(){return this.buffer[this.index-1]}get pos(){return this.index}next(){this.index-=4}fork(){return new t(this.buffer,this.index)}},lo=class t{constructor(e,n,r){this.buffer=e,this.length=n,this.set=r}get type(){return at.none}toString(){let e=[];for(let n=0;n<this.buffer.length;)e.push(this.childString(n)),n=this.buffer[n+3];return e.join(",")}childString(e){let n=this.buffer[e],r=this.buffer[e+3],o=this.set.types[n],a=o.name;if(/\W/.test(a)&&!o.isError&&(a=JSON.stringify(a)),e+=4,r==e)return a;let i=[];for(;e<r;)i.push(this.childString(e)),e=this.buffer[e+3];return a+"("+i.join(",")+")"}findChild(e,n,r,o,a){let{buffer:i}=this,l=-1;for(let s=e;s!=n&&!(vw(a,o,i[s+1],i[s+2])&&(l=s,r>0));s=i[s+3]);return l}slice(e,n,r){let o=this.buffer,a=new Uint16Array(n-e),i=0;for(let l=e,s=0;l<n;){a[s++]=o[l++],a[s++]=o[l++]-r;let f=a[s++]=o[l++]-r;a[s++]=o[l++]-e,i=Math.max(i,f)}return new t(a,i,this.set)}};lu=class{cursor(e=0){return new vs(this,e)}getChild(e,n=null,r=null){let o=bw(this,e,n,r);return o.length?o[0]:null}getChildren(e,n=null,r=null){return bw(this,e,n,r)}resolve(e,n=0){return bs(this,e,n,!1)}resolveInner(e,n=0){return bs(this,e,n,!0)}matchContext(e){return Nh(this.parent,e)}enterUnfinishedNodesBefore(e){let n=this.childBefore(e),r=this;for(;n;){let o=n.lastChild;if(!o||o.to!=n.to)break;o.type.isError&&o.from==o.to?(r=n,n=o.prevSibling):n=o}return r}get node(){return this}get next(){return this.parent}},Gn=class t extends lu{constructor(e,n,r,o){super(),this._tree=e,this.from=n,this.index=r,this._parent=o}get type(){return this._tree.type}get name(){return this._tree.type.name}get to(){return this.from+this._tree.length}nextChild(e,n,r,o,a=0){for(let i=this;;){for(let{children:l,positions:s}=i._tree,f=n>0?l.length:-1;e!=f;e+=n){let c=l[e],u=s[e]+i.from,d;if(!(!(a&Ae.EnterBracketed&&c instanceof Le&&(d=Jo.get(c))&&!d.overlay&&d.bracketed&&r>=u&&r<=u+c.length)&&!vw(o,r,u,u+c.length))){if(c instanceof lo){if(a&Ae.ExcludeBuffers)continue;let p=c.findChild(0,c.buffer.length,n,r-u,o);if(p>-1)return new Is(new _h(i,c,e,u),null,p)}else if(a&Ae.IncludeAnonymous||!c.type.isAnonymous||zh(c)){let p;if(!(a&Ae.IgnoreMounts)&&(p=Jo.get(c))&&!p.overlay)return new t(p.tree,u,e,i);let m=new t(c,u,e,i);return a&Ae.IncludeAnonymous||!m.type.isAnonymous?m:m.nextChild(n<0?c.children.length-1:0,n,r,o,a)}}}if(a&Ae.IncludeAnonymous||!i.type.isAnonymous||(i.index>=0?e=i.index+n:e=n<0?-1:i._parent._tree.children.length,i=i._parent,!i))return null}}get firstChild(){return this.nextChild(0,1,0,4)}get lastChild(){return this.nextChild(this._tree.children.length-1,-1,0,4)}childAfter(e){return this.nextChild(0,1,e,2)}childBefore(e){return this.nextChild(this._tree.children.length-1,-1,e,-2)}prop(e){return this._tree.prop(e)}enter(e,n,r=0){let o;if(!(r&Ae.IgnoreOverlays)&&(o=Jo.get(this._tree))&&o.overlay){let a=e-this.from,i=r&Ae.EnterBracketed&&o.bracketed;for(let{from:l,to:s}of o.overlay)if((n>0||i?l<=a:l<a)&&(n<0||i?s>=a:s>a))return new t(o.tree,o.overlay[0].from+this.from,-1,this)}return this.nextChild(0,1,e,n,r)}nextSignificantParent(){let e=this;for(;e.type.isAnonymous&&e._parent;)e=e._parent;return e}get parent(){return this._parent?this._parent.nextSignificantParent():null}get nextSibling(){return this._parent&&this.index>=0?this._parent.nextChild(this.index+1,1,0,4):null}get prevSibling(){return this._parent&&this.index>=0?this._parent.nextChild(this.index-1,-1,0,4):null}get tree(){return this._tree}toTree(){return this._tree}toString(){return this._tree.toString()}};_h=class{constructor(e,n,r,o){this.parent=e,this.buffer=n,this.index=r,this.start=o}},Is=class t extends lu{get name(){return this.type.name}get from(){return this.context.start+this.context.buffer.buffer[this.index+1]}get to(){return this.context.start+this.context.buffer.buffer[this.index+2]}constructor(e,n,r){super(),this.context=e,this._parent=n,this.index=r,this.type=e.buffer.set.types[e.buffer.buffer[r]]}child(e,n,r){let{buffer:o}=this.context,a=o.findChild(this.index+4,o.buffer[this.index+3],e,n-this.context.start,r);return a<0?null:new t(this.context,this,a)}get firstChild(){return this.child(1,0,4)}get lastChild(){return this.child(-1,0,4)}childAfter(e){return this.child(1,e,2)}childBefore(e){return this.child(-1,e,-2)}prop(e){return this.type.prop(e)}enter(e,n,r=0){if(r&Ae.ExcludeBuffers)return null;let{buffer:o}=this.context,a=o.findChild(this.index+4,o.buffer[this.index+3],n>0?1:-1,e-this.context.start,n);return a<0?null:new t(this.context,this,a)}get parent(){return this._parent||this.context.parent.nextSignificantParent()}externalSibling(e){return this._parent?null:this.context.parent.nextChild(this.context.index+e,e,0,4)}get nextSibling(){let{buffer:e}=this.context,n=e.buffer[this.index+3];return n<(this._parent?e.buffer[this._parent.index+3]:e.buffer.length)?new t(this.context,this._parent,n):this.externalSibling(1)}get prevSibling(){let{buffer:e}=this.context,n=this._parent?this._parent.index+4:0;return this.index==n?this.externalSibling(-1):new t(this.context,this._parent,e.findChild(n,this.index,-1,0,4))}get tree(){return null}toTree(){let e=[],n=[],{buffer:r}=this.context,o=this.index+4,a=r.buffer[this.index+3];if(a>o){let i=r.buffer[this.index+1];e.push(r.slice(o,a,i)),n.push(0)}return new Le(this.type,e,n,this.to-this.from)}toString(){return this.context.buffer.childString(this.index)}};qh=class{constructor(e,n){this.heads=e,this.node=n}get next(){return ww(this.heads)}};vs=class{get name(){return this.type.name}constructor(e,n=0){if(this.buffer=null,this.stack=[],this.index=0,this.bufferNode=null,this.mode=n&~Ae.EnterBracketed,e instanceof Gn)this.yieldNode(e);else{this._tree=e.context.parent,this.buffer=e.context;for(let r=e._parent;r;r=r._parent)this.stack.unshift(r.index);this.bufferNode=e,this.yieldBuf(e.index)}}yieldNode(e){return e?(this._tree=e,this.type=e.type,this.from=e.from,this.to=e.to,!0):!1}yieldBuf(e,n){this.index=e;let{start:r,buffer:o}=this.buffer;return this.type=n||o.set.types[o.buffer[e]],this.from=r+o.buffer[e+1],this.to=r+o.buffer[e+2],!0}yield(e){return e?e instanceof Gn?(this.buffer=null,this.yieldNode(e)):(this.buffer=e.context,this.yieldBuf(e.index,e.type)):!1}toString(){return this.buffer?this.buffer.buffer.childString(this.index):this._tree.toString()}enterChild(e,n,r){if(!this.buffer)return this.yield(this._tree.nextChild(e<0?this._tree._tree.children.length-1:0,e,n,r,this.mode));let{buffer:o}=this.buffer,a=o.findChild(this.index+4,o.buffer[this.index+3],e,n-this.buffer.start,r);return a<0?!1:(this.stack.push(this.index),this.yieldBuf(a))}firstChild(){return this.enterChild(1,0,4)}lastChild(){return this.enterChild(-1,0,4)}childAfter(e){return this.enterChild(1,e,2)}childBefore(e){return this.enterChild(-1,e,-2)}enter(e,n,r=this.mode){return this.buffer?r&Ae.ExcludeBuffers?!1:this.enterChild(1,e,n):this.yield(this._tree.enter(e,n,r))}parent(){if(!this.buffer)return this.yieldNode(this.mode&Ae.IncludeAnonymous?this._tree._parent:this._tree.parent);if(this.stack.length)return this.yieldBuf(this.stack.pop());let e=this.mode&Ae.IncludeAnonymous?this.buffer.parent:this.buffer.parent.nextSignificantParent();return this.buffer=null,this.yieldNode(e)}sibling(e){if(!this.buffer)return this._tree._parent?this.yield(this._tree.index<0?null:this._tree._parent.nextChild(this._tree.index+e,e,0,4,this.mode)):!1;let{buffer:n}=this.buffer,r=this.stack.length-1;if(e<0){let o=r<0?0:this.stack[r]+4;if(this.index!=o)return this.yieldBuf(n.findChild(o,this.index,-1,0,4))}else{let o=n.buffer[this.index+3];if(o<(r<0?n.buffer.length:n.buffer[this.stack[r]+3]))return this.yieldBuf(o)}return r<0?this.yield(this.buffer.parent.nextChild(this.buffer.index+e,e,0,4,this.mode)):!1}nextSibling(){return this.sibling(1)}prevSibling(){return this.sibling(-1)}atLastNode(e){let n,r,{buffer:o}=this;if(o){if(e>0){if(this.index<o.buffer.buffer.length)return!1}else for(let a=0;a<this.index;a++)if(o.buffer.buffer[a+3]<this.index)return!1;({index:n,parent:r}=o)}else({index:n,_parent:r}=this._tree);for(;r;{index:n,_parent:r}=r)if(n>-1)for(let a=n+e,i=e<0?-1:r._tree.children.length;a!=i;a+=e){let l=r._tree.children[a];if(this.mode&Ae.IncludeAnonymous||l instanceof lo||!l.type.isAnonymous||zh(l))return!1}return!0}move(e,n){if(n&&this.enterChild(e,0,4))return!0;for(;;){if(this.sibling(e))return!0;if(this.atLastNode(e)||!this.parent())return!1}}next(e=!0){return this.move(1,e)}prev(e=!0){return this.move(-1,e)}moveTo(e,n=0){for(;(this.from==this.to||(n<1?this.from>=e:this.from>e)||(n>-1?this.to<=e:this.to<e))&&this.parent(););for(;this.enterChild(1,e,n););return this}get node(){if(!this.buffer)return this._tree;let e=this.bufferNode,n=null,r=0;if(e&&e.context==this.buffer)e:for(let o=this.index,a=this.stack.length;a>=0;){for(let i=e;i;i=i._parent)if(i.index==o){if(o==this.index)return i;n=i,r=a+1;break e}o=this.stack[--a]}for(let o=r;o<this.stack.length;o++)n=new Is(this.buffer,n,this.stack[o]);return this.bufferNode=new Is(this.buffer,n,this.index)}get tree(){return this.buffer?null:this._tree._tree}iterate(e,n){for(let r=0;;){let o=!1;if(this.type.isAnonymous||e(this)!==!1){if(this.firstChild()){r++;continue}this.type.isAnonymous||(o=!0)}for(;;){if(o&&n&&n(this),o=this.type.isAnonymous,!r)return;if(this.nextSibling())break;this.parent(),r--,o=!0}}}matchContext(e){if(!this.buffer)return Nh(this.node.parent,e);let{buffer:n}=this.buffer,{types:r}=n.set;for(let o=e.length-1,a=this.stack.length-1;o>=0;a--){if(a<0)return Nh(this._tree,e,o);let i=r[n.buffer[this.stack[a]]];if(!i.isAnonymous){if(e[o]&&e[o]!=i.name)return!1;o--}}return!0}};Iw=new WeakMap;Zo=class t{constructor(e,n,r,o,a=!1,i=!1){this.from=e,this.to=n,this.tree=r,this.offset=o,this.open=(a?1:0)|(i?2:0)}get openStart(){return(this.open&1)>0}get openEnd(){return(this.open&2)>0}static addTree(e,n=[],r=!1){let o=[new t(0,e.length,e,0,!1,r)];for(let a of n)a.to>e.length&&o.push(a);return o}static applyChanges(e,n,r=128){if(!n.length)return e;let o=[],a=1,i=e.length?e[0]:null;for(let l=0,s=0,f=0;;l++){let c=l<n.length?n[l]:null,u=c?c.fromA:1e9;if(u-s>=r)for(;i&&i.from<u;){let d=i;if(s>=d.from||u<=d.to||f){let p=Math.max(d.from,s)-f,m=Math.min(d.to,u)-f;d=p>=m?null:new t(p,m,d.tree,d.offset+f,l>0,!!c)}if(d&&o.push(d),i.to>u)break;i=a<e.length?e[a++]:null}if(!c)break;s=c.toA,f=c.toA-c.toB}return o}},wi=class{startParse(e,n,r){return typeof e=="string"&&(e=new Ph(e)),r=r?r.length?r.map(o=>new gs(o.from,o.to)):[new gs(0,0)]:[new gs(0,e.length)],this.createParse(e,n||[],r)}parse(e,n,r){let o=this.startParse(e,n,r);for(;;){let a=o.advance();if(a)return a}}},Ph=class{constructor(e){this.string=e}get length(){return this.string.length}chunk(e){return this.string.slice(e)}get lineChunks(){return!1}read(e,n){return this.string.slice(e,n)}},O6=new j({perNode:!0})});function xM(t){if(t<768)return!1;for(let e=0,n=jh.length;;){let r=e+n>>1;if(t<jh[r])n=r;else if(t>=Aw[r])e=r+1;else return!0;if(e==n)return!1}}function Sw(t){return t>=127462&&t<=127487}function Tw(t,e,n=!0,r=!0){return(n?Ow:gM)(t,e,r)}function Ow(t,e,n){if(e==t.length)return e;e&&Bw(t.charCodeAt(e))&&Dw(t.charCodeAt(e-1))&&e--;let r=Uh(t,e);for(e+=Cw(r);e<t.length;){let o=Uh(t,e);if(r==kw||o==kw||n&&xM(o))e+=Cw(o),r=o;else if(Sw(o)){let a=0,i=e-2;for(;i>=0&&Sw(Uh(t,i));)a++,i-=2;if(a%2==0)break;e+=2}else break}return e}function gM(t,e,n){for(;e>1;){let r=Ow(t,e-2,n);if(r<e)return r;e--}return 0}function Uh(t,e){let n=t.charCodeAt(e);if(!Dw(n)||e+1==t.length)return n;let r=t.charCodeAt(e+1);return Bw(r)?(n-55296<<10)+(r-56320)+65536:n}function Bw(t){return t>=56320&&t<57344}function Dw(t){return t>=55296&&t<56320}function Cw(t){return t<65536?1:2}var jh,Aw,kw,Mw=F(()=>{jh=[],Aw=[];(()=>{let t="lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,1n,9,16,o,,x,1i,3,,i,,7,a,2,t,3,1k,,,7,2,2,2,3,9,,a,2,q,,2,3,1k,,,5,4,2,2,3,3,,u,2,3,,b,3,1k,,,8,,3,,3,k,2,m,6,,3,1k,,,7,2,2,2,3,7,3,a,2,u,,1n,5,3,3,,4,9,,14,5,1j,,,7,,3,,4,7,2,b,2,t,3,1k,,,7,,3,,4,7,2,b,2,f,,c,4,1j,2,,7,,3,,4,9,,a,2,t,3,1y,,4,6,,,,8,i,2,1p,,,8,c,8,2q,,,a,b,7,21,2,r,,,,,,4,2,1d,k,,2,5,b,,10,9,,2u,b,,6,n,4,4,3,g,4,d,,,3,6,,f,,jj,3,qa,4,s,3,t,2,u,2,1s,w,9,,19,3,,,39,2,y,,3a,c,4,c,63,5,1l,a,,,,,2,o,2,,1c,1a,2,c,k,5,1b,h,12,9,c,3,u,d,1k,e,1c,k,48,3,,l,4,,6,,2,3,5i,1s,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,n,5,4,,2b,2,1e,i,q,i,d,,12,8,p,d,18,4,1b,e,10,,1v,e,c,,8,2,1a,,1f,,,3,2,2,5,2,,,15,5,5,2,6k,8,,2,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,1t,5,8t,2,25,6,1y,b,1d,4,3e,3,1h,f,15,,2,2,a,4,19,b,7,,1p,3,10,e,g,2,18,,c,3,1c,e,8,4,,2,2k,c,6,,2,,4d,c,l,4,1j,2,,7,2,2,2,3,9,,a,2,2,7,3,5,1v,9,,,2,,,4,,5,,,e,2,2a,i,n,,29,k,6j,7,2,9,r,2,2a,h,2y,d,2t,3,2,a,74,f,6t,6,,2,2,4,,,,2,3x,7,2,7,3,,s,a,14,7,,4,8,,9,b,1a,g,5i,8,5j,8,,8,2a,m,,e,3e,6,3,,,2,,7,,,1u,5,,2,,5,9n,4,9,2,,,1c,7,3,5,n,,44l,,6,f,8ug,i,1xc,5,1n,7,t4,,,1j,7,4,29,,b,2,f57,2,3mp,1a,2,n,f2,5,3,6,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,2s,,4g,7,af,,1p,4,e4,4,72,2,6r,,2,,7,2,5,,d6,7,31,7,240,5".split(",").map(e=>e?parseInt(e,36):1);for(let e=0,n=0;e<t.length;e++)(e%2?Aw:jh).push(n=n+t[e])})();kw=8205});function yM(t){let e=-1;for(let n of t)e+=n.length+1;return e}function uu(t,e,n=0,r=1e9){for(let o=0,a=0,i=!0;a<t.length&&o<=r;a++){let l=t[a],s=o+l.length;s>=n&&(s>r&&(l=l.slice(0,r-o)),o<n&&(l=l.slice(n-o)),i?(e[e.length-1]+=l,i=!1):e.push(l)),o=s+1}return e}function Rw(t,e,n){return uu(t,[""],e,n)}function Ti(t,e,n){return e=Math.max(0,Math.min(t.length,e)),[e,Math.max(e,Math.min(t.length,n))]}function Qe(t,e,n=!0,r=!0){return Tw(t,e,n,r)}function bM(t){return t>=56320&&t<57344}function IM(t){return t>=55296&&t<56320}function wr(t,e){let n=t.charCodeAt(e);if(!IM(n)||e+1==t.length)return n;let r=t.charCodeAt(e+1);return bM(r)?(n-55296<<10)+(r-56320)+65536:n}function _w(t){return t<=65535?String.fromCharCode(t):(t-=65536,String.fromCharCode((t>>10)+55296,(t&1023)+56320))}function co(t){return t<65536?1:2}function it(t,e,n,r=!1){if(e==0&&n<=0)return;let o=t.length-2;o>=0&&n<=0&&n==t[o+1]?t[o]+=e:o>=0&&e==0&&t[o]==0?t[o+1]+=n:r?(t[o]+=e,t[o+1]+=n):t.push(e,n)}function so(t,e,n){if(n.length==0)return;let r=e.length-2>>1;if(r<t.length)t[t.length-1]=t[t.length-1].append(n);else{for(;t.length<r;)t.push(J.empty);t.push(n)}}function Xh(t,e,n){let r=t.inserted;for(let o=0,a=0,i=0;i<t.sections.length;){let l=t.sections[i++],s=t.sections[i++];if(s<0)o+=l,a+=l;else{let f=o,c=a,u=J.empty;for(;f+=l,c+=s,s&&r&&(u=u.append(r[i-2>>1])),!(n||i==t.sections.length||t.sections[i+1]<0);)l=t.sections[i++],s=t.sections[i++];e(o,f,a,c,u),o=f,a=c}}}function Qh(t,e,n,r=!1){let o=[],a=r?[]:null,i=new ra(t),l=new ra(e);for(let s=-1;;){if(i.done&&l.len||l.done&&i.len)throw new Error("Mismatched change set lengths");if(i.ins==-1&&l.ins==-1){let f=Math.min(i.len,l.len);it(o,f,-1),i.forward(f),l.forward(f)}else if(l.ins>=0&&(i.ins<0||s==i.i||i.off==0&&(l.len<i.len||l.len==i.len&&!n))){let f=l.len;for(it(o,l.ins,-1);f;){let c=Math.min(i.len,f);i.ins>=0&&s<i.i&&i.len<=c&&(it(o,0,i.ins),a&&so(a,o,i.text),s=i.i),i.forward(c),f-=c}l.next()}else if(i.ins>=0){let f=0,c=i.len;for(;c;)if(l.ins==-1){let u=Math.min(c,l.len);f+=u,c-=u,l.forward(u)}else if(l.ins==0&&l.len<c)c-=l.len,l.next();else break;it(o,f,s<i.i?i.ins:0),a&&s<i.i&&so(a,o,i.text),s=i.i,i.forward(i.len-c)}else{if(i.done&&l.done)return a?ht.createSet(o,a):vr.create(o);throw new Error("Mismatched change set lengths")}}}function qw(t,e,n=!1){let r=[],o=n?[]:null,a=new ra(t),i=new ra(e);for(let l=!1;;){if(a.done&&i.done)return o?ht.createSet(r,o):vr.create(r);if(a.ins==0)it(r,a.len,0,l),a.next();else if(i.len==0&&!i.done)it(r,0,i.ins,l),o&&so(o,r,i.text),i.next();else{if(a.done||i.done)throw new Error("Mismatched change set lengths");{let s=Math.min(a.len2,i.len),f=r.length;if(a.ins==-1){let c=i.ins==-1?-1:i.off?0:i.ins;it(r,s,c,l),o&&c&&so(o,r,i.text)}else i.ins==-1?(it(r,a.off?0:a.len,s,l),o&&so(o,r,a.textBit(s))):(it(r,a.off?0:a.len,i.off?0:i.ins,l),o&&!i.off&&so(o,r,i.text));l=(a.ins>s||i.ins>=0&&i.len>s)&&(l||r.length>f),a.forward2(s),i.forward(s)}}}}function Pw(t,e){for(let n of t.ranges)if(n.to>e)throw new RangeError("Selection points outside of document")}function ax(t,e){return t==e||t.length==e.length&&t.every((n,r)=>n===e[r])}function Ew(t,e,n){if(t.length!=e.length)return!1;for(let r=0;r<t.length;r++)if(!n(t[r],e[r]))return!1;return!0}function Kh(t,e){let n=!1;for(let r of e)ks(t,r)&1&&(n=!0);return n}function vM(t,e,n){let r=n.map(s=>t[s.id]),o=n.map(s=>s.type),a=r.filter(s=>!(s&1)),i=t[e.id]>>1;function l(s){let f=[];for(let c=0;c<r.length;c++){let u=xu(s,r[c]);if(o[c]==2)for(let d of u)f.push(d);else f.push(u)}return e.combine(f)}return{create(s){for(let f of r)ks(s,f);return s.values[i]=l(s),1},update(s,f){if(!Kh(s,a))return 0;let c=l(s);return e.compare(c,s.values[i])?0:(s.values[i]=c,1)},reconfigure(s,f){let c=Kh(s,r),u=f.config.facets[e.id],d=f.facet(e);if(u&&!c&&ax(n,u))return s.values[i]=d,0;let p=l(s);return e.compare(p,d)?(s.values[i]=d,0):(s.values[i]=p,1)}}}function Ss(t){return e=>new mu(e,t)}function wM(t,e,n){let r=[[],[],[],[],[]],o=new Map;function a(i,l){let s=o.get(i);if(s!=null){if(s<=l)return;let f=r[s].indexOf(i);f>-1&&r[s].splice(f,1),i instanceof Cs&&n.delete(i.compartment)}if(o.set(i,l),Array.isArray(i))for(let f of i)a(f,l);else if(i instanceof Cs){if(n.has(i.compartment))throw new RangeError("Duplicate use of compartment in extensions");let f=e.get(i.compartment)||i.inner;n.set(i.compartment,f),a(f,l)}else if(i instanceof mu)a(i.inner,i.prec);else if(i instanceof xt)r[l].push(i),i.provides&&a(i.provides,l);else if(i instanceof Ci)r[l].push(i),i.facet.extensions&&a(i.facet.extensions,ea.default);else{let f=i.extension;if(!f)throw new Error(`Unrecognized extension value in extension set (${i}).`);if(f==i)throw new Error(`Unrecognized extension value in extension set (${i}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);a(f,l)}}return a(t,ea.default),r.reduce((i,l)=>i.concat(l))}function ks(t,e){if(e&1)return 2;let n=e>>1,r=t.status[n];if(r==4)throw new Error("Cyclic dependency between fields and/or facets");if(r&2)return r;t.status[n]=4;let o=t.computeSlot(t,t.config.dynamicSlots[n]);return t.status[n]=2|o}function xu(t,e){return e&1?t.config.staticValues[e>>1]:t.values[e>>1]}function SM(t,e){let n=[];for(let r=0,o=0;;){let a,i;if(r<t.length&&(o==e.length||e[o]>=t[r]))a=t[r++],i=t[r++];else if(o<e.length)a=e[o++],i=e[o++];else return n;!n.length||n[n.length-1]<a?n.push(a,i):n[n.length-1]<i&&(n[n.length-1]=i)}}function Ww(t,e,n){var r;let o,a,i;return n?(o=e.changes,a=ht.empty(e.changes.length),i=t.changes.compose(e.changes)):(o=e.changes.map(t.changes),a=t.changes.mapDesc(e.changes,!0),i=t.changes.compose(o)),{changes:i,selection:e.selection?e.selection.map(a):(r=t.selection)===null||r===void 0?void 0:r.map(o),effects:oe.mapEffects(t.effects,o).concat(oe.mapEffects(e.effects,a)),annotations:t.annotations.length?t.annotations.concat(e.annotations):e.annotations,scrollIntoView:t.scrollIntoView||e.scrollIntoView}}function $h(t,e,n){let r=e.selection,o=Ai(e.annotations);return e.userEvent&&(o=o.concat(Ve.userEvent.of(e.userEvent))),{changes:e.changes instanceof ht?e.changes:ht.of(e.changes||[],n,t.facet(Hw)),selection:r&&(r instanceof O?r:O.single(r.anchor,r.head)),effects:Ai(e.effects),annotations:o,scrollIntoView:!!e.scrollIntoView}}function Xw(t,e,n){let r=$h(t,e.length?e[0]:{},t.doc.length);e.length&&e[0].filter===!1&&(n=!1);for(let a=1;a<e.length;a++){e[a].filter===!1&&(n=!1);let i=!!e[a].sequential;r=Ww(r,$h(t,e[a],i?r.changes.newLength:t.doc.length),i)}let o=Ve.create(t,r.changes,r.selection,r.effects,r.annotations,r.scrollIntoView);return CM(n?kM(o):o)}function kM(t){let e=t.startState,n=!0;for(let o of e.facet(Uw)){let a=o(t);if(a===!1){n=!1;break}Array.isArray(a)&&(n=n===!0?a:SM(n,a))}if(n!==!0){let o,a;if(n===!1)a=t.changes.invertedDesc,o=ht.empty(e.doc.length);else{let i=t.changes.filter(n);o=i.changes,a=i.filtered.mapDesc(i.changes).invertedDesc}t=Ve.create(e,o,t.selection&&t.selection.map(a),oe.mapEffects(t.effects,a),t.annotations,t.scrollIntoView)}let r=e.facet(jw);for(let o=r.length-1;o>=0;o--){let a=r[o](t);a instanceof Ve?t=a:Array.isArray(a)&&a.length==1&&a[0]instanceof Ve?t=a[0]:t=Xw(e,Ai(a),!1)}return t}function CM(t){let e=t.startState,n=e.facet(Vw),r=t;for(let o=n.length-1;o>=0;o--){let a=n[o](t);a&&Object.keys(a).length&&(r=Ww(r,$h(e,a,t.changes.newLength),!0))}return r==t?t:Ve.create(e,t.changes,t.selection,r.effects,r.annotations,r.scrollIntoView)}function Ai(t){return t==null?AM:Array.isArray(t)?t:[t]}function OM(t){if(ex)return ex.test(t);for(let e=0;e<t.length;e++){let n=t[e];if(/\w/.test(n)||n>"\x80"&&(n.toUpperCase()!=n.toLowerCase()||TM.test(n)))return!0}return!1}function BM(t){return e=>{if(!/\S/.test(e))return cn.Space;if(OM(e))return cn.Word;for(let n=0;n<t.length;n++)if(e.indexOf(t[n])>-1)return cn.Word;return cn.Other}}function uo(t,e,n={}){let r={};for(let o of t)for(let a of Object.keys(o)){let i=o[a],l=r[a];if(l===void 0)r[a]=i;else if(!(l===i||i===void 0))if(Object.hasOwnProperty.call(n,a))r[a]=n[a](l,i);else throw new Error("Config merge conflict for field "+a)}for(let o in e)r[o]===void 0&&(r[o]=e[o]);return r}function ix(t,e){return t==e||t.constructor==e.constructor&&t.eq(e)}function tx(t,e){return t.from-e.from||t.value.startSide-e.value.startSide}function Si(t){return t[t.length-1]}function DM(t){if(t.length>1)for(let e=t[0],n=1;n<t.length;n++){let r=t[n];if(tx(e,r)>0)return t.slice().sort(tx);e=r}return t}function Fw(t,e,n){let r=new Map;for(let a of t)for(let i=0;i<a.chunk.length;i++)a.chunk[i].maxPoint<=0&&r.set(a.chunk[i],a.chunkPos[i]);let o=new Set;for(let a of e)for(let i=0;i<a.chunk.length;i++){let l=r.get(a.chunk[i]);l!=null&&(n?n.mapPos(l):l)==a.chunkPos[i]&&!n?.touchesRange(l,l+a.chunk[i].length)&&o.add(a.chunk[i])}return o}function Vh(t,e){for(let n=t[e];;){let r=(e<<1)+1;if(r>=t.length)break;let o=t[r];if(r+1<t.length&&o.compare(t[r+1])>=0&&(o=t[r+1],r++),n.compare(o)<0)break;t[r]=n,t[e]=o,e=r}}function Lw(t,e,n,r,o,a){t.goto(e),n.goto(r);let i=r+o,l=r,s=r-e,f=!!a.boundChange;for(let c=!1;;){let u=t.to+s-n.to,d=u||t.endSide-n.endSide,p=d<0?t.to+s:n.to,m=Math.min(p,i);if(t.point||n.point?(t.point&&n.point&&ix(t.point,n.point)&&rx(t.activeForPoint(t.to),n.activeForPoint(n.to))||a.comparePoint(l,m,t.point,n.point),c=!1):(c&&(a.boundChange(l),c=!1),m>l&&!rx(t.active,n.active)&&a.compareRange(l,m,t.active,n.active),f&&m<i&&(u||t.openEnd(p)!=n.openEnd(p))&&(c=!0)),p>i)break;l=p,d<=0&&t.next(),d>=0&&n.next()}}function rx(t,e){if(t.length!=e.length)return!1;for(let n=0;n<t.length;n++)if(t[n]!=e[n]&&!ix(t[n],e[n]))return!1;return!0}function fu(t,e){for(let n=e,r=t.length-1;n<r;n++)t[n]=t[n+1];t.pop()}function cu(t,e,n){for(let r=t.length-1;r>=e;r--)t[r+1]=t[r];t[e]=n}function Nw(t,e){let n=-1,r=1e9;for(let o=0;o<e.length;o++)(e[o]-r||t[o].endSide-t[n].endSide)<0&&(n=o,r=e[o]);return n}function oa(t,e,n=t.length){let r=0;for(let o=0;o<n&&o<t.length;)t.charCodeAt(o)==9?(r+=e-r%e,o++):(r++,o=Qe(t,o));return r}function Qw(t,e,n,r){for(let o=0,a=0;;){if(a>=e)return o;if(o==t.length)break;a+=t.charCodeAt(o)==9?n-a%n:1,o=Qe(t,o)}return r===!0?-1:t.length}var J,Gt,ki,na,du,pu,Gh,Wh,mt,vr,ht,ra,$o,O,ox,N,Ci,su,xt,ea,kn,mu,Oi,Cs,hu,zw,Yh,Hw,Uw,jw,Vw,Gw,Ot,Jh,Zh,oe,Ve,AM,cn,TM,ex,Te,un,As,nx,le,fo,gu,Ts,ta,Bi=F(()=>{Mw();J=class t{lineAt(e){if(e<0||e>this.length)throw new RangeError(`Invalid position ${e} in document of length ${this.length}`);return this.lineInner(e,!1,1,0)}line(e){if(e<1||e>this.lines)throw new RangeError(`Invalid line number ${e} in ${this.lines}-line document`);return this.lineInner(e,!0,1,0)}replace(e,n,r){[e,n]=Ti(this,e,n);let o=[];return this.decompose(0,e,o,2),r.length&&r.decompose(0,r.length,o,3),this.decompose(n,this.length,o,1),ki.from(o,this.length-(n-e)+r.length)}append(e){return this.replace(this.length,this.length,e)}slice(e,n=this.length){[e,n]=Ti(this,e,n);let r=[];return this.decompose(e,n,r,0),ki.from(r,n-e)}eq(e){if(e==this)return!0;if(e.length!=this.length||e.lines!=this.lines)return!1;let n=this.scanIdentical(e,1),r=this.length-this.scanIdentical(e,-1),o=new na(this),a=new na(e);for(let i=n,l=n;;){if(o.next(i),a.next(i),i=0,o.lineBreak!=a.lineBreak||o.done!=a.done||o.value!=a.value)return!1;if(l+=o.value.length,o.done||l>=r)return!0}}iter(e=1){return new na(this,e)}iterRange(e,n=this.length){return new du(this,e,n)}iterLines(e,n){let r;if(e==null)r=this.iter();else{n==null&&(n=this.lines+1);let o=this.line(e).from;r=this.iterRange(o,Math.max(o,n==this.lines+1?this.length:n<=1?0:this.line(n-1).to))}return new pu(r)}toString(){return this.sliceString(0)}toJSON(){let e=[];return this.flatten(e),e}constructor(){}static of(e){if(e.length==0)throw new RangeError("A document must have at least one line");return e.length==1&&!e[0]?t.empty:e.length<=32?new Gt(e):ki.from(Gt.split(e,[]))}},Gt=class t extends J{constructor(e,n=yM(e)){super(),this.text=e,this.length=n}get lines(){return this.text.length}get children(){return null}lineInner(e,n,r,o){for(let a=0;;a++){let i=this.text[a],l=o+i.length;if((n?r:l)>=e)return new Gh(o,l,r,i);o=l+1,r++}}decompose(e,n,r,o){let a=e<=0&&n>=this.length?this:new t(Rw(this.text,e,n),Math.min(n,this.length)-Math.max(0,e));if(o&1){let i=r.pop(),l=uu(a.text,i.text.slice(),0,a.length);if(l.length<=32)r.push(new t(l,i.length+a.length));else{let s=l.length>>1;r.push(new t(l.slice(0,s)),new t(l.slice(s)))}}else r.push(a)}replace(e,n,r){if(!(r instanceof t))return super.replace(e,n,r);[e,n]=Ti(this,e,n);let o=uu(this.text,uu(r.text,Rw(this.text,0,e)),n),a=this.length+r.length-(n-e);return o.length<=32?new t(o,a):ki.from(t.split(o,[]),a)}sliceString(e,n=this.length,r=`
`){[e,n]=Ti(this,e,n);let o="";for(let a=0,i=0;a<=n&&i<this.text.length;i++){let l=this.text[i],s=a+l.length;a>e&&i&&(o+=r),e<s&&n>a&&(o+=l.slice(Math.max(0,e-a),n-a)),a=s+1}return o}flatten(e){for(let n of this.text)e.push(n)}scanIdentical(){return 0}static split(e,n){let r=[],o=-1;for(let a of e)r.push(a),o+=a.length+1,r.length==32&&(n.push(new t(r,o)),r=[],o=-1);return o>-1&&n.push(new t(r,o)),n}},ki=class t extends J{constructor(e,n){super(),this.children=e,this.length=n,this.lines=0;for(let r of e)this.lines+=r.lines}lineInner(e,n,r,o){for(let a=0;;a++){let i=this.children[a],l=o+i.length,s=r+i.lines-1;if((n?s:l)>=e)return i.lineInner(e,n,r,o);o=l+1,r=s+1}}decompose(e,n,r,o){for(let a=0,i=0;i<=n&&a<this.children.length;a++){let l=this.children[a],s=i+l.length;if(e<=s&&n>=i){let f=o&((i<=e?1:0)|(s>=n?2:0));i>=e&&s<=n&&!f?r.push(l):l.decompose(e-i,n-i,r,f)}i=s+1}}replace(e,n,r){if([e,n]=Ti(this,e,n),r.lines<this.lines)for(let o=0,a=0;o<this.children.length;o++){let i=this.children[o],l=a+i.length;if(e>=a&&n<=l){let s=i.replace(e-a,n-a,r),f=this.lines-i.lines+s.lines;if(s.lines<f>>4&&s.lines>f>>6){let c=this.children.slice();return c[o]=s,new t(c,this.length-(n-e)+r.length)}return super.replace(a,l,s)}a=l+1}return super.replace(e,n,r)}sliceString(e,n=this.length,r=`
`){[e,n]=Ti(this,e,n);let o="";for(let a=0,i=0;a<this.children.length&&i<=n;a++){let l=this.children[a],s=i+l.length;i>e&&a&&(o+=r),e<s&&n>i&&(o+=l.sliceString(e-i,n-i,r)),i=s+1}return o}flatten(e){for(let n of this.children)n.flatten(e)}scanIdentical(e,n){if(!(e instanceof t))return 0;let r=0,[o,a,i,l]=n>0?[0,0,this.children.length,e.children.length]:[this.children.length-1,e.children.length-1,-1,-1];for(;;o+=n,a+=n){if(o==i||a==l)return r;let s=this.children[o],f=e.children[a];if(s!=f)return r+s.scanIdentical(f,n);r+=s.length+1}}static from(e,n=e.reduce((r,o)=>r+o.length+1,-1)){let r=0;for(let p of e)r+=p.lines;if(r<32){let p=[];for(let m of e)m.flatten(p);return new Gt(p,n)}let o=Math.max(32,r>>5),a=o<<1,i=o>>1,l=[],s=0,f=-1,c=[];function u(p){let m;if(p.lines>a&&p instanceof t)for(let x of p.children)u(x);else p.lines>i&&(s>i||!s)?(d(),l.push(p)):p instanceof Gt&&s&&(m=c[c.length-1])instanceof Gt&&p.lines+m.lines<=32?(s+=p.lines,f+=p.length+1,c[c.length-1]=new Gt(m.text.concat(p.text),m.length+1+p.length)):(s+p.lines>o&&d(),s+=p.lines,f+=p.length+1,c.push(p))}function d(){s!=0&&(l.push(c.length==1?c[0]:t.from(c,f)),f=-1,s=c.length=0)}for(let p of e)u(p);return d(),l.length==1?l[0]:new t(l,n)}};J.empty=new Gt([""],0);na=class{constructor(e,n=1){this.dir=n,this.done=!1,this.lineBreak=!1,this.value="",this.nodes=[e],this.offsets=[n>0?1:(e instanceof Gt?e.text.length:e.children.length)<<1]}nextInner(e,n){for(this.done=this.lineBreak=!1;;){let r=this.nodes.length-1,o=this.nodes[r],a=this.offsets[r],i=a>>1,l=o instanceof Gt?o.text.length:o.children.length;if(i==(n>0?l:0)){if(r==0)return this.done=!0,this.value="",this;n>0&&this.offsets[r-1]++,this.nodes.pop(),this.offsets.pop()}else if((a&1)==(n>0?0:1)){if(this.offsets[r]+=n,e==0)return this.lineBreak=!0,this.value=`
`,this;e--}else if(o instanceof Gt){let s=o.text[i+(n<0?-1:0)];if(this.offsets[r]+=n,s.length>Math.max(0,e))return this.value=e==0?s:n>0?s.slice(e):s.slice(0,s.length-e),this;e-=s.length}else{let s=o.children[i+(n<0?-1:0)];e>s.length?(e-=s.length,this.offsets[r]+=n):(n<0&&this.offsets[r]--,this.nodes.push(s),this.offsets.push(n>0?1:(s instanceof Gt?s.text.length:s.children.length)<<1))}}}next(e=0){return e<0&&(this.nextInner(-e,-this.dir),e=this.value.length),this.nextInner(e,this.dir)}},du=class{constructor(e,n,r){this.value="",this.done=!1,this.cursor=new na(e,n>r?-1:1),this.pos=n>r?e.length:0,this.from=Math.min(n,r),this.to=Math.max(n,r)}nextInner(e,n){if(n<0?this.pos<=this.from:this.pos>=this.to)return this.value="",this.done=!0,this;e+=Math.max(0,n<0?this.pos-this.to:this.from-this.pos);let r=n<0?this.pos-this.from:this.to-this.pos;e>r&&(e=r),r-=e;let{value:o}=this.cursor.next(e);return this.pos+=(o.length+e)*n,this.value=o.length<=r?o:n<0?o.slice(o.length-r):o.slice(0,r),this.done=!this.value,this}next(e=0){return e<0?e=Math.max(e,this.from-this.pos):e>0&&(e=Math.min(e,this.to-this.pos)),this.nextInner(e,this.cursor.dir)}get lineBreak(){return this.cursor.lineBreak&&this.value!=""}},pu=class{constructor(e){this.inner=e,this.afterBreak=!0,this.value="",this.done=!1}next(e=0){let{done:n,lineBreak:r,value:o}=this.inner.next(e);return n&&this.afterBreak?(this.value="",this.afterBreak=!1):n?(this.done=!0,this.value=""):r?this.afterBreak?this.value="":(this.afterBreak=!0,this.next()):(this.value=o,this.afterBreak=!1),this}get lineBreak(){return!1}};typeof Symbol<"u"&&(J.prototype[Symbol.iterator]=function(){return this.iter()},na.prototype[Symbol.iterator]=du.prototype[Symbol.iterator]=pu.prototype[Symbol.iterator]=function(){return this});Gh=class{constructor(e,n,r,o){this.from=e,this.to=n,this.number=r,this.text=o}get length(){return this.to-this.from}};Wh=/\r\n?|\n/,mt=(function(t){return t[t.Simple=0]="Simple",t[t.TrackDel=1]="TrackDel",t[t.TrackBefore=2]="TrackBefore",t[t.TrackAfter=3]="TrackAfter",t})(mt||(mt={})),vr=class t{constructor(e){this.sections=e}get length(){let e=0;for(let n=0;n<this.sections.length;n+=2)e+=this.sections[n];return e}get newLength(){let e=0;for(let n=0;n<this.sections.length;n+=2){let r=this.sections[n+1];e+=r<0?this.sections[n]:r}return e}get empty(){return this.sections.length==0||this.sections.length==2&&this.sections[1]<0}iterGaps(e){for(let n=0,r=0,o=0;n<this.sections.length;){let a=this.sections[n++],i=this.sections[n++];i<0?(e(r,o,a),o+=a):o+=i,r+=a}}iterChangedRanges(e,n=!1){Xh(this,e,n)}get invertedDesc(){let e=[];for(let n=0;n<this.sections.length;){let r=this.sections[n++],o=this.sections[n++];o<0?e.push(r,o):e.push(o,r)}return new t(e)}composeDesc(e){return this.empty?e:e.empty?this:qw(this,e)}mapDesc(e,n=!1){return e.empty?this:Qh(this,e,n)}mapPos(e,n=-1,r=mt.Simple){let o=0,a=0;for(let i=0;i<this.sections.length;){let l=this.sections[i++],s=this.sections[i++],f=o+l;if(s<0){if(f>e)return a+(e-o);a+=l}else{if(r!=mt.Simple&&f>=e&&(r==mt.TrackDel&&o<e&&f>e||r==mt.TrackBefore&&o<e||r==mt.TrackAfter&&f>e))return null;if(f>e||f==e&&n<0&&!l)return e==o||n<0?a:a+s;a+=s}o=f}if(e>o)throw new RangeError(`Position ${e} is out of range for changeset of length ${o}`);return a}touchesRange(e,n=e){for(let r=0,o=0;r<this.sections.length&&o<=n;){let a=this.sections[r++],i=this.sections[r++],l=o+a;if(i>=0&&o<=n&&l>=e)return o<e&&l>n?"cover":!0;o=l}return!1}toString(){let e="";for(let n=0;n<this.sections.length;){let r=this.sections[n++],o=this.sections[n++];e+=(e?" ":"")+r+(o>=0?":"+o:"")}return e}toJSON(){return this.sections}static fromJSON(e){if(!Array.isArray(e)||e.length%2||e.some(n=>typeof n!="number"))throw new RangeError("Invalid JSON representation of ChangeDesc");return new t(e)}static create(e){return new t(e)}},ht=class t extends vr{constructor(e,n){super(e),this.inserted=n}apply(e){if(this.length!=e.length)throw new RangeError("Applying change set to a document with the wrong length");return Xh(this,(n,r,o,a,i)=>e=e.replace(o,o+(r-n),i),!1),e}mapDesc(e,n=!1){return Qh(this,e,n,!0)}invert(e){let n=this.sections.slice(),r=[];for(let o=0,a=0;o<n.length;o+=2){let i=n[o],l=n[o+1];if(l>=0){n[o]=l,n[o+1]=i;let s=o>>1;for(;r.length<s;)r.push(J.empty);r.push(i?e.slice(a,a+i):J.empty)}a+=i}return new t(n,r)}compose(e){return this.empty?e:e.empty?this:qw(this,e,!0)}map(e,n=!1){return e.empty?this:Qh(this,e,n,!0)}iterChanges(e,n=!1){Xh(this,e,n)}get desc(){return vr.create(this.sections)}filter(e){let n=[],r=[],o=[],a=new ra(this);e:for(let i=0,l=0;;){let s=i==e.length?1e9:e[i++];for(;l<s||l==s&&a.len==0;){if(a.done)break e;let c=Math.min(a.len,s-l);it(o,c,-1);let u=a.ins==-1?-1:a.off==0?a.ins:0;it(n,c,u),u>0&&so(r,n,a.text),a.forward(c),l+=c}let f=e[i++];for(;l<f;){if(a.done)break e;let c=Math.min(a.len,f-l);it(n,c,-1),it(o,c,a.ins==-1?-1:a.off==0?a.ins:0),a.forward(c),l+=c}}return{changes:new t(n,r),filtered:vr.create(o)}}toJSON(){let e=[];for(let n=0;n<this.sections.length;n+=2){let r=this.sections[n],o=this.sections[n+1];o<0?e.push(r):o==0?e.push([r]):e.push([r].concat(this.inserted[n>>1].toJSON()))}return e}static of(e,n,r){let o=[],a=[],i=0,l=null;function s(c=!1){if(!c&&!o.length)return;i<n&&it(o,n-i,-1);let u=new t(o,a);l=l?l.compose(u.map(l)):u,o=[],a=[],i=0}function f(c){if(Array.isArray(c))for(let u of c)f(u);else if(c instanceof t){if(c.length!=n)throw new RangeError(`Mismatched change set length (got ${c.length}, expected ${n})`);s(),l=l?l.compose(c.map(l)):c}else{let{from:u,to:d=u,insert:p}=c;if(u>d||u<0||d>n)throw new RangeError(`Invalid change range ${u} to ${d} (in doc of length ${n})`);let m=p?typeof p=="string"?J.of(p.split(r||Wh)):p:J.empty,x=m.length;if(u==d&&x==0)return;u<i&&s(),u>i&&it(o,u-i,-1),it(o,d-u,x),so(a,o,m),i=d}}return f(e),s(!l),l}static empty(e){return new t(e?[e,-1]:[],[])}static fromJSON(e){if(!Array.isArray(e))throw new RangeError("Invalid JSON representation of ChangeSet");let n=[],r=[];for(let o=0;o<e.length;o++){let a=e[o];if(typeof a=="number")n.push(a,-1);else{if(!Array.isArray(a)||typeof a[0]!="number"||a.some((i,l)=>l&&typeof i!="string"))throw new RangeError("Invalid JSON representation of ChangeSet");if(a.length==1)n.push(a[0],0);else{for(;r.length<o;)r.push(J.empty);r[o]=J.of(a.slice(1)),n.push(a[0],r[o].length)}}}return new t(n,r)}static createSet(e,n){return new t(e,n)}};ra=class{constructor(e){this.set=e,this.i=0,this.next()}next(){let{sections:e}=this.set;this.i<e.length?(this.len=e[this.i++],this.ins=e[this.i++]):(this.len=0,this.ins=-2),this.off=0}get done(){return this.ins==-2}get len2(){return this.ins<0?this.len:this.ins}get text(){let{inserted:e}=this.set,n=this.i-2>>1;return n>=e.length?J.empty:e[n]}textBit(e){let{inserted:n}=this.set,r=this.i-2>>1;return r>=n.length&&!e?J.empty:n[r].slice(this.off,e==null?void 0:this.off+e)}forward(e){e==this.len?this.next():(this.len-=e,this.off+=e)}forward2(e){this.ins==-1?this.forward(e):e==this.ins?this.next():(this.ins-=e,this.off+=e)}},$o=class t{constructor(e,n,r,o){this.from=e,this.to=n,this.flags=r,this.goalColumn=o}get anchor(){return this.flags&32?this.to:this.from}get head(){return this.flags&32?this.from:this.to}get empty(){return this.from==this.to}get assoc(){return this.flags&8?-1:this.flags&16?1:0}get undirectional(){return(this.flags&64)>0}get bidiLevel(){let e=this.flags&7;return e==7?null:e}map(e,n=-1){let r,o;return this.empty?r=o=e.mapPos(this.from,n):(r=e.mapPos(this.from,1),o=e.mapPos(this.to,-1)),r==this.from&&o==this.to?this:new t(r,o,this.flags,this.goalColumn)}extend(e,n=e,r=0){if(e<=this.anchor&&n>=this.anchor)return O.range(e,n,void 0,void 0,r);let o=Math.abs(e-this.anchor)>Math.abs(n-this.anchor)?e:n;return O.range(this.anchor,o,void 0,void 0,r)}eq(e,n=!1){return this.anchor==e.anchor&&this.head==e.head&&this.goalColumn==e.goalColumn&&(!n||!this.empty||this.assoc==e.assoc)}toJSON(){return{anchor:this.anchor,head:this.head}}static fromJSON(e){if(!e||typeof e.anchor!="number"||typeof e.head!="number")throw new RangeError("Invalid JSON representation for SelectionRange");return O.range(e.anchor,e.head)}static create(e,n,r,o){return new t(e,n,r,o)}},O=class t{constructor(e,n){this.ranges=e,this.mainIndex=n}map(e,n=-1){return e.empty?this:t.create(this.ranges.map(r=>r.map(e,n)),this.mainIndex)}eq(e,n=!1){if(this.ranges.length!=e.ranges.length||this.mainIndex!=e.mainIndex)return!1;for(let r=0;r<this.ranges.length;r++)if(!this.ranges[r].eq(e.ranges[r],n))return!1;return!0}get main(){return this.ranges[this.mainIndex]}asSingle(){return this.ranges.length==1?this:new t([this.main],0)}addRange(e,n=!0){return t.create([e].concat(this.ranges),n?0:this.mainIndex+1)}replaceRange(e,n=this.mainIndex){let r=this.ranges.slice();return r[n]=e,t.create(r,this.mainIndex)}toJSON(){return{ranges:this.ranges.map(e=>e.toJSON()),main:this.mainIndex}}static fromJSON(e){if(!e||!Array.isArray(e.ranges)||typeof e.main!="number"||e.main>=e.ranges.length)throw new RangeError("Invalid JSON representation for EditorSelection");return new t(e.ranges.map(n=>$o.fromJSON(n)),e.main)}static single(e,n=e){return new t([t.range(e,n)],0)}static create(e,n=0){if(e.length==0)throw new RangeError("A selection needs at least one range");for(let r=0,o=0;o<e.length;o++){let a=e[o];if(a.empty?a.from<=r:a.from<r)return t.normalized(e.slice(),n);r=a.to}return new t(e,n)}static cursor(e,n=0,r,o){return $o.create(e,e,(n==0?0:n<0?8:16)|(r==null?7:Math.min(6,r)),o)}static range(e,n,r,o,a){let i=o==null?7:Math.min(6,o);return!a&&e!=n&&(a=n<e?1:-1),a&&(i|=a<0?8:16),n<e?$o.create(n,e,i|32,r):$o.create(e,n,i,r)}static undirectionalRange(e,n){return $o.create(e,n,64,void 0)}static normalized(e,n=0){let r=e[n];e.sort((o,a)=>o.from-a.from),n=e.indexOf(r);for(let o=1;o<e.length;o++){let a=e[o],i=e[o-1];if(a.empty?a.from<=i.to:a.from<i.to){let l=i.from,s=Math.max(a.to,i.to);o<=n&&n--,e.splice(--o,2,a.anchor>a.head?t.range(s,l):t.range(l,s))}}return new t(e,n)}};ox=0,N=class t{constructor(e,n,r,o,a){this.combine=e,this.compareInput=n,this.compare=r,this.isStatic=o,this.id=ox++,this.default=e([]),this.extensions=typeof a=="function"?a(this):a}get reader(){return this}static define(e={}){return new t(e.combine||(n=>n),e.compareInput||((n,r)=>n===r),e.compare||(e.combine?(n,r)=>n===r:ax),!!e.static,e.enables)}of(e){return new Ci([],this,0,e)}compute(e,n){if(this.isStatic)throw new Error("Can't compute a static facet");return new Ci(e,this,1,n)}computeN(e,n){if(this.isStatic)throw new Error("Can't compute a static facet");return new Ci(e,this,2,n)}from(e,n){return n||(n=r=>r),this.compute([e],r=>n(r.field(e)))}};Ci=class{constructor(e,n,r,o){this.dependencies=e,this.facet=n,this.type=r,this.value=o,this.id=ox++}dynamicSlot(e){var n;let r=this.value,o=this.facet.compareInput,a=this.id,i=e[a]>>1,l=this.type==2,s=!1,f=!1,c=[];for(let u of this.dependencies)u=="doc"?s=!0:u=="selection"?f=!0:(((n=e[u.id])!==null&&n!==void 0?n:1)&1)==0&&c.push(e[u.id]);return{create(u){return u.values[i]=r(u),1},update(u,d){if(s&&d.docChanged||f&&(d.docChanged||d.selection)||Kh(u,c)){let p=r(u);if(l?!Ew(p,u.values[i],o):!o(p,u.values[i]))return u.values[i]=p,1}return 0},reconfigure:(u,d)=>{let p,m=d.config.address[a];if(m!=null){let x=xu(d,m);if(this.dependencies.every(b=>b instanceof N?d.facet(b)===u.facet(b):b instanceof xt?d.field(b,!1)==u.field(b,!1):!0)||(l?Ew(p=r(u),x,o):o(p=r(u),x)))return u.values[i]=x,0}else p=r(u);return u.values[i]=p,1}}}get extension(){return this}};su=N.define({static:!0}),xt=class t{constructor(e,n,r,o,a){this.id=e,this.createF=n,this.updateF=r,this.compareF=o,this.spec=a,this.provides=void 0}static define(e){let n=new t(ox++,e.create,e.update,e.compare||((r,o)=>r===o),e);return e.provide&&(n.provides=e.provide(n)),n}create(e){let n=e.facet(su).find(r=>r.field==this);return(n?.create||this.createF)(e)}slot(e){let n=e[this.id]>>1;return{create:r=>(r.values[n]=this.create(r),1),update:(r,o)=>{let a=r.values[n],i=this.updateF(a,o);return this.compareF(a,i)?0:(r.values[n]=i,1)},reconfigure:(r,o)=>{let a=r.facet(su),i=o.facet(su),l;return(l=a.find(s=>s.field==this))&&l!=i.find(s=>s.field==this)?(r.values[n]=l.create(r),1):o.config.address[this.id]!=null?(r.values[n]=o.field(this),0):(r.values[n]=this.create(r),1)}}}init(e){return[this,su.of({field:this,create:e})]}get extension(){return this}},ea={lowest:4,low:3,default:2,high:1,highest:0};kn={highest:Ss(ea.highest),high:Ss(ea.high),default:Ss(ea.default),low:Ss(ea.low),lowest:Ss(ea.lowest)},mu=class{constructor(e,n){this.inner=e,this.prec=n}get extension(){return this}},Oi=class t{of(e){return new Cs(this,e)}reconfigure(e){return t.reconfigure.of({compartment:this,extension:e})}get(e){return e.config.compartments.get(this)}},Cs=class{constructor(e,n){this.compartment=e,this.inner=n}get extension(){return this}},hu=class t{constructor(e,n,r,o,a,i){for(this.base=e,this.compartments=n,this.dynamicSlots=r,this.address=o,this.staticValues=a,this.facets=i,this.statusTemplate=[];this.statusTemplate.length<r.length;)this.statusTemplate.push(0)}staticFacet(e){let n=this.address[e.id];return n==null?e.default:this.staticValues[n>>1]}static resolve(e,n,r){let o=[],a=Object.create(null),i=new Map;for(let d of wM(e,n,i))d instanceof xt?o.push(d):(a[d.facet.id]||(a[d.facet.id]=[])).push(d);let l=Object.create(null),s=[],f=[];for(let d of o)l[d.id]=f.length<<1,f.push(p=>d.slot(p));let c=r?.config.facets;for(let d in a){let p=a[d],m=p[0].facet,x=c&&c[d]||[];if(p.every(b=>b.type==0))if(l[m.id]=s.length<<1|1,ax(x,p))s.push(r.facet(m));else{let b=m.combine(p.map(h=>h.value));s.push(r&&m.compare(b,r.facet(m))?r.facet(m):b)}else{for(let b of p)b.type==0?(l[b.id]=s.length<<1|1,s.push(b.value)):(l[b.id]=f.length<<1,f.push(h=>b.dynamicSlot(h)));l[m.id]=f.length<<1,f.push(b=>vM(b,m,p))}}let u=f.map(d=>d(l));return new t(e,i,u,l,s,a)}};zw=N.define(),Yh=N.define({combine:t=>t.some(e=>e),static:!0}),Hw=N.define({combine:t=>t.length?t[0]:void 0,static:!0}),Uw=N.define(),jw=N.define(),Vw=N.define(),Gw=N.define({combine:t=>t.length?t[0]:!1}),Ot=class{constructor(e,n){this.type=e,this.value=n}static define(){return new Jh}},Jh=class{of(e){return new Ot(this,e)}},Zh=class{constructor(e){this.map=e}of(e){return new oe(this,e)}},oe=class t{constructor(e,n){this.type=e,this.value=n}map(e){let n=this.type.map(this.value,e);return n===void 0?void 0:n==this.value?this:new t(this.type,n)}is(e){return this.type==e}static define(e={}){return new Zh(e.map||(n=>n))}static mapEffects(e,n){if(!e.length)return e;let r=[];for(let o of e){let a=o.map(n);a&&r.push(a)}return r}};oe.reconfigure=oe.define();oe.appendConfig=oe.define();Ve=class t{constructor(e,n,r,o,a,i){this.startState=e,this.changes=n,this.selection=r,this.effects=o,this.annotations=a,this.scrollIntoView=i,this._doc=null,this._state=null,r&&Pw(r,n.newLength),a.some(l=>l.type==t.time)||(this.annotations=a.concat(t.time.of(Date.now())))}static create(e,n,r,o,a,i){return new t(e,n,r,o,a,i)}get newDoc(){return this._doc||(this._doc=this.changes.apply(this.startState.doc))}get newSelection(){return this.selection||this.startState.selection.map(this.changes)}get state(){return this._state||this.startState.applyTransaction(this),this._state}annotation(e){for(let n of this.annotations)if(n.type==e)return n.value}get docChanged(){return!this.changes.empty}get reconfigured(){return this.startState.config!=this.state.config}isUserEvent(e){let n=this.annotation(t.userEvent);return!!(n&&(n==e||n.length>e.length&&n.slice(0,e.length)==e&&n[e.length]=="."))}};Ve.time=Ot.define();Ve.userEvent=Ot.define();Ve.addToHistory=Ot.define();Ve.remote=Ot.define();AM=[];cn=(function(t){return t[t.Word=0]="Word",t[t.Space=1]="Space",t[t.Other=2]="Other",t})(cn||(cn={})),TM=/[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;try{ex=new RegExp("[\\p{Alphabetic}\\p{Number}_]","u")}catch{}Te=class t{constructor(e,n,r,o,a,i){this.config=e,this.doc=n,this.selection=r,this.values=o,this.status=e.statusTemplate.slice(),this.computeSlot=a,i&&(i._state=this);for(let l=0;l<this.config.dynamicSlots.length;l++)ks(this,l<<1);this.computeSlot=null}field(e,n=!0){let r=this.config.address[e.id];if(r==null){if(n)throw new RangeError("Field is not present in this state");return}return ks(this,r),xu(this,r)}update(...e){return Xw(this,e,!0)}applyTransaction(e){let n=this.config,{base:r,compartments:o}=n;for(let l of e.effects)l.is(Oi.reconfigure)?(n&&(o=new Map,n.compartments.forEach((s,f)=>o.set(f,s)),n=null),o.set(l.value.compartment,l.value.extension)):l.is(oe.reconfigure)?(n=null,r=l.value):l.is(oe.appendConfig)&&(n=null,r=Ai(r).concat(l.value));let a;n?a=e.startState.values.slice():(n=hu.resolve(r,o,this),a=new t(n,this.doc,this.selection,n.dynamicSlots.map(()=>null),(s,f)=>f.reconfigure(s,this),null).values);let i=e.startState.facet(Yh)?e.newSelection:e.newSelection.asSingle();new t(n,e.newDoc,i,a,(l,s)=>s.update(l,e),e)}replaceSelection(e){return typeof e=="string"&&(e=this.toText(e)),this.changeByRange(n=>({changes:{from:n.from,to:n.to,insert:e},range:O.cursor(n.from+e.length,-1)}))}changeByRange(e){let n=this.selection,r=e(n.ranges[0]),o=this.changes(r.changes),a=[r.range],i=Ai(r.effects);for(let l=1;l<n.ranges.length;l++){let s=e(n.ranges[l]),f=this.changes(s.changes),c=f.map(o);for(let d=0;d<l;d++)a[d]=a[d].map(c);let u=o.mapDesc(f,!0);a.push(s.range.map(u)),o=o.compose(c),i=oe.mapEffects(i,c).concat(oe.mapEffects(Ai(s.effects),u))}return{changes:o,selection:O.create(a,n.mainIndex),effects:i}}changes(e=[]){return e instanceof ht?e:ht.of(e,this.doc.length,this.facet(t.lineSeparator))}toText(e){return J.of(e.split(this.facet(t.lineSeparator)||Wh))}sliceDoc(e=0,n=this.doc.length){return this.doc.sliceString(e,n,this.lineBreak)}facet(e){let n=this.config.address[e.id];return n==null?e.default:(ks(this,n),xu(this,n))}toJSON(e){let n={doc:this.sliceDoc(),selection:this.selection.toJSON()};if(e)for(let r in e){let o=e[r];o instanceof xt&&this.config.address[o.id]!=null&&(n[r]=o.spec.toJSON(this.field(e[r]),this))}return n}static fromJSON(e,n={},r){if(!e||typeof e.doc!="string")throw new RangeError("Invalid JSON representation for EditorState");let o=[];if(r){for(let a in r)if(Object.prototype.hasOwnProperty.call(e,a)){let i=r[a],l=e[a];o.push(i.init(s=>i.spec.fromJSON(l,s)))}}return t.create({doc:e.doc,selection:O.fromJSON(e.selection),extensions:n.extensions?o.concat([n.extensions]):o})}static create(e={}){let n=hu.resolve(e.extensions||[],new Map),r=e.doc instanceof J?e.doc:J.of((e.doc||"").split(n.staticFacet(t.lineSeparator)||Wh)),o=e.selection?e.selection instanceof O?e.selection:O.single(e.selection.anchor,e.selection.head):O.single(0);return Pw(o,r.length),n.staticFacet(Yh)||(o=o.asSingle()),new t(n,r,o,n.dynamicSlots.map(()=>null),(a,i)=>i.create(a),null)}get tabSize(){return this.facet(t.tabSize)}get lineBreak(){return this.facet(t.lineSeparator)||`
`}get readOnly(){return this.facet(Gw)}phrase(e,...n){for(let r of this.facet(t.phrases))if(Object.prototype.hasOwnProperty.call(r,e)){e=r[e];break}return n.length&&(e=e.replace(/\$(\$|\d*)/g,(r,o)=>{if(o=="$")return"$";let a=+(o||1);return!a||a>n.length?r:n[a-1]})),e}languageDataAt(e,n,r=-1){let o=[];for(let a of this.facet(zw))for(let i of a(this,n,r))Object.prototype.hasOwnProperty.call(i,e)&&o.push(i[e]);return o}charCategorizer(e){let n=this.languageDataAt("wordChars",e);return BM(n.length?n[0]:"")}wordAt(e){let{text:n,from:r,length:o}=this.doc.lineAt(e),a=this.charCategorizer(e),i=e-r,l=e-r;for(;i>0;){let s=Qe(n,i,!1);if(a(n.slice(s,i))!=cn.Word)break;i=s}for(;l<o;){let s=Qe(n,l);if(a(n.slice(l,s))!=cn.Word)break;l=s}return i==l?null:O.range(i+r,l+r)}};Te.allowMultipleSelections=Yh;Te.tabSize=N.define({combine:t=>t.length?t[0]:4});Te.lineSeparator=Hw;Te.readOnly=Gw;Te.phrases=N.define({compare(t,e){let n=Object.keys(t),r=Object.keys(e);return n.length==r.length&&n.every(o=>t[o]==e[o])}});Te.languageData=zw;Te.changeFilter=Uw;Te.transactionFilter=jw;Te.transactionExtender=Vw;Oi.reconfigure=oe.define();un=class{eq(e){return this==e}range(e,n=e){return As.create(e,n,this)}};un.prototype.startSide=un.prototype.endSide=0;un.prototype.point=!1;un.prototype.mapMode=mt.TrackDel;As=class t{constructor(e,n,r){this.from=e,this.to=n,this.value=r}static create(e,n,r){return new t(e,n,r)}};nx=class t{constructor(e,n,r,o){this.from=e,this.to=n,this.value=r,this.maxPoint=o}get length(){return Si(this.to)}findIndex(e,n,r,o=0){let a=r?this.to:this.from;for(let i=o,l=a.length;;){if(i==l)return i;let s=i+l>>1,f=a[s]-e||(r?this.value[s].endSide:this.value[s].startSide)-n;if(s==i)return f>=0?i:l;f>=0?l=s:i=s+1}}between(e,n,r,o){for(let a=this.findIndex(n,-1e9,!0),i=this.findIndex(r,1e9,!1,a);a<i;a++)if(o(this.from[a]+e,this.to[a]+e,this.value[a])===!1)return!1}map(e,n,r,o,a){let i=[],l=[],s=[],f=-1,c=-1;e:for(let u=0;u<this.value.length;u++){let d=this.value[u],p=this.from[u]+e,m=this.to[u]+e,x,b;if(p==m){let h=n.mapPos(p,d.startSide,d.mapMode);if(h==null||(x=b=h,d.startSide!=d.endSide&&(b=n.mapPos(p,d.endSide),b<x)))continue}else if(x=n.mapPos(p,d.startSide),b=n.mapPos(m,d.endSide),x>b||x==b&&d.startSide>0&&d.endSide<=0)continue;if(!((b-x||d.endSide-d.startSide)<0))if(f<0&&(f=x),d.point&&(c=Math.max(c,b-x)),(x-r||d.startSide-o)>=0)i.push(d),l.push(x-f),s.push(b-f),r=b,o=d.endSide;else{if(x==b)for(let h=i.length;h>0;h--){if((x-(s[h-1]+f)||d.startSide-i[h-1].endSide)>=0){i.splice(h,0,d),l.splice(h,0,x-f),s.splice(h,0,b-f);continue e}if((x-(l[h-1]+f)||d.endSide-i[h-1].startSide)>0)break}a(x,b,d)}}return{mapped:i.length?new t(l,s,i,c):null,pos:f}}},le=class t{constructor(e,n,r,o){this.chunkPos=e,this.chunk=n,this.nextLayer=r,this.maxPoint=o}static create(e,n,r,o){return new t(e,n,r,o)}get length(){let e=this.chunk.length-1;return e<0?0:Math.max(this.chunkEnd(e),this.nextLayer.length)}get size(){if(this.isEmpty)return 0;let e=this.nextLayer.size;for(let n of this.chunk)e+=n.value.length;return e}chunkEnd(e){return this.chunkPos[e]+this.chunk[e].length}update(e){let{add:n=[],sort:r=!1,filterFrom:o=0,filterTo:a=this.length}=e,i=e.filter;if(n.length==0&&!i)return this;if(r&&(n=n.slice().sort(tx)),this.isEmpty)return n.length?t.of(n):this;let l=new gu(this,null,-1).goto(0),s=0,f=[],c=new fo;for(;l.value||s<n.length;)if(s<n.length&&(l.from-n[s].from||l.startSide-n[s].value.startSide)>=0){let u=n[s++];c.addInner(u.from,u.to,u.value,!1)||f.push(u)}else l.rangeIndex==1&&l.chunkIndex<this.chunk.length&&(s==n.length||this.chunkEnd(l.chunkIndex)<n[s].from)&&(!i||o>this.chunkEnd(l.chunkIndex)||a<this.chunkPos[l.chunkIndex])&&c.addChunk(this.chunkPos[l.chunkIndex],this.chunk[l.chunkIndex])?l.nextChunk():((!i||o>l.to||a<l.from||i(l.from,l.to,l.value))&&(c.addInner(l.from,l.to,l.value,!1)||f.push(As.create(l.from,l.to,l.value))),l.next());return c.finishInner(this.nextLayer.isEmpty&&!f.length?t.empty:this.nextLayer.update({add:f,filter:i,filterFrom:o,filterTo:a}))}map(e){if(e.empty||this.isEmpty)return this;let n=[],r=[],o=-1,a,i=(s,f,c)=>{a||(a=new fo),a.addRange(s,f,c,!1)};for(let s=0;s<this.chunk.length;s++){let f=this.chunkPos[s],c=this.chunk[s],u=e.touchesRange(f,f+c.length);if(u===!1)o=Math.max(o,c.maxPoint),n.push(c),r.push(e.mapPos(f));else if(u===!0){let[d,p]=n.length?[Si(r)+Si(n).length,Si(Si(n).value).endSide]:[-1,-1],{mapped:m,pos:x}=c.map(f,e,d,p,i);m&&(o=Math.max(o,m.maxPoint),n.push(m),r.push(x))}}let l=this.nextLayer.map(e);return a&&(l=a.finishInner(l)),n.length==0?l:new t(r,n,l||t.empty,o)}between(e,n,r){if(!this.isEmpty){for(let o=0;o<this.chunk.length;o++){let a=this.chunkPos[o],i=this.chunk[o];if(n>=a&&e<=a+i.length&&i.between(a,e-a,n-a,r)===!1)return}this.nextLayer.between(e,n,r)}}iter(e=0){return Ts.from([this]).goto(e)}get isEmpty(){return this.nextLayer==this}static iter(e,n=0){return Ts.from(e).goto(n)}static compare(e,n,r,o,a=-1){let i=e.filter(u=>u.maxPoint>0||!u.isEmpty&&u.maxPoint>=a),l=n.filter(u=>u.maxPoint>0||!u.isEmpty&&u.maxPoint>=a),s=Fw(i,l,r),f=new ta(i,s,a),c=new ta(l,s,a);r.iterGaps((u,d,p)=>Lw(f,u,c,d,p,o)),r.empty&&r.length==0&&Lw(f,0,c,0,0,o)}static eq(e,n,r=0,o){o==null&&(o=999999999);let a=e.filter(c=>!c.isEmpty&&n.indexOf(c)<0),i=n.filter(c=>!c.isEmpty&&e.indexOf(c)<0);if(a.length!=i.length)return!1;if(!a.length)return!0;let l=Fw(a,i),s=new ta(a,l,0).goto(r),f=new ta(i,l,0).goto(r);for(;;){if(s.to!=f.to||!rx(s.active,f.active)||s.point&&(!f.point||!ix(s.point,f.point)))return!1;if(s.to>o)return!0;s.next(),f.next()}}static spans(e,n,r,o,a=-1){let i=new ta(e,null,a).goto(n),l=n,s=i.openStart;for(;;){let f=Math.min(i.to,r);if(i.point){let c=i.activeForPoint(i.to),u=i.pointFrom<n?c.length+1:i.point.startSide<0?c.length:Math.min(c.length,s);o.point(l,f,i.point,c,u,i.pointRank),s=Math.min(i.openEnd(f),c.length)}else f>l&&(o.span(l,f,i.active,s),s=i.openEnd(f));if(i.to>r)return s+(i.point&&i.to>r?1:0);l=i.to,i.next()}}static of(e,n=!1){let r=new fo;for(let o of e instanceof As?[e]:n?DM(e):e)r.add(o.from,o.to,o.value);return r.finish()}static join(e){if(!e.length)return t.empty;let n=Si(e);for(let r=e.length-2;r>=0;r--)for(let o=e[r];o!=t.empty;o=o.nextLayer)n=new t(o.chunkPos,o.chunk,n,Math.max(o.maxPoint,n.maxPoint));return n}};le.empty=new le([],[],null,-1);le.empty.nextLayer=le.empty;fo=class t{finishChunk(e){this.chunks.push(new nx(this.from,this.to,this.value,this.maxPoint)),this.chunkPos.push(this.chunkStart),this.chunkStart=-1,this.setMaxPoint=Math.max(this.setMaxPoint,this.maxPoint),this.maxPoint=-1,e&&(this.from=[],this.to=[],this.value=[])}constructor(){this.chunks=[],this.chunkPos=[],this.chunkStart=-1,this.last=null,this.lastFrom=-1e9,this.lastTo=-1e9,this.from=[],this.to=[],this.value=[],this.maxPoint=-1,this.setMaxPoint=-1,this.nextLayer=null}add(e,n,r){this.addRange(e,n,r,!0)}addRange(e,n,r,o){this.addInner(e,n,r,o)||(this.nextLayer||(this.nextLayer=new t)).addRange(e,n,r,o)}addInner(e,n,r,o){let a=e-this.lastTo||r.startSide-this.last.endSide;if(o&&a<=0&&(e-this.lastFrom||r.startSide-this.last.startSide)<0)throw new Error("Ranges must be added sorted by `from` position and `startSide`");return a<0?!1:(this.from.length==250&&this.finishChunk(!0),this.chunkStart<0&&(this.chunkStart=e),this.from.push(e-this.chunkStart),this.to.push(n-this.chunkStart),this.last=r,this.lastFrom=e,this.lastTo=n,this.value.push(r),r.point&&(this.maxPoint=Math.max(this.maxPoint,n-e)),!0)}addChunk(e,n){if((e-this.lastTo||n.value[0].startSide-this.last.endSide)<0)return!1;this.from.length&&this.finishChunk(!0),this.setMaxPoint=Math.max(this.setMaxPoint,n.maxPoint),this.chunks.push(n),this.chunkPos.push(e);let r=n.value.length-1;return this.last=n.value[r],this.lastFrom=n.from[r]+e,this.lastTo=n.to[r]+e,!0}finish(){return this.finishInner(le.empty)}finishInner(e){if(this.from.length&&this.finishChunk(!1),this.chunks.length==0)return e;let n=le.create(this.chunkPos,this.chunks,this.nextLayer?this.nextLayer.finishInner(e):e,this.setMaxPoint);return this.from=null,n}};gu=class{constructor(e,n,r,o=0){this.layer=e,this.skip=n,this.minPoint=r,this.rank=o}get startSide(){return this.value?this.value.startSide:0}get endSide(){return this.value?this.value.endSide:0}goto(e,n=-1e9){return this.chunkIndex=this.rangeIndex=0,this.gotoInner(e,n,!1),this}gotoInner(e,n,r){for(;this.chunkIndex<this.layer.chunk.length;){let o=this.layer.chunk[this.chunkIndex];if(!(this.skip&&this.skip.has(o)||this.layer.chunkEnd(this.chunkIndex)<e||o.maxPoint<this.minPoint))break;this.chunkIndex++,r=!1}if(this.chunkIndex<this.layer.chunk.length){let o=this.layer.chunk[this.chunkIndex].findIndex(e-this.layer.chunkPos[this.chunkIndex],n,!0);(!r||this.rangeIndex<o)&&this.setRangeIndex(o)}this.next()}forward(e,n){(this.to-e||this.endSide-n)<0&&this.gotoInner(e,n,!0)}next(){for(;;)if(this.chunkIndex==this.layer.chunk.length){this.from=this.to=1e9,this.value=null;break}else{let e=this.layer.chunkPos[this.chunkIndex],n=this.layer.chunk[this.chunkIndex],r=e+n.from[this.rangeIndex];if(this.from=r,this.to=e+n.to[this.rangeIndex],this.value=n.value[this.rangeIndex],this.setRangeIndex(this.rangeIndex+1),this.minPoint<0||this.value.point&&this.to-this.from>=this.minPoint)break}}setRangeIndex(e){if(e==this.layer.chunk[this.chunkIndex].value.length){if(this.chunkIndex++,this.skip)for(;this.chunkIndex<this.layer.chunk.length&&this.skip.has(this.layer.chunk[this.chunkIndex]);)this.chunkIndex++;this.rangeIndex=0}else this.rangeIndex=e}nextChunk(){this.chunkIndex++,this.rangeIndex=0,this.next()}compare(e){return this.from-e.from||this.startSide-e.startSide||this.rank-e.rank||this.to-e.to||this.endSide-e.endSide}},Ts=class t{constructor(e){this.heap=e}static from(e,n=null,r=-1){let o=[];for(let a=0;a<e.length;a++)for(let i=e[a];!i.isEmpty;i=i.nextLayer)i.maxPoint>=r&&o.push(new gu(i,n,r,a));return o.length==1?o[0]:new t(o)}get startSide(){return this.value?this.value.startSide:0}goto(e,n=-1e9){for(let r of this.heap)r.goto(e,n);for(let r=this.heap.length>>1;r>=0;r--)Vh(this.heap,r);return this.next(),this}forward(e,n){for(let r of this.heap)r.forward(e,n);for(let r=this.heap.length>>1;r>=0;r--)Vh(this.heap,r);(this.to-e||this.value.endSide-n)<0&&this.next()}next(){if(this.heap.length==0)this.from=this.to=1e9,this.value=null,this.rank=-1;else{let e=this.heap[0];this.from=e.from,this.to=e.to,this.value=e.value,this.rank=e.rank,e.value&&e.next(),Vh(this.heap,0)}}};ta=class{constructor(e,n,r){this.minPoint=r,this.active=[],this.activeTo=[],this.activeRank=[],this.minActive=-1,this.point=null,this.pointFrom=0,this.pointRank=0,this.to=-1e9,this.endSide=0,this.openStart=-1,this.cursor=Ts.from(e,n,r)}goto(e,n=-1e9){return this.cursor.goto(e,n),this.active.length=this.activeTo.length=this.activeRank.length=0,this.minActive=-1,this.to=e,this.endSide=n,this.openStart=-1,this.next(),this}forward(e,n){for(;this.minActive>-1&&(this.activeTo[this.minActive]-e||this.active[this.minActive].endSide-n)<0;)this.removeActive(this.minActive);this.cursor.forward(e,n)}removeActive(e){fu(this.active,e),fu(this.activeTo,e),fu(this.activeRank,e),this.minActive=Nw(this.active,this.activeTo)}addActive(e){let n=0,{value:r,to:o,rank:a}=this.cursor;for(;n<this.activeRank.length&&(a-this.activeRank[n]||o-this.activeTo[n])>0;)n++;cu(this.active,n,r),cu(this.activeTo,n,o),cu(this.activeRank,n,a),e&&cu(e,n,this.cursor.from),this.minActive=Nw(this.active,this.activeTo)}next(){let e=this.to,n=this.point;this.point=null;let r=this.openStart<0?[]:null;for(;;){let o=this.minActive;if(o>-1&&(this.activeTo[o]-this.cursor.from||this.active[o].endSide-this.cursor.startSide)<0){if(this.activeTo[o]>e){this.to=this.activeTo[o],this.endSide=this.active[o].endSide;break}this.removeActive(o),r&&fu(r,o)}else if(this.cursor.value)if(this.cursor.from>e){this.to=this.cursor.from,this.endSide=this.cursor.startSide;break}else{let a=this.cursor.value;if(!a.point)this.addActive(r),this.cursor.next();else if(n&&this.cursor.to==this.to&&this.cursor.from<this.cursor.to)this.cursor.next();else{this.point=a,this.pointFrom=this.cursor.from,this.pointRank=this.cursor.rank,this.to=this.cursor.to,this.endSide=a.endSide,this.cursor.next(),this.forward(this.to,this.endSide);break}}else{this.to=this.endSide=1e9;break}}if(r){this.openStart=0;for(let o=r.length-1;o>=0&&r[o]<e;o--)this.openStart++}}activeForPoint(e){if(!this.active.length)return this.active;let n=[];for(let r=this.active.length-1;r>=0&&!(this.activeRank[r]<this.pointRank);r--)(this.activeTo[r]>e||this.activeTo[r]==e&&this.active[r].endSide>=this.point.endSide)&&n.push(this.active[r]);return n.reverse()}openEnd(e){let n=0;for(let r=this.activeTo.length-1;r>=0&&this.activeTo[r]>e;r--)n++;return n}}});var Kw,lx,Yw,dn,Jw,sx,fx=F(()=>{Kw=typeof Symbol>"u"?"__\u037C":Symbol.for("\u037C"),lx=typeof Symbol>"u"?"__styleSet"+Math.floor(Math.random()*1e8):Symbol("styleSet"),Yw=typeof globalThis<"u"?globalThis:typeof window<"u"?window:{},dn=class{constructor(e,n){this.rules=[];let{finish:r}=n||{};function o(i){return/^@/.test(i)?[i]:i.split(/,\s*/)}function a(i,l,s,f){let c=[],u=/^@(\w+)\b/.exec(i[0]),d=u&&u[1]=="keyframes";if(u&&l==null)return s.push(i[0]+";");for(let p in l){let m=l[p];if(/&/.test(p))a(p.split(/,\s*/).map(x=>i.map(b=>x.replace(/&/,b))).reduce((x,b)=>x.concat(b)),m,s);else if(m&&typeof m=="object"){if(!u)throw new RangeError("The value of a property ("+p+") should be a primitive value.");a(o(p),m,c,d)}else m!=null&&c.push(p.replace(/_.*/,"").replace(/[A-Z]/g,x=>"-"+x.toLowerCase())+": "+m+";")}(c.length||d)&&s.push((r&&!u&&!f?i.map(r):i).join(", ")+" {"+c.join(" ")+"}")}for(let i in e)a(o(i),e[i],this.rules)}getRules(){return this.rules.join(`
`)}static newName(){let e=Yw[Kw]||1;return Yw[Kw]=e+1,"\u037C"+e.toString(36)}static mount(e,n,r){let o=e[lx],a=r&&r.nonce;o?a&&o.setNonce(a):o=new sx(e,a),o.mount(Array.isArray(n)?n:[n],e)}},Jw=new Map,sx=class{constructor(e,n){let r=e.ownerDocument||e,o=r.defaultView;if(!e.head&&e.adoptedStyleSheets&&o.CSSStyleSheet){let a=Jw.get(r);if(a)return e[lx]=a;this.sheet=new o.CSSStyleSheet,Jw.set(r,this)}else this.styleTag=r.createElement("style"),n&&this.styleTag.setAttribute("nonce",n);this.modules=[],e[lx]=this}mount(e,n){let r=this.sheet,o=0,a=0,i=!1;for(let l=0;l<e.length;l++){let s=e[l],f=this.modules.indexOf(s);if(f<a&&f>-1&&(this.modules.splice(f,1),i=!0,a--,f=-1),f==-1){if(this.modules.splice(a++,0,s),i=!0,r)for(let c=0;c<s.rules.length;c++)r.insertRule(s.rules[c],o++)}else{for(;a<f;)o+=this.modules[a++].rules.length;o+=s.rules.length,a++}}if(r)n.adoptedStyleSheets.indexOf(this.sheet)<0&&(n.adoptedStyleSheets=[this.sheet,...n.adoptedStyleSheets]);else{if(i){let s="";for(let f=0;f<this.modules.length;f++)s+=this.modules[f].getRules()+`
`;this.styleTag.textContent=s}let l=n.head||n;this.styleTag.parentNode!=l&&l.insertBefore(this.styleTag,l.firstChild)}}setNonce(e){this.styleTag&&this.styleTag.getAttribute("nonce")!=e&&this.styleTag.setAttribute("nonce",e)}}});function Zw(t){var e=MM&&t.metaKey&&t.shiftKey&&!t.ctrlKey&&!t.altKey||RM&&t.shiftKey&&t.key&&t.key.length==1||t.key=="Unidentified",n=!e&&t.key||(t.shiftKey?Di:Sr)[t.keyCode]||t.key||"Unidentified";return n=="Esc"&&(n="Escape"),n=="Del"&&(n="Delete"),n=="Left"&&(n="ArrowLeft"),n=="Up"&&(n="ArrowUp"),n=="Right"&&(n="ArrowRight"),n=="Down"&&(n="ArrowDown"),n}var Sr,Di,MM,RM,He,He,He,yu,$w=F(()=>{Sr={8:"Backspace",9:"Tab",10:"Enter",12:"NumLock",13:"Enter",16:"Shift",17:"Control",18:"Alt",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",44:"PrintScreen",45:"Insert",46:"Delete",59:";",61:"=",91:"Meta",92:"Meta",106:"*",107:"+",108:",",109:"-",110:".",111:"/",144:"NumLock",145:"ScrollLock",160:"Shift",161:"Shift",162:"Control",163:"Control",164:"Alt",165:"Alt",173:"-",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},Di={48:")",49:"!",50:"@",51:"#",52:"$",53:"%",54:"^",55:"&",56:"*",57:"(",59:":",61:"+",173:"_",186:":",187:"+",188:"<",189:"_",190:">",191:"?",192:"~",219:"{",220:"|",221:"}",222:'"'},MM=typeof navigator<"u"&&/Mac/.test(navigator.platform),RM=typeof navigator<"u"&&/MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);for(He=0;He<10;He++)Sr[48+He]=Sr[96+He]=String(He);for(He=1;He<=24;He++)Sr[He+111]="F"+He;for(He=65;He<=90;He++)Sr[He]=String.fromCharCode(He+32),Di[He]=String.fromCharCode(He);for(yu in Sr)Di.hasOwnProperty(yu)||(Di[yu]=Sr[yu])});var eS=F(()=>{});function sg(t,e){for(let n in t)n=="class"&&e.class?e.class+=" "+t.class:n=="style"&&e.style?e.style+=";"+t.style:e[n]=t[n];return e}function fg(t,e,n){if(t==e)return!0;t||(t=Du),e||(e=Du);let r=Object.keys(t),o=Object.keys(e);if(r.length-0!=o.length-0)return!1;for(let a of r)if(a!=n&&(o.indexOf(a)==-1||t[a]!==e[a]))return!1;return!0}function EM(t,e){for(let n=t.attributes.length-1;n>=0;n--){let r=t.attributes[n].name;e[r]==null&&t.removeAttribute(r)}for(let n in e){let r=e[n];n=="style"?t.style.cssText=r:t.getAttribute(n)!=r&&t.setAttribute(n,r)}}function oS(t,e,n){let r=!1;if(e)for(let o in e)n&&o in n||(r=!0,o=="style"?t.style.cssText="":t.removeAttribute(o));if(n)for(let o in n)e&&e[o]==n[o]||(r=!0,o=="style"?t.style.cssText=n[o]:t.setAttribute(o,n[o]));return r}function FM(t){let e=Object.create(null);for(let n=0;n<t.attributes.length;n++){let r=t.attributes[n];e[r.name]=r.value}return e}function ES(t,e=!1){let{inclusiveStart:n,inclusiveEnd:r}=t;return n==null&&(n=t.inclusive),r==null&&(r=t.inclusive),{start:n??e,end:r??e}}function LM(t,e){return t==e||!!(t&&e&&t.compare(e))}function Li(t,e,n,r=0){let o=n.length-1;o>=0&&n[o]+r>=t?n[o]=Math.max(n[o],e):n.push(t,e)}function zs(t){let e;return t.nodeType==11?e=t.getSelection?t:t.ownerDocument:e=t,e.getSelection()}function wx(t,e){return e?t==e||t.contains(e.nodeType!=1?e.parentNode:e):!1}function Ds(t,e){if(!e.anchorNode)return!1;try{return wx(t,e.anchorNode)}catch{return!1}}function Tu(t){return _i(t)?Hs(t,0,t.nodeValue.length).getClientRects():Ke(t)?t.getClientRects():[]}function Ms(t,e,n,r){return n?aS(t,e,n,r,-1)||aS(t,e,n,r,1):!1}function xo(t){for(var e=0;;e++)if(t=t.previousSibling,!t)return e}function Ru(t){return Ke(t)&&/^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(t.nodeName)}function aS(t,e,n,r,o){for(;;){if(t==n&&e==r)return!0;if(e==(o<0?0:Ar(t))){if(t.nodeName=="DIV")return!1;let a=t.parentNode;if(!a||!Ke(a))return!1;e=xo(t)+(o<0?0:1),t=a}else if(Ke(t)){if(t=t.childNodes[e+(o<0?-1:0)],Ke(t)&&(t.nodeName=="IMG"||t.nodeName=="BR"||t.contentEditable=="false"))return!1;e=o<0?Ar(t):0}else return!1}}function Ar(t){return _i(t)?t.nodeValue.length:t.childNodes.length}function Eu(t,e){let{left:n,right:r}=t;if(n==r)return t;let o=e?n:r;return{left:o,right:o,top:t.top,bottom:t.bottom}}function NM(t){let e=t.visualViewport;return e?{left:0,right:e.width,top:0,bottom:e.height}:{left:0,right:t.innerWidth,top:0,bottom:t.innerHeight}}function FS(t,e){let n=e.width/t.offsetWidth,r=e.height/t.offsetHeight;return(n>.995&&n<1.005||!isFinite(n)||Math.abs(e.width-t.offsetWidth)<1)&&(n=1),(r>.995&&r<1.005||!isFinite(r)||Math.abs(e.height-t.offsetHeight)<1)&&(r=1),{scaleX:n,scaleY:r}}function _M(t,e,n,r,o,a,i,l){let s=t.ownerDocument,f=s.defaultView||window;for(let c=t,u=!1;c&&!u;)if(Ke(c)){let d,p=c==s.body,m=1,x=1,b=!0,h=!0;if(p)d=NM(f);else{let I=getComputedStyle(c);if(/^(fixed|sticky)$/.test(I.position)&&(u=!0),(c.scrollHeight<=c.clientHeight||!/auto|scroll/.test(I.overflowY))&&(h=!1),(c.scrollWidth<=c.clientWidth||!/auto|scroll/.test(I.overflowX))&&(b=!1),!b&&!h){c=c.assignedSlot||c.parentNode;continue}let v=c.getBoundingClientRect();({scaleX:m,scaleY:x}=FS(c,v)),d={left:v.left,right:v.left+c.clientWidth*m,top:v.top,bottom:v.top+c.clientHeight*x}}let y=0,g=0;if(h)if(o=="nearest")e.top<d.top+i?(g=e.top-(d.top+i),n>0&&e.bottom>d.bottom+g&&(g=e.bottom-d.bottom+i)):e.bottom>d.bottom-i&&(g=e.bottom-d.bottom+i,n<0&&e.top-g<d.top&&(g=e.top-(d.top+i)));else{let I=e.bottom-e.top,v=d.bottom-d.top;g=(o=="center"&&I<=v?e.top+I/2-v/2:o=="start"||o=="center"&&n<0?e.top-i:e.bottom-v+i)-d.top}if(b&&(r=="nearest"?e.left<d.left+a?(y=e.left-(d.left+a),n>0&&e.right>d.right+y&&(y=e.right-d.right+a)):e.right>d.right-a&&(y=e.right-d.right+a,n<0&&e.left<d.left+y&&(y=e.left-(d.left+a))):y=(r=="center"?e.left+(e.right-e.left)/2-(d.right-d.left)/2:r=="start"==l?e.left-a:e.right-(d.right-d.left)+a)-d.left),y||g)if(p)f.scrollBy(y,g);else{let I=0,v=0;if(g){let S=c.scrollTop;c.scrollTop+=g/x,v=(c.scrollTop-S)*x}if(y){let S=c.scrollLeft;c.scrollLeft+=y/m,I=(c.scrollLeft-S)*m}e={left:e.left-I,top:e.top-v,right:e.right-I,bottom:e.bottom-v},I&&Math.abs(I-y)<1&&(r="nearest"),v&&Math.abs(v-g)<1&&(o="nearest")}if(p)break;(e.top<d.top||e.bottom>d.bottom||e.left<d.left||e.right>d.right)&&(e={left:Math.max(e.left,d.left),right:Math.min(e.right,d.right),top:Math.max(e.top,d.top),bottom:Math.min(e.bottom,d.bottom)}),c=c.assignedSlot||c.parentNode}else if(c.nodeType==11)c=c.host;else break}function LS(t,e=!0){let n=t.ownerDocument,r=null,o=null;for(let a=t.parentNode;a&&!(a==n.body||(!e||r)&&o);)if(Ke(a))!o&&a.scrollHeight>a.clientHeight&&/scroll|auto/.test(getComputedStyle(a).overflowY)&&(o=a),e&&!r&&a.scrollWidth>a.clientWidth&&/scroll|auto/.test(getComputedStyle(a).overflowX)&&(r=a),a=a.assignedSlot||a.parentNode;else if(a.nodeType==11)a=a.host;else break;return{x:r,y:o}}function NS(t){let e=[];for(let n=t;n;n=n.nodeType==11?n.host:n.parentNode)Ke(n)&&e.push({node:n,left:n.scrollLeft,top:n.scrollTop});return e}function _S(t,e=!0){for(let{node:n,left:r,top:o}of t)e&&n.scrollTop!=o&&(n.scrollTop=o),n.scrollLeft!=r&&(n.scrollLeft=r)}function qS(t){if(t.setActive)return t.setActive();if(aa)return t.focus(aa);let e=NS(t);t.focus(aa==null?{get preventScroll(){return aa={preventScroll:!0},!0}}:void 0),aa||(aa=!1,_S(e))}function Hs(t,e,n=e){let r=iS||(iS=document.createRange());return r.setEnd(t,n),r.setStart(t,e),r}function Ni(t,e,n,r){let o={key:e,code:e,keyCode:n,which:n,cancelable:!0};r&&({altKey:o.altKey,ctrlKey:o.ctrlKey,shiftKey:o.shiftKey,metaKey:o.metaKey}=r);let a=new KeyboardEvent("keydown",o);a.synthetic=!0,t.dispatchEvent(a);let i=new KeyboardEvent("keyup",o);return i.synthetic=!0,t.dispatchEvent(i),a.defaultPrevented||i.defaultPrevented}function qM(t){for(;t;){if(t&&(t.nodeType==9||t.nodeType==11&&t.host))return t;t=t.assignedSlot||t.parentNode}return null}function PM(t,e){let n=e.focusNode,r=e.focusOffset;if(!n||e.anchorNode!=n||e.anchorOffset!=r)return!1;for(r=Math.min(r,Ar(n));;)if(r){if(!Ke(n))return!1;let o=n.childNodes[r-1];o.contentEditable=="false"?r--:(n=o,r=Ar(n))}else{if(n==t)return!0;r=xo(n),n=n.parentNode}}function PS(t){return t instanceof Window?t.pageYOffset>Math.max(0,t.document.documentElement.scrollHeight-t.innerHeight-4):t.scrollTop>Math.max(1,t.scrollHeight-t.clientHeight-4)}function zS(t,e){for(let n=t,r=e;;){if(_i(n)&&r>0)return{node:n,offset:r};if(Ke(n)&&r>0){if(n.contentEditable=="false")return null;n=n.childNodes[r-1],r=Ar(n)}else if(n.parentNode&&!Ru(n))r=xo(n),n=n.parentNode;else return null}}function HS(t,e){for(let n=t,r=e;;){if(_i(n)&&r<n.nodeValue.length)return{node:n,offset:r};if(Ke(n)&&r<n.childNodes.length){if(n.contentEditable=="false")return null;n=n.childNodes[r],r=0}else if(n.parentNode&&!Ru(n))r=xo(n)+1,n=n.parentNode;else return null}}function US(t){let e=[];for(let n=0;n<t.length;n++)e.push(1<<+t[n]);return e}function jS(t){return t<=247?zM[t]:1424<=t&&t<=1524?2:1536<=t&&t<=1785?HM[t-1536]:1774<=t&&t<=2220?4:8192<=t&&t<=8204?256:64336<=t&&t<=65023?4:1}function VS(t,e){if(t.length!=e.length)return!1;for(let n=0;n<t.length;n++){let r=t[n],o=e[n];if(r.from!=o.from||r.to!=o.to||r.direction!=o.direction||!VS(r.inner,o.inner))return!1}return!0}function jM(t,e,n,r,o){for(let a=0;a<=r.length;a++){let i=a?r[a-1].to:e,l=a<r.length?r[a].from:n,s=a?256:o;for(let f=i,c=s,u=s;f<l;f++){let d=jS(t.charCodeAt(f));d==512?d=c:d==8&&u==4&&(d=16),de[f]=d==4?2:d,d&7&&(u=d),c=d}for(let f=i,c=s,u=s;f<l;f++){let d=de[f];if(d==128)f<l-1&&c==de[f+1]&&c&24?d=de[f]=c:de[f]=256;else if(d==64){let p=f+1;for(;p<l&&de[p]==64;)p++;let m=f&&c==8||p<n&&de[p]==8?u==1?1:8:256;for(let x=f;x<p;x++)de[x]=m;f=p-1}else d==8&&u==1&&(de[f]=1);c=d,d&7&&(u=d)}}}function VM(t,e,n,r,o){let a=o==1?2:1;for(let i=0,l=0,s=0;i<=r.length;i++){let f=i?r[i-1].to:e,c=i<r.length?r[i].from:n;for(let u=f,d,p,m;u<c;u++)if(p=kx[d=t.charCodeAt(u)])if(p<0){for(let x=l-3;x>=0;x-=3)if(Wn[x+1]==-p){let b=Wn[x+2],h=b&2?o:b&4?b&1?a:o:0;h&&(de[u]=de[Wn[x]]=h),l=x;break}}else{if(Wn.length==189)break;Wn[l++]=u,Wn[l++]=d,Wn[l++]=s}else if((m=de[u])==2||m==1){let x=m==o;s=x?0:1;for(let b=l-3;b>=0;b-=3){let h=Wn[b+2];if(h&2)break;if(x)Wn[b+2]|=2;else{if(h&4)break;Wn[b+2]|=4}}}}}function GM(t,e,n,r){for(let o=0,a=r;o<=n.length;o++){let i=o?n[o-1].to:t,l=o<n.length?n[o].from:e;for(let s=i;s<l;){let f=de[s];if(f==256){let c=s+1;for(;;)if(c==l){if(o==n.length)break;c=n[o++].to,l=o<n.length?n[o].from:e}else if(de[c]==256)c++;else break;let u=a==1,d=(c<e?de[c]:r)==1,p=u==d?u?1:2:r;for(let m=c,x=o,b=x?n[x-1].to:t;m>s;)m==b&&(m=n[--x].from,b=x?n[x-1].to:t),de[--m]=p;s=c}else a=f,s++}}}function Cx(t,e,n,r,o,a,i){let l=r%2?2:1;if(r%2==o%2)for(let s=e,f=0;s<n;){let c=!0,u=!1;if(f==a.length||s<a[f].from){let x=de[s];x!=l&&(c=!1,u=x==16)}let d=!c&&l==1?[]:null,p=c?r:r+1,m=s;e:for(;;)if(f<a.length&&m==a[f].from){if(u)break e;let x=a[f];if(!c)for(let b=x.to,h=f+1;;){if(b==n)break e;if(h<a.length&&a[h].from==b)b=a[h++].to;else{if(de[b]==l)break e;break}}if(f++,d)d.push(x);else{x.from>s&&i.push(new hn(s,x.from,p));let b=x.direction==qi!=!(p%2);Ax(t,b?r+1:r,o,x.inner,x.from,x.to,i),s=x.to}m=x.to}else{if(m==n||(c?de[m]!=l:de[m]==l))break;m++}d?Cx(t,s,m,r+1,o,d,i):s<m&&i.push(new hn(s,m,p)),s=m}else for(let s=n,f=a.length;s>e;){let c=!0,u=!1;if(!f||s>a[f-1].to){let x=de[s-1];x!=l&&(c=!1,u=x==16)}let d=!c&&l==1?[]:null,p=c?r:r+1,m=s;e:for(;;)if(f&&m==a[f-1].to){if(u)break e;let x=a[--f];if(!c)for(let b=x.from,h=f;;){if(b==e)break e;if(h&&a[h-1].to==b)b=a[--h].from;else{if(de[b-1]==l)break e;break}}if(d)d.push(x);else{x.to<s&&i.push(new hn(x.to,s,p));let b=x.direction==qi!=!(p%2);Ax(t,b?r+1:r,o,x.inner,x.from,x.to,i),s=x.from}m=x.from}else{if(m==e||(c?de[m-1]!=l:de[m-1]==l))break;m--}d?Cx(t,m,s,r+1,o,d,i):m<s&&i.push(new hn(m,s,p)),s=m}}function Ax(t,e,n,r,o,a,i){let l=e%2?2:1;jM(t,o,a,r,l),VM(t,o,a,r,l),GM(o,a,r,l),Cx(t,o,a,e,n,r,i)}function WM(t,e,n){if(!t)return[new hn(0,0,e==cg?1:0)];if(e==qi&&!n.length&&!UM.test(t))return GS(t.length);if(n.length)for(;t.length>de.length;)de[de.length]=256;let r=[],o=e==qi?0:1;return Ax(t,o,o,n,0,t.length,r),r}function GS(t){return[new hn(0,t,0)]}function XM(t,e,n,r,o){var a;if(!t.length)return null;let i=r.head-t.from,l;if(r.head==t.from&&r.assoc<0){if(!o)return null;i=e[l=0].side(!1,n)}else if(r.head==t.to&&r.assoc>0){if(o)return null;i=e[l=e.length-1].side(!0,n)}else l=hn.find(e,i,(a=r.bidiLevel)!==null&&a!==void 0?a:-1,r.assoc);let s=e[l],f=s.side(o,n);if(i==f){let d=l+=o?1:-1;if(d<0||d>=e.length)return null;s=e[l=d],i=s.side(!o,n),f=s.side(o,n)}let c=Qe(t.text,i,s.forward(o,n));(c<s.from||c>s.to)&&(c=f),WS=t.text.slice(Math.min(i,c),Math.max(i,c));let u=l==(o?e.length-1:0)?null:e[l+(o?1:-1)];if(c==f){if(!u)return o?O.cursor(t.to,1):O.cursor(t.from,-1);if(u.level+(o?0:1)<s.level)return O.cursor(u.side(!o,n)+t.from,u.forward(o,n)?1:-1,u.level)}return O.cursor(c+t.from,s.forward(o,n)?-1:1,s.level)}function QM(t,e,n){for(let r=e;r<n;r++){let o=jS(t.charCodeAt(r));if(o==1)return qi;if(o==2||o==4)return cg}}function yt(t,e,n){let r=t.facet(YS);r.length?r[0](e):window.onerror&&window.onerror(String(e),n,void 0,void 0,e)||(n?console.error(n+":",e):console.error(e))}function lS(t,e){let n=t.state.facet(ok);if(!n.length)return n;let r=n.map(a=>a instanceof Function?a(t):a),o=[];return le.spans(r,e.from,e.to,{point(){},span(a,i,l,s){let f=a-e.from,c=i-e.from,u=o;for(let d=l.length-1;d>=0;d--,s--){let p=l[d].spec.bidiIsolate,m;if(s>0&&u.length&&(m=u[u.length-1]).to==f&&m.direction==p)m.to=c,u=m.inner;else{let x={from:f,to:c,direction:p,inner:[]};u.push(x),u=x.inner}}}}),ak(e.text,o)}function ak(t,e){for(let n of e){if(n.direction==null){for(let r=n.from,o=0;r<n.to;o++){let a=o<n.inner.length?n.inner[o]:null,i=QM(t,r,a?a.from:n.to);if(i){n.direction=i;break}if(!a)break;r=a.to}n.direction==null&&(n.direction=pe.LTR)}ak(t,n.inner)}return e}function hg(t){let e=0,n=0,r=0,o=0;for(let a of t.state.facet(ik)){let i=a(t);i&&(i.left!=null&&(e=Math.max(e,i.left)),i.right!=null&&(n=Math.max(n,i.right)),i.top!=null&&(r=Math.max(r,i.top)),i.bottom!=null&&(o=Math.max(o,i.bottom)))}return{left:e,right:n,top:r,bottom:o}}function sS(t){let e=t.nextSibling;return t.parentNode.removeChild(t),e}function ZM(t){let e=t.dom.lastChild;if(!e)return t.dom.getBoundingClientRect();let n=Tu(e);return n[n.length-1]||null}function $M(t,e){let n=t.coordsIn(0,1),r=e.coordsIn(0,1);return n&&r&&r.top<n.bottom}function fS(t,e){let n=r=>{for(let o of r.children)if((e?o.isText():o.length)||n(o))return!0;return!1};return n(t)}function eR(t){let e=t.isReplace?(t.startSide<0?64:0)|(t.endSide>0?128:0):t.startSide>0?32:16;return t.block&&(e|=256),e}function tR(t,e){let n=e.spec.attributes,r=e.spec.class;return!n&&!r||(t||(t={class:"cm-line"}),n&&sg(n,t),r&&(t.class+=" "+r)),t}function nR(t){let e=[];for(let n=t.parents.length;n>1;n--){let r=n==t.parents.length?t.tile:t.parents[n].tile;r instanceof Bt&&e.push(r.mark)}return e}function ux(t){let e=Oe.get(t);return e&&e.setDOM(t.cloneNode()),t}function Fx(t,e){let n=e?.get(t);if(n!=1){n==null&&t.destroy();for(let r of t.children)Fx(r,e)}}function rR(t){return Ke(t.node)&&t.node.firstChild&&(t.offset==0||t.node.childNodes[t.offset-1].contentEditable=="false")&&(t.offset==t.node.childNodes.length||t.node.childNodes[t.offset].contentEditable=="false")}function sk(t,e){let n=t.observer.selectionRange;if(!n.focusNode)return null;let r=zS(n.focusNode,n.focusOffset),o=HS(n.focusNode,n.focusOffset),a=r||o;if(o&&r&&o.node!=r.node){let l=Oe.get(o.node);if(!l||l.isText()&&l.text!=o.node.nodeValue)a=o;else if(t.docView.lastCompositionAfterCursor){let s=Oe.get(r.node);!s||s.isText()&&s.text!=r.node.nodeValue||(a=o)}}if(t.docView.lastCompositionAfterCursor=a!=r,!a)return null;let i=e-a.offset;return{from:i,to:i+a.node.nodeValue.length,node:a.node}}function oR(t,e,n){let r=sk(t,n);if(!r)return null;let{node:o,from:a,to:i}=r,l=o.nodeValue;if(/[\n\r]/.test(l)||t.state.doc.sliceString(r.from,r.to)!=l)return null;let s=e.invertedDesc;return{range:new An(s.mapPos(a),s.mapPos(i),a,i),text:o}}function aR(t,e){return Ke(t)?(e&&t.childNodes[e-1].contentEditable=="false"?1:0)|(e<t.childNodes.length&&t.childNodes[e].contentEditable=="false"?2:0):0}function lR(t,e,n){let r=new iR;return le.compare(t,e,n,r),r.changes}function sR(t,e,n){let r=new Lx;return le.compare(t,e,n,r),r.changes}function fR(t,e){for(let n=t;n&&n!=e;n=n.assignedSlot||n.parentNode)if(Ke(n)&&n.contentEditable=="false")return!0;return!1}function cR(t,e){let n=!1;return e&&t.iterChangedRanges((r,o)=>{r<e.to&&o>e.from&&(n=!0)}),n}function uR(t,e,n=1){let r=t.charCategorizer(e),o=t.doc.lineAt(e),a=e-o.from;if(o.length==0)return O.cursor(e);a==0?n=1:a==o.length&&(n=-1);let i=a,l=a;n<0?i=Qe(o.text,a,!1):l=Qe(o.text,a);let s=r(o.text.slice(i,l));for(;i>0;){let f=Qe(o.text,i,!1);if(r(o.text.slice(f,i))!=s)break;i=f}for(;l<o.length;){let f=Qe(o.text,l);if(r(o.text.slice(l,f))!=s)break;l=f}return O.undirectionalRange(i+o.from,l+o.from)}function dR(t,e,n,r,o){let a=Math.round((r-e.left)*t.defaultCharacterWidth);if(t.lineWrapping&&n.height>t.defaultLineHeight*1.5){let l=t.viewState.heightOracle.textHeight,s=Math.floor((o-n.top-(t.defaultLineHeight-l)*.5)/l);a+=s*t.viewState.heightOracle.lineLength}let i=t.state.sliceDoc(n.from,n.to);return n.from+Qw(i,a,t.state.tabSize)}function pR(t,e,n){let r=t.lineBlockAt(e);if(Array.isArray(r.type)){let o;for(let a of r.type){if(a.from>e)break;if(!(a.to<e)){if(a.from<e&&a.to>e)return a;(!o||a.type==Dt.Text&&(o.type!=a.type||(n<0?a.from<e:a.to>e)))&&(o=a)}}return o||r}return r}function mR(t,e,n,r){let o=pR(t,e.head,e.assoc||-1),a=!r||o.type!=Dt.Text||!(t.lineWrapping||o.widgetLineBreaks)?null:t.coordsAtPos(e.assoc<0&&e.head>o.from?e.head-1:e.head);if(a){let i=t.dom.getBoundingClientRect(),l=t.textDirectionAt(o.from),s=t.posAndSideAtCoords({x:n==(l==pe.LTR)?i.right-1:i.left+1,y:(a.top+a.bottom)/2});if(s)return O.cursor(s.pos,s.assoc)}return O.cursor(n?o.to:o.from,n?1:-1)}function cS(t,e,n,r){let o=t.state.doc.lineAt(e.head),a=t.bidiSpans(o),i=t.textDirectionAt(o.from);for(let l=e,s=null;;){let f=XM(o,a,i,l,n),c=WS;if(!f){if(o.number==(n?t.state.doc.lines:1))return l;c=`
`,o=t.state.doc.line(o.number+(n?1:-1)),a=t.bidiSpans(o),f=n?O.cursor(o.from,-1):O.cursor(o.to,1)}if(s){if(!s(c))return l}else{if(!r)return f;s=r(c)}l=f}}function hR(t,e,n){let r=t.state.charCategorizer(e),o=r(n);return a=>{let i=r(a);return o==cn.Space&&(o=i),o==i}}function xR(t,e,n,r){let o=e.head,a=n?1:-1;if(o==(n?t.state.doc.length:0))return O.cursor(o,e.assoc);let i=e.goalColumn,l,s=t.contentDOM.getBoundingClientRect(),f=t.coordsAtPos(o,e.assoc||((e.empty?n:e.head==e.from)?1:-1)),c=t.documentTop;if(f)i==null&&(i=f.left-s.left),l=a<0?f.top:f.bottom;else{let m=t.viewState.lineBlockAt(o);i==null&&(i=Math.min(s.right-s.left,t.defaultCharacterWidth*(o-m.from))),l=(a<0?m.top:m.bottom)+c}let u=s.left+i,d=t.viewState.heightOracle.textHeight>>1,p=r??d;for(let m=0;;m+=d){let x=l+(p+m)*a,b=Nx(t,{x:u,y:x},!1,a);if(n?x>s.bottom:x<s.top)return O.cursor(b.pos,b.assoc);let h=t.coordsAtPos(b.pos,b.assoc),y=h?(h.top+h.bottom)/2:0;if(!h||(n?y>l:y<l))return O.cursor(b.pos,b.assoc,void 0,i)}}function Ls(t,e,n){for(;;){let r=0;for(let o of t)o.between(e-1,e+1,(a,i,l)=>{if(e>a&&e<i){let s=r||n||(e-a<i-e?-1:1);e=s<0?a:i,r=s}});if(!r)return e}}function fk(t,e){let n=null;for(let r=0;r<e.ranges.length;r++){let o=e.ranges[r],a=null;if(o.empty){let i=Ls(t,o.from,0);i!=o.from&&(a=O.cursor(i,-1))}else{let i=Ls(t,o.from,-1),l=Ls(t,o.to,1);(i!=o.from||l!=o.to)&&(o.undirectional?a=O.undirectionalRange(o.from,o.to):a=O.range(o.from==o.anchor?i:l,o.from==o.head?i:l))}a&&(n||(n=e.ranges.slice()),n[r]=a)}return n?O.create(n,e.mainIndex):e}function px(t,e,n){let r=Ls(t.state.facet(Us).map(o=>o(t)),n.from,e.head>n.from?-1:1);return r==n.from?n:O.cursor(r,r<n.from?1:-1)}function Nx(t,e,n,r){let o=t.contentDOM.getBoundingClientRect(),a=o.top+t.viewState.paddingTop,{x:i,y:l}=e,s=l-a,f;for(;;){if(s<0)return new mn(0,1);if(s>t.viewState.docHeight)return new mn(t.state.doc.length,-1);if(f=t.elementAtHeight(s),r==null)break;if(f.type==Dt.Text){if(r<0?f.to<t.viewport.from:f.from>t.viewport.to)break;let d=t.docView.coordsAt(r<0?f.from:f.to,r>0?-1:1);if(d&&(r<0?d.top<=s+a:d.bottom>=s+a))break}let u=t.viewState.heightOracle.textHeight/2;s=r>0?f.bottom+u:f.top-u}if(t.viewport.from>=f.to||t.viewport.to<=f.from){if(n)return null;if(f.type==Dt.Text){let u=dR(t,o,f,i,l);return new mn(u,u==f.from?1:-1)}}if(f.type!=Dt.Text)return s<(f.top+f.bottom)/2?new mn(f.from,1):new mn(f.to,-1);let c=t.docView.lineAt(f.from,2);return(!c||c.length!=f.length)&&(c=t.docView.lineAt(f.from,-2)),new _x(t,i,l,t.textDirectionAt(f.from)).scanTile(c,f.from)}function gR(t,e,n){for(;;){if(!e||n<Ar(e))return!1;if(e==t)return!0;n=xo(e)+1,e=e.parentNode}}function yR(t,e){let n;for(;!(t==e||!t);t=t.nextSibling){let r=Oe.get(t);if(!r?.isWidget())return!1;r&&(n||(n=[])).push(r)}if(n)for(let r of n){let o=r.overrideDOMText;if(o?.length)return!1}return!0}function ck(t,e,n,r){if(t.isComposite()){let o=-1,a=-1,i=-1,l=-1;for(let s=0,f=r,c=r;s<t.children.length;s++){let u=t.children[s],d=f+u.length;if(f<e&&d>n)return ck(u,e,n,f);if(d>=e&&o==-1&&(o=s,a=f),f>n&&u.dom.parentNode==t.dom){i=s,l=c;break}c=d,f=d+u.breakAfter}return{from:a,to:l<0?r+t.length:l,startDOM:(o?t.children[o-1].dom.nextSibling:null)||t.dom.firstChild,endDOM:i<t.children.length&&i>=0?t.children[i].dom:null}}else return t.isText()?{from:r,to:r+t.length,startDOM:t.dom,endDOM:t.dom.nextSibling}:null}function uk(t,e){let n,{newSel:r}=e,{state:o}=t,a=o.selection.main,i=t.inputState.lastKeyTime>Date.now()-100?t.inputState.lastKeyCode:-1;if(e.bounds){let{from:l,to:s}=e.bounds,f=a.from,c=null;(i===8||R.android&&e.text.length<s-l)&&(f=a.to,c="end");let u=o.doc.sliceString(l,s,Mi),d,p;!a.empty&&a.from>=l&&a.to<=s&&(e.typeOver||u!=e.text)&&u.slice(0,a.from-l)==e.text.slice(0,a.from-l)&&u.slice(a.to-l)==e.text.slice(d=e.text.length-(u.length-(a.to-l)))?n={from:a.from,to:a.to,insert:J.of(e.text.slice(a.from-l,d).split(Mi))}:(p=dk(u,e.text,f-l,c))&&(R.chrome&&i==13&&p.toB==p.from+2&&e.text.slice(p.from,p.toB)==Mi+Mi&&p.toB--,n={from:l+p.from,to:l+p.toA,insert:J.of(e.text.slice(p.from,p.toB).split(Mi))})}else r&&(!t.hasFocus&&o.facet(kr)||zx(r,a))&&(r=null);if(!n&&!r)return!1;if((R.mac||R.android)&&n&&n.from==n.to&&n.from==a.head-1&&/^\. ?$/.test(n.insert.toString())&&t.contentDOM.getAttribute("autocorrect")=="off"?(r&&n.insert.length==2&&(r=O.single(r.main.anchor-1,r.main.head-1)),n={from:n.from,to:n.to,insert:J.of([n.insert.toString().replace("."," ")])}):o.doc.lineAt(a.from).to<a.to&&t.docView.lineHasWidget(a.to)&&t.inputState.insertingTextAt>Date.now()-50?n={from:a.from,to:a.to,insert:o.toText(t.inputState.insertingText)}:R.chrome&&n&&n.from==n.to&&n.from==a.head&&n.insert.toString()==`
 `&&t.lineWrapping&&(r&&(r=O.single(r.main.anchor-1,r.main.head-1)),n={from:a.from,to:a.to,insert:J.of([" "])}),n)return xg(t,n,r,i);if(r&&!zx(r,a)){let l=!1,s="select";return t.inputState.lastSelectionTime>Date.now()-50&&(t.inputState.lastSelectionOrigin=="select"&&(l=!0),s=t.inputState.lastSelectionOrigin,s=="select.pointer"&&(r=fk(o.facet(Us).map(f=>f(t)),r))),t.dispatch({selection:r,scrollIntoView:l,userEvent:s}),!0}else return!1}function xg(t,e,n,r=-1){if(R.ios&&t.inputState.flushIOSKey(e))return!0;let o=t.state.selection.main;if(R.android&&(e.to==o.to&&(e.from==o.from||e.from==o.from-1&&t.state.sliceDoc(e.from,o.from)==" ")&&e.insert.length==1&&e.insert.lines==2&&Ni(t.contentDOM,"Enter",13)||(e.from==o.from-1&&e.to==o.to&&e.insert.length==0||r==8&&e.insert.length<e.to-e.from&&e.to>o.head)&&Ni(t.contentDOM,"Backspace",8)||e.from==o.from&&e.to==o.to+1&&e.insert.length==0&&Ni(t.contentDOM,"Delete",46)))return!0;let a=e.insert.toString();t.inputState.composing>=0&&t.inputState.composing++;let i,l=()=>i||(i=bR(t,e,n));return t.state.facet(JS).some(s=>s(t,e.from,e.to,a,l))||t.dispatch(l()),!0}function bR(t,e,n){let r,o=t.state,a=o.selection.main,i=-1;if(e.from==e.to&&e.from<a.from||e.from>a.to){let s=e.from<a.from?-1:1,f=s<0?a.from:a.to,c=Ls(o.facet(Us).map(u=>u(t)),f,s);e.from==c&&(i=c)}if(i>-1)r={changes:e,selection:O.cursor(e.from+e.insert.length,-1)};else if(e.from>=a.from&&e.to<=a.to&&e.to-e.from>=(a.to-a.from)/3&&(!n||n.main.empty&&n.main.from==e.from+e.insert.length)&&t.inputState.composing<0){let s=a.from<e.from?o.sliceDoc(a.from,e.from):"",f=a.to>e.to?o.sliceDoc(e.to,a.to):"";r=o.replaceSelection(t.state.toText(s+e.insert.sliceString(0,void 0,t.state.lineBreak)+f))}else{let s=o.changes(e),f=n&&n.main.to<=s.newLength?n.main:void 0;if(o.selection.ranges.length>1&&(t.inputState.composing>=0||t.inputState.compositionPendingChange)&&e.to<=a.to+10&&e.to>=a.to-10){let c=t.state.sliceDoc(e.from,e.to),u,d=n&&sk(t,n.main.head);if(d){let m=e.insert.length-(e.to-e.from);u={from:d.from,to:d.to-m}}else u=t.state.doc.lineAt(a.head);let p=a.to-e.to;r=o.changeByRange(m=>{if(m.from==a.from&&m.to==a.to)return{changes:s,range:f||m.map(s)};let x=m.to-p,b=x-c.length;if(t.state.sliceDoc(b,x)!=c||x>=u.from&&b<=u.to)return{range:m};let h=o.changes({from:b,to:x,insert:e.insert}),y=m.to-a.to;return{changes:h,range:f?O.range(Math.max(0,f.anchor+y),Math.max(0,f.head+y)):m.map(h)}})}else r={changes:s,selection:f&&o.selection.replaceRange(f)}}let l="input.type";return(t.composing||t.inputState.compositionPendingChange&&t.inputState.compositionEndedAt>Date.now()-50)&&(t.inputState.compositionPendingChange=!1,l+=".compose",t.inputState.compositionFirstChange&&(l+=".start",t.inputState.compositionFirstChange=!1)),o.update(r,{userEvent:l,scrollIntoView:!0})}function dk(t,e,n,r){let o=Math.min(t.length,e.length),a=0;for(;a<o&&t.charCodeAt(a)==e.charCodeAt(a);)a++;if(a==o&&t.length==e.length)return null;let i=t.length,l=e.length;for(;i>0&&l>0&&t.charCodeAt(i-1)==e.charCodeAt(l-1);)i--,l--;if(r=="end"){let s=Math.max(0,a-Math.min(i,l));n-=i+s-a}if(i<a&&t.length<e.length){let s=n<=a&&n>=i?a-n:0;a-=s,l=a+(l-i),i=a}else if(l<a){let s=n<=a&&n>=l?a-n:0;a-=s,i=a+(i-l),l=a}return{from:a,toA:i,toB:l}}function IR(t){let e=[];if(t.root.activeElement!=t.contentDOM)return e;let{anchorNode:n,anchorOffset:r,focusNode:o,focusOffset:a}=t.observer.selectionRange;return n&&(e.push(new _u(n,r)),(o!=n||a!=r)&&e.push(new _u(o,a))),e}function vR(t,e){if(t.length==0)return null;let n=t[0].pos,r=t.length==2?t[1].pos:n;return n<0||r<0?null:n==r?O.create([O.cursor(r+e,-1)]):O.single(n+e,r+e)}function zx(t,e){return e.head==t.main.head&&e.anchor==t.main.anchor}function wR(t){return t.visualViewport?t.visualViewport.height*t.visualViewport.scale/t.document.documentElement.clientHeight<.85:!1}function uS(t,e){return(n,r)=>{try{return e.call(t,r,n)}catch(o){yt(n.state,o)}}}function SR(t){let e=Object.create(null);function n(r){return e[r]||(e[r]={observers:[],handlers:[]})}for(let r of t){let o=r.spec,a=o&&o.plugin.domEventHandlers,i=o&&o.plugin.domEventObservers;if(a)for(let l in a){let s=a[l];s&&n(l).handlers.push(uS(r.value,s))}if(i)for(let l in i){let s=i[l];s&&n(l).observers.push(uS(r.value,s))}}for(let r in Tn)n(r).handlers.push(Tn[r]);for(let r in bt)n(r).observers.push(bt[r]);return e}function vu(t){return Math.max(0,t)*.7+8}function CR(t,e){return Math.max(Math.abs(t.clientX-e.clientX),Math.abs(t.clientY-e.clientY))}function AR(t,e){let n=t.state.facet(XS);return n.length?n[0](e):R.mac?e.metaKey:e.ctrlKey}function TR(t,e){let n=t.state.facet(QS);return n.length?n[0](e):R.mac?!e.altKey:!e.ctrlKey}function OR(t,e){let{main:n}=t.state.selection;if(n.empty)return!1;let r=zs(t.root);if(!r||r.rangeCount==0)return!0;let o=r.getRangeAt(0).getClientRects();for(let a=0;a<o.length;a++){let i=o[a];if(i.left<=e.clientX&&i.right>=e.clientX&&i.top<=e.clientY&&i.bottom>=e.clientY)return!0}return!1}function BR(t,e){if(!e.bubbles)return!0;if(e.defaultPrevented)return!1;for(let n=e.target,r;n!=t.contentDOM;n=n.parentNode)if(!n||n.nodeType==11||(r=Oe.get(n))&&r.isWidget()&&!r.isHidden&&r.widget.ignoreEvent(e))return!1;return!0}function DR(t){let e=t.dom.parentNode;if(!e)return;let n=e.appendChild(document.createElement("textarea"));n.style.cssText="position: fixed; left: -10000px; top: 10px",n.focus(),setTimeout(()=>{t.focus(),n.remove(),xk(t,n.value)},50)}function Wu(t,e,n){for(let r of t.facet(e))n=r(n,t);return n}function xk(t,e){e=Wu(t.state,ug,e);let{state:n}=t,r,o=1,a=n.toText(e),i=a.lines==n.selection.ranges.length;if(jx!=null&&n.selection.ranges.every(s=>s.empty)&&jx==a.toString()){let s=-1;r=n.changeByRange(f=>{let c=n.doc.lineAt(f.from);if(c.from==s)return{range:f};s=c.from;let u=n.toText((i?a.line(o++).text:e)+n.lineBreak);return{changes:{from:c.from,insert:u},range:O.cursor(f.from+u.length,-1)}})}else i?r=n.changeByRange(s=>{let f=a.line(o++);return{changes:{from:s.from,to:s.to,insert:f.text},range:O.cursor(s.from+f.length,-1)}}):r=n.replaceSelection(a);t.dispatch(r,{userEvent:"input.paste",scrollIntoView:!0})}function dS(t,e,n,r){if(r==1)return O.cursor(e,n);if(r==2)return uR(t.state,e,n);{let o=t.docView.lineAt(e,n),a=t.state.doc.lineAt(o?o.posAtEnd:e),i=o?o.posAtStart:a.from,l=o?o.posAtEnd:a.to;return l<t.state.doc.length&&l==a.to&&l++,O.undirectionalRange(i,l)}}function gk(t){if(!MR)return t.detail;let e=pS,n=hS;return pS=t,hS=Date.now(),mS=!e||n>Date.now()-400&&Math.abs(e.clientX-t.clientX)<2&&Math.abs(e.clientY-t.clientY)<2?(mS+1)%3:1}function RR(t,e){let n=t.posAndSideAtCoords({x:e.clientX,y:e.clientY},!1),r=gk(e),o=t.state.selection;return{update(a){a.docChanged&&(n.pos=a.changes.mapPos(n.pos),o=o.map(a.changes))},get(a,i,l){let s=t.posAndSideAtCoords({x:a.clientX,y:a.clientY},!1),f,c=dS(t,s.pos,s.assoc,r);if(n.pos!=s.pos&&!i){let u=dS(t,n.pos,n.assoc,r),d=Math.min(u.from,c.from),p=Math.max(u.to,c.to);c=d<c.from?O.range(d,p,c.assoc):O.range(p,d,c.assoc)}return i?o.replaceRange(o.main.extend(c.from,c.to,c.assoc)):l&&r==1&&o.ranges.length>1&&(f=ER(o,s.pos))?f:l?o.addRange(c):O.create([c])}}}function ER(t,e){for(let n=0;n<t.ranges.length;n++){let{from:r,to:o}=t.ranges[n];if(r<=e&&o>=e)return O.create(t.ranges.slice(0,n).concat(t.ranges.slice(n+1)),t.mainIndex==n?0:t.mainIndex-(t.mainIndex>n?1:0))}return null}function xS(t,e,n,r){if(n=Wu(t.state,ug,n),!n)return;let o=t.posAtCoords({x:e.clientX,y:e.clientY},!1),{draggedContent:a}=t.inputState,i=r&&a&&TR(t,e)?{from:a.from,to:a.to}:null,l={from:o,insert:n},s=t.state.changes(i?[i,l]:l);t.focus(),t.dispatch({changes:s,selection:{anchor:s.mapPos(o,-1),head:s.mapPos(o,1)},userEvent:i?"move.drop":"input.drop"}),t.inputState.draggedContent=null}function FR(t,e){let n=t.dom.parentNode;if(!n)return;let r=n.appendChild(document.createElement("textarea"));r.style.cssText="position: fixed; left: -10000px; top: 10px",r.value=e,r.focus(),r.selectionEnd=e.length,r.selectionStart=0,setTimeout(()=>{r.remove(),t.focus()},50)}function LR(t){let e=[],n=[],r=!1;for(let o of t.selection.ranges)o.empty||(e.push(t.sliceDoc(o.from,o.to)),n.push(o));if(!e.length){let o=-1;for(let{from:a}of t.selection.ranges){let i=t.doc.lineAt(a);i.number>o&&(e.push(i.text),n.push({from:i.from,to:Math.min(t.doc.length,i.to+1)})),o=i.number}r=!0}return{text:Wu(t,dg,e.join(t.lineBreak)),ranges:n,linewise:r}}function bk(t,e){let n=[];for(let r of t.facet(ZS)){let o=r(t,e);o&&n.push(o)}return n.length?t.update({effects:n,annotations:yk.of(!0)}):null}function Ik(t){setTimeout(()=>{let e=t.hasFocus;if(e!=t.inputState.notifiedFocused){let n=bk(t.state,e);n?t.dispatch(n):t.update([])}},10)}function NR(t){gS.has(t)||(gS.add(t),t.addEventListener("copy",()=>{}),t.addEventListener("cut",()=>{}))}function bS(){ji=!1}function qu(t,e){return t==e?t:(t.constructor!=e.constructor&&(ji=!0),e)}function IS(t,e){let n,r;t[e]==null&&(n=t[e-1])instanceof mo&&(r=t[e+1])instanceof mo&&t.splice(e-1,3,new mo(n.length+1+r.length))}function PR(t,e,n){let r=new Qx;return le.compare(t,e,n,r,0),r.changes}function zR(t,e){let n=t.getBoundingClientRect(),r=t.ownerDocument,o=r.defaultView||window,a=Math.max(0,n.left),i=Math.min(o.innerWidth,n.right),l=Math.max(0,n.top),s=Math.min(o.innerHeight,n.bottom);for(let f=t.parentNode;f&&f!=r.body;)if(Ke(f)){let c=window.getComputedStyle(f);if((f.scrollHeight>f.clientHeight||f.scrollWidth>f.clientWidth)&&c.overflow!="visible"){let u=f.getBoundingClientRect();a=Math.max(a,u.left),i=Math.min(i,u.right),l=Math.max(l,u.top),s=Math.min(f==t.parentNode?o.innerHeight:s,u.bottom)}f=c.position=="absolute"||c.position=="fixed"?f.offsetParent:f.parentNode}else if(f.nodeType==11)f=f.host;else break;return{left:a-n.left,right:Math.max(a,i)-n.left,top:l-(n.top+e),bottom:Math.max(l,s)-(n.top+e)}}function HR(t){let e=t.getBoundingClientRect(),n=t.ownerDocument.defaultView||window;return e.left<n.innerWidth&&e.right>0&&e.top<n.innerHeight&&e.bottom>0}function UR(t,e){let n=t.getBoundingClientRect();return{left:0,right:n.right-n.left,top:e,bottom:n.bottom-(n.top+e)}}function jR(t,e,n){let r=[],o=t,a=0;return le.spans(n,t,e,{span(){},point(i,l){i>o&&(r.push({from:o,to:i}),a+=i-o),o=l}},20),o<e&&(r.push({from:o,to:e}),a+=e-o),{total:a,ranges:r}}function wu({total:t,ranges:e},n){if(n<=0)return e[0].from;if(n>=1)return e[e.length-1].to;let r=Math.floor(t*n);for(let o=0;;o++){let{from:a,to:i}=e[o],l=i-a;if(r<=l)return a+r;r-=l}}function Su(t,e){let n=0;for(let{from:r,to:o}of t.ranges){if(e<=o){n+=e-r;break}n+=o-r}return n/t.total}function VR(t,e){for(let n of t)if(e(n))return n}function vS(t){let e=t.facet(Gu).filter(r=>typeof r!="function"),n=t.facet(mg).filter(r=>typeof r!="function");return n.length&&e.push(le.join(n)),e}function Bs(t,e){if(e.scale==1)return t;let n=e.toDOM(t.top),r=e.toDOM(t.bottom);return new Cn(t.from,t.length,n,r-n,Array.isArray(t._content)?t._content.map(o=>Bs(o,e)):t._content)}function eg(t,e,n){return new dn(e,{finish(r){return/&/.test(r)?r.replace(/&\w*/,o=>{if(o=="&")return t;if(!n||!n[o])throw new RangeError(`Unsupported selector: ${o}`);return n[o]}):t+" "+r}})}function wS(t,e,n){for(;e;){let r=Oe.get(e);if(r&&r.parent==t)return r;let o=e.parentNode;e=o!=t.dom?o:n>0?e.nextSibling:e.previousSibling}return null}function SS(t,e){let n=e.startContainer,r=e.startOffset,o=e.endContainer,a=e.endOffset,i=t.docView.domAtPos(t.state.selection.main.anchor,1);return Ms(i.node,i.offset,o,a)&&([n,r,o,a]=[o,a,n,r]),{anchorNode:n,anchorOffset:r,focusNode:o,focusOffset:a}}function XR(t,e){if(e.getComposedRanges){let o=e.getComposedRanges(t.root)[0];if(o)return SS(t,o)}let n=null;function r(o){o.preventDefault(),o.stopImmediatePropagation(),n=o.getTargetRanges()[0]}return t.contentDOM.addEventListener("beforeinput",r,!0),t.dom.ownerDocument.execCommand("indent"),t.contentDOM.removeEventListener("beforeinput",r,!0),n?SS(t,n):null}function CS(t,e,n){for(let r=t.state.facet(e),o=r.length-1;o>=0;o--){let a=r[o],i=typeof a=="function"?a(t):a;i&&sg(i,n)}return n}function YR(t,e){let n=t.split(/-(?!$)/),r=n[n.length-1];r=="Space"&&(r=" ");let o,a,i,l;for(let s=0;s<n.length-1;++s){let f=n[s];if(/^(cmd|meta|m)$/i.test(f))l=!0;else if(/^a(lt)?$/i.test(f))o=!0;else if(/^(c|ctrl|control)$/i.test(f))a=!0;else if(/^s(hift)?$/i.test(f))i=!0;else if(/^mod$/i.test(f))e=="mac"?l=!0:a=!0;else throw new Error("Unrecognized modifier name: "+f)}return o&&(r="Alt-"+r),a&&(r="Ctrl-"+r),l&&(r="Meta-"+r),i&&(r="Shift-"+r),r}function Cu(t,e,n){return e.altKey&&(t="Alt-"+t),e.ctrlKey&&(t="Ctrl-"+t),e.metaKey&&(t="Meta-"+t),n!==!1&&e.shiftKey&&(t="Shift-"+t),t}function ZR(t){let e=t.facet(Vi),n=AS.get(e);return n||AS.set(e,n=eE(e.reduce((r,o)=>r.concat(o),[]))),n}function eE(t,e=KR){let n=Object.create(null),r=Object.create(null),o=(i,l)=>{let s=r[i];if(s==null)r[i]=l;else if(s!=l)throw new Error("Key binding "+i+" is used both as a regular binding and as a multi-stroke prefix")},a=(i,l,s,f,c)=>{var u,d;let p=n[i]||(n[i]=Object.create(null)),m=l.split(/ (?!$)/).map(h=>YR(h,e));for(let h=1;h<m.length;h++){let y=m.slice(0,h).join(" ");o(y,!0),p[y]||(p[y]={preventDefault:!0,stopPropagation:!1,run:[g=>{let I=po={view:g,prefix:y,scope:i};return setTimeout(()=>{po==I&&(po=null)},$R),!0}]})}let x=m.join(" ");o(x,!1);let b=p[x]||(p[x]={preventDefault:!1,stopPropagation:!1,run:((d=(u=p._any)===null||u===void 0?void 0:u.run)===null||d===void 0?void 0:d.slice())||[]});s&&b.run.push(s),f&&(b.preventDefault=!0),c&&(b.stopPropagation=!0)};for(let i of t){let l=i.scope?i.scope.split(" "):["editor"];if(i.any)for(let f of l){let c=n[f]||(n[f]=Object.create(null));c._any||(c._any={preventDefault:!1,stopPropagation:!1,run:[]});let{any:u}=i;for(let d in c)c[d].run.push(p=>u(p,rg))}let s=i[e]||i.key;if(s)for(let f of l)a(f,s,i.run,i.preventDefault,i.stopPropagation),i.shift&&a(f,"Shift-"+s,i.shift,i.preventDefault,i.stopPropagation)}return n}function tE(t,e,n,r){rg=e;let o=Zw(e),a=wr(o,0),i=co(a)==o.length&&o!=" ",l="",s=!1,f=!1,c=!1;po&&po.view==n&&po.scope==r&&(l=po.prefix+" ",mk.indexOf(e.keyCode)<0&&(f=!0,po=null));let u=new Set,d=b=>{if(b){for(let h of b.run)if(!u.has(h)&&(u.add(h),h(n)))return b.stopPropagation&&(c=!0),!0;b.preventDefault&&(b.stopPropagation&&(c=!0),f=!0)}return!1},p=t[r],m,x;return p&&(d(p[l+Cu(o,e,!i)])?s=!0:i&&(e.altKey||e.metaKey||e.ctrlKey)&&!(R.windows&&e.ctrlKey&&e.altKey)&&!(R.mac&&e.altKey&&!(e.ctrlKey||e.metaKey))&&(m=Sr[e.keyCode])&&m!=o?(d(p[l+Cu(m,e,!0)])||e.shiftKey&&(x=Di[e.keyCode])!=o&&x!=m&&d(p[l+Cu(x,e,!1)]))&&(s=!0):i&&e.shiftKey&&d(p[l+Cu(o,e,!0)])&&(s=!0),!s&&d(p._any)&&(s=!0)),f&&(s=!0),s&&c&&e.stopPropagation(),rg=null,s}function kk(){return oE}function Ck(t){let e=t.dom.ownerDocument.documentElement,n=e.clientWidth,r=getComputedStyle(e);if(!/stable/.test(r.scrollbarGutter||""))return{left:0,right:n};let o=e.getBoundingClientRect(),a=t.win.scrollX;return{left:Math.max(0,o.left+a-parseFloat(r.marginLeft)),right:Math.min(n,o.right+a+parseFloat(r.marginRight))}}function aE(t){let{left:e,right:n}=Ck(t);return{top:0,left:e,right:n,bottom:t.dom.ownerDocument.documentElement.clientHeight}}function BS(t,e){let n=parseInt(t.style.left,10);(isNaN(n)||Math.abs(e-n)>1)&&(t.style.left=e+"px")}function yg(t,e){let n=t.plugin(Ak);if(!n)return null;let r=n.manager.tooltips.indexOf(e);return r<0?null:n.manager.tooltipViews[r]}function fE(t){let e=[cE];return t&&t.fixed===!1&&e.push(ag.of(!0)),e}function DS(t){return Array.isArray(t)?t:[t]}function ig(t,e,n){for(;t.value&&t.from<=n;)t.from==n&&e.push(t.value),t.next()}function uE(t,e){if(t.length!=e.length)return!1;for(let n=0;n<t.length;n++)if(!t[n].compare(e[n]))return!1;return!0}function gx(t,e){return t.state.facet(Fi).formatNumber(e,t.state)}function Tk(t={}){return[Fi.of(t),fE(),mE]}function MS(t){let e=9;for(;e<t;)e=e*10+9;return e}var gt,yx,bx,RS,Ix,Vu,tS,cx,nS,vx,rS,R,Du,ho,Dt,ee,qs,Ps,la,Mu,Ke,_i,Sx,aa,iS,Xn,pe,qi,cg,zM,HM,kx,Wn,UM,hn,de,WS,XS,QS,KS,YS,Tx,JS,ZS,ug,dg,$S,KM,ek,Rs,bu,tk,kr,YM,Ri,Xt,Es,nk,pg,Gu,rk,mg,Us,ok,ik,Os,An,Fu,JM,Oe,Pi,zi,Cr,Hi,Bt,ia,sa,Ui,Ox,Bx,Dx,Mx,Lu,Rx,Ex,lk,go,dx,Nu,iR,Lx,Fs,mn,_x,Mi,qx,_u,Px,Hx,pk,kR,mk,Iu,Ux,Tn,bt,hk,MR,pS,mS,hS,jx,yk,gS,yS,ji,Vx,Gx,Cn,xe,Ou,Wt,_R,Pu,pn,mo,Wx,qR,Xx,Qx,Ns,Kx,zu,Ei,Yx,Jx,ku,Zx,$x,vk,wk,Sk,GR,WR,mx,tg,ng,q,QR,kS,Hu,KR,JR,Vi,AS,po,$R,rg,TS,nE,U6,j6,rE,oE,Au,og,hx,OS,Ak,iE,lE,gg,Qn,xx,sE,Bu,ag,cE,lg,Uu,ju,dE,pE,Fi,_s,mE,js=F(()=>{Bi();fx();$w();eS();gt=typeof navigator<"u"?navigator:{userAgent:"",vendor:"",platform:""},yx=typeof document<"u"?document:{documentElement:{style:{}}},bx=/Edge\/(\d+)/.exec(gt.userAgent),RS=/MSIE \d/.test(gt.userAgent),Ix=/Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(gt.userAgent),Vu=!!(RS||Ix||bx),tS=!Vu&&/gecko\/(\d+)/i.test(gt.userAgent),cx=!Vu&&/Chrome\/(\d+)/.exec(gt.userAgent),nS="webkitFontSmoothing"in yx.documentElement.style,vx=!Vu&&/Apple Computer/.test(gt.vendor),rS=vx&&(/Mobile\/\w+/.test(gt.userAgent)||gt.maxTouchPoints>2),R={mac:rS||/Mac/.test(gt.platform),windows:/Win/.test(gt.platform),linux:/Linux|X11/.test(gt.platform),ie:Vu,ie_version:RS?yx.documentMode||6:Ix?+Ix[1]:bx?+bx[1]:0,gecko:tS,gecko_version:tS?+(/Firefox\/(\d+)/.exec(gt.userAgent)||[0,0])[1]:0,chrome:!!cx,chrome_version:cx?+cx[1]:0,ios:rS,android:/Android\b/.test(gt.userAgent),webkit:nS,webkit_version:nS?+(/\bAppleWebKit\/(\d+)/.exec(gt.userAgent)||[0,0])[1]:0,safari:vx,safari_version:vx?+(/\bVersion\/(\d+(\.\d+)?)/.exec(gt.userAgent)||[0,0])[1]:0,tabSize:yx.documentElement.style.tabSize!=null?"tab-size":"-moz-tab-size"};Du=Object.create(null);ho=class{eq(e){return!1}updateDOM(e,n,r){return!1}compare(e){return this==e||this.constructor==e.constructor&&this.eq(e)}get estimatedHeight(){return-1}get lineBreaks(){return 0}ignoreEvent(e){return!0}coordsAt(e,n,r){return null}get isHidden(){return!1}get editable(){return!1}destroy(e){}},Dt=(function(t){return t[t.Text=0]="Text",t[t.WidgetBefore=1]="WidgetBefore",t[t.WidgetAfter=2]="WidgetAfter",t[t.WidgetRange=3]="WidgetRange",t})(Dt||(Dt={})),ee=class extends un{constructor(e,n,r,o){super(),this.startSide=e,this.endSide=n,this.widget=r,this.spec=o}get heightRelevant(){return!1}static mark(e){return new qs(e)}static widget(e){let n=Math.max(-1e4,Math.min(1e4,e.side||0)),r=!!e.block;return n+=r&&!e.inlineOrder?n>0?3e8:-4e8:n>0?1e8:-1e8,new la(e,n,n,r,e.widget||null,!1)}static replace(e){let n=!!e.block,r,o;if(e.isBlockGap)r=-5e8,o=4e8;else{let{start:a,end:i}=ES(e,n);r=(a?n?-3e8:-1:5e8)-1,o=(i?n?2e8:1:-6e8)+1}return new la(e,r,o,n,e.widget||null,!0)}static line(e){return new Ps(e)}static set(e,n=!1){return le.of(e,n)}hasHeight(){return this.widget?this.widget.estimatedHeight>-1:!1}};ee.none=le.empty;qs=class t extends ee{constructor(e){let{start:n,end:r}=ES(e);super(n?-1:5e8,r?1:-6e8,null,e),this.tagName=e.tagName||"span",this.attrs=e.class&&e.attributes?sg(e.attributes,{class:e.class}):e.class?{class:e.class}:e.attributes||Du}eq(e){return this==e||e instanceof t&&this.tagName==e.tagName&&fg(this.attrs,e.attrs)}range(e,n=e){if(e>=n)throw new RangeError("Mark decorations may not be empty");return super.range(e,n)}};qs.prototype.point=!1;Ps=class t extends ee{constructor(e){super(-2e8,-2e8,null,e)}eq(e){return e instanceof t&&this.spec.class==e.spec.class&&fg(this.spec.attributes,e.spec.attributes)}range(e,n=e){if(n!=e)throw new RangeError("Line decoration ranges must be zero-length");return super.range(e,n)}};Ps.prototype.mapMode=mt.TrackBefore;Ps.prototype.point=!0;la=class t extends ee{constructor(e,n,r,o,a,i){super(n,r,a,e),this.block=o,this.isReplace=i,this.mapMode=o?n<=0?mt.TrackBefore:mt.TrackAfter:mt.TrackDel}get type(){return this.startSide!=this.endSide?Dt.WidgetRange:this.startSide<=0?Dt.WidgetBefore:Dt.WidgetAfter}get heightRelevant(){return this.block||!!this.widget&&(this.widget.estimatedHeight>=5||this.widget.lineBreaks>0)}eq(e){return e instanceof t&&LM(this.widget,e.widget)&&this.block==e.block&&this.startSide==e.startSide&&this.endSide==e.endSide}range(e,n=e){if(this.isReplace&&(e>n||e==n&&this.startSide>0&&this.endSide<=0))throw new RangeError("Invalid range for replacement decoration");if(!this.isReplace&&n!=e)throw new RangeError("Widget decorations can only have zero-length ranges");return super.range(e,n)}};la.prototype.point=!0;Mu=class t extends un{constructor(e,n,r){super(),this.tagName=e,this.attributes=n,this.rank=r}eq(e){return e==this||e instanceof t&&this.tagName==e.tagName&&fg(this.attributes,e.attributes)}static create(e){return new t(e.tagName,e.attributes||Du,e.rank==null?50:Math.max(0,Math.min(e.rank,100)))}static set(e,n=!1){return le.of(e,n)}};Mu.prototype.startSide=Mu.prototype.endSide=-1;Ke=t=>t.nodeType==1,_i=t=>t.nodeType==3;Sx=class{constructor(){this.anchorNode=null,this.anchorOffset=0,this.focusNode=null,this.focusOffset=0}eq(e){return this.anchorNode==e.anchorNode&&this.anchorOffset==e.anchorOffset&&this.focusNode==e.focusNode&&this.focusOffset==e.focusOffset}setRange(e){let{anchorNode:n,focusNode:r}=e;this.set(n,Math.min(e.anchorOffset,n?Ar(n):0),r,Math.min(e.focusOffset,r?Ar(r):0))}set(e,n,r,o){this.anchorNode=e,this.anchorOffset=n,this.focusNode=r,this.focusOffset=o}};aa=null;R.safari&&R.safari_version>=26&&(aa=!1);Xn=class t{constructor(e,n,r=!0){this.node=e,this.offset=n,this.precise=r}static before(e,n){return new t(e.parentNode,xo(e),n)}static after(e,n){return new t(e.parentNode,xo(e)+1,n)}},pe=(function(t){return t[t.LTR=0]="LTR",t[t.RTL=1]="RTL",t})(pe||(pe={})),qi=pe.LTR,cg=pe.RTL;zM=US("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008"),HM=US("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333"),kx=Object.create(null),Wn=[];for(let t of["()","[]","{}"]){let e=t.charCodeAt(0),n=t.charCodeAt(1);kx[e]=n,kx[n]=-e}UM=/[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/,hn=class{get dir(){return this.level%2?cg:qi}constructor(e,n,r){this.from=e,this.to=n,this.level=r}side(e,n){return this.dir==n==e?this.to:this.from}forward(e,n){return e==(this.dir==n)}static find(e,n,r,o){let a=-1;for(let i=0;i<e.length;i++){let l=e[i];if(l.from<=n&&l.to>=n){if(l.level==r)return i;(a<0||(o!=0?o<0?l.from<n:l.to>n:e[a].level>l.level))&&(a=i)}}if(a<0)throw new RangeError("Index out of range");return a}};de=[];WS="";XS=N.define(),QS=N.define(),KS=N.define(),YS=N.define(),Tx=N.define(),JS=N.define(),ZS=N.define(),ug=N.define(),dg=N.define(),$S=N.define({combine:t=>t.some(e=>e)}),KM=N.define({combine:t=>t.some(e=>e)}),ek=N.define(),Rs=class t{constructor(e,n,r,o,a,i=!1){this.range=e,this.y=n,this.x=r,this.yMargin=o,this.xMargin=a,this.isSnapshot=i}map(e){return e.empty?this:new t(this.range.map(e),this.y,this.x,this.yMargin,this.xMargin,this.isSnapshot)}clip(e){return this.range.to<=e.doc.length?this:new t(O.cursor(e.doc.length),this.y,this.x,this.yMargin,this.xMargin,this.isSnapshot)}},bu=oe.define({map:(t,e)=>t.map(e)}),tk=oe.define();kr=N.define({combine:t=>t.length?t[0]:!0}),YM=0,Ri=N.define({combine(t){return t.filter((e,n)=>{for(let r=0;r<n;r++)if(t[r].plugin==e.plugin)return!1;return!0})}}),Xt=class t{constructor(e,n,r,o,a){this.id=e,this.create=n,this.domEventHandlers=r,this.domEventObservers=o,this.baseExtensions=a(this),this.extension=this.baseExtensions.concat(Ri.of({plugin:this,arg:void 0}))}of(e){return this.baseExtensions.concat(Ri.of({plugin:this,arg:e}))}static define(e,n){let{eventHandlers:r,eventObservers:o,provide:a,decorations:i}=n||{};return new t(YM++,e,r,o,l=>{let s=[];return i&&s.push(Gu.of(f=>{let c=f.plugin(l);return c?i(c):ee.none})),a&&s.push(a(l)),s})}static fromClass(e,n){return t.define((r,o)=>new e(r,o),n)}},Es=class{constructor(e){this.spec=e,this.mustUpdate=null,this.value=null}get plugin(){return this.spec&&this.spec.plugin}update(e){if(this.value){if(this.mustUpdate){let n=this.mustUpdate;if(this.mustUpdate=null,this.value.update)try{this.value.update(n)}catch(r){if(yt(n.state,r,"CodeMirror plugin crashed"),this.value.destroy)try{this.value.destroy()}catch{}this.deactivate()}}}else if(this.spec)try{this.value=this.spec.plugin.create(e,this.spec.arg)}catch(n){yt(e.state,n,"CodeMirror plugin crashed"),this.deactivate()}return this}destroy(e){var n;if(!((n=this.value)===null||n===void 0)&&n.destroy)try{this.value.destroy()}catch(r){yt(e.state,r,"CodeMirror plugin crashed")}}deactivate(){this.spec=this.value=null}},nk=N.define(),pg=N.define(),Gu=N.define(),rk=N.define(),mg=N.define(),Us=N.define(),ok=N.define();ik=N.define();Os=N.define(),An=class t{constructor(e,n,r,o){this.fromA=e,this.toA=n,this.fromB=r,this.toB=o}join(e){return new t(Math.min(this.fromA,e.fromA),Math.max(this.toA,e.toA),Math.min(this.fromB,e.fromB),Math.max(this.toB,e.toB))}addToSet(e){let n=e.length,r=this;for(;n>0;n--){let o=e[n-1];if(!(o.fromA>r.toA)){if(o.toA<r.fromA)break;r=r.join(o),e.splice(n-1,1)}}return e.splice(n,0,r),e}static extendWithRanges(e,n){if(n.length==0)return e;let r=[];for(let o=0,a=0,i=0;;){let l=o<e.length?e[o].fromB:1e9,s=a<n.length?n[a]:1e9,f=Math.min(l,s);if(f==1e9)break;let c=f+i,u=f,d=c;for(;;)if(a<n.length&&n[a]<=u){let p=n[a+1];a+=2,u=Math.max(u,p);for(let m=o;m<e.length&&e[m].fromB<=u;m++)i=e[m].toA-e[m].toB;d=Math.max(d,p+i)}else if(o<e.length&&e[o].fromB<=u){let p=e[o++];u=Math.max(u,p.toB),d=Math.max(d,p.toA),i=p.toA-p.toB}else break;r.push(new t(c,d,f,u))}return r}},Fu=class t{constructor(e,n,r){this.view=e,this.state=n,this.transactions=r,this.flags=0,this.startState=e.state,this.changes=ht.empty(this.startState.doc.length);for(let a of r)this.changes=this.changes.compose(a.changes);let o=[];this.changes.iterChangedRanges((a,i,l,s)=>o.push(new An(a,i,l,s))),this.changedRanges=o}static create(e,n,r){return new t(e,n,r)}get viewportChanged(){return(this.flags&4)>0}get viewportMoved(){return(this.flags&8)>0}get heightChanged(){return(this.flags&2)>0}get geometryChanged(){return this.docChanged||(this.flags&18)>0}get focusChanged(){return(this.flags&1)>0}get docChanged(){return!this.changes.empty}get selectionSet(){return this.transactions.some(e=>e.selection)}get empty(){return this.flags==0&&this.transactions.length==0}},JM=[],Oe=class{constructor(e,n,r=0){this.dom=e,this.length=n,this.flags=r,this.parent=null,e.cmTile=this}get breakAfter(){return this.flags&1}get children(){return JM}isWidget(){return!1}get isHidden(){return!1}isComposite(){return!1}isLine(){return!1}isText(){return!1}isBlock(){return!1}get domAttrs(){return null}sync(e){if(this.flags|=2,this.flags&4){this.flags&=-5;let n=this.domAttrs;n&&EM(this.dom,n)}}toString(){return this.constructor.name+(this.children.length?`(${this.children})`:"")+(this.breakAfter?"#":"")}destroy(){this.parent=null}setDOM(e){this.dom=e,e.cmTile=this}get posAtStart(){return this.parent?this.parent.posBefore(this):0}get posAtEnd(){return this.posAtStart+this.length}posBefore(e,n=this.posAtStart){let r=n;for(let o of this.children){if(o==e)return r;r+=o.length+o.breakAfter}throw new RangeError("Invalid child in posBefore")}posAfter(e){return this.posBefore(e)+e.length}covers(e){return!0}coordsIn(e,n,r){return null}domPosFor(e,n){let r=xo(this.dom),o=this.length?e>0:n>0;return new Xn(this.parent.dom,r+(o?1:0),e==0||e==this.length)}markDirty(e){this.flags&=-3,e&&(this.flags|=4),this.parent&&this.parent.flags&2&&this.parent.markDirty(!1)}get overrideDOMText(){return null}get root(){for(let e=this;e;e=e.parent)if(e instanceof zi)return e;return null}static get(e){return e.cmTile}},Pi=class extends Oe{constructor(e){super(e,0),this._children=[]}isComposite(){return!0}get children(){return this._children}get lastChild(){return this.children.length?this.children[this.children.length-1]:null}append(e){this.children.push(e),e.parent=this}sync(e){if(this.flags&2)return;super.sync(e);let n=this.dom,r=null,o,a=e?.node==n?e:null,i=0;for(let l of this.children){if(l.sync(e),i+=l.length+l.breakAfter,o=r?r.nextSibling:n.firstChild,a&&o!=l.dom&&(a.written=!0),l.dom.parentNode==n)for(;o&&o!=l.dom;)o=sS(o);else n.insertBefore(l.dom,o);r=l.dom}for(o=r?r.nextSibling:n.firstChild,a&&o&&(a.written=!0);o;)o=sS(o);this.length=i}};zi=class extends Pi{constructor(e,n){super(n),this.view=e}owns(e){for(;e;e=e.parent)if(e==this)return!0;return!1}isBlock(){return!0}nearest(e){for(;;){if(!e)return null;let n=Oe.get(e);if(n&&this.owns(n))return n;e=e.parentNode}}blockTiles(e){for(let n=[],r=this,o=0,a=0;;)if(o==r.children.length){if(!n.length)return;r=r.parent,r.breakAfter&&a++,o=n.pop()}else{let i=r.children[o++];if(i instanceof Cr)n.push(o),r=i,o=0;else{let l=a+i.length,s=e(i,a);if(s!==void 0)return s;a=l+i.breakAfter}}}resolveBlock(e,n){let r,o=-1,a,i=-1;if(this.blockTiles((l,s)=>{let f=s+l.length;if(e>=s&&e<=f){if(l.isWidget()&&n>=-1&&n<=1){if(l.flags&32)return!0;l.flags&16&&(r=void 0)}(s<e||e==f&&(n<-1?l.length:l.covers(1)))&&(!r||!l.isWidget()&&r.isWidget())&&(r=l,o=e-s),(f>e||e==s&&(n>1?l.length:l.covers(-1)))&&(!a||!l.isWidget()&&a.isWidget())&&(a=l,i=e-s)}}),!r&&!a)throw new Error("No tile at position "+e);return r&&n<0||!a?{tile:r,offset:o}:{tile:a,offset:i}}},Cr=class t extends Pi{constructor(e,n){super(e),this.wrapper=n}isBlock(){return!0}covers(e){return this.children.length?e<0?this.children[0].covers(-1):this.lastChild.covers(1):!1}get domAttrs(){return this.wrapper.attributes}static of(e,n){let r=new t(n||document.createElement(e.tagName),e);return n||(r.flags|=4),r}},Hi=class t extends Pi{constructor(e,n){super(e),this.attrs=n}isLine(){return!0}static start(e,n,r){let o=new t(n||document.createElement("div"),e);return(!n||!r)&&(o.flags|=4),o}get domAttrs(){return this.attrs}resolveInline(e,n,r=!1){let o=null,a=-1,i=null,l=-1;function s(c,u){for(let d=0,p=0;d<c.children.length&&p<=u;d++){let m=c.children[d],x=p+m.length;x>=u&&(m.isComposite()?s(m,u-p):(!i||r&&i.isHidden&&(n>0&&!(i.flags&32)||r&&$M(i,m)))&&(x>u||m.flags&32&&n<=1)?(i=m,l=u-p):(p<u||m.flags&16&&!(r&&m.isHidden)&&n>=-1)&&(o=m,a=u-p)),p=x}}s(this,e);let f=(n<0?o:i)||o||i;return f?{tile:f,offset:f==o?a:l}:null}coordsIn(e,n,r){let o=this.resolveInline(e,n,!0);return o?o.tile.coordsIn(Math.max(0,o.offset),n,r):ZM(this)}domIn(e,n){let r=this.resolveInline(e,n);if(r){let{tile:o,offset:a}=r;if(this.dom.contains(o.dom))return o.isText()?new Xn(o.dom,Math.min(o.dom.nodeValue.length,a)):o.domPosFor(a,o.flags&16?1:o.flags&32?-1:n);let i=r.tile.parent,l=!1;for(let s of i.children){if(l)return new Xn(s.dom,0);s==r.tile&&(l=!0)}}return new Xn(this.dom,0)}};Bt=class t extends Pi{constructor(e,n){super(e),this.mark=n}get domAttrs(){return this.mark.attrs}static of(e,n){let r=new t(n||document.createElement(e.tagName),e);return n||(r.flags|=4),r}},ia=class t extends Oe{constructor(e,n){super(e,n.length),this.text=n}sync(e){this.flags&2||(super.sync(e),this.dom.nodeValue!=this.text&&(e&&e.node==this.dom&&(e.written=!0),this.dom.nodeValue=this.text))}isText(){return!0}toString(){return JSON.stringify(this.text)}coordsIn(e,n,r){let o=this.dom.nodeValue.length;e>o&&(e=o);let a=e,i=e,l=0;e==0&&n<0||e==o&&n>=0?R.chrome||R.gecko||(e?(a--,l=1):i<o&&(i++,l=-1)):n<0?a--:i<o&&i++;let s=Hs(this.dom,a,i).getClientRects();if(!s.length)return null;let f=s[(l?l<0:n>=0)?0:s.length-1];return R.safari&&!l&&f.width==0&&(f=Array.prototype.find.call(s,c=>c.width)||f),r==null?f:Eu(f,(l?l>0:n<0)==r)}static of(e,n){let r=new t(n||document.createTextNode(e),e);return n||(r.flags|=2),r}},sa=class t extends Oe{constructor(e,n,r,o){super(e,n,o),this.widget=r}isWidget(){return!0}get isHidden(){return this.widget.isHidden}covers(e){return this.flags&48?!1:(this.flags&(e<0?64:128))>0}coordsIn(e,n){return this.coordsInWidget(e,n,!1)}coordsInWidget(e,n,r){let o=this.widget.coordsAt(this.dom,e,n);if(o)return o;if(r)return Eu(this.dom.getBoundingClientRect(),this.length?e==0:n<=0);{let a=this.dom.getClientRects(),i=null;if(!a.length)return null;let l=this.flags&16?!0:this.flags&32?!1:e>0;for(let s=l?a.length-1:0;i=a[s],!(e>0?s==0:s==a.length-1||i.top<i.bottom);s+=l?-1:1);return Eu(i,!l)}}get overrideDOMText(){if(!this.length)return J.empty;let{root:e}=this;if(!e)return J.empty;let n=this.posAtStart;return e.view.state.doc.slice(n,n+this.length)}destroy(){super.destroy(),this.widget.destroy(this.dom)}static of(e,n,r,o,a){return a||(a=e.toDOM(n),e.editable||(a.contentEditable="false")),new t(a,r,e,o)}},Ui=class extends Oe{constructor(e){let n=document.createElement("img");n.className="cm-widgetBuffer",n.setAttribute("aria-hidden","true"),super(n,0,e)}get isHidden(){return!0}get overrideDOMText(){return J.empty}coordsIn(e,n,r){let o=this.dom.getBoundingClientRect();return r==null?o:Eu(o,n>0==r)}},Ox=class{constructor(e){this.index=0,this.beforeBreak=!1,this.parents=[],this.tile=e}advance(e,n,r){let{tile:o,index:a,beforeBreak:i,parents:l}=this;for(;e||n>0;)if(o.isComposite())if(i){if(!e)break;r&&r.break(),e--,i=!1}else if(a==o.children.length){if(!e&&!l.length)break;r&&r.leave(o),i=!!o.breakAfter,{tile:o,index:a}=l.pop(),a++}else{let s=o.children[a],f=s.breakAfter;(n>0?s.length<=e:s.length<e)&&(!r||r.skip(s,0,s.length)!==!1||!s.isComposite)?(i=!!f,a++,e-=s.length):(l.push({tile:o,index:a}),o=s,a=0,r&&s.isComposite()&&r.enter(s))}else{let s=o.length;if(a<s&&e){let f=Math.min(e,s-a);r&&r.skip(o,a,a+f),e-=f,a+=f}if(a==s)i=!!o.breakAfter,{tile:o,index:a}=l.pop(),a++;else if(!e)break}return this.tile=o,this.index=a,this.beforeBreak=i,this}get root(){return this.parents.length?this.parents[0].tile:this.tile}},Bx=class{constructor(e,n,r,o){this.from=e,this.to=n,this.wrapper=r,this.rank=o}},Dx=class{constructor(e,n,r){this.cache=e,this.root=n,this.blockWrappers=r,this.curLine=null,this.lastBlock=null,this.afterWidget=null,this.pos=0,this.wrappers=[],this.wrapperPos=0}addText(e,n,r,o){var a;this.flushBuffer();let i=this.ensureMarks(n,r),l=i.lastChild;if(l&&l.isText()&&!(l.flags&8)&&l.length+e.length<512){this.cache.reused.set(l,2);let s=i.children[i.children.length-1]=new ia(l.dom,l.text+e);s.parent=i}else i.append(o||ia.of(e,(a=this.cache.find(ia))===null||a===void 0?void 0:a.dom));this.pos+=e.length,this.afterWidget=null}addComposition(e,n){let r=this.curLine;r.dom!=n.line.dom&&(r.setDOM(this.cache.reused.has(n.line)?ux(n.line.dom):n.line.dom),this.cache.reused.set(n.line,2));let o=r;for(let l=n.marks.length-1;l>=0;l--){let s=n.marks[l],f=o.lastChild;if(f instanceof Bt&&f.mark.eq(s.mark))f.dom!=s.dom&&f.setDOM(ux(s.dom)),o=f;else{let{dom:c}=s;this.cache.reused.get(s)&&Oe.get(s.dom)&&(c=ux(s.dom));let u=Bt.of(s.mark,c);o.append(u),o=u}this.cache.reused.set(s,2)}let a=Oe.get(e.text);a&&this.cache.reused.set(a,2);let i=new ia(e.text,e.text.nodeValue);i.flags|=8,this.pos=e.range.toB,o.append(i)}addInlineWidget(e,n,r){let o=this.afterWidget&&e.flags&48&&(this.afterWidget.flags&48)==(e.flags&48);o||this.flushBuffer();let a=this.ensureMarks(n,r);!o&&!(e.flags&16)&&a.append(this.getBuffer(1)),a.append(e),this.pos+=e.length,this.afterWidget=e}addMark(e,n,r){this.flushBuffer(),this.ensureMarks(n,r).append(e),this.pos+=e.length,this.afterWidget=null}addBlockWidget(e){this.getBlockPos().append(e),this.pos+=e.length,this.lastBlock=e,this.endLine()}continueWidget(e){let n=this.afterWidget||this.lastBlock;n.length+=e,this.pos+=e}addLineStart(e,n){var r;e||(e=lk);let o=Hi.start(e,n||((r=this.cache.find(Hi))===null||r===void 0?void 0:r.dom),!!n);this.getBlockPos().append(this.lastBlock=this.curLine=o)}addLine(e){this.getBlockPos().append(e),this.pos+=e.length,this.lastBlock=e,this.endLine()}addBreak(){this.lastBlock.flags|=1,this.endLine(),this.pos++}addLineStartIfNotCovered(e){this.blockPosCovered()||this.addLineStart(e)}ensureLine(e){this.curLine||this.addLineStart(e)}ensureMarks(e,n){var r;let o=this.curLine;for(let a=e.length-1;a>=0;a--){let i=e[a],l;if(n>0&&(l=o.lastChild)&&l instanceof Bt&&l.mark.eq(i))o=l,n--;else{let s=Bt.of(i,(r=this.cache.find(Bt,f=>f.mark.eq(i)))===null||r===void 0?void 0:r.dom);o.append(s),o=s,n=0}}return o}endLine(){if(this.curLine){this.flushBuffer();let e=this.curLine.lastChild;(!e||!fS(this.curLine,!1)||e.dom.nodeName!="BR"&&e.isWidget()&&!(R.ios&&fS(this.curLine,!0)))&&this.curLine.append(this.cache.findWidget(dx,0,32)||new sa(dx.toDOM(),0,dx,32)),this.curLine=this.afterWidget=null}}updateBlockWrappers(){this.wrapperPos>this.pos+1e4&&(this.blockWrappers.goto(this.pos),this.wrappers.length=0);for(let e=this.wrappers.length-1;e>=0;e--)this.wrappers[e].to<this.pos&&this.wrappers.splice(e,1);for(let e=this.blockWrappers;e.value&&e.from<=this.pos;e.next())if(e.to>=this.pos){let n=e.rank*102+e.value.rank,r=new Bx(e.from,e.to,e.value,n),o=this.wrappers.length;for(;o>0&&(this.wrappers[o-1].rank-r.rank||this.wrappers[o-1].to-r.to)<0;)o--;this.wrappers.splice(o,0,r)}this.wrapperPos=this.pos}getBlockPos(){var e;this.updateBlockWrappers();let n=this.root;for(let r of this.wrappers){let o=n.lastChild;if(r.from<this.pos&&o instanceof Cr&&o.wrapper.eq(r.wrapper))n=o;else{let a=Cr.of(r.wrapper,(e=this.cache.find(Cr,i=>i.wrapper.eq(r.wrapper)))===null||e===void 0?void 0:e.dom);n.append(a),n=a}}return n}blockPosCovered(){let e=this.lastBlock;return e!=null&&!e.breakAfter&&(!e.isWidget()||(e.flags&160)>0)}getBuffer(e){let n=2|(e<0?16:32),r=this.cache.find(Ui,void 0,1);return r&&(r.flags=n),r||new Ui(n)}flushBuffer(){this.afterWidget&&!(this.afterWidget.flags&32)&&(this.afterWidget.parent.append(this.getBuffer(-1)),this.afterWidget=null)}},Mx=class{constructor(e){this.skipCount=0,this.text="",this.textOff=0,this.cursor=e.iter()}skip(e){this.textOff+e<=this.text.length?this.textOff+=e:(this.skipCount+=e-(this.text.length-this.textOff),this.text="",this.textOff=0)}next(e){if(this.textOff==this.text.length){let{value:o,lineBreak:a,done:i}=this.cursor.next(this.skipCount);if(this.skipCount=0,i)throw new Error("Ran out of text content when drawing inline views");this.text=o;let l=this.textOff=Math.min(e,o.length);return a?null:o.slice(0,l)}let n=Math.min(this.text.length,this.textOff+e),r=this.text.slice(this.textOff,n);return this.textOff=n,r}},Lu=[sa,Hi,ia,Bt,Ui,Cr,zi];for(let t=0;t<Lu.length;t++)Lu[t].bucket=t;Rx=class{constructor(e){this.view=e,this.buckets=Lu.map(()=>[]),this.index=Lu.map(()=>0),this.reused=new Map}add(e){let n=e.constructor.bucket,r=this.buckets[n];r.length<6?r.push(e):r[this.index[n]=(this.index[n]+1)%6]=e}find(e,n,r=2){let o=e.bucket,a=this.buckets[o],i=this.index[o];for(let l=0;l<a.length;l++){let s=(l+i)%a.length,f=a[s];if((!n||n(f))&&!this.reused.has(f))return a.splice(s,1),s<i&&this.index[o]--,this.reused.set(f,r),f}return null}findWidget(e,n,r){let o=this.buckets[0];if(o.length)for(let a=0,i=0;;a++){if(a==o.length){if(i)return null;i=1,a=0}let l=o[a];if(!this.reused.has(l)&&(i==0?l.widget.compare(e):l.widget.constructor==e.constructor&&e.updateDOM(l.dom,this.view,l.widget)))return o.splice(a,1),a<this.index[0]&&this.index[0]--,l.widget==e&&l.length==n&&(l.flags&497)==r?(this.reused.set(l,1),l):(this.reused.set(l,2),new sa(l.dom,n,e,l.flags&-498|r))}}reuse(e){return this.reused.set(e,1),e}maybeReuse(e,n=2){if(!this.reused.has(e))return this.reused.set(e,n),e.dom}clear(){for(let e=0;e<this.buckets.length;e++)this.buckets[e].length=this.index[e]=0}},Ex=class{constructor(e,n,r,o,a){this.view=e,this.decorations=o,this.disallowBlockEffectsFor=a,this.openWidget=!1,this.openMarks=0,this.cache=new Rx(e),this.text=new Mx(e.state.doc),this.builder=new Dx(this.cache,new zi(e,e.contentDOM),le.iter(r)),this.cache.reused.set(n,2),this.old=new Ox(n),this.reuseWalker={skip:(i,l,s)=>{if(this.cache.add(i),i.isComposite())return!1},enter:i=>this.cache.add(i),leave:()=>{},break:()=>{}}}run(e,n){let r=n&&this.getCompositionContext(n.text);for(let o=0,a=0,i=0;;){let l=i<e.length?e[i++]:null,s=l?l.fromA:this.old.root.length;if(s>o){let f=s-o;this.preserve(f,!i,!l),o=s,a+=f}if(!l)break;n&&l.fromA<=n.range.fromA&&l.toA>=n.range.toA?(this.forward(l.fromA,n.range.fromA,n.range.fromA<n.range.toA?1:-1),this.emit(a,n.range.fromB),this.builder.flushBuffer(),this.cache.clear(),this.builder.addComposition(n,r),this.text.skip(n.range.toB-n.range.fromB),this.forward(n.range.fromA,l.toA),this.emit(n.range.toB,l.toB)):(this.forward(l.fromA,l.toA),this.emit(a,l.toB)),a=l.toB,o=l.toA}return this.builder.curLine&&this.builder.endLine(),this.builder.root}preserve(e,n,r){let o=nR(this.old),a=this.openMarks;this.old.advance(e,r?1:-1,{skip:(i,l,s)=>{if(i.isWidget())if(this.openWidget)this.builder.continueWidget(s-l);else{let f=s>0||l<i.length?sa.of(i.widget,this.view,s-l,i.flags&496,this.cache.maybeReuse(i)):this.cache.reuse(i);f.flags&256?(f.flags&=-2,this.builder.addBlockWidget(f)):(this.builder.ensureLine(null),this.builder.addInlineWidget(f,o,a),a=o.length)}else if(i.isText())this.builder.ensureLine(null),!l&&s==i.length&&!this.cache.reused.has(i)?this.builder.addText(i.text,o,a,this.cache.reuse(i)):(this.cache.add(i),this.builder.addText(i.text.slice(l,s),o,a)),a=o.length;else if(i.isLine())i.flags&=-2,this.cache.reused.set(i,1),this.builder.addLine(i);else if(i instanceof Ui)this.cache.add(i);else if(i instanceof Bt)this.builder.ensureLine(null),this.builder.addMark(i,o,a),this.cache.reused.set(i,1),a=o.length;else return!1;this.openWidget=!1},enter:i=>{i.isLine()?this.builder.addLineStart(i.attrs,this.cache.maybeReuse(i)):(this.cache.add(i),i instanceof Bt&&o.unshift(i.mark)),this.openWidget=!1},leave:i=>{i.isLine()?o.length&&(o.length=a=0):i instanceof Bt&&(o.shift(),a=Math.min(a,o.length))},break:()=>{this.builder.addBreak(),this.openWidget=!1}}),this.text.skip(e)}emit(e,n){let r=null,o=this.builder,a=-1,i=le.spans(this.decorations,e,n,{point:(l,s,f,c,u,d)=>{if(f instanceof la){if(this.disallowBlockEffectsFor[d]){if(f.block)throw new RangeError("Block decorations may not be specified via plugins");if(s>this.view.state.doc.lineAt(l).to)throw new RangeError("Decorations that replace line breaks may not be specified via plugins")}if(a=c.length,u>c.length)o.continueWidget(s-l);else{let p=f.widget||(f.block?go.block:go.inline),m=eR(f),x=this.cache.findWidget(p,s-l,m)||sa.of(p,this.view,s-l,m);f.block?(f.startSide>0&&o.addLineStartIfNotCovered(r),o.addBlockWidget(x)):(o.ensureLine(r),o.addInlineWidget(x,c,u))}r=null}else r=tR(r,f);s>l&&this.text.skip(s-l)},span:(l,s,f,c)=>{for(let u=l;u<s;){let d=this.text.next(Math.min(512,s-u));d==null?(o.addLineStartIfNotCovered(r),o.addBreak(),u++):(o.ensureLine(r),o.addText(d,f,u==l?c:f.length),u+=d.length),r=null}a=f.length}});a>-1&&(this.openWidget=i>a),this.openWidget||o.addLineStartIfNotCovered(r),this.openMarks=i}forward(e,n,r=1){n-e<=10?this.old.advance(n-e,r,this.reuseWalker):(this.old.advance(5,-1,this.reuseWalker),this.old.advance(n-e-10,-1),this.old.advance(5,r,this.reuseWalker))}getCompositionContext(e){let n=[],r=null;for(let o=e.parentNode;;o=o.parentNode){let a=Oe.get(o);if(o==this.view.contentDOM)break;a instanceof Bt?n.push(a):a?.isLine()?r=a:a instanceof Cr||(o.nodeName=="DIV"&&!r?r=new Hi(o,lk):r||n.push(Bt.of(new qs({tagName:o.nodeName.toLowerCase(),attributes:FM(o)}),o)))}return r?{line:r,marks:n}:null}};lk={class:"cm-line"};go=class extends ho{constructor(e){super(),this.tag=e}eq(e){return e.tag==this.tag}toDOM(){return document.createElement(this.tag)}updateDOM(e){return e.nodeName.toLowerCase()==this.tag}get isHidden(){return!0}};go.inline=new go("span");go.block=new go("div");dx=new class extends ho{toDOM(){return document.createElement("br")}get isHidden(){return!0}get editable(){return!0}},Nu=class{constructor(e){this.view=e,this.decorations=[],this.blockWrappers=[],this.dynamicDecorationMap=[!1],this.domChanged=null,this.hasComposition=null,this.editContextFormatting=ee.none,this.lastCompositionAfterCursor=!1,this.minWidth=0,this.minWidthFrom=0,this.minWidthTo=0,this.impreciseAnchor=null,this.impreciseHead=null,this.forceSelection=!1,this.lastUpdate=Date.now(),this.updateDeco(),this.tile=new zi(e,e.contentDOM),this.updateInner([new An(0,0,0,e.state.doc.length)],null)}update(e){var n;let r=e.changedRanges;this.minWidth>0&&r.length&&(r.every(({fromA:c,toA:u})=>u<this.minWidthFrom||c>this.minWidthTo)?(this.minWidthFrom=e.changes.mapPos(this.minWidthFrom,1),this.minWidthTo=e.changes.mapPos(this.minWidthTo,1)):this.minWidth=this.minWidthFrom=this.minWidthTo=0),this.updateEditContextFormatting(e);let o=-1;this.view.inputState.composing>=0&&!this.view.observer.editContext&&(!((n=this.domChanged)===null||n===void 0)&&n.newSel?o=this.domChanged.newSel.head:!cR(e.changes,this.hasComposition)&&!e.selectionSet&&(o=e.state.selection.main.head));let a=o>-1?oR(this.view,e.changes,o):null;if(this.domChanged=null,this.hasComposition){let{from:c,to:u}=this.hasComposition;r=new An(c,u,e.changes.mapPos(c,-1),e.changes.mapPos(u,1)).addToSet(r.slice())}this.hasComposition=a?{from:a.range.fromB,to:a.range.toB}:null,(R.ie||R.chrome)&&!a&&e&&e.state.doc.lines!=e.startState.doc.lines&&(this.forceSelection=!0);let i=this.decorations,l=this.blockWrappers;this.updateDeco();let s=lR(i,this.decorations,e.changes);s.length&&(r=An.extendWithRanges(r,s));let f=sR(l,this.blockWrappers,e.changes);return f.length&&(r=An.extendWithRanges(r,f)),a&&!r.some(c=>c.fromA<=a.range.fromA&&c.toA>=a.range.toA)&&(r=a.range.addToSet(r.slice())),this.tile.flags&2&&r.length==0?!1:(this.updateInner(r,a),e.transactions.length&&(this.lastUpdate=Date.now()),!0)}updateInner(e,n){this.view.viewState.mustMeasureContent=!0;let{observer:r}=this.view;r.ignore(()=>{if(n||e.length){let i=this.tile,l=new Ex(this.view,i,this.blockWrappers,this.decorations,this.dynamicDecorationMap);n&&Oe.get(n.text)&&l.cache.reused.set(Oe.get(n.text),2),this.tile=l.run(e,n),Fx(i,l.cache.reused)}this.tile.dom.style.height=this.view.viewState.contentHeight/this.view.scaleY+"px",this.tile.dom.style.flexBasis=this.minWidth?this.minWidth+"px":"";let a=R.chrome||R.ios?{node:r.selectionRange.focusNode,written:!1}:void 0;this.tile.sync(a),a&&(a.written||r.selectionRange.focusNode!=a.node||!this.tile.dom.contains(a.node))&&(this.forceSelection=!0),this.tile.dom.style.height=""});let o=[];if(this.view.viewport.from||this.view.viewport.to<this.view.state.doc.length)for(let a of this.tile.children)a.isWidget()&&a.widget instanceof Fs&&o.push(a.dom);r.updateGaps(o)}updateEditContextFormatting(e){this.editContextFormatting=this.editContextFormatting.map(e.changes);for(let n of e.transactions)for(let r of n.effects)r.is(tk)&&(this.editContextFormatting=r.value)}updateSelection(e=!1,n=!1){(e||!this.view.observer.selectionRange.focusNode)&&this.view.observer.readSelectionRange();let{dom:r}=this.tile,o=this.view.root.activeElement,a=o==r,i=!a&&!(this.view.state.facet(kr)||r.tabIndex>-1)&&Ds(r,this.view.observer.selectionRange)&&!(o&&r.contains(o));if(!(a||n||i))return;let l=this.forceSelection;this.forceSelection=!1;let s=this.view.state.selection.main,f,c;if(s.empty?c=f=this.inlineDOMNearPos(s.anchor,s.assoc||1):(c=this.inlineDOMNearPos(s.head,s.head==s.from?1:-1),f=this.inlineDOMNearPos(s.anchor,s.anchor==s.from?1:-1)),R.gecko&&s.empty&&!this.hasComposition&&rR(f)){let d=document.createTextNode("");this.view.observer.ignore(()=>f.node.insertBefore(d,f.node.childNodes[f.offset]||null)),f=c=new Xn(d,0),l=!0}let u=this.view.observer.selectionRange;(l||!u.focusNode||(!Ms(f.node,f.offset,u.anchorNode,u.anchorOffset)||!Ms(c.node,c.offset,u.focusNode,u.focusOffset))&&!this.suppressWidgetCursorChange(u,s))&&(this.view.observer.ignore(()=>{R.android&&R.chrome&&r.contains(u.focusNode)&&fR(u.focusNode,r)&&(r.blur(),r.focus({preventScroll:!0}));let d=zs(this.view.root);if(d)if(s.empty){if(R.gecko){let p=aR(f.node,f.offset);if(p&&p!=3){let m=(p==1?zS:HS)(f.node,f.offset);m&&(f=new Xn(m.node,m.offset))}}d.collapse(f.node,f.offset),s.bidiLevel!=null&&d.caretBidiLevel!==void 0&&(d.caretBidiLevel=s.bidiLevel)}else if(d.extend){d.collapse(f.node,f.offset);try{d.extend(c.node,c.offset)}catch{}}else{let p=document.createRange();s.anchor>s.head&&([f,c]=[c,f]),p.setEnd(c.node,c.offset),p.setStart(f.node,f.offset),d.removeAllRanges(),d.addRange(p)}i&&this.view.root.activeElement==r&&(r.blur(),o&&o.focus())}),this.view.observer.setSelectionRange(f,c)),this.impreciseAnchor=f.precise?null:new Xn(u.anchorNode,u.anchorOffset),this.impreciseHead=c.precise?null:new Xn(u.focusNode,u.focusOffset)}suppressWidgetCursorChange(e,n){return this.hasComposition&&n.empty&&Ms(e.focusNode,e.focusOffset,e.anchorNode,e.anchorOffset)&&this.posFromDOM(e.focusNode,e.focusOffset)==n.head}enforceCursorAssoc(){if(this.hasComposition)return;let{view:e}=this,n=e.state.selection.main,r=zs(e.root),{anchorNode:o,anchorOffset:a}=e.observer.selectionRange;if(!r||!n.empty||!n.assoc||!r.modify)return;let i=this.lineAt(n.head,n.assoc);if(!i)return;let l=i.posAtStart;if(n.head==l||n.head==l+i.length)return;let s=this.coordsAt(n.head,-1),f=this.coordsAt(n.head,1);if(!s||!f||s.bottom>f.top)return;let c=this.domAtPos(n.head+n.assoc,n.assoc);r.collapse(c.node,c.offset),r.modify("move",n.assoc<0?"forward":"backward","lineboundary"),e.observer.readSelectionRange();let u=e.observer.selectionRange;e.docView.posFromDOM(u.anchorNode,u.anchorOffset)!=n.from&&r.collapse(o,a)}posFromDOM(e,n){let r=this.tile.nearest(e);if(!r)return this.tile.dom.compareDocumentPosition(e)&2?0:this.view.state.doc.length;let o=r.posAtStart;if(r.isComposite()){let a;if(e==r.dom)a=r.dom.childNodes[n];else{let i=Ar(e)==0?0:n==0?-1:1;for(;;){let l=e.parentNode;if(l==r.dom)break;i==0&&l.firstChild!=l.lastChild&&(e==l.firstChild?i=-1:i=1),e=l}i<0?a=e:a=e.nextSibling}if(a==r.dom.firstChild)return o;for(;a&&!Oe.get(a);)a=a.nextSibling;if(!a)return o+r.length;for(let i=0,l=o;;i++){let s=r.children[i];if(s.dom==a)return l;l+=s.length+s.breakAfter}}else return r.isText()?e==r.dom?o+n:o+(n?r.length:0):o}domAtPos(e,n){let{tile:r,offset:o}=this.tile.resolveBlock(e,n);return r.isWidget()?r.domPosFor(o,n):r.domIn(o,n)}inlineDOMNearPos(e,n){let r,o=-1,a=!1,i,l=-1,s=!1;return this.tile.blockTiles((f,c)=>{if(f.isWidget()){if(f.flags&32&&c>=e)return!0;f.flags&16&&(a=!0)}else{let u=c+f.length;if(c<=e&&(r=f,o=e-c,a=u<e),u>=e&&!i&&(i=f,l=e-c,s=c>e),c>e&&i)return!0}}),!r&&!i?this.domAtPos(e,n):(a&&i?r=null:s&&r&&(i=null),r&&n<0||!i?r.domIn(o,n):i.domIn(l,n))}coordsAt(e,n,r){let{tile:o,offset:a}=this.tile.resolveBlock(e,n);return o.isWidget()?o.widget instanceof Fs?null:o.coordsInWidget(a,n,!0):o.coordsIn(a,n,r)}lineAt(e,n){let{tile:r}=this.tile.resolveBlock(e,n);return r.isLine()?r:null}coordsForChar(e){let{tile:n,offset:r}=this.tile.resolveBlock(e,1);if(!n.isLine())return null;function o(a,i){if(a.isComposite())for(let l of a.children){if(l.length>=i){let s=o(l,i);if(s)return s}if(i-=l.length,i<0)break}else if(a.isText()&&i<a.length){let l=Qe(a.text,i);if(l==i)return null;let s=Hs(a.dom,i,l).getClientRects();for(let f=0;f<s.length;f++){let c=s[f];if(f==s.length-1||c.top<c.bottom&&c.left<c.right)return c}}return null}return o(n,r)}measureVisibleLineHeights(e){let n=[],{from:r,to:o}=e,a=this.view.contentDOM.clientWidth,i=a>Math.max(this.view.scrollDOM.clientWidth,this.minWidth)+1,l=-1,s=this.view.textDirection==pe.LTR,f=0,c=(u,d,p)=>{for(let m=0;m<u.children.length&&!(d>o);m++){let x=u.children[m],b=d+x.length,h=x.dom.getBoundingClientRect(),{height:y}=h;if(p&&!m&&(f+=h.top-p.top),x instanceof Cr)b>r&&c(x,d,h);else if(d>=r&&(f>0&&n.push(-f),n.push(y+f),f=0,i)){let g=x.dom.lastChild,I=g?Tu(g):[];if(I.length){let v=I[I.length-1],S=s?v.right-h.left:h.right-v.left;S>l&&(l=S,this.minWidth=a,this.minWidthFrom=d,this.minWidthTo=b)}}p&&m==u.children.length-1&&(f+=p.bottom-h.bottom),d=b+x.breakAfter}};return c(this.tile,0,null),n}textDirectionAt(e){let{tile:n}=this.tile.resolveBlock(e,1);return getComputedStyle(n.dom).direction=="rtl"?pe.RTL:pe.LTR}measureTextSize(){let e=this.tile.blockTiles(i=>{if(i.isLine()&&i.children.length&&i.length<=20){let l=0,s;for(let f of i.children){if(!f.isText()||/[^ -~]/.test(f.text))return;let c=Tu(f.dom);if(c.length!=1)return;l+=c[0].width,s=c[0].height}if(l)return{lineHeight:i.dom.getBoundingClientRect().height,charWidth:l/i.length,textHeight:s}}});if(e)return e;let n=document.createElement("div"),r,o,a;return n.className="cm-line",n.style.width="99999px",n.style.position="absolute",n.textContent="abc def ghi jkl mno pqr stu",this.view.observer.ignore(()=>{this.tile.dom.appendChild(n);let i=Tu(n.firstChild)[0];r=n.getBoundingClientRect().height,o=i&&i.width?i.width/27:7,a=i&&i.height?i.height:r,n.remove()}),{lineHeight:r,charWidth:o,textHeight:a}}computeBlockGapDeco(){let e=[],n=this.view.viewState;for(let r=0,o=0;;o++){let a=o==n.viewports.length?null:n.viewports[o],i=a?a.from-1:this.view.state.doc.length;if(i>r){let l=(n.lineBlockAt(i).bottom-n.lineBlockAt(r).top)/this.view.scaleY;e.push(ee.replace({widget:new Fs(l),block:!0,inclusive:!0,isBlockGap:!0}).range(r,i))}if(!a)break;r=a.to+1}return ee.set(e)}updateDeco(){let e=1,n=this.view.state.facet(Gu).map(a=>(this.dynamicDecorationMap[e++]=typeof a=="function")?a(this.view):a),r=!1,o=this.view.state.facet(mg).map((a,i)=>{let l=typeof a=="function";return l&&(r=!0),l?a(this.view):a});for(o.length&&(this.dynamicDecorationMap[e++]=r,n.push(le.join(o))),this.decorations=[this.editContextFormatting,...n,this.computeBlockGapDeco(),this.view.viewState.lineGapDeco];e<this.decorations.length;)this.dynamicDecorationMap[e++]=!1;this.blockWrappers=this.view.state.facet(rk).map(a=>typeof a=="function"?a(this.view):a)}scrollIntoView(e){if(e.isSnapshot){let f=this.view.viewState.lineBlockAt(e.range.head);this.view.scrollDOM.scrollTop=f.top-e.yMargin,this.view.scrollDOM.scrollLeft=e.xMargin;return}for(let f of this.view.state.facet(ek))try{if(f(this.view,e.range,e))return!0}catch(c){yt(this.view.state,c,"scroll handler")}let{range:n}=e,r=this.coordsAt(n.head,n.assoc||(n.head>n.anchor?-1:1)),o;if(!r)return;!n.empty&&(o=this.coordsAt(n.anchor,n.anchor>n.head?-1:1))&&(r={left:Math.min(r.left,o.left),top:Math.min(r.top,o.top),right:Math.max(r.right,o.right),bottom:Math.max(r.bottom,o.bottom)});let a=hg(this.view),i={left:r.left-a.left,top:r.top-a.top,right:r.right+a.right,bottom:r.bottom+a.bottom},{offsetWidth:l,offsetHeight:s}=this.view.scrollDOM;if(_M(this.view.scrollDOM,i,n.head<n.anchor?-1:1,e.x,e.y,Math.max(Math.min(e.xMargin,l),-l),Math.max(Math.min(e.yMargin,s),-s),this.view.textDirection==pe.LTR),window.visualViewport&&window.innerHeight-window.visualViewport.height>1&&(r.top>window.visualViewport.offsetTop+window.visualViewport.height||r.bottom<window.visualViewport.offsetTop)){let f=this.view.docView.lineAt(n.head,1);if(f){let c=NS(f.dom);f.dom.scrollIntoView({block:"nearest"}),_S(c,!1)}}}lineHasWidget(e){let n=r=>r.isWidget()||r.children.some(n);return n(this.tile.resolveBlock(e,1).tile)}destroy(){Fx(this.tile)}};iR=class{constructor(){this.changes=[]}compareRange(e,n){Li(e,n,this.changes)}comparePoint(e,n){Li(e,n,this.changes)}boundChange(e){Li(e,e,this.changes)}};Lx=class{constructor(){this.changes=[]}compareRange(e,n){Li(e,n,this.changes)}comparePoint(){}boundChange(e){Li(e,e,this.changes)}};Fs=class extends ho{constructor(e){super(),this.height=e}toDOM(){let e=document.createElement("div");return e.className="cm-gap",this.updateDOM(e),e}eq(e){return e.height==this.height}updateDOM(e){return e.style.height=this.height+"px",!0}get editable(){return!0}get estimatedHeight(){return this.height}ignoreEvent(){return!1}};mn=class{constructor(e,n){this.pos=e,this.assoc=n}};_x=class{constructor(e,n,r,o){this.view=e,this.x=n,this.y=r,this.baseDir=o,this.line=null,this.spans=null}bidiSpansAt(e){return(!this.line||this.line.from>e||this.line.to<e)&&(this.line=this.view.state.doc.lineAt(e),this.spans=this.view.bidiSpans(this.line)),this}baseDirAt(e,n){let{line:r,spans:o}=this.bidiSpansAt(e);return o[hn.find(o,e-r.from,-1,n)].level==this.baseDir}dirAt(e,n){let{line:r,spans:o}=this.bidiSpansAt(e);return o[hn.find(o,e-r.from,-1,n)].dir}bidiIn(e,n){let{spans:r,line:o}=this.bidiSpansAt(e);return r.length>1||r.length&&(r[0].level!=this.baseDir||r[0].to+o.from<n)}scan(e,n,r=!1){let o=0,a=e.length-1,i=new Set,l=this.bidiIn(e[0],e[a]),s,f,c=-1,u=1e9,d;e:for(;o<a;){let m=a-o,x=o+a>>1;t:if(i.has(x)){for(let y=1;y<m;y++){let g=x+y;if(g>=a&&(g-=m),!i.has(g)){x=g;break t}}break e}i.add(x);let b=n(x),h=0;if(b)for(let y=0;y<b.length;y++){let g=b[y];if(!(g.width==0&&b.length>1))if(g.bottom<this.y)(!s||s.bottom<g.bottom)&&(s=g),h=1;else if(g.top>this.y)(!f||f.top>g.top)&&(f=g),h=-1;else{let I=g.left>this.x?this.x-g.left:g.right<this.x?this.x-g.right:0,v=Math.abs(I);v<u&&(c=x,u=v,d=g),I&&(h=I<0==(this.baseDir==pe.LTR)?-1:1)}}h==-1&&(!l||this.baseDirAt(e[x],1))?a=x:h==1&&(!l||this.baseDirAt(e[x+1],-1))&&(o=x+1)}if(!d){if(!f&&!s)return{i:0,after:!1};let m=s&&(!f||this.y-s.bottom<f.top-this.y)?s:f;return this.y=(m.top+m.bottom)/2,this.scan(e,n,!0)}if(u&&!r){let{top:m,bottom:x}=d;if(s&&s.bottom>(m+m+x)/3)return this.y=s.bottom-1,this.scan(e,n,!0);if(f&&f.top<(m+x+x)/3)return this.y=f.top+1,this.scan(e,n,!0)}let p=(l?this.dirAt(e[c],1):this.baseDir)==pe.LTR;return{i:c,after:this.x>(d.left+d.right)/2==p}}scanText(e,n){let r=[];for(let a=0;a<e.length;a=Qe(e.text,a))r.push(n+a);r.push(n+e.length);let o=this.scan(r,a=>{let i=r[a]-n,l=r[a+1]-n;return Hs(e.dom,i,l).getClientRects()});return o.after?new mn(r[o.i+1],-1):new mn(r[o.i],1)}scanTile(e,n){if(!e.length)return new mn(n,1);if(e.children.length==1){let l=e.children[0];if(l.isText())return this.scanText(l,n);if(l.isComposite())return this.scanTile(l,n)}let r=[n];for(let l=0,s=n;l<e.children.length;l++)r.push(s+=e.children[l].length);let o=this.scan(r,l=>{let s=e.children[l];return s.flags&48?null:(Ke(s.dom)?s.dom:Hs(s.dom,0,s.length)).getClientRects()}),a=e.children[o.i],i=r[o.i];return a.isText()?this.scanText(a,i):a.isComposite()?this.scanTile(a,i):o.after?new mn(r[o.i+1],-1):new mn(i,1)}},Mi="\uFFFF",qx=class{constructor(e,n){this.points=e,this.view=n,this.text="",this.lineSeparator=n.state.facet(Te.lineSeparator)}append(e){this.text+=e}lineBreak(){this.text+=Mi}readRange(e,n){if(!e)return this;let r=e.parentNode;for(let o=e;;){this.findPointBefore(r,o);let a=this.text.length;this.readNode(o);let i=Oe.get(o),l=o.nextSibling;if(l==n){i?.breakAfter&&!l&&r!=this.view.contentDOM&&this.lineBreak();break}let s=Oe.get(l);(i&&s?i.breakAfter:(i?i.breakAfter:Ru(o))||Ru(l)&&(o.nodeName!="BR"||i?.isWidget())&&this.text.length>a)&&!yR(l,n)&&this.lineBreak(),o=l}return this.findPointBefore(r,n),this}readTextNode(e){let n=e.nodeValue;for(let r of this.points)r.node==e&&(r.pos=this.text.length+Math.min(r.offset,n.length));for(let r=0,o=this.lineSeparator?null:/\r\n?|\n/g;;){let a=-1,i=1,l;if(this.lineSeparator?(a=n.indexOf(this.lineSeparator,r),i=this.lineSeparator.length):(l=o.exec(n))&&(a=l.index,i=l[0].length),this.append(n.slice(r,a<0?n.length:a)),a<0)break;if(this.lineBreak(),i>1)for(let s of this.points)s.node==e&&s.pos>this.text.length&&(s.pos-=i-1);r=a+i}}readNode(e){let n=Oe.get(e),r=n&&n.overrideDOMText;if(r!=null){this.findPointInside(e,r.length);for(let o=r.iter();!o.next().done;)o.lineBreak?this.lineBreak():this.append(o.value)}else _i(e)?this.readTextNode(e):e.nodeName=="BR"?e.nextSibling&&this.lineBreak():Ke(e)&&this.readRange(e.firstChild,null)}findPointBefore(e,n){for(let r of this.points)r.node==e&&e.childNodes[r.offset]==n&&(r.pos=this.text.length)}findPointInside(e,n){for(let r of this.points)(_i(e)?r.node==e:e.contains(r.node))&&(r.pos=this.text.length+(gR(e,r.node,r.offset)?n:0))}};_u=class{constructor(e,n){this.node=e,this.offset=n,this.pos=-1}},Px=class{constructor(e,n,r,o){this.typeOver=o,this.bounds=null,this.text="",this.domChanged=n>-1;let{impreciseHead:a,impreciseAnchor:i}=e.docView,l=e.state.selection;if(e.state.readOnly&&n>-1)this.newSel=null;else if(n>-1&&(this.bounds=ck(e.docView.tile,n,r,0))){let s=a||i?[]:IR(e),f=new qx(s,e);f.readRange(this.bounds.startDOM,this.bounds.endDOM),this.text=f.text,this.newSel=vR(s,this.bounds.from)}else{let s=e.observer.selectionRange,f=a&&a.node==s.focusNode&&a.offset==s.focusOffset||!wx(e.contentDOM,s.focusNode)?l.main.head:e.docView.posFromDOM(s.focusNode,s.focusOffset),c=i&&i.node==s.anchorNode&&i.offset==s.anchorOffset||!wx(e.contentDOM,s.anchorNode)?l.main.anchor:e.docView.posFromDOM(s.anchorNode,s.anchorOffset),u=e.viewport;if((R.ios||R.chrome)&&f!=c&&Math.min(f,c)<=l.main.from&&Math.max(f,c)>=l.main.to&&(u.from>0||u.to<e.state.doc.length)){let d=Math.min(f,c),p=Math.max(f,c),m=u.from-d,x=u.to-p;(m==0||m==1||d==0)&&(x==0||x==-1||p==e.state.doc.length)&&(f=0,c=e.state.doc.length)}if(e.inputState.composing>-1&&l.ranges.length>1)this.newSel=l.replaceRange(O.range(c,f));else if(e.lineWrapping&&c==f&&!(l.main.empty&&l.main.head==f)&&e.inputState.lastTouchTime>Date.now()-100){let d=e.coordsAtPos(f,-1),p=0;d&&(p=e.inputState.lastTouchY<=d.bottom?-1:1),this.newSel=O.create([O.cursor(f,p)])}else this.newSel=O.single(c,f)}}};Hx=class{setSelectionOrigin(e){this.lastSelectionOrigin=e,this.lastSelectionTime=Date.now()}constructor(e){this.view=e,this.lastKeyCode=0,this.lastKeyTime=0,this.touchActive=!1,this.lastTouchTime=0,this.lastTouchX=0,this.lastTouchY=0,this.lastFocusTime=0,this.lastScrollTop=0,this.lastScrollLeft=0,this.lastWheelEvent=0,this.pendingIOSKey=void 0,this.lastIOSMomentumScroll=0,this.tabFocusMode=-1,this.lastSelectionOrigin=null,this.lastSelectionTime=0,this.lastContextMenu=0,this.scrollHandlers=[],this.handlers=Object.create(null),this.composing=-1,this.compositionFirstChange=null,this.compositionEndedAt=0,this.compositionPendingKey=!1,this.compositionPendingChange=!1,this.insertingText="",this.insertingTextAt=0,this.mouseSelection=null,this.draggedContent=null,this.handleEvent=this.handleEvent.bind(this),this.notifiedFocused=e.hasFocus,R.safari&&e.contentDOM.addEventListener("input",()=>null),R.gecko&&NR(e.contentDOM.ownerDocument)}handleEvent(e){!BR(this.view,e)||this.ignoreDuringComposition(e)||e.type=="keydown"&&this.keydown(e)||(this.view.updateState!=0?Promise.resolve().then(()=>this.runHandlers(e.type,e)):this.runHandlers(e.type,e))}runHandlers(e,n){let r=this.handlers[e];if(r){for(let o of r.observers)o(this.view,n);for(let o of r.handlers){if(n.defaultPrevented)break;if(o(this.view,n)){n.preventDefault();break}}}}ensureHandlers(e){let n=SR(e),r=this.handlers,o=this.view.contentDOM;for(let a in n)if(a!="scroll"){let i=!n[a].handlers.length,l=r[a];l&&i!=!l.handlers.length&&(o.removeEventListener(a,this.handleEvent),l=null),l||o.addEventListener(a,this.handleEvent,{passive:i})}for(let a in r)a!="scroll"&&!n[a]&&o.removeEventListener(a,this.handleEvent);this.handlers=n}keydown(e){if(this.lastKeyCode=e.keyCode,this.lastKeyTime=Date.now(),e.keyCode==9&&this.tabFocusMode>-1&&(!this.tabFocusMode||Date.now()<=this.tabFocusMode))return!0;if(this.tabFocusMode>0&&e.keyCode!=27&&mk.indexOf(e.keyCode)<0&&(this.tabFocusMode=-1),R.android&&R.chrome&&!e.synthetic&&(e.keyCode==13||e.keyCode==8))return this.view.observer.delayAndroidKey(e.key,e.keyCode),!0;if(R.ios&&!e.synthetic&&!e.altKey&&!e.metaKey&&(pk.some(n=>n.keyCode==e.keyCode)&&!e.ctrlKey||kR.indexOf(e.key)>-1&&e.ctrlKey)){let n={ctrlKey:e.ctrlKey,altKey:e.altKey,metaKey:e.metaKey,shiftKey:e.shiftKey};n.shiftKey&&R.ios&&!/^(off|none)$/.test(this.view.contentDOM.autocapitalize)&&wR(this.view.win)&&(n.shiftKey=!1);let r=this.pendingIOSKey={key:e.key,keyCode:e.keyCode,mods:n};return setTimeout(()=>{this.pendingIOSKey==r&&this.flushIOSKey()},50),!0}return e.keyCode!=229&&this.view.observer.forceFlush(),!1}flushIOSKey(e){let n=this.pendingIOSKey;return!n||this.view.observer.pendingRecords().length||n.key=="Enter"&&e&&e.from<e.to&&/^\S+$/.test(e.insert.toString())?!1:(this.pendingIOSKey=void 0,Ni(this.view.contentDOM,n.key,n.keyCode,n.mods))}ignoreDuringComposition(e){return!/^key/.test(e.type)||e.synthetic?!1:this.composing>0?!0:R.safari&&!R.ios&&this.compositionPendingKey&&Date.now()-this.compositionEndedAt<100?(this.compositionPendingKey=!1,!0):!1}startMouseSelection(e){this.mouseSelection&&this.mouseSelection.destroy(),this.mouseSelection=e}update(e){this.view.observer.update(e),this.mouseSelection&&this.mouseSelection.update(e),this.draggedContent&&e.docChanged&&(this.draggedContent=this.draggedContent.map(e.changes)),e.transactions.length&&(this.lastKeyCode=this.lastSelectionTime=0)}destroy(){this.mouseSelection&&this.mouseSelection.destroy()}};pk=[{key:"Backspace",keyCode:8,inputType:"deleteContentBackward"},{key:"Enter",keyCode:13,inputType:"insertParagraph"},{key:"Enter",keyCode:13,inputType:"insertLineBreak"},{key:"Delete",keyCode:46,inputType:"deleteContentForward"}],kR="dthko",mk=[16,17,18,20,91,92,224,225],Iu=6;Ux=class{constructor(e,n,r,o){this.view=e,this.startEvent=n,this.style=r,this.mustSelect=o,this.scrollSpeed={x:0,y:0},this.scrolling=-1,this.lastEvent=n,this.scrollParents=LS(e.contentDOM),this.atoms=e.state.facet(Us).map(i=>i(e));let a=e.contentDOM.ownerDocument;a.addEventListener("mousemove",this.move=this.move.bind(this)),a.addEventListener("mouseup",this.up=this.up.bind(this)),this.extend=n.shiftKey,this.multiple=e.state.facet(Te.allowMultipleSelections)&&AR(e,n),this.dragging=OR(e,n)&&gk(n)==1?null:!1}start(e){this.dragging===!1&&this.select(e)}move(e){if(e.buttons==0)return this.destroy();if(this.dragging||this.dragging==null&&CR(this.startEvent,e)<10)return;this.select(this.lastEvent=e);let n=0,r=0,o=0,a=0,i=this.view.win.innerWidth,l=this.view.win.innerHeight;this.scrollParents.x&&({left:o,right:i}=this.scrollParents.x.getBoundingClientRect()),this.scrollParents.y&&({top:a,bottom:l}=this.scrollParents.y.getBoundingClientRect());let s=hg(this.view);e.clientX-s.left<=o+Iu?n=-vu(o-e.clientX):e.clientX+s.right>=i-Iu&&(n=vu(e.clientX-i)),e.clientY-s.top<=a+Iu?r=-vu(a-e.clientY):e.clientY+s.bottom>=l-Iu&&(r=vu(e.clientY-l)),this.setScrollSpeed(n,r)}up(e){this.dragging==null&&this.select(this.lastEvent),this.dragging||e.preventDefault(),this.destroy()}destroy(){this.setScrollSpeed(0,0);let e=this.view.contentDOM.ownerDocument;e.removeEventListener("mousemove",this.move),e.removeEventListener("mouseup",this.up),this.view.inputState.mouseSelection=this.view.inputState.draggedContent=null}setScrollSpeed(e,n){this.scrollSpeed={x:e,y:n},e||n?this.scrolling<0&&(this.scrolling=setInterval(()=>this.scroll(),50)):this.scrolling>-1&&(clearInterval(this.scrolling),this.scrolling=-1)}scroll(){let{x:e,y:n}=this.scrollSpeed;e&&this.scrollParents.x&&(this.scrollParents.x.scrollLeft+=e,e=0),n&&this.scrollParents.y&&(this.scrollParents.y.scrollTop+=n,n=0),(e||n)&&this.view.win.scrollBy(e,n),this.dragging===!1&&this.select(this.lastEvent)}select(e){let{view:n}=this,r=fk(this.atoms,this.style.get(e,this.extend,this.multiple));(this.mustSelect||!r.eq(n.state.selection,this.dragging===!1))&&this.view.dispatch({selection:r,userEvent:"select.pointer"}),this.mustSelect=!1}update(e){e.transactions.some(n=>n.isUserEvent("input.type"))?this.destroy():this.style.update(e)&&setTimeout(()=>this.select(this.lastEvent),20)}};Tn=Object.create(null),bt=Object.create(null),hk=R.ie&&R.ie_version<15||R.ios&&R.webkit_version<604;bt.scroll=t=>{let e=t.inputState;e.lastScrollTop=t.scrollDOM.scrollTop,e.lastScrollLeft=t.scrollDOM.scrollLeft,R.ios&&!e.touchActive&&(e.lastIOSMomentumScroll=Date.now())};bt.wheel=bt.mousewheel=t=>{t.inputState.lastWheelEvent=Date.now()};Tn.keydown=(t,e)=>(t.inputState.setSelectionOrigin("select"),e.keyCode==27&&t.inputState.tabFocusMode!=0&&(t.inputState.tabFocusMode=Date.now()+2e3),!1);bt.touchstart=(t,e)=>{let n=t.inputState,r=e.targetTouches[0];n.touchActive=!0,n.lastTouchTime=Date.now(),r&&(n.lastTouchX=r.clientX,n.lastTouchY=r.clientY),n.setSelectionOrigin("select.pointer")};bt.touchmove=t=>{t.inputState.setSelectionOrigin("select.pointer")};bt.touchend=(t,e)=>{t.inputState.touchActive=!1};Tn.mousedown=(t,e)=>{if(t.observer.flush(),t.inputState.lastTouchTime>Date.now()-2e3)return!1;let n=null;for(let r of t.state.facet(KS))if(n=r(t,e),n)break;if(!n&&e.button==0&&(n=RR(t,e)),n){let r=!t.hasFocus;t.inputState.startMouseSelection(new Ux(t,e,n,r)),r&&t.observer.ignore(()=>{qS(t.contentDOM);let a=t.root.activeElement;a&&!a.contains(t.contentDOM)&&a.blur()});let o=t.inputState.mouseSelection;if(o)return o.start(e),o.dragging===!1}else t.inputState.setSelectionOrigin("select.pointer");return!1};MR=R.ie&&R.ie_version<=11,pS=null,mS=0,hS=0;Tn.dragstart=(t,e)=>{let{selection:{main:n}}=t.state;if(e.target.draggable){let o=t.docView.tile.nearest(e.target);if(o&&o.isWidget()){let a=o.posAtStart,i=a+o.length;(a>=n.to||i<=n.from)&&(n=O.undirectionalRange(a,i))}}let{inputState:r}=t;return r.mouseSelection&&(r.mouseSelection.dragging=!0),r.draggedContent=n,e.dataTransfer&&(e.dataTransfer.setData("Text",Wu(t.state,dg,t.state.sliceDoc(n.from,n.to))),e.dataTransfer.effectAllowed="copyMove"),!1};Tn.dragend=t=>(t.inputState.draggedContent=null,!1);Tn.drop=(t,e)=>{if(!e.dataTransfer)return!1;if(t.state.readOnly)return!0;let n=e.dataTransfer.files;if(n&&n.length){let r=Array(n.length),o=0,a=()=>{++o==n.length&&xS(t,e,r.filter(i=>i!=null).join(t.state.lineBreak),!1)};for(let i=0;i<n.length;i++){let l=new FileReader;l.onerror=a,l.onload=()=>{/[\x00-\x08\x0e-\x1f]{2}/.test(l.result)||(r[i]=l.result),a()},l.readAsText(n[i])}return!0}else{let r=e.dataTransfer.getData("Text");if(r)return xS(t,e,r,!0),!0}return!1};Tn.paste=(t,e)=>{if(t.state.readOnly)return!0;t.observer.flush();let n=hk?null:e.clipboardData;return n?(xk(t,n.getData("text/plain")||n.getData("text/uri-list")),!0):(DR(t),!1)};jx=null;Tn.copy=Tn.cut=(t,e)=>{if(!Ds(t.contentDOM,t.observer.selectionRange))return!1;let{text:n,ranges:r,linewise:o}=LR(t.state);if(!n&&!o)return!1;jx=o?n:null,e.type=="cut"&&!t.state.readOnly&&t.dispatch({changes:r,scrollIntoView:!0,userEvent:"delete.cut"});let a=hk?null:e.clipboardData;return a?(a.clearData(),a.setData("text/plain",n),!0):(FR(t,n),!1)};yk=Ot.define();bt.focus=t=>{t.inputState.lastFocusTime=Date.now(),!t.scrollDOM.scrollTop&&(t.inputState.lastScrollTop||t.inputState.lastScrollLeft)&&(t.scrollDOM.scrollTop=t.inputState.lastScrollTop,t.scrollDOM.scrollLeft=t.inputState.lastScrollLeft),Ik(t)};bt.blur=t=>{t.observer.clearSelectionRange(),Ik(t)};bt.compositionstart=bt.compositionupdate=(t,e)=>{if(!t.observer.editContext&&(t.inputState.compositionFirstChange==null&&(t.inputState.compositionFirstChange=!0),t.inputState.composing<0)){let{main:n}=t.state.selection;!n.empty&&t.lineBlockAt(n.from).from!=t.lineBlockAt(n.to).from&&!t.state.readOnly&&t.dispatch({changes:t.state.selection.ranges.filter(r=>!r.empty).map(r=>({from:r.from,to:r.to})),userEvent:"input"}),t.inputState.composing=0}};bt.compositionend=t=>{t.observer.editContext||(t.inputState.composing=-1,t.inputState.compositionEndedAt=Date.now(),t.inputState.compositionPendingKey=!0,t.inputState.compositionPendingChange=t.observer.pendingRecords().length>0,t.inputState.compositionFirstChange=null,R.chrome&&R.android?t.observer.flushSoon():t.inputState.compositionPendingChange?Promise.resolve().then(()=>t.observer.flush()):setTimeout(()=>{t.inputState.composing<0&&t.docView.hasComposition&&t.update([])},50))};bt.contextmenu=t=>{t.inputState.lastContextMenu=Date.now()};Tn.beforeinput=(t,e)=>{var n,r;if((e.inputType=="insertText"||e.inputType=="insertCompositionText")&&(t.inputState.insertingText=e.data,t.inputState.insertingTextAt=Date.now()),e.inputType=="insertReplacementText"&&t.observer.editContext){let a=(n=e.dataTransfer)===null||n===void 0?void 0:n.getData("text/plain"),i=e.getTargetRanges();if(a&&i.length){let l=i[0],s=t.posAtDOM(l.startContainer,l.startOffset),f=t.posAtDOM(l.endContainer,l.endOffset);return xg(t,{from:s,to:f,insert:t.state.toText(a)},null),!0}}let o;if(R.chrome&&R.android&&(o=pk.find(a=>a.inputType==e.inputType))&&(t.observer.delayAndroidKey(o.key,o.keyCode),o.key=="Backspace"||o.key=="Delete")){let a=((r=window.visualViewport)===null||r===void 0?void 0:r.height)||0;setTimeout(()=>{var i;(((i=window.visualViewport)===null||i===void 0?void 0:i.height)||0)>a+10&&t.hasFocus&&(t.contentDOM.blur(),t.focus())},100)}return R.ios&&e.inputType=="deleteContentForward"&&t.observer.flushSoon(),R.safari&&e.inputType=="insertText"&&t.inputState.composing>=0&&setTimeout(()=>bt.compositionend(t,e),20),!1};gS=new Set;yS=["pre-wrap","normal","pre-line","break-spaces"],ji=!1;Vx=class{constructor(e){this.lineWrapping=e,this.doc=J.empty,this.heightSamples={},this.lineHeight=14,this.charWidth=7,this.textHeight=14,this.lineLength=30}heightForGap(e,n){let r=this.doc.lineAt(n).number-this.doc.lineAt(e).number+1;return this.lineWrapping&&(r+=Math.max(0,Math.ceil((n-e-r*this.lineLength*.5)/this.lineLength))),this.lineHeight*r}heightForLine(e){return this.lineWrapping?(1+Math.max(0,Math.ceil((e-this.lineLength)/Math.max(1,this.lineLength-5))))*this.lineHeight:this.lineHeight}setDoc(e){return this.doc=e,this}mustRefreshForWrapping(e){return yS.indexOf(e)>-1!=this.lineWrapping}mustRefreshForHeights(e){let n=!1;for(let r=0;r<e.length;r++){let o=e[r];o<0?r++:this.heightSamples[Math.floor(o*10)]||(n=!0,this.heightSamples[Math.floor(o*10)]=!0)}return n}refresh(e,n,r,o,a,i){let l=yS.indexOf(e)>-1,s=Math.abs(n-this.lineHeight)>.3||this.lineWrapping!=l;if(this.lineWrapping=l,this.lineHeight=n,this.charWidth=r,this.textHeight=o,this.lineLength=a,s){this.heightSamples={};for(let f=0;f<i.length;f++){let c=i[f];c<0?f++:this.heightSamples[Math.floor(c*10)]=!0}}return s}},Gx=class{constructor(e,n){this.from=e,this.heights=n,this.index=0}get more(){return this.index<this.heights.length}},Cn=class t{constructor(e,n,r,o,a){this.from=e,this.length=n,this.top=r,this.height=o,this._content=a}get type(){return typeof this._content=="number"?Dt.Text:Array.isArray(this._content)?this._content:this._content.type}get to(){return this.from+this.length}get bottom(){return this.top+this.height}get widget(){return this._content instanceof la?this._content.widget:null}get widgetLineBreaks(){return typeof this._content=="number"?this._content:0}join(e){let n=(Array.isArray(this._content)?this._content:[this]).concat(Array.isArray(e._content)?e._content:[e]);return new t(this.from,this.length+e.length,this.top,this.height+e.height,n)}},xe=(function(t){return t[t.ByPos=0]="ByPos",t[t.ByHeight=1]="ByHeight",t[t.ByPosNoHeight=2]="ByPosNoHeight",t})(xe||(xe={})),Ou=.001,Wt=class t{constructor(e,n,r=2){this.length=e,this.height=n,this.flags=r}get outdated(){return(this.flags&2)>0}set outdated(e){this.flags=(e?2:0)|this.flags&-3}setHeight(e){this.height!=e&&(Math.abs(this.height-e)>Ou&&(ji=!0),this.height=e)}replace(e,n,r){return t.of(r)}decomposeLeft(e,n){n.push(this)}decomposeRight(e,n){n.push(this)}applyChanges(e,n,r,o){let a=this,i=r.doc;for(let l=o.length-1;l>=0;l--){let{fromA:s,toA:f,fromB:c,toB:u}=o[l],d=a.lineAt(s,xe.ByPosNoHeight,r.setDoc(n),0,0),p=d.to>=f?d:a.lineAt(f,xe.ByPosNoHeight,r,0,0);for(u+=p.to-f,f=p.to;l>0&&d.from<=o[l-1].toA;)s=o[l-1].fromA,c=o[l-1].fromB,l--,s<d.from&&(d=a.lineAt(s,xe.ByPosNoHeight,r,0,0));c+=d.from-s,s=d.from;let m=Xx.build(r.setDoc(i),e,c,u);a=qu(a,a.replace(s,f,m))}return a.updateHeight(r,0)}static empty(){return new pn(0,0,0)}static of(e){if(e.length==1)return e[0];let n=0,r=e.length,o=0,a=0;for(;;)if(n==r)if(o>a*2){let l=e[n-1];l.break?e.splice(--n,1,l.left,null,l.right):e.splice(--n,1,l.left,l.right),r+=1+l.break,o-=l.size}else if(a>o*2){let l=e[r];l.break?e.splice(r,1,l.left,null,l.right):e.splice(r,1,l.left,l.right),r+=2+l.break,a-=l.size}else break;else if(o<a){let l=e[n++];l&&(o+=l.size)}else{let l=e[--r];l&&(a+=l.size)}let i=!1;return e[n-1]==null?(i=!0,n--):e[n]==null&&(i=!0,r++),new Wx(t.of(e.slice(0,n)),i,t.of(e.slice(r)))}};Wt.prototype.size=1;_R=ee.replace({}),Pu=class extends Wt{constructor(e,n,r){super(e,n),this.deco=r,this.spaceAbove=0}mainBlock(e,n){return new Cn(n,this.length,e+this.spaceAbove,this.height-this.spaceAbove,this.deco||0)}blockAt(e,n,r,o){return this.spaceAbove&&e<r+this.spaceAbove?new Cn(o,0,r,this.spaceAbove,_R):this.mainBlock(r,o)}lineAt(e,n,r,o,a){let i=this.mainBlock(o,a);return this.spaceAbove?this.blockAt(0,r,o,a).join(i):i}forEachLine(e,n,r,o,a,i){e<=a+this.length&&n>=a&&i(this.lineAt(0,xe.ByPos,r,o,a))}setMeasuredHeight(e){let n=e.heights[e.index++];n<0?(this.spaceAbove=-n,n=e.heights[e.index++]):this.spaceAbove=0,this.setHeight(n)}updateHeight(e,n=0,r=!1,o){return o&&o.from<=n&&o.more&&this.setMeasuredHeight(o),this.outdated=!1,this}toString(){return`block(${this.length})`}},pn=class t extends Pu{constructor(e,n,r){super(e,n,null),this.collapsed=0,this.widgetHeight=0,this.breaks=0,this.spaceAbove=r}mainBlock(e,n){return new Cn(n,this.length,e+this.spaceAbove,this.height-this.spaceAbove,this.breaks)}replace(e,n,r){let o=r[0];return r.length==1&&(o instanceof t||o instanceof mo&&o.flags&4)&&Math.abs(this.length-o.length)<10?(o instanceof mo?o=new t(o.length,this.height,this.spaceAbove):o.height=this.height,this.outdated||(o.outdated=!1),o):Wt.of(r)}updateHeight(e,n=0,r=!1,o){return o&&o.from<=n&&o.more?this.setMeasuredHeight(o):(r||this.outdated)&&(this.spaceAbove=0,this.setHeight(Math.max(this.widgetHeight,e.heightForLine(this.length-this.collapsed))+this.breaks*e.lineHeight)),this.outdated=!1,this}toString(){return`line(${this.length}${this.collapsed?-this.collapsed:""}${this.widgetHeight?":"+this.widgetHeight:""})`}},mo=class t extends Wt{constructor(e){super(e,0)}heightMetrics(e,n){let r=e.doc.lineAt(n).number,o=e.doc.lineAt(n+this.length).number,a=o-r+1,i,l=0;if(e.lineWrapping){let s=Math.min(this.height,e.lineHeight*a);i=s/a,this.length>a+1&&(l=(this.height-s)/(this.length-a-1))}else i=this.height/a;return{firstLine:r,lastLine:o,perLine:i,perChar:l}}blockAt(e,n,r,o){let{firstLine:a,lastLine:i,perLine:l,perChar:s}=this.heightMetrics(n,o);if(n.lineWrapping){let f=o+(e<n.lineHeight?0:Math.round(Math.max(0,Math.min(1,(e-r)/this.height))*this.length)),c=n.doc.lineAt(f),u=l+c.length*s,d=Math.max(r,e-u/2);return new Cn(c.from,c.length,d,u,0)}else{let f=Math.max(0,Math.min(i-a,Math.floor((e-r)/l))),{from:c,length:u}=n.doc.line(a+f);return new Cn(c,u,r+l*f,l,0)}}lineAt(e,n,r,o,a){if(n==xe.ByHeight)return this.blockAt(e,r,o,a);if(n==xe.ByPosNoHeight){let{from:p,to:m}=r.doc.lineAt(e);return new Cn(p,m-p,0,0,0)}let{firstLine:i,perLine:l,perChar:s}=this.heightMetrics(r,a),f=r.doc.lineAt(e),c=l+f.length*s,u=f.number-i,d=o+l*u+s*(f.from-a-u);return new Cn(f.from,f.length,Math.max(o,Math.min(d,o+this.height-c)),c,0)}forEachLine(e,n,r,o,a,i){e=Math.max(e,a),n=Math.min(n,a+this.length);let{firstLine:l,perLine:s,perChar:f}=this.heightMetrics(r,a);for(let c=e,u=o;c<=n;){let d=r.doc.lineAt(c);if(c==e){let m=d.number-l;u+=s*m+f*(e-a-m)}let p=s+f*d.length;i(new Cn(d.from,d.length,u,p,0)),u+=p,c=d.to+1}}replace(e,n,r){let o=this.length-n;if(o>0){let a=r[r.length-1];a instanceof t?r[r.length-1]=new t(a.length+o):r.push(null,new t(o-1))}if(e>0){let a=r[0];a instanceof t?r[0]=new t(e+a.length):r.unshift(new t(e-1),null)}return Wt.of(r)}decomposeLeft(e,n){n.push(new t(e-1),null)}decomposeRight(e,n){n.push(null,new t(this.length-e-1))}updateHeight(e,n=0,r=!1,o){let a=n+this.length;if(o&&o.from<=n+this.length&&o.more){let i=[],l=Math.max(n,o.from),s=-1;for(o.from>n&&i.push(new t(o.from-n-1).updateHeight(e,n));l<=a&&o.more;){let c=e.doc.lineAt(l).length;i.length&&i.push(null);let u=o.heights[o.index++],d=0;u<0&&(d=-u,u=o.heights[o.index++]),s==-1?s=u:Math.abs(u-s)>=Ou&&(s=-2);let p=new pn(c,u,d);p.outdated=!1,i.push(p),l+=c+1}l<=a&&i.push(null,new t(a-l).updateHeight(e,l));let f=Wt.of(i);return(s<0||Math.abs(f.height-this.height)>=Ou||Math.abs(s-this.heightMetrics(e,n).perLine)>=Ou)&&(ji=!0),qu(this,f)}else(r||this.outdated)&&(this.setHeight(e.heightForGap(n,n+this.length)),this.outdated=!1);return this}toString(){return`gap(${this.length})`}},Wx=class extends Wt{constructor(e,n,r){super(e.length+(n?1:0)+r.length,e.height+r.height,(n?1:0)|(e.outdated||r.outdated?2:0)),this.left=e,this.right=r,this.size=e.size+r.size}get break(){return this.flags&1}blockAt(e,n,r,o){let a=r+this.left.height;return e<a?this.left.blockAt(e,n,r,o):this.right.blockAt(e,n,a,o+this.left.length+this.break)}lineAt(e,n,r,o,a){let i=o+this.left.height,l=a+this.left.length+this.break,s=n==xe.ByHeight?e<i:e<l,f=s?this.left.lineAt(e,n,r,o,a):this.right.lineAt(e,n,r,i,l);if(this.break||(s?f.to<l:f.from>l))return f;let c=n==xe.ByPosNoHeight?xe.ByPosNoHeight:xe.ByPos;return s?f.join(this.right.lineAt(l,c,r,i,l)):this.left.lineAt(l,c,r,o,a).join(f)}forEachLine(e,n,r,o,a,i){let l=o+this.left.height,s=a+this.left.length+this.break;if(this.break)e<s&&this.left.forEachLine(e,n,r,o,a,i),n>=s&&this.right.forEachLine(e,n,r,l,s,i);else{let f=this.lineAt(s,xe.ByPos,r,o,a);e<f.from&&this.left.forEachLine(e,Math.min(n,f.from-1),r,o,a,i),f.to>=e&&f.from<=n&&i(f),n>f.to&&this.right.forEachLine(Math.max(e,f.to+1),n,r,l,s,i)}}replace(e,n,r){let o=this.left.length+this.break;if(n<o)return this.balanced(this.left.replace(e,n,r),this.right);if(e>this.left.length)return this.balanced(this.left,this.right.replace(e-o,n-o,r));let a=[];e>0&&this.decomposeLeft(e,a);let i=a.length;for(let l of r)a.push(l);if(e>0&&IS(a,i-1),n<this.length){let l=a.length;this.decomposeRight(n,a),IS(a,l)}return Wt.of(a)}decomposeLeft(e,n){let r=this.left.length;if(e<=r)return this.left.decomposeLeft(e,n);n.push(this.left),this.break&&(r++,e>=r&&n.push(null)),e>r&&this.right.decomposeLeft(e-r,n)}decomposeRight(e,n){let r=this.left.length,o=r+this.break;if(e>=o)return this.right.decomposeRight(e-o,n);e<r&&this.left.decomposeRight(e,n),this.break&&e<o&&n.push(null),n.push(this.right)}balanced(e,n){return e.size>2*n.size||n.size>2*e.size?Wt.of(this.break?[e,null,n]:[e,n]):(this.left=qu(this.left,e),this.right=qu(this.right,n),this.setHeight(e.height+n.height),this.outdated=e.outdated||n.outdated,this.size=e.size+n.size,this.length=e.length+this.break+n.length,this)}updateHeight(e,n=0,r=!1,o){let{left:a,right:i}=this,l=n+a.length+this.break,s=null;return o&&o.from<=n+a.length&&o.more?s=a=a.updateHeight(e,n,r,o):a.updateHeight(e,n,r),o&&o.from<=l+i.length&&o.more?s=i=i.updateHeight(e,l,r,o):i.updateHeight(e,l,r),s?this.balanced(a,i):(this.height=this.left.height+this.right.height,this.outdated=!1,this)}toString(){return this.left+(this.break?" ":"-")+this.right}};qR=5,Xx=class t{constructor(e,n){this.pos=e,this.oracle=n,this.nodes=[],this.lineStart=-1,this.lineEnd=-1,this.covering=null,this.writtenTo=e}get isCovered(){return this.covering&&this.nodes[this.nodes.length-1]==this.covering}span(e,n){if(this.lineStart>-1){let r=Math.min(n,this.lineEnd),o=this.nodes[this.nodes.length-1];o instanceof pn?o.length+=r-this.pos:(r>this.pos||!this.isCovered)&&this.nodes.push(new pn(r-this.pos,-1,0)),this.writtenTo=r,n>r&&(this.nodes.push(null),this.writtenTo++,this.lineStart=-1)}this.pos=n}point(e,n,r){if(e<n||r.heightRelevant){let o=r.widget?r.widget.estimatedHeight:0,a=r.widget?r.widget.lineBreaks:0;o<0&&(o=this.oracle.lineHeight);let i=n-e;r.block?this.addBlock(new Pu(i,o,r)):(i||a||o>=qR)&&this.addLineDeco(o,a,i)}else n>e&&this.span(e,n);this.lineEnd>-1&&this.lineEnd<this.pos&&(this.lineEnd=this.oracle.doc.lineAt(this.pos).to)}enterLine(){if(this.lineStart>-1)return;let{from:e,to:n}=this.oracle.doc.lineAt(this.pos);this.lineStart=e,this.lineEnd=n,this.writtenTo<e&&((this.writtenTo<e-1||this.nodes[this.nodes.length-1]==null)&&this.nodes.push(this.blankContent(this.writtenTo,e-1)),this.nodes.push(null)),this.pos>e&&this.nodes.push(new pn(this.pos-e,-1,0)),this.writtenTo=this.pos}blankContent(e,n){let r=new mo(n-e);return this.oracle.doc.lineAt(e).to==n&&(r.flags|=4),r}ensureLine(){this.enterLine();let e=this.nodes.length?this.nodes[this.nodes.length-1]:null;if(e instanceof pn)return e;let n=new pn(0,-1,0);return this.nodes.push(n),n}addBlock(e){this.enterLine();let n=e.deco;n&&n.startSide>0&&!this.isCovered&&this.ensureLine(),this.nodes.push(e),this.writtenTo=this.pos=this.pos+e.length,n&&n.endSide>0&&(this.covering=e)}addLineDeco(e,n,r){let o=this.ensureLine();o.length+=r,o.collapsed+=r,o.widgetHeight=Math.max(o.widgetHeight,e),o.breaks+=n,this.writtenTo=this.pos=this.pos+r}finish(e){let n=this.nodes.length==0?null:this.nodes[this.nodes.length-1];this.lineStart>-1&&!(n instanceof pn)&&!this.isCovered?this.nodes.push(new pn(0,-1,0)):(this.writtenTo<this.pos||n==null)&&this.nodes.push(this.blankContent(this.writtenTo,this.pos));let r=e;for(let o of this.nodes)o instanceof pn&&o.updateHeight(this.oracle,r),r+=o?o.length:1;return this.nodes}static build(e,n,r,o){let a=new t(r,e);return le.spans(n,r,o,a,0),a.finish(r)}};Qx=class{constructor(){this.changes=[]}compareRange(){}comparePoint(e,n,r,o){(e<n||r&&r.heightRelevant||o&&o.heightRelevant)&&Li(e,n,this.changes,5)}};Ns=class{constructor(e,n,r,o){this.from=e,this.to=n,this.size=r,this.displaySize=o}static same(e,n){if(e.length!=n.length)return!1;for(let r=0;r<e.length;r++){let o=e[r],a=n[r];if(o.from!=a.from||o.to!=a.to||o.size!=a.size)return!1}return!0}draw(e,n){return ee.replace({widget:new Kx(this.displaySize*(n?e.scaleY:e.scaleX),n)}).range(this.from,this.to)}},Kx=class extends ho{constructor(e,n){super(),this.size=e,this.vertical=n}eq(e){return e.size==this.size&&e.vertical==this.vertical}toDOM(){let e=document.createElement("div");return this.vertical?e.style.height=this.size+"px":(e.style.width=this.size+"px",e.style.height="2px",e.style.display="inline-block"),e}get estimatedHeight(){return this.vertical?this.size:-1}},zu=class{constructor(e,n){this.view=e,this.state=n,this.pixelViewport={left:0,right:window.innerWidth,top:0,bottom:0},this.inView=!0,this.paddingTop=0,this.paddingBottom=0,this.contentDOMWidth=0,this.contentDOMHeight=0,this.editorHeight=0,this.editorWidth=0,this.scaleX=1,this.scaleY=1,this.scrollOffset=0,this.scrolledToBottom=!1,this.scrollAnchorPos=0,this.scrollAnchorHeight=-1,this.scaler=Yx,this.scrollTarget=null,this.printing=!1,this.mustMeasureContent=!0,this.defaultTextDirection=pe.LTR,this.visibleRanges=[],this.mustEnforceCursorAssoc=!1;let r=n.facet(pg).some(o=>typeof o!="function"&&o.class=="cm-lineWrapping");this.heightOracle=new Vx(r),this.stateDeco=vS(n),this.heightMap=Wt.empty().applyChanges(this.stateDeco,J.empty,this.heightOracle.setDoc(n.doc),[new An(0,0,0,n.doc.length)]);for(let o=0;o<2&&(this.viewport=this.getViewport(0,null),!!this.updateForViewport());o++);this.updateViewportLines(),this.lineGaps=this.ensureLineGaps([]),this.lineGapDeco=ee.set(this.lineGaps.map(o=>o.draw(this,!1))),this.scrollParent=e.scrollDOM,this.computeVisibleRanges()}updateForViewport(){let e=[this.viewport],{main:n}=this.state.selection;for(let r=0;r<=1;r++){let o=r?n.head:n.anchor;if(!e.some(({from:a,to:i})=>o>=a&&o<=i)){let{from:a,to:i}=this.lineBlockAt(o);e.push(new Ei(a,i))}}return this.viewports=e.sort((r,o)=>r.from-o.from),this.updateScaler()}updateScaler(){let e=this.scaler;return this.scaler=this.heightMap.height<=7e6?Yx:Jx.get(this.heightOracle,this.heightMap,this.viewports),e.eq(this.scaler)?0:2}updateViewportLines(){this.viewportLines=[],this.heightMap.forEachLine(this.viewport.from,this.viewport.to,this.heightOracle.setDoc(this.state.doc),0,0,e=>{this.viewportLines.push(Bs(e,this.scaler))})}update(e,n=null){this.state=e.state;let r=this.stateDeco;this.stateDeco=vS(this.state);let o=e.changedRanges,a=An.extendWithRanges(o,PR(r,this.stateDeco,e?e.changes:ht.empty(this.state.doc.length))),i=this.heightMap.height,l=this.scrolledToBottom?null:this.scrollAnchorAt(this.scrollOffset);bS(),this.heightMap=this.heightMap.applyChanges(this.stateDeco,e.startState.doc,this.heightOracle.setDoc(this.state.doc),a),(this.heightMap.height!=i||ji)&&(e.flags|=2),l?(this.scrollAnchorPos=e.changes.mapPos(l.from,-1),this.scrollAnchorHeight=l.top):(this.scrollAnchorPos=-1,this.scrollAnchorHeight=i);let s=a.length?this.mapViewport(this.viewport,e.changes):this.viewport;(n&&(n.range.head<s.from||n.range.head>s.to)||!this.viewportIsAppropriate(s))&&(s=this.getViewport(0,n));let f=s.from!=this.viewport.from||s.to!=this.viewport.to;this.viewport=s,e.flags|=this.updateForViewport(),(f||!e.changes.empty||e.flags&2)&&this.updateViewportLines(),(this.lineGaps.length||this.viewport.to-this.viewport.from>4e3)&&this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps,e.changes))),e.flags|=this.computeVisibleRanges(e.changes),n&&(this.scrollTarget=n),!this.mustEnforceCursorAssoc&&(e.selectionSet||e.focusChanged)&&e.view.lineWrapping&&e.state.selection.main.empty&&e.state.selection.main.assoc&&!e.state.facet(KM)&&(this.mustEnforceCursorAssoc=!0)}measure(){let{view:e}=this,n=e.contentDOM,r=window.getComputedStyle(n),o=this.heightOracle,a=r.whiteSpace;this.defaultTextDirection=r.direction=="rtl"?pe.RTL:pe.LTR;let i=this.heightOracle.mustRefreshForWrapping(a)||this.mustMeasureContent==="refresh",l=n.getBoundingClientRect(),s=i||this.mustMeasureContent||this.contentDOMHeight!=l.height;this.contentDOMHeight=l.height,this.mustMeasureContent=!1;let f=0,c=0;if(l.width&&l.height){let{scaleX:v,scaleY:S}=FS(n,l);(v>.005&&Math.abs(this.scaleX-v)>.005||S>.005&&Math.abs(this.scaleY-S)>.005)&&(this.scaleX=v,this.scaleY=S,f|=16,i=s=!0)}let u=(parseInt(r.paddingTop)||0)*this.scaleY,d=(parseInt(r.paddingBottom)||0)*this.scaleY;(this.paddingTop!=u||this.paddingBottom!=d)&&(this.paddingTop=u,this.paddingBottom=d,f|=18),this.editorWidth!=e.scrollDOM.clientWidth&&(o.lineWrapping&&(s=!0),this.editorWidth=e.scrollDOM.clientWidth,f|=16);let p=LS(this.view.contentDOM,!1).y;p!=this.scrollParent&&(this.scrollParent=p,this.scrollAnchorHeight=-1,this.scrollOffset=0);let m=this.getScrollOffset();this.scrollOffset!=m&&(this.scrollAnchorHeight=-1,this.scrollOffset=m),this.scrolledToBottom=PS(this.scrollParent||e.win);let x=(this.printing?UR:zR)(n,this.paddingTop),b=x.top-this.pixelViewport.top,h=x.bottom-this.pixelViewport.bottom;this.pixelViewport=x;let y=this.pixelViewport.bottom>this.pixelViewport.top&&this.pixelViewport.right>this.pixelViewport.left;if(y!=this.inView&&(this.inView=y,y&&(s=!0)),!this.inView&&!this.scrollTarget&&!HR(e.dom))return 0;let g=l.width;if((this.contentDOMWidth!=g||this.editorHeight!=e.scrollDOM.clientHeight)&&(this.contentDOMWidth=l.width,this.editorHeight=e.scrollDOM.clientHeight,f|=16),s){let v=e.docView.measureVisibleLineHeights(this.viewport);if(o.mustRefreshForHeights(v)&&(i=!0),i||o.lineWrapping&&Math.abs(g-this.contentDOMWidth)>o.charWidth){let{lineHeight:S,charWidth:w,textHeight:k}=e.docView.measureTextSize();i=S>0&&o.refresh(a,S,w,k,Math.max(5,g/w),v),i&&(e.docView.minWidth=0,f|=16)}b>0&&h>0?c=Math.max(b,h):b<0&&h<0&&(c=Math.min(b,h)),bS();for(let S of this.viewports){let w=S.from==this.viewport.from?v:e.docView.measureVisibleLineHeights(S);this.heightMap=(i?Wt.empty().applyChanges(this.stateDeco,J.empty,this.heightOracle,[new An(0,0,0,e.state.doc.length)]):this.heightMap).updateHeight(o,0,i,new Gx(S.from,w))}ji&&(f|=2)}let I=!this.viewportIsAppropriate(this.viewport,c)||this.scrollTarget&&(this.scrollTarget.range.head<this.viewport.from||this.scrollTarget.range.head>this.viewport.to);return I&&(f&2&&(f|=this.updateScaler()),this.viewport=this.getViewport(c,this.scrollTarget),f|=this.updateForViewport()),(f&2||I)&&this.updateViewportLines(),(this.lineGaps.length||this.viewport.to-this.viewport.from>4e3)&&this.updateLineGaps(this.ensureLineGaps(i?[]:this.lineGaps,e)),f|=this.computeVisibleRanges(),this.mustEnforceCursorAssoc&&(this.mustEnforceCursorAssoc=!1,e.docView.enforceCursorAssoc()),f}get visibleTop(){return this.scaler.fromDOM(this.pixelViewport.top)}get visibleBottom(){return this.scaler.fromDOM(this.pixelViewport.bottom)}getViewport(e,n){let r=.5-Math.max(-.5,Math.min(.5,e/1e3/2)),o=this.heightMap,a=this.heightOracle,{visibleTop:i,visibleBottom:l}=this,s=new Ei(o.lineAt(i-r*1e3,xe.ByHeight,a,0,0).from,o.lineAt(l+(1-r)*1e3,xe.ByHeight,a,0,0).to);if(n){let{head:f}=n.range;if(f<s.from||f>s.to){let c=Math.min(this.editorHeight,this.pixelViewport.bottom-this.pixelViewport.top),u=o.lineAt(f,xe.ByPos,a,0,0),d;n.y=="center"?d=(u.top+u.bottom)/2-c/2:n.y=="start"||n.y=="nearest"&&f<s.from?d=u.top:d=u.bottom-c,s=new Ei(o.lineAt(d-1e3/2,xe.ByHeight,a,0,0).from,o.lineAt(d+c+1e3/2,xe.ByHeight,a,0,0).to)}}return s}mapViewport(e,n){let r=n.mapPos(e.from,-1),o=n.mapPos(e.to,1);return new Ei(this.heightMap.lineAt(r,xe.ByPos,this.heightOracle,0,0).from,this.heightMap.lineAt(o,xe.ByPos,this.heightOracle,0,0).to)}viewportIsAppropriate({from:e,to:n},r=0){if(!this.inView)return!0;let{top:o}=this.heightMap.lineAt(e,xe.ByPos,this.heightOracle,0,0),{bottom:a}=this.heightMap.lineAt(n,xe.ByPos,this.heightOracle,0,0),{visibleTop:i,visibleBottom:l}=this;return(e==0||o<=i-Math.max(10,Math.min(-r,250)))&&(n==this.state.doc.length||a>=l+Math.max(10,Math.min(r,250)))&&o>i-2*1e3&&a<l+2*1e3}mapLineGaps(e,n){if(!e.length||n.empty)return e;let r=[];for(let o of e)n.touchesRange(o.from,o.to)||r.push(new Ns(n.mapPos(o.from),n.mapPos(o.to),o.size,o.displaySize));return r}ensureLineGaps(e,n){let r=this.heightOracle.lineWrapping,o=r?1e4:2e3,a=o>>1,i=o<<1;if(this.defaultTextDirection!=pe.LTR&&!r)return[];let l=[],s=(c,u,d,p)=>{if(u-c<a)return;let m=this.state.selection.main,x=[m.from];m.empty||x.push(m.to);for(let h of x)if(h>c&&h<u){s(c,h-10,d,p),s(h+10,u,d,p);return}let b=VR(e,h=>h.from>=d.from&&h.to<=d.to&&Math.abs(h.from-c)<a&&Math.abs(h.to-u)<a&&!x.some(y=>h.from<y&&h.to>y));if(!b){if(u<d.to&&n&&r&&n.visibleRanges.some(g=>g.from<=u&&g.to>=u)){let g=n.moveToLineBoundary(O.cursor(u),!1,!0).head;g>c&&(u=g)}let h=this.gapSize(d,c,u,p),y=r||h<2e6?h:2e6;b=new Ns(c,u,h,y)}l.push(b)},f=c=>{if(c.length<i||c.type!=Dt.Text)return;let u=jR(c.from,c.to,this.stateDeco);if(u.total<i)return;let d=this.scrollTarget?this.scrollTarget.range.head:null,p,m;if(r){let x=o/this.heightOracle.lineLength*this.heightOracle.lineHeight,b,h;if(d!=null){let y=Su(u,d),g=((this.visibleBottom-this.visibleTop)/2+x)/c.height;b=y-g,h=y+g}else b=(this.visibleTop-c.top-x)/c.height,h=(this.visibleBottom-c.top+x)/c.height;p=wu(u,b),m=wu(u,h)}else{let x=u.total*this.heightOracle.charWidth,b=o*this.heightOracle.charWidth,h=0;if(x>2e6)for(let S of e)S.from>=c.from&&S.from<c.to&&S.size!=S.displaySize&&S.from*this.heightOracle.charWidth+h<this.pixelViewport.left&&(h=S.size-S.displaySize);let y=this.pixelViewport.left+h,g=this.pixelViewport.right+h,I,v;if(d!=null){let S=Su(u,d),w=((g-y)/2+b)/x;I=S-w,v=S+w}else I=(y-b)/x,v=(g+b)/x;p=wu(u,I),m=wu(u,v)}p>c.from&&s(c.from,p,c,u),m<c.to&&s(m,c.to,c,u)};for(let c of this.viewportLines)Array.isArray(c.type)?c.type.forEach(f):f(c);return l}gapSize(e,n,r,o){let a=Su(o,r)-Su(o,n);return this.heightOracle.lineWrapping?e.height*a:o.total*this.heightOracle.charWidth*a}updateLineGaps(e){Ns.same(e,this.lineGaps)||(this.lineGaps=e,this.lineGapDeco=ee.set(e.map(n=>n.draw(this,this.heightOracle.lineWrapping))))}computeVisibleRanges(e){let n=this.stateDeco;this.lineGaps.length&&(n=n.concat(this.lineGapDeco));let r=[];le.spans(n,this.viewport.from,this.viewport.to,{span(a,i){r.push({from:a,to:i})},point(){}},20);let o=0;if(r.length!=this.visibleRanges.length)o=12;else for(let a=0;a<r.length&&!(o&8);a++){let i=this.visibleRanges[a],l=r[a];(i.from!=l.from||i.to!=l.to)&&(o|=4,e&&e.mapPos(i.from,-1)==l.from&&e.mapPos(i.to,1)==l.to||(o|=8))}return this.visibleRanges=r,o}lineBlockAt(e){return e>=this.viewport.from&&e<=this.viewport.to&&this.viewportLines.find(n=>n.from<=e&&n.to>=e)||Bs(this.heightMap.lineAt(e,xe.ByPos,this.heightOracle,0,0),this.scaler)}lineBlockAtHeight(e){return e>=this.viewportLines[0].top&&e<=this.viewportLines[this.viewportLines.length-1].bottom&&this.viewportLines.find(n=>n.top<=e&&n.bottom>=e)||Bs(this.heightMap.lineAt(this.scaler.fromDOM(e),xe.ByHeight,this.heightOracle,0,0),this.scaler)}getScrollOffset(){return this.scrollParent==this.view.scrollDOM?this.scrollParent.scrollTop*this.scaleY:(this.scrollParent?this.scrollParent.getBoundingClientRect().top:0)-this.view.contentDOM.getBoundingClientRect().top}scrollAnchorAt(e){let n=this.lineBlockAtHeight(e+12-this.paddingTop);return n.from>=this.viewport.from||this.viewportLines[0].top-e>200?n:this.viewportLines[0]}elementAtHeight(e){return Bs(this.heightMap.blockAt(this.scaler.fromDOM(e),this.heightOracle,0,0),this.scaler)}get docHeight(){return this.scaler.toDOM(this.heightMap.height)}get contentHeight(){return this.docHeight+this.paddingTop+this.paddingBottom}},Ei=class{constructor(e,n){this.from=e,this.to=n}};Yx={toDOM(t){return t},fromDOM(t){return t},scale:1,eq(t){return t==this}};Jx=class t{constructor(e,n){this.scale=e,this.viewports=n}static get(e,n,r){let o=0,a=0,i=0,l=r.map(({from:f,to:c})=>{let u=n.lineAt(f,xe.ByPos,e,0,0).top,d=n.lineAt(c,xe.ByPos,e,0,0).bottom;return o+=d-u,{from:f,to:c,top:u,bottom:d,domTop:0,domBottom:0}});if(n.height-o<10)return Yx;let s=(7e6-o)/(n.height-o);for(let f of l)f.domTop=i+(f.top-a)*s,i=f.domBottom=f.domTop+(f.bottom-f.top),a=f.bottom;return new t(s,l)}toDOM(e){for(let n=0,r=0,o=0;;n++){let a=n<this.viewports.length?this.viewports[n]:null;if(!a||e<a.top)return o+(e-r)*this.scale;if(e<=a.bottom)return a.domTop+(e-a.top);r=a.bottom,o=a.domBottom}}fromDOM(e){for(let n=0,r=0,o=0;;n++){let a=n<this.viewports.length?this.viewports[n]:null;if(!a||e<a.domTop)return r+(e-o)/this.scale;if(e<=a.domBottom)return a.top+(e-a.domTop);r=a.bottom,o=a.domBottom}}eq(e){return e instanceof t?this.scale==e.scale&&this.viewports.length==e.viewports.length&&this.viewports.every((n,r)=>n.from==e.viewports[r].from&&n.to==e.viewports[r].to):!1}};ku=N.define({combine:t=>t.join(" ")}),Zx=N.define({combine:t=>t.indexOf(!0)>-1}),$x=dn.newName(),vk=dn.newName(),wk=dn.newName(),Sk={"&light":"."+vk,"&dark":"."+wk};GR=eg("."+$x,{"&":{position:"relative !important",boxSizing:"border-box","&.cm-focused":{outline:"1px dotted #212121"},display:"flex !important",flexDirection:"column"},".cm-scroller":{display:"flex !important",alignItems:"flex-start !important",fontFamily:"monospace",lineHeight:1.4,height:"100%",overflowX:"auto",position:"relative",zIndex:0,overflowAnchor:"none"},".cm-content":{margin:0,flexGrow:2,flexShrink:0,display:"block",whiteSpace:"pre",wordWrap:"normal",boxSizing:"border-box",minHeight:"100%",padding:"4px 0",outline:"none","&[contenteditable=true]":{WebkitUserModify:"read-write-plaintext-only"}},".cm-lineWrapping":{whiteSpace_fallback:"pre-wrap",whiteSpace:"break-spaces",wordBreak:"break-word",overflowWrap:"anywhere",flexShrink:1},"&light .cm-content":{caretColor:"black"},"&dark .cm-content":{caretColor:"white"},".cm-line":{display:"block",padding:"0 2px 0 6px"},".cm-layer":{userSelect:"none",position:"absolute",left:0,top:0,contain:"size style","& > *":{position:"absolute"}},"&light .cm-selectionBackground":{background:"#d9d9d9"},"&dark .cm-selectionBackground":{background:"#222"},"&light.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground":{background:"#d7d4f0"},"&dark.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground":{background:"#233"},".cm-cursorLayer":{pointerEvents:"none"},"&.cm-focused > .cm-scroller > .cm-cursorLayer":{animation:"steps(1) cm-blink 1.2s infinite"},"@keyframes cm-blink":{"0%":{},"50%":{opacity:0},"100%":{}},"@keyframes cm-blink2":{"0%":{},"50%":{opacity:0},"100%":{}},".cm-cursor, .cm-dropCursor":{borderLeft:"1.2px solid black",marginLeft:"-0.6px",pointerEvents:"none"},".cm-cursor":{display:"none"},"&dark .cm-cursor":{borderLeftColor:"#ddd"},".cm-selectionHandle":{backgroundColor:"currentColor",width:"1.5px"},".cm-selectionHandle-start::before, .cm-selectionHandle-end::before":{content:'""',backgroundColor:"inherit",borderRadius:"50%",width:"8px",height:"8px",position:"absolute",left:"-3.25px"},".cm-selectionHandle-start::before":{top:"-8px"},".cm-selectionHandle-end::before":{bottom:"-8px"},".cm-dropCursor":{position:"absolute"},"&.cm-focused > .cm-scroller > .cm-cursorLayer .cm-cursor":{display:"block"},".cm-iso":{unicodeBidi:"isolate"},".cm-announced":{position:"fixed",top:"-10000px"},"@media print":{".cm-announced":{display:"none"}},"&light .cm-activeLine":{backgroundColor:"#cceeff44"},"&dark .cm-activeLine":{backgroundColor:"#99eeff33"},"&light .cm-specialChar":{color:"red"},"&dark .cm-specialChar":{color:"#f78"},".cm-gutters":{flexShrink:0,display:"flex",height:"100%",boxSizing:"border-box",zIndex:200},".cm-gutters-before":{insetInlineStart:0},".cm-gutters-after":{insetInlineEnd:0},"&light .cm-gutters":{backgroundColor:"#f5f5f5",color:"#6c6c6c",border:"0px solid #ddd","&.cm-gutters-before":{borderRightWidth:"1px"},"&.cm-gutters-after":{borderLeftWidth:"1px"}},"&dark .cm-gutters":{backgroundColor:"#333338",color:"#ccc"},".cm-gutter":{display:"flex !important",flexDirection:"column",flexShrink:0,boxSizing:"border-box",minHeight:"100%",overflow:"hidden"},".cm-gutterElement":{boxSizing:"border-box"},".cm-lineNumbers .cm-gutterElement":{padding:"0 3px 0 5px",minWidth:"20px",textAlign:"right",whiteSpace:"nowrap"},"&light .cm-activeLineGutter":{backgroundColor:"#e2f2ff"},"&dark .cm-activeLineGutter":{backgroundColor:"#222227"},".cm-panels":{boxSizing:"border-box",position:"sticky",left:0,right:0,zIndex:300},"&light .cm-panels":{backgroundColor:"#f5f5f5",color:"black"},".cm-panels-top":{top:"0"},".cm-panels-bottom":{bottom:"0"},"&light .cm-panels-top":{borderBottom:"1px solid #ddd"},"&light .cm-panels-bottom":{borderTop:"1px solid #ddd"},"&dark .cm-panels":{backgroundColor:"#333338",color:"white"},".cm-dialog":{padding:"2px 19px 4px 6px",position:"relative","& label":{fontSize:"80%"}},".cm-dialog-close":{position:"absolute",top:"3px",right:"4px",backgroundColor:"inherit",border:"none",font:"inherit",fontSize:"14px",padding:"0"},".cm-tab":{display:"inline-block",overflow:"hidden",verticalAlign:"bottom"},".cm-widgetBuffer":{verticalAlign:"baseline",height:"1em",width:0,display:"inline"},".cm-placeholder":{color:"#888",display:"inline-block",verticalAlign:"top",userSelect:"none"},".cm-highlightSpace":{background:"radial-gradient(circle at 50% 55%, #aaa 20%, transparent 0) no-repeat",backgroundSize:".4em",backgroundPosition:"calc(min(50%, 0px)) center"},".cm-highlightTab":{backgroundImage:`url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20"><path stroke="%23888" stroke-width="1" fill="none" d="M1 10H196L190 5M190 15L196 10M197 4L197 16"/></svg>')`,backgroundSize:"auto 100%",backgroundPosition:"right 90%",backgroundRepeat:"no-repeat"},".cm-trailingSpace":{backgroundColor:"#ff332255"},".cm-button":{verticalAlign:"middle",color:"inherit",fontSize:"70%",padding:".2em 1em",borderRadius:"1px"},"&light .cm-button":{backgroundImage:"linear-gradient(#eff1f5, #d9d9df)",border:"1px solid #888","&:active":{backgroundImage:"linear-gradient(#b4b4b4, #d0d3d6)"}},"&dark .cm-button":{backgroundImage:"linear-gradient(#393939, #111)",border:"1px solid #888","&:active":{backgroundImage:"linear-gradient(#111, #333)"}},".cm-textfield":{verticalAlign:"middle",color:"inherit",fontSize:"70%",border:"1px solid silver",padding:".2em .5em"},"&light .cm-textfield":{backgroundColor:"white"},"&dark .cm-textfield":{border:"1px solid #555",backgroundColor:"inherit"}},Sk),WR={childList:!0,characterData:!0,subtree:!0,attributes:!0,characterDataOldValue:!0},mx=R.ie&&R.ie_version<=11,tg=class{constructor(e){this.view=e,this.active=!1,this.editContext=null,this.selectionRange=new Sx,this.selectionChanged=!1,this.delayedFlush=-1,this.resizeTimeout=-1,this.queue=[],this.delayedAndroidKey=null,this.flushingAndroidKey=-1,this.lastChange=0,this.scrollTargets=[],this.intersection=null,this.resizeScroll=null,this.intersecting=!1,this.gapIntersection=null,this.gaps=[],this.printQuery=null,this.parentCheck=-1,this.dom=e.contentDOM,this.observer=new MutationObserver(n=>{for(let r of n)this.queue.push(r);(R.ie&&R.ie_version<=11||R.ios&&e.composing)&&n.some(r=>r.type=="childList"&&r.removedNodes.length||r.type=="characterData"&&r.oldValue.length>r.target.nodeValue.length)?this.flushSoon():this.flush()}),window.EditContext&&R.android&&e.constructor.EDIT_CONTEXT!==!1&&!(R.chrome&&R.chrome_version<126)&&(this.editContext=new ng(e),e.state.facet(kr)&&(e.contentDOM.editContext=this.editContext.editContext)),mx&&(this.onCharData=n=>{this.queue.push({target:n.target,type:"characterData",oldValue:n.prevValue}),this.flushSoon()}),this.onSelectionChange=this.onSelectionChange.bind(this),this.onResize=this.onResize.bind(this),this.onPrint=this.onPrint.bind(this),this.onScroll=this.onScroll.bind(this),window.matchMedia&&(this.printQuery=window.matchMedia("print")),typeof ResizeObserver=="function"&&(this.resizeScroll=new ResizeObserver(()=>{var n;((n=this.view.docView)===null||n===void 0?void 0:n.lastUpdate)<Date.now()-75&&this.onResize()}),this.resizeScroll.observe(e.scrollDOM)),this.addWindowListeners(this.win=e.win),this.start(),typeof IntersectionObserver=="function"&&(this.intersection=new IntersectionObserver(n=>{this.parentCheck<0&&(this.parentCheck=setTimeout(this.listenForScroll.bind(this),1e3)),n.length>0&&n[n.length-1].intersectionRatio>0!=this.intersecting&&(this.intersecting=!this.intersecting,this.intersecting!=this.view.inView&&this.onScrollChanged(document.createEvent("Event")))},{threshold:[0,.001]}),this.intersection.observe(this.dom),this.gapIntersection=new IntersectionObserver(n=>{n.length>0&&n[n.length-1].intersectionRatio>0&&this.onScrollChanged(document.createEvent("Event"))},{})),this.listenForScroll(),this.readSelectionRange()}onScrollChanged(e){this.view.inputState.runHandlers("scroll",e),this.intersecting&&this.view.measure()}onScroll(e){this.intersecting&&this.flush(this.pendingRecords().length>0),this.editContext&&this.view.requestMeasure(this.editContext.measureReq),this.onScrollChanged(e)}onResize(){this.resizeTimeout<0&&(this.resizeTimeout=setTimeout(()=>{this.resizeTimeout=-1,this.view.requestMeasure()},50))}onPrint(e){(e.type=="change"||!e.type)&&!e.matches||(this.view.viewState.printing=!0,this.view.measure(),setTimeout(()=>{this.view.viewState.printing=!1,this.view.requestMeasure()},500))}updateGaps(e){if(this.gapIntersection&&(e.length!=this.gaps.length||this.gaps.some((n,r)=>n!=e[r]))){this.gapIntersection.disconnect();for(let n of e)this.gapIntersection.observe(n);this.gaps=e}}onSelectionChange(e){let n=this.selectionChanged;if(!this.readSelectionRange()||this.delayedAndroidKey)return;let{view:r}=this,o=this.selectionRange;if(r.state.facet(kr)?r.root.activeElement!=this.dom:!Ds(this.dom,o))return;let a=o.anchorNode&&r.docView.tile.nearest(o.anchorNode);if(a&&a.isWidget()&&a.widget.ignoreEvent(e)){n||(this.selectionChanged=!1);return}(R.ie&&R.ie_version<=11||R.android&&R.chrome)&&!r.state.selection.main.empty&&o.focusNode&&Ms(o.focusNode,o.focusOffset,o.anchorNode,o.anchorOffset)?this.flushSoon():this.flush(!1)}readSelectionRange(){let{view:e}=this,n=zs(e.root);if(!n)return!1;let r=R.safari&&e.root.nodeType==11&&e.root.activeElement==this.dom&&XR(this.view,n)||n;if(!r||this.selectionRange.eq(r))return!1;let o=Ds(this.dom,r);return o&&!this.selectionChanged&&e.inputState.lastFocusTime>Date.now()-200&&e.inputState.lastTouchTime<Date.now()-300&&PM(this.dom,r)?(this.view.inputState.lastFocusTime=0,e.docView.updateSelection(),!1):(this.selectionRange.setRange(r),o&&(this.selectionChanged=!0),!0)}setSelectionRange(e,n){this.selectionRange.set(e.node,e.offset,n.node,n.offset),this.selectionChanged=!1}clearSelectionRange(){this.selectionRange.set(null,0,null,0)}listenForScroll(){this.parentCheck=-1;let e=0,n=null;for(let r=this.dom;r;)if(Ke(r))!n&&e<this.scrollTargets.length&&this.scrollTargets[e]==r?e++:n||(n=this.scrollTargets.slice(0,e)),n&&n.push(r),r=r.assignedSlot||r.parentNode;else if(r.nodeType==11)r=r.host;else break;if(e<this.scrollTargets.length&&!n&&(n=this.scrollTargets.slice(0,e)),n){for(let r of this.scrollTargets)r.removeEventListener("scroll",this.onScroll);for(let r of this.scrollTargets=n)r.addEventListener("scroll",this.onScroll)}}ignore(e){if(!this.active)return e();try{return this.stop(),e()}finally{this.start(),this.clear()}}start(){this.active||(this.observer.observe(this.dom,WR),mx&&this.dom.addEventListener("DOMCharacterDataModified",this.onCharData),this.active=!0)}stop(){this.active&&(this.active=!1,this.observer.disconnect(),mx&&this.dom.removeEventListener("DOMCharacterDataModified",this.onCharData))}clear(){this.processRecords(),this.queue.length=0,this.selectionChanged=!1}delayAndroidKey(e,n){var r;if(!this.delayedAndroidKey){let o=()=>{let a=this.delayedAndroidKey;a&&(this.clearDelayedAndroidKey(),this.view.inputState.lastKeyCode=a.keyCode,this.view.inputState.lastKeyTime=Date.now(),!this.flush()&&a.force&&Ni(this.dom,a.key,a.keyCode))};this.flushingAndroidKey=this.view.win.requestAnimationFrame(o)}(!this.delayedAndroidKey||e=="Enter")&&(this.delayedAndroidKey={key:e,keyCode:n,force:this.lastChange<Date.now()-50||!!(!((r=this.delayedAndroidKey)===null||r===void 0)&&r.force)})}clearDelayedAndroidKey(){this.win.cancelAnimationFrame(this.flushingAndroidKey),this.delayedAndroidKey=null,this.flushingAndroidKey=-1}flushSoon(){this.delayedFlush<0&&(this.delayedFlush=this.view.win.requestAnimationFrame(()=>{this.delayedFlush=-1,this.flush()}))}forceFlush(){this.delayedFlush>=0&&(this.view.win.cancelAnimationFrame(this.delayedFlush),this.delayedFlush=-1),this.flush()}pendingRecords(){for(let e of this.observer.takeRecords())this.queue.push(e);return this.queue}processRecords(){let e=this.pendingRecords();e.length&&(this.queue=[]);let n=-1,r=-1,o=!1;for(let a of e){let i=this.readMutation(a);i&&(i.typeOver&&(o=!0),n==-1?{from:n,to:r}=i:(n=Math.min(i.from,n),r=Math.max(i.to,r)))}return{from:n,to:r,typeOver:o}}readChange(){let{from:e,to:n,typeOver:r}=this.processRecords(),o=this.selectionChanged&&Ds(this.dom,this.selectionRange);if(e<0&&!o)return null;e>-1&&(this.lastChange=Date.now()),this.view.inputState.lastFocusTime=0,this.selectionChanged=!1;let a=new Px(this.view,e,n,r);return this.view.docView.domChanged={newSel:a.newSel?a.newSel.main:null},a}flush(e=!0){if(this.delayedFlush>=0||this.delayedAndroidKey)return!1;e&&this.readSelectionRange();let n=this.selectionChanged,r=this.readChange();if(!r)return this.view.requestMeasure(),!1;let o=this.view.state,a=uk(this.view,r);return this.view.state==o&&(r.domChanged||n)&&this.view.update([]),a}readMutation(e){let n=this.view.docView.tile.nearest(e.target);if(!n||n.isWidget())return null;if(n.markDirty(e.type=="attributes"),e.type=="childList"){let r=wS(n,e.previousSibling||e.target.previousSibling,-1),o=wS(n,e.nextSibling||e.target.nextSibling,1);return{from:r?n.posAfter(r):n.posAtStart,to:o?n.posBefore(o):n.posAtEnd,typeOver:!1}}else return e.type=="characterData"?{from:n.posAtStart,to:n.posAtEnd,typeOver:e.target.nodeValue==e.oldValue}:null}setWindow(e){e!=this.win&&(this.removeWindowListeners(this.win),this.win=e,this.addWindowListeners(this.win))}addWindowListeners(e){e.addEventListener("resize",this.onResize),this.printQuery?this.printQuery.addEventListener?this.printQuery.addEventListener("change",this.onPrint):this.printQuery.addListener(this.onPrint):e.addEventListener("beforeprint",this.onPrint),e.addEventListener("scroll",this.onScroll),e.document.addEventListener("selectionchange",this.onSelectionChange)}removeWindowListeners(e){e.removeEventListener("scroll",this.onScroll),e.removeEventListener("resize",this.onResize),this.printQuery?this.printQuery.removeEventListener?this.printQuery.removeEventListener("change",this.onPrint):this.printQuery.removeListener(this.onPrint):e.removeEventListener("beforeprint",this.onPrint),e.document.removeEventListener("selectionchange",this.onSelectionChange)}update(e){this.editContext&&(this.editContext.update(e),e.startState.facet(kr)!=e.state.facet(kr)&&(e.view.contentDOM.editContext=e.state.facet(kr)?this.editContext.editContext:null))}destroy(){var e,n,r;this.stop(),(e=this.intersection)===null||e===void 0||e.disconnect(),(n=this.gapIntersection)===null||n===void 0||n.disconnect(),(r=this.resizeScroll)===null||r===void 0||r.disconnect();for(let o of this.scrollTargets)o.removeEventListener("scroll",this.onScroll);this.removeWindowListeners(this.win),clearTimeout(this.parentCheck),clearTimeout(this.resizeTimeout),this.win.cancelAnimationFrame(this.delayedFlush),this.win.cancelAnimationFrame(this.flushingAndroidKey),this.editContext&&(this.view.contentDOM.editContext=null,this.editContext.destroy())}};ng=class{constructor(e){this.from=0,this.to=0,this.pendingContextChange=null,this.handlers=Object.create(null),this.composing=null,this.resetRange(e.state);let n=this.editContext=new window.EditContext({text:e.state.doc.sliceString(this.from,this.to),selectionStart:this.toContextPos(Math.max(this.from,Math.min(this.to,e.state.selection.main.anchor))),selectionEnd:this.toContextPos(e.state.selection.main.head)});this.handlers.textupdate=r=>{let o=e.state.selection.main,{anchor:a,head:i}=o,l=this.toEditorPos(r.updateRangeStart),s=this.toEditorPos(r.updateRangeEnd);e.inputState.composing>=0&&!this.composing&&(this.composing={contextBase:r.updateRangeStart,editorBase:l,drifted:!1});let f=s-l>r.text.length;l==this.from&&a<this.from?l=a:s==this.to&&a>this.to&&(s=a);let c=dk(e.state.sliceDoc(l,s),r.text,(f?o.from:o.to)-l,f?"end":null);if(!c){let d=O.single(this.toEditorPos(r.selectionStart),this.toEditorPos(r.selectionEnd));zx(d,o)||e.dispatch({selection:d,userEvent:"select"});return}let u={from:c.from+l,to:c.toA+l,insert:J.of(r.text.slice(c.from,c.toB).split(`
`))};if((R.mac||R.android)&&u.from==i-1&&/^\. ?$/.test(r.text)&&e.contentDOM.getAttribute("autocorrect")=="off"&&(u={from:l,to:s,insert:J.of([r.text.replace("."," ")])}),this.pendingContextChange=u,!e.state.readOnly){let d=this.to-this.from+(u.to-u.from+u.insert.length);xg(e,u,O.single(this.toEditorPos(r.selectionStart,d),this.toEditorPos(r.selectionEnd,d)))}this.pendingContextChange&&(this.revertPending(e.state),this.setSelection(e.state)),u.from<u.to&&!u.insert.length&&e.inputState.composing>=0&&!/[\\p{Alphabetic}\\p{Number}_]/.test(n.text.slice(Math.max(0,r.updateRangeStart-1),Math.min(n.text.length,r.updateRangeStart+1)))&&this.handlers.compositionend(r)},this.handlers.characterboundsupdate=r=>{let o=[],a=null;for(let i=this.toEditorPos(r.rangeStart),l=this.toEditorPos(r.rangeEnd);i<l;i++){let s=e.coordsForChar(i);a=s&&new DOMRect(s.left,s.top,s.right-s.left,s.bottom-s.top)||a||new DOMRect,o.push(a)}n.updateCharacterBounds(r.rangeStart,o)},this.handlers.textformatupdate=r=>{let o=[];for(let a of r.getTextFormats()){let i=a.underlineStyle,l=a.underlineThickness;if(!/none/i.test(i)&&!/none/i.test(l)){let s=this.toEditorPos(a.rangeStart),f=this.toEditorPos(a.rangeEnd);if(s<f){let c=`text-decoration: underline ${/^[a-z]/.test(i)?i+" ":i=="Dashed"?"dashed ":i=="Squiggle"?"wavy ":""}${/thin/i.test(l)?1:2}px`;o.push(ee.mark({attributes:{style:c}}).range(s,f))}}}e.dispatch({effects:tk.of(ee.set(o))})},this.handlers.compositionstart=()=>{e.inputState.composing<0&&(e.inputState.composing=0,e.inputState.compositionFirstChange=!0)},this.handlers.compositionend=()=>{if(e.inputState.composing=-1,e.inputState.compositionFirstChange=null,this.composing){let{drifted:r}=this.composing;this.composing=null,r&&this.reset(e.state)}};for(let r in this.handlers)n.addEventListener(r,this.handlers[r]);this.measureReq={read:r=>{let o=zs(r.root);o&&o.rangeCount&&this.editContext.updateSelectionBounds(o.getRangeAt(0).getBoundingClientRect())}}}applyEdits(e){let n=0,r=!1,o=this.pendingContextChange;return e.changes.iterChanges((a,i,l,s,f)=>{if(r)return;let c=f.length-(i-a);if(o&&i>=o.to)if(o.from==a&&o.to==i&&o.insert.eq(f)){o=this.pendingContextChange=null,n+=c,this.to+=c;return}else o=null,this.revertPending(e.state);if(a+=n,i+=n,i<=this.from)this.from+=c,this.to+=c;else if(a<this.to){if(a<this.from||i>this.to||this.to-this.from+f.length>3e4){r=!0;return}this.editContext.updateText(this.toContextPos(a),this.toContextPos(i),f.toString()),this.to+=c}n+=c}),o&&!r&&this.revertPending(e.state),!r}update(e){let n=this.pendingContextChange,r=e.startState.selection.main;this.composing&&(this.composing.drifted||!e.changes.touchesRange(r.from,r.to)&&e.transactions.some(o=>!o.isUserEvent("input.type")&&o.changes.touchesRange(this.from,this.to)))?(this.composing.drifted=!0,this.composing.editorBase=e.changes.mapPos(this.composing.editorBase)):!this.applyEdits(e)||!this.rangeIsValid(e.state)?(this.pendingContextChange=null,this.reset(e.state)):(e.docChanged||e.selectionSet||n)&&this.setSelection(e.state),(e.geometryChanged||e.docChanged||e.selectionSet)&&e.view.requestMeasure(this.measureReq)}resetRange(e){let{head:n}=e.selection.main;this.from=Math.max(0,n-1e4),this.to=Math.min(e.doc.length,n+1e4)}reset(e){this.resetRange(e),this.editContext.updateText(0,this.editContext.text.length,e.doc.sliceString(this.from,this.to)),this.setSelection(e)}revertPending(e){let n=this.pendingContextChange;this.pendingContextChange=null,this.editContext.updateText(this.toContextPos(n.from),this.toContextPos(n.from+n.insert.length),e.doc.sliceString(n.from,n.to))}setSelection(e){let{main:n}=e.selection,r=this.toContextPos(Math.max(this.from,Math.min(this.to,n.anchor))),o=this.toContextPos(n.head);(this.editContext.selectionStart!=r||this.editContext.selectionEnd!=o)&&this.editContext.updateSelection(r,o)}rangeIsValid(e){let{head:n}=e.selection.main;return!(this.from>0&&n-this.from<500||this.to<e.doc.length&&this.to-n<500||this.to-this.from>1e4*3)}toEditorPos(e,n=this.to-this.from){e=Math.min(e,n);let r=this.composing;return r&&r.drifted?r.editorBase+(e-r.contextBase):e+this.from}toContextPos(e){let n=this.composing;return n&&n.drifted?n.contextBase+(e-n.editorBase):e-this.from}destroy(){for(let e in this.handlers)this.editContext.removeEventListener(e,this.handlers[e])}},q=class t{get state(){return this.viewState.state}get viewport(){return this.viewState.viewport}get visibleRanges(){return this.viewState.visibleRanges}get inView(){return this.viewState.inView}get composing(){return!!this.inputState&&this.inputState.composing>0}get compositionStarted(){return!!this.inputState&&this.inputState.composing>=0}get root(){return this._root}get win(){return this.dom.ownerDocument.defaultView||window}constructor(e={}){var n;this.plugins=[],this.pluginMap=new Map,this.editorAttrs={},this.contentAttrs={},this.bidiCache=[],this.destroyed=!1,this.updateState=2,this.measureScheduled=-1,this.measureRequests=[],this.clearAnnouncement=-1,this.contentDOM=document.createElement("div"),this.scrollDOM=document.createElement("div"),this.scrollDOM.tabIndex=-1,this.scrollDOM.className="cm-scroller",this.scrollDOM.appendChild(this.contentDOM),this.announceDOM=document.createElement("div"),this.announceDOM.className="cm-announced",this.announceDOM.setAttribute("aria-live","polite"),this.dom=document.createElement("div"),this.dom.appendChild(this.announceDOM),this.dom.appendChild(this.scrollDOM),e.parent&&e.parent.appendChild(this.dom);let{dispatch:r}=e;this.dispatchTransactions=e.dispatchTransactions||r&&(o=>o.forEach(a=>r(a,this)))||(o=>this.update(o)),this.dispatch=this.dispatch.bind(this),this._root=e.root||qM(e.parent)||document,this.viewState=new zu(this,e.state||Te.create(e)),e.scrollTo&&e.scrollTo.is(bu)&&(this.viewState.scrollTarget=e.scrollTo.value.clip(this.viewState.state)),this.plugins=this.state.facet(Ri).map(o=>new Es(o));for(let o of this.plugins)o.update(this);this.observer=new tg(this),this.inputState=new Hx(this),this.inputState.ensureHandlers(this.plugins),this.docView=new Nu(this),this.mountStyles(),this.updateAttrs(),this.updateState=0,this.requestMeasure(),!((n=document.fonts)===null||n===void 0)&&n.ready&&document.fonts.ready.then(()=>{this.viewState.mustMeasureContent="refresh",this.requestMeasure()})}dispatch(...e){let n=e.length==1&&e[0]instanceof Ve?e:e.length==1&&Array.isArray(e[0])?e[0]:[this.state.update(...e)];this.dispatchTransactions(n,this)}update(e){if(this.updateState!=0)throw new Error("Calls to EditorView.update are not allowed while an update is in progress");let n=!1,r=!1,o,a=this.state;for(let d of e){if(d.startState!=a)throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");a=d.state}if(this.destroyed){this.viewState.state=a;return}let i=this.hasFocus,l=0,s=null;e.some(d=>d.annotation(yk))?(this.inputState.notifiedFocused=i,l=1):i!=this.inputState.notifiedFocused&&(this.inputState.notifiedFocused=i,s=bk(a,i),s||(l=1));let f=this.observer.delayedAndroidKey,c=null;if(f?(this.observer.clearDelayedAndroidKey(),c=this.observer.readChange(),(c&&!this.state.doc.eq(a.doc)||!this.state.selection.eq(a.selection))&&(c=null)):this.observer.clear(),a.facet(Te.phrases)!=this.state.facet(Te.phrases))return this.setState(a);o=Fu.create(this,a,e),o.flags|=l;let u=this.viewState.scrollTarget;try{this.updateState=2;for(let d of e){if(u&&(u=u.map(d.changes)),d.scrollIntoView){let{main:p}=d.state.selection,{x:m,y:x}=this.state.facet(t.cursorScrollMargin);u=new Rs(p.empty?p:O.cursor(p.head,p.head>p.anchor?-1:1),"nearest","nearest",x,m)}for(let p of d.effects)p.is(bu)&&(u=p.value.clip(this.state))}this.viewState.update(o,u),this.bidiCache=Hu.update(this.bidiCache,o.changes),o.empty||(this.updatePlugins(o),this.inputState.update(o)),n=this.docView.update(o),this.state.facet(Os)!=this.styleModules&&this.mountStyles(),r=this.updateAttrs(),this.showAnnouncements(e),this.docView.updateSelection(n,e.some(d=>d.isUserEvent("select.pointer")))}finally{this.updateState=0}if(o.startState.facet(ku)!=o.state.facet(ku)&&(this.viewState.mustMeasureContent=!0),(n||r||u||this.viewState.mustEnforceCursorAssoc||this.viewState.mustMeasureContent)&&this.requestMeasure(),n&&this.docViewUpdate(),!o.empty)for(let d of this.state.facet(Tx))try{d(o)}catch(p){yt(this.state,p,"update listener")}(s||c)&&Promise.resolve().then(()=>{s&&this.state==s.startState&&this.dispatch(s),c&&!uk(this,c)&&f.force&&Ni(this.contentDOM,f.key,f.keyCode)})}setState(e){if(this.updateState!=0)throw new Error("Calls to EditorView.setState are not allowed while an update is in progress");if(this.destroyed){this.viewState.state=e;return}this.updateState=2;let n=this.hasFocus;try{for(let r of this.plugins)r.destroy(this);this.viewState=new zu(this,e),this.plugins=e.facet(Ri).map(r=>new Es(r)),this.pluginMap.clear();for(let r of this.plugins)r.update(this);this.docView.destroy(),this.docView=new Nu(this),this.inputState.ensureHandlers(this.plugins),this.mountStyles(),this.updateAttrs(),this.bidiCache=[]}finally{this.updateState=0}n&&this.focus(),this.requestMeasure()}updatePlugins(e){let n=e.startState.facet(Ri),r=e.state.facet(Ri);if(n!=r){let o=[];for(let a of r){let i=n.indexOf(a);if(i<0)o.push(new Es(a));else{let l=this.plugins[i];l.mustUpdate=e,o.push(l)}}for(let a of this.plugins)a.mustUpdate!=e&&a.destroy(this);this.plugins=o,this.pluginMap.clear()}else for(let o of this.plugins)o.mustUpdate=e;for(let o=0;o<this.plugins.length;o++)this.plugins[o].update(this);n!=r&&this.inputState.ensureHandlers(this.plugins)}docViewUpdate(){for(let e of this.plugins){let n=e.value;if(n&&n.docViewUpdate)try{n.docViewUpdate(this)}catch(r){yt(this.state,r,"doc view update listener")}}}measure(e=!0){if(this.destroyed)return;if(this.measureScheduled>-1&&this.win.cancelAnimationFrame(this.measureScheduled),this.observer.delayedAndroidKey){this.measureScheduled=-1,this.requestMeasure();return}this.measureScheduled=0,e&&this.observer.forceFlush();let n=null,r=this.viewState.scrollParent,o=this.viewState.getScrollOffset(),{scrollAnchorPos:a,scrollAnchorHeight:i,scaleY:l}=this.viewState;Math.abs(o-this.viewState.scrollOffset)>1&&(i=-1),this.viewState.scrollAnchorHeight=-1;try{for(let s=0;;s++){if(i<0){if(PS(r||this.win))a=-1,i=this.viewState.heightMap.height/this.viewState.scaleY;else{let m=this.viewState.scrollAnchorAt(o);a=m.from,i=m.top}l=this.viewState.scaleY}this.updateState=1;let f=this.viewState.measure();if(!f&&!this.measureRequests.length&&this.viewState.scrollTarget==null)break;if(s>5){console.warn(this.measureRequests.length?"Measure loop restarted more than 5 times":"Viewport failed to stabilize");break}let c=[];f&4||([this.measureRequests,c]=[c,this.measureRequests]);let u=c.map(m=>{try{return m.read(this)}catch(x){return yt(this.state,x),kS}}),d=Fu.create(this,this.state,[]),p=!1;d.flags|=f,n?n.flags|=f:n=d,this.updateState=2,d.empty||(this.updatePlugins(d),this.inputState.update(d),this.updateAttrs(),p=this.docView.update(d),p&&this.docViewUpdate());for(let m=0;m<c.length;m++)if(u[m]!=kS)try{let x=c[m];x.write&&x.write(u[m],this)}catch(x){yt(this.state,x)}if(p&&this.docView.updateSelection(!0),!d.viewportChanged&&this.measureRequests.length==0){if(this.viewState.editorHeight)if(this.viewState.scrollTarget){this.docView.scrollIntoView(this.viewState.scrollTarget),this.viewState.scrollTarget=null,i=-1;continue}else{let x=(a<0?this.viewState.heightMap.height:this.viewState.lineBlockAt(a).top)/this.viewState.scaleY-i/l;if((x>1||x<-1)&&!(R.ios&&this.inputState.lastIOSMomentumScroll>Date.now()-100)&&(r==this.scrollDOM||this.hasFocus||Math.max(this.inputState.lastWheelEvent,this.inputState.lastTouchTime)>Date.now()-100)){o=o+x,r?a<0?r.scrollTop=r.scrollHeight:r.scrollTop+=x:this.win.scrollBy(0,x),i=-1;continue}}break}}}finally{this.updateState=0,this.measureScheduled=-1}if(n&&!n.empty)for(let s of this.state.facet(Tx))s(n)}get themeClasses(){return $x+" "+(this.state.facet(Zx)?wk:vk)+" "+this.state.facet(ku)}updateAttrs(){let e=CS(this,nk,{class:"cm-editor"+(this.hasFocus?" cm-focused ":" ")+this.themeClasses}),n={spellcheck:"false",autocorrect:"off",autocapitalize:"off",writingsuggestions:"false",translate:"no",contenteditable:this.state.facet(kr)?"true":"false",class:"cm-content",style:`${R.tabSize}: ${this.state.tabSize}`,role:"textbox","aria-multiline":"true"};this.state.readOnly&&(n["aria-readonly"]="true"),CS(this,pg,n);let r=this.observer.ignore(()=>{let o=oS(this.contentDOM,this.contentAttrs,n),a=oS(this.dom,this.editorAttrs,e);return o||a});return this.editorAttrs=e,this.contentAttrs=n,r}showAnnouncements(e){let n=!0;for(let r of e)for(let o of r.effects)if(o.is(t.announce)){n&&(this.announceDOM.textContent="",this.win.clearTimeout(this.clearAnnouncement),this.clearAnnouncement=this.win.setTimeout(()=>{this.announceDOM.textContent="\xA0"},200),n=!1);let a=this.announceDOM.appendChild(document.createElement("div"));a.textContent=o.value}}mountStyles(){this.styleModules=this.state.facet(Os);let e=this.state.facet(t.cspNonce);dn.mount(this.root,this.styleModules.concat(GR).reverse(),e?{nonce:e}:void 0)}readMeasured(){if(this.updateState==2)throw new Error("Reading the editor layout isn't allowed during an update");this.updateState==0&&this.measureScheduled>-1&&this.measure(!1)}requestMeasure(e){if(this.measureScheduled<0&&(this.measureScheduled=this.win.requestAnimationFrame(()=>this.measure())),e){if(this.measureRequests.indexOf(e)>-1)return;if(e.key!=null){for(let n=0;n<this.measureRequests.length;n++)if(this.measureRequests[n].key===e.key){this.measureRequests[n]=e;return}}this.measureRequests.push(e)}}plugin(e){let n=this.pluginMap.get(e);return(n===void 0||n&&n.plugin!=e)&&this.pluginMap.set(e,n=this.plugins.find(r=>r.plugin==e)||null),n&&n.update(this).value}get documentTop(){return this.contentDOM.getBoundingClientRect().top+this.viewState.paddingTop}get documentPadding(){return{top:this.viewState.paddingTop,bottom:this.viewState.paddingBottom}}get scaleX(){return this.viewState.scaleX}get scaleY(){return this.viewState.scaleY}elementAtHeight(e){return this.readMeasured(),this.viewState.elementAtHeight(e)}lineBlockAtHeight(e){return this.readMeasured(),this.viewState.lineBlockAtHeight(e)}get viewportLineBlocks(){return this.viewState.viewportLines}lineBlockAt(e){return this.viewState.lineBlockAt(e)}get contentHeight(){return this.viewState.contentHeight}moveByChar(e,n,r){return px(this,e,cS(this,e,n,r))}moveByGroup(e,n){return px(this,e,cS(this,e,n,r=>hR(this,e.head,r)))}visualLineSide(e,n){return n?O.cursor(e.to,1):O.cursor(e.from,-1)}moveToLineBoundary(e,n,r=!0){return mR(this,e,n,r)}moveVertically(e,n,r){return px(this,e,xR(this,e,n,r))}domAtPos(e,n=1){return this.docView.domAtPos(e,n)}posAtDOM(e,n=0){return this.docView.posFromDOM(e,n)}posAtCoords(e,n=!0){this.readMeasured();let r=Nx(this,e,n);return r&&r.pos}posAndSideAtCoords(e,n=!0){return this.readMeasured(),Nx(this,e,n)}coordsAtPos(e,n=1){this.readMeasured();let r=this.state.doc.lineAt(e),o=this.bidiSpans(r),a=o[hn.find(o,e-r.from,-1,n)];return r.length&&(e==r.from&&n<0||e==r.to&&n>0)&&a.dir!=this.textDirectionAt(r.from)&&(e==r.to?(e=r.from+a.from,n=1):(e=r.from+a.to,n=-1)),this.docView.coordsAt(e,n,a.dir==pe.RTL)}coordsForChar(e){return this.readMeasured(),this.docView.coordsForChar(e)}get defaultCharacterWidth(){return this.viewState.heightOracle.charWidth}get defaultLineHeight(){return this.viewState.heightOracle.lineHeight}get textDirection(){return this.viewState.defaultTextDirection}textDirectionAt(e){return!this.state.facet($S)||e<this.viewport.from||e>this.viewport.to?this.textDirection:(this.readMeasured(),this.docView.textDirectionAt(e))}get lineWrapping(){return this.viewState.heightOracle.lineWrapping}bidiSpans(e){if(e.length>QR)return GS(e.length);let n=this.textDirectionAt(e.from),r;for(let a of this.bidiCache)if(a.from==e.from&&a.dir==n&&(a.fresh||VS(a.isolates,r=lS(this,e))))return a.order;r||(r=lS(this,e));let o=WM(e.text,n,r);return this.bidiCache.push(new Hu(e.from,e.to,n,r,!0,o)),o}get hasFocus(){var e;return(this.dom.ownerDocument.hasFocus()||R.safari&&((e=this.inputState)===null||e===void 0?void 0:e.lastContextMenu)>Date.now()-3e4)&&this.root.activeElement==this.contentDOM}focus(){this.observer.ignore(()=>{qS(this.contentDOM),this.docView.updateSelection()})}setRoot(e){this._root!=e&&(this._root=e,this.observer.setWindow((e.nodeType==9?e:e.ownerDocument).defaultView||window),this.mountStyles())}destroy(){this.root.activeElement==this.contentDOM&&this.contentDOM.blur();for(let e of this.plugins)e.destroy(this);this.plugins=[],this.inputState.destroy(),this.docView.destroy(),this.dom.remove(),this.observer.destroy(),this.win.clearTimeout(this.clearAnnouncement),this.measureScheduled>-1&&this.win.cancelAnimationFrame(this.measureScheduled),this.destroyed=!0}static scrollIntoView(e,n={}){var r,o,a,i;return bu.of(new Rs(typeof e=="number"?O.cursor(e):e,(r=n.y)!==null&&r!==void 0?r:"nearest",(o=n.x)!==null&&o!==void 0?o:"nearest",(a=n.yMargin)!==null&&a!==void 0?a:5,(i=n.xMargin)!==null&&i!==void 0?i:5))}scrollSnapshot(){let{scrollTop:e,scrollLeft:n}=this.scrollDOM,r=this.viewState.scrollAnchorAt(e);return bu.of(new Rs(O.cursor(r.from),"start","start",r.top-e,n,!0))}setTabFocusMode(e){e==null?this.inputState.tabFocusMode=this.inputState.tabFocusMode<0?0:-1:typeof e=="boolean"?this.inputState.tabFocusMode=e?0:-1:this.inputState.tabFocusMode!=0&&(this.inputState.tabFocusMode=Date.now()+e)}static domEventHandlers(e){return Xt.define(()=>({}),{eventHandlers:e})}static domEventObservers(e){return Xt.define(()=>({}),{eventObservers:e})}static theme(e,n){let r=dn.newName(),o=[ku.of(r),Os.of(eg(`.${r}`,e))];return n&&n.dark&&o.push(Zx.of(!0)),o}static baseTheme(e){return kn.lowest(Os.of(eg("."+$x,e,Sk)))}static findFromDOM(e){var n;let r=e.querySelector(".cm-content"),o=r&&Oe.get(r)||Oe.get(e);return((n=o?.root)===null||n===void 0?void 0:n.view)||null}};q.styleModule=Os;q.inputHandler=JS;q.clipboardInputFilter=ug;q.clipboardOutputFilter=dg;q.scrollHandler=ek;q.focusChangeEffect=ZS;q.perLineTextDirection=$S;q.exceptionSink=YS;q.updateListener=Tx;q.editable=kr;q.mouseSelectionStyle=KS;q.dragMovesSelection=QS;q.clickAddsSelectionRange=XS;q.decorations=Gu;q.blockWrappers=rk;q.outerDecorations=mg;q.atomicRanges=Us;q.bidiIsolatedRanges=ok;q.cursorScrollMargin=N.define({combine:t=>{let e=5,n=5;for(let r of t)typeof r=="number"?e=n=r:{x:e,y:n}=r;return{x:e,y:n}}});q.scrollMargins=ik;q.darkTheme=Zx;q.cspNonce=N.define({combine:t=>t.length?t[0]:""});q.contentAttributes=pg;q.editorAttributes=nk;q.lineWrapping=q.contentAttributes.of({class:"cm-lineWrapping"});q.announce=oe.define();QR=4096,kS={},Hu=class t{constructor(e,n,r,o,a,i){this.from=e,this.to=n,this.dir=r,this.isolates=o,this.fresh=a,this.order=i}static update(e,n){if(n.empty&&!e.some(a=>a.fresh))return e;let r=[],o=e.length?e[e.length-1].dir:pe.LTR;for(let a=Math.max(0,e.length-10);a<e.length;a++){let i=e[a];i.dir==o&&!n.touchesRange(i.from,i.to)&&r.push(new t(n.mapPos(i.from,1),n.mapPos(i.to,-1),i.dir,i.isolates,!1,i.order))}return r}};KR=R.mac?"mac":R.windows?"win":R.linux?"linux":"key";JR=kn.default(q.domEventHandlers({keydown(t,e){return tE(ZR(e.state),t,e,"editor")}})),Vi=N.define({enables:JR}),AS=new WeakMap;po=null,$R=4e3;rg=null;TS=!R.ios,nE=R.gecko&&R.gecko_version==153?"#ffffff01":"transparent",U6=kn.highest(q.theme({".cm-line":{...TS?{"& ::selection, &::selection":{backgroundColor:`${nE} !important`}}:{},caretColor:"transparent !important"},".cm-content":{caretColor:"transparent !important","& :focus":{caretColor:"initial !important",...TS?{"&::selection, & ::selection":{backgroundColor:"Highlight !important"}}:{}}}})),j6=/x/.unicode!=null?"gu":"g";rE=ee.line({class:"cm-activeLine"}),oE=Xt.fromClass(class{constructor(t){this.decorations=this.getDeco(t)}update(t){(t.docChanged||t.selectionSet)&&(this.decorations=this.getDeco(t.view))}getDeco(t){let e=-1,n=[];for(let r of t.state.selection.ranges){let o=t.lineBlockAt(r.head);o.from>e&&(n.push(rE.range(o.from)),e=o.from)}return ee.set(n)}},{decorations:t=>t.decorations}),Au="-10000px",og=class{constructor(e,n,r,o){this.facet=n,this.createTooltipView=r,this.removeTooltipView=o,this.input=e.state.facet(n),this.tooltips=this.input.filter(i=>i);let a=null;this.tooltipViews=this.tooltips.map(i=>a=r(i,a))}update(e,n){var r;let o=e.state.facet(this.facet),a=o.filter(s=>s);if(o===this.input){for(let s of this.tooltipViews)s.update&&s.update(e);return!1}let i=[],l=n?[]:null;for(let s=0;s<a.length;s++){let f=a[s],c=-1;if(f){for(let u=0;u<this.tooltips.length;u++){let d=this.tooltips[u];d&&d.create==f.create&&(c=u)}if(c<0)i[s]=this.createTooltipView(f,s?i[s-1]:null),l&&(l[s]=!!f.above);else{let u=i[s]=this.tooltipViews[c];l&&(l[s]=n[c]),u.update&&u.update(e)}}}for(let s of this.tooltipViews)i.indexOf(s)<0&&(this.removeTooltipView(s),(r=s.destroy)===null||r===void 0||r.call(s));return n&&(l.forEach((s,f)=>n[f]=s),n.length=l.length),this.input=o,this.tooltips=a,this.tooltipViews=i,!0}};hx=N.define({combine:t=>{var e,n,r;return{position:R.ios?"absolute":((e=t.find(o=>o.position))===null||e===void 0?void 0:e.position)||"fixed",parent:((n=t.find(o=>o.parent))===null||n===void 0?void 0:n.parent)||null,tooltipSpace:((r=t.find(o=>o.tooltipSpace))===null||r===void 0?void 0:r.tooltipSpace)||aE}}}),OS=new WeakMap,Ak=Xt.fromClass(class{constructor(t){this.view=t,this.above=[],this.inView=!0,this.madeAbsolute=!1,this.lastTransaction=0,this.measureTimeout=-1;let e=t.state.facet(hx);this.position=e.position,this.parent=e.parent,this.classes=t.themeClasses,this.createContainer(),this.measureReq={read:this.readMeasure.bind(this),write:this.writeMeasure.bind(this),key:this},this.resizeObserver=typeof ResizeObserver=="function"?new ResizeObserver(()=>this.measureSoon()):null,this.manager=new og(t,gg,(n,r)=>this.createTooltip(n,r),n=>{this.resizeObserver&&this.resizeObserver.unobserve(n.dom),n.dom.remove()}),this.above=this.manager.tooltips.map(n=>!!n.above),this.intersectionObserver=typeof IntersectionObserver=="function"?new IntersectionObserver(n=>{Date.now()>this.lastTransaction-50&&n.length>0&&n[n.length-1].intersectionRatio<1&&this.measureSoon()},{threshold:[1]}):null,this.observeIntersection(),t.win.addEventListener("resize",this.measureSoon=this.measureSoon.bind(this)),this.maybeMeasure()}createContainer(){this.parent?(this.container=document.createElement("div"),this.container.style.position="relative",this.container.className=this.view.themeClasses,this.parent.appendChild(this.container)):this.container=this.view.dom}observeIntersection(){if(this.intersectionObserver){this.intersectionObserver.disconnect();for(let t of this.manager.tooltipViews)this.intersectionObserver.observe(t.dom)}}measureSoon(){this.measureTimeout<0&&(this.measureTimeout=setTimeout(()=>{this.measureTimeout=-1,this.maybeMeasure()},50))}update(t){t.transactions.length&&(this.lastTransaction=Date.now());let e=this.manager.update(t,this.above);e&&this.observeIntersection();let n=e||t.geometryChanged,r=t.state.facet(hx);if(r.position!=this.position&&!this.madeAbsolute){this.position=r.position;for(let o of this.manager.tooltipViews)o.dom.style.position=this.position;n=!0}if(r.parent!=this.parent){this.parent&&this.container.remove(),this.parent=r.parent,this.createContainer();for(let o of this.manager.tooltipViews)this.container.appendChild(o.dom);n=!0}else this.parent&&this.view.themeClasses!=this.classes&&(this.classes=this.container.className=this.view.themeClasses);n&&this.maybeMeasure()}createTooltip(t,e){let n=t.create(this.view),r=e?e.dom:null;if(n.dom.classList.add("cm-tooltip"),t.arrow&&!n.dom.querySelector(".cm-tooltip > .cm-tooltip-arrow")){let o=document.createElement("div");o.className="cm-tooltip-arrow",n.dom.appendChild(o)}return n.dom.style.position=this.position,n.dom.style.top=Au,n.dom.style.left="0px",this.container.insertBefore(n.dom,r),n.mount&&n.mount(this.view),this.resizeObserver&&this.resizeObserver.observe(n.dom),n}destroy(){var t,e,n;this.view.win.removeEventListener("resize",this.measureSoon);for(let r of this.manager.tooltipViews)r.dom.remove(),(t=r.destroy)===null||t===void 0||t.call(r);this.parent&&this.container.remove(),(e=this.resizeObserver)===null||e===void 0||e.disconnect(),(n=this.intersectionObserver)===null||n===void 0||n.disconnect(),clearTimeout(this.measureTimeout)}readMeasure(){let t=1,e=1,n=!1,r=0;if(this.position=="fixed"&&this.manager.tooltipViews.length){let{dom:i}=this.manager.tooltipViews[0];if(R.safari){let l=i.getBoundingClientRect();n=Math.abs(l.top+1e4)>1||Math.abs(l.left)>1}else n=!!i.offsetParent&&i.offsetParent!=this.container.ownerDocument.body}if(n||this.position=="absolute")if(this.parent){let i=this.parent.getBoundingClientRect();i.width&&i.height&&(t=i.width/this.parent.offsetWidth,e=i.height/this.parent.offsetHeight)}else({scaleX:t,scaleY:e}=this.view.viewState);else r=Ck(this.view).left;let o=this.view.scrollDOM.getBoundingClientRect(),a=hg(this.view);return{visible:{left:o.left+a.left,top:o.top+a.top,right:o.right-a.right,bottom:o.bottom-a.bottom},parent:this.parent?this.container.getBoundingClientRect():this.view.dom.getBoundingClientRect(),pos:this.manager.tooltips.map((i,l)=>{let s=this.manager.tooltipViews[l];return s.getCoords?s.getCoords(i.pos):this.view.coordsAtPos(i.pos)}),size:this.manager.tooltipViews.map(({dom:i})=>i.getBoundingClientRect()),space:this.view.state.facet(hx).tooltipSpace(this.view),scaleX:t,scaleY:e,makeAbsolute:n,fixedLeft:r}}writeMeasure(t){var e;if(t.makeAbsolute){this.madeAbsolute=!0,this.position="absolute";for(let l of this.manager.tooltipViews)l.dom.style.position="absolute"}let{visible:n,space:r,scaleX:o,scaleY:a}=t,i=[];for(let l=0;l<this.manager.tooltips.length;l++){let s=this.manager.tooltips[l],f=this.manager.tooltipViews[l],{dom:c}=f,u=t.pos[l],d=t.size[l];if(!u||s.clip!==!1&&(u.bottom<=Math.max(n.top,r.top)||u.top>=Math.min(n.bottom,r.bottom)||u.right<Math.max(n.left,r.left)-.1||u.left>Math.min(n.right,r.right)+.1)){c.style.top=Au;continue}let p=s.arrow?f.dom.querySelector(".cm-tooltip-arrow"):null,m=p?7:0,x=d.right-d.left,b=(e=OS.get(f))!==null&&e!==void 0?e:d.bottom-d.top,h=f.offset||lE,y=this.view.textDirection==pe.LTR,g=d.width>r.right-r.left?y?r.left:r.right-d.width:y?Math.max(r.left,Math.min(u.left-(p?14:0)+h.x,r.right-x)):Math.min(Math.max(r.left,u.left-x+(p?14:0)-h.x),r.right-x),I=this.above[l];!s.strictSide&&(I?u.top-b-m-h.y<r.top:u.bottom+b+m+h.y>r.bottom)&&I==r.bottom-u.bottom>u.top-r.top&&(I=this.above[l]=!I);let v=(I?u.top-r.top:r.bottom-u.bottom)-m;if(v<b&&f.resize!==!1){if(v<this.view.defaultLineHeight){c.style.top=Au;continue}OS.set(f,b),c.style.height=(b=v)/a+"px"}else c.style.height&&(c.style.height="");let S=I?u.top-b-m-h.y:u.bottom+m+h.y,w=g+x;if(f.overlap!==!0)for(let k of i)k.left<w&&k.right>g&&k.top<S+b&&k.bottom>S&&(S=I?k.top-b-2-m:k.bottom+m+2);if(this.position=="absolute"?(c.style.top=(S-t.parent.top)/a+"px",BS(c,(g-t.parent.left)/o)):(c.style.top=S/a+"px",BS(c,(g-t.fixedLeft)/o)),p){let k=u.left+(y?h.x:-h.x)-(g+14-7);p.style.left=k/o+"px"}f.overlap!==!0&&i.push({left:g,top:S,right:w,bottom:S+b}),c.classList.toggle("cm-tooltip-above",I),c.classList.toggle("cm-tooltip-below",!I),f.positioned&&f.positioned(t.space)}}maybeMeasure(){if(this.manager.tooltips.length&&(this.view.inView&&this.view.requestMeasure(this.measureReq),this.inView!=this.view.inView&&(this.inView=this.view.inView,!this.inView)))for(let t of this.manager.tooltipViews)t.dom.style.top=Au}},{eventObservers:{scroll(){this.maybeMeasure()}}});iE=q.baseTheme({".cm-tooltip":{zIndex:500,boxSizing:"border-box"},"&light .cm-tooltip":{border:"1px solid #bbb",backgroundColor:"#f5f5f5"},"&light .cm-tooltip-section:not(:first-child)":{borderTop:"1px solid #bbb"},"&dark .cm-tooltip":{backgroundColor:"#333338",color:"white"},".cm-tooltip-arrow":{height:"7px",width:"14px",position:"absolute",zIndex:-1,overflow:"hidden","&:before, &:after":{content:"''",position:"absolute",width:0,height:0,borderLeft:"7px solid transparent",borderRight:"7px solid transparent"},".cm-tooltip-above &":{bottom:"-7px","&:before":{borderTop:"7px solid #bbb"},"&:after":{borderTop:"7px solid #f5f5f5",bottom:"1px"}},".cm-tooltip-below &":{top:"-7px","&:before":{borderBottom:"7px solid #bbb"},"&:after":{borderBottom:"7px solid #f5f5f5",top:"1px"}}},"&dark .cm-tooltip .cm-tooltip-arrow":{"&:before":{borderTopColor:"#333338",borderBottomColor:"#333338"},"&:after":{borderTopColor:"transparent",borderBottomColor:"transparent"}}}),lE={x:0,y:0},gg=N.define({enables:[Ak,iE]});Qn=class extends un{compare(e){return this==e||this.constructor==e.constructor&&this.eq(e)}eq(e){return!1}destroy(e){}};Qn.prototype.elementClass="";Qn.prototype.toDOM=void 0;Qn.prototype.mapMode=mt.TrackBefore;Qn.prototype.startSide=Qn.prototype.endSide=-1;Qn.prototype.point=!0;xx=N.define(),sE=N.define(),Bu=N.define(),ag=N.define({combine:t=>t.some(e=>e)});cE=Xt.fromClass(class{constructor(t){this.view=t,this.domAfter=null,this.prevViewport=t.viewport,this.dom=document.createElement("div"),this.dom.className="cm-gutters cm-gutters-before",this.dom.setAttribute("aria-hidden","true"),this.dom.style.minHeight=this.view.contentHeight/this.view.scaleY+"px",this.gutters=t.state.facet(Bu).map(e=>new Uu(t,e)),this.fixed=!t.state.facet(ag);for(let e of this.gutters)e.config.side=="after"?this.getDOMAfter().appendChild(e.dom):this.dom.appendChild(e.dom);this.fixed&&(this.dom.style.position="sticky"),this.syncGutters(!1),t.scrollDOM.insertBefore(this.dom,t.contentDOM)}getDOMAfter(){return this.domAfter||(this.domAfter=document.createElement("div"),this.domAfter.className="cm-gutters cm-gutters-after",this.domAfter.setAttribute("aria-hidden","true"),this.domAfter.style.minHeight=this.view.contentHeight/this.view.scaleY+"px",this.domAfter.style.position=this.fixed?"sticky":"",this.view.scrollDOM.appendChild(this.domAfter)),this.domAfter}update(t){if(this.updateGutters(t)){let e=this.prevViewport,n=t.view.viewport,r=Math.min(e.to,n.to)-Math.max(e.from,n.from);this.syncGutters(r<(n.to-n.from)*.8)}if(t.geometryChanged){let e=this.view.contentHeight/this.view.scaleY+"px";this.dom.style.minHeight=e,this.domAfter&&(this.domAfter.style.minHeight=e)}this.view.state.facet(ag)!=!this.fixed&&(this.fixed=!this.fixed,this.dom.style.position=this.fixed?"sticky":"",this.domAfter&&(this.domAfter.style.position=this.fixed?"sticky":"")),this.prevViewport=t.view.viewport}syncGutters(t){let e=this.dom.nextSibling;t&&(this.dom.remove(),this.domAfter&&this.domAfter.remove());let n=le.iter(this.view.state.facet(xx),this.view.viewport.from),r=[],o=this.gutters.map(a=>new lg(a,this.view.viewport,-this.view.documentPadding.top));for(let a of this.view.viewportLineBlocks)if(r.length&&(r=[]),Array.isArray(a.type)){let i=!0;for(let l of a.type)if(l.type==Dt.Text&&i){ig(n,r,l.from);for(let s of o)s.line(this.view,l,r);i=!1}else if(l.widget)for(let s of o)s.widget(this.view,l)}else if(a.type==Dt.Text){ig(n,r,a.from);for(let i of o)i.line(this.view,a,r)}else if(a.widget)for(let i of o)i.widget(this.view,a);for(let a of o)a.finish();t&&(this.view.scrollDOM.insertBefore(this.dom,e),this.domAfter&&this.view.scrollDOM.appendChild(this.domAfter))}updateGutters(t){let e=t.startState.facet(Bu),n=t.state.facet(Bu),r=t.docChanged||t.heightChanged||t.viewportChanged||!le.eq(t.startState.facet(xx),t.state.facet(xx),t.view.viewport.from,t.view.viewport.to);if(e==n)for(let o of this.gutters)o.update(t)&&(r=!0);else{r=!0;let o=[];for(let a of n){let i=e.indexOf(a);i<0?o.push(new Uu(this.view,a)):(this.gutters[i].update(t),o.push(this.gutters[i]))}for(let a of this.gutters)a.dom.remove(),o.indexOf(a)<0&&a.destroy();for(let a of o)a.config.side=="after"?this.getDOMAfter().appendChild(a.dom):this.dom.appendChild(a.dom);this.gutters=o}return r}destroy(){for(let t of this.gutters)t.destroy();this.dom.remove(),this.domAfter&&this.domAfter.remove()}},{provide:t=>q.scrollMargins.of(e=>{let n=e.plugin(t);if(!n||n.gutters.length==0||!n.fixed)return null;let r=n.dom.offsetWidth*e.scaleX,o=n.domAfter?n.domAfter.offsetWidth*e.scaleX:0;return e.textDirection==pe.LTR?{left:r,right:o}:{right:r,left:o}})});lg=class{constructor(e,n,r){this.gutter=e,this.height=r,this.i=0,this.cursor=le.iter(e.markers,n.from)}addElement(e,n,r){let{gutter:o}=this,a=(n.top-this.height)/e.scaleY,i=n.height/e.scaleY;if(this.i==o.elements.length){let l=new ju(e,i,a,r);o.elements.push(l),o.dom.appendChild(l.dom)}else o.elements[this.i].update(e,i,a,r);this.height=n.bottom,this.i++}line(e,n,r){let o=[];ig(this.cursor,o,n.from),r.length&&(o=o.concat(r));let a=this.gutter.config.lineMarker(e,n,o);a&&o.unshift(a);let i=this.gutter;o.length==0&&!i.config.renderEmptyElements||this.addElement(e,n,o)}widget(e,n){let r=this.gutter.config.widgetMarker(e,n.widget,n),o=r?[r]:null;for(let a of e.state.facet(sE)){let i=a(e,n.widget,n);i&&(o||(o=[])).push(i)}o&&this.addElement(e,n,o)}finish(){let e=this.gutter;for(;e.elements.length>this.i;){let n=e.elements.pop();e.dom.removeChild(n.dom),n.destroy()}}},Uu=class{constructor(e,n){this.view=e,this.config=n,this.elements=[],this.spacer=null,this.dom=document.createElement("div"),this.dom.className="cm-gutter"+(this.config.class?" "+this.config.class:"");for(let r in n.domEventHandlers)this.dom.addEventListener(r,o=>{let a=o.target,i;if(a!=this.dom&&this.dom.contains(a)){for(;a.parentNode!=this.dom;)a=a.parentNode;let s=a.getBoundingClientRect();i=(s.top+s.bottom)/2}else i=o.clientY;let l=e.lineBlockAtHeight(i-e.documentTop);n.domEventHandlers[r](e,l,o)&&o.preventDefault()});this.markers=DS(n.markers(e)),n.initialSpacer&&(this.spacer=new ju(e,0,0,[n.initialSpacer(e)]),this.dom.appendChild(this.spacer.dom),this.spacer.dom.style.cssText+="visibility: hidden; pointer-events: none")}update(e){let n=this.markers;if(this.markers=DS(this.config.markers(e.view)),this.spacer&&this.config.updateSpacer){let o=this.config.updateSpacer(this.spacer.markers[0],e);o!=this.spacer.markers[0]&&this.spacer.update(e.view,0,0,[o])}let r=e.view.viewport;return!le.eq(this.markers,n,r.from,r.to)||(this.config.lineMarkerChange?this.config.lineMarkerChange(e):!1)}destroy(){for(let e of this.elements)e.destroy()}},ju=class{constructor(e,n,r,o){this.height=-1,this.above=0,this.markers=[],this.dom=document.createElement("div"),this.dom.className="cm-gutterElement",this.update(e,n,r,o)}update(e,n,r,o){this.height!=n&&(this.height=n,this.dom.style.height=n+"px"),this.above!=r&&(this.dom.style.marginTop=(this.above=r)?r+"px":""),uE(this.markers,o)||this.setMarkers(e,o)}setMarkers(e,n){let r="cm-gutterElement",o=this.dom.firstChild;for(let a=0,i=0;;){let l=i,s=a<n.length?n[a++]:null,f=!1;if(s){let c=s.elementClass;c&&(r+=" "+c);for(let u=i;u<this.markers.length;u++)if(this.markers[u].compare(s)){l=u,f=!0;break}}else l=this.markers.length;for(;i<l;){let c=this.markers[i++];if(c.toDOM){c.destroy(o);let u=o.nextSibling;o.remove(),o=u}}if(!s)break;s.toDOM&&(f?o=o.nextSibling:this.dom.insertBefore(s.toDOM(e),o)),f&&i++}this.dom.className=r,this.markers=n}destroy(){this.setMarkers(null,[])}};dE=N.define(),pE=N.define(),Fi=N.define({combine(t){return uo(t,{formatNumber:String,domEventHandlers:{}},{domEventHandlers(e,n){let r=Object.assign({},e);for(let o in n){let a=r[o],i=n[o];r[o]=a?(l,s,f)=>a(l,s,f)||i(l,s,f):i}return r}})}}),_s=class extends Qn{constructor(e){super(),this.number=e}eq(e){return this.number==e.number}toDOM(){return document.createTextNode(this.number)}};mE=Bu.compute([Fi],t=>({class:"cm-lineNumbers",renderEmptyElements:!1,markers(e){return e.state.facet(dE)},lineMarker(e,n,r){return r.some(o=>o.toDOM)?null:new _s(gx(e,e.state.doc.lineAt(n.from).number))},widgetMarker:(e,n,r)=>{for(let o of e.state.facet(pE)){let a=o(e,n,r);if(a)return a}return null},lineMarkerChange:e=>e.startState.facet(Fi)!=e.state.facet(Fi),initialSpacer(e){return new _s(gx(e,MS(e.state.doc.lines)))},updateSpacer(e,n){let r=gx(n.view,MS(n.view.state.doc.lines));return r==e.number?e:new _s(r)},domEventHandlers:t.facet(Fi).domEventHandlers,side:"before"}))});function gE(t,e){return t.length==e.length&&t.every((n,r)=>n==e[r])}function yE(t){let e=[[]];for(let n=0;n<t.length;n++)for(let r=0,o=e.length;r<o;r++)e.push(e[r].concat(t[n]));return e.sort((n,r)=>r.length-n.length)}function Ju(t){let e=Object.create(null);for(let n in t){let r=t[n];Array.isArray(r)||(r=[r]);for(let o of n.split(" "))if(o){let a=[],i=2,l=o;for(let u=0;;){if(l=="..."&&u>0&&u+3==o.length){i=1;break}let d=/^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(l);if(!d)throw new RangeError("Invalid path: "+o);if(a.push(d[0]=="*"?"":d[0][0]=='"'?JSON.parse(d[0]):d[0]),u+=d[0].length,u==o.length)break;let p=o[u++];if(u==o.length&&p=="!"){i=0;break}if(p!="/")throw new RangeError("Invalid path: "+o);l=o.slice(u)}let s=a.length-1,f=a[s];if(!f)throw new RangeError("Invalid path: "+o);let c=new ca(r,i,s>0?a.slice(0,s):null);e[f]=c.sort(e[f])}}return Dk.add(e)}function wg(t,e){let n=Object.create(null);for(let a of t)if(!Array.isArray(a.tag))n[a.tag.id]=a.class;else for(let i of a.tag)n[i.id]=a.class;let{scope:r,all:o=null}=e||{};return{style:a=>{let i=o;for(let l of a)for(let s of l.set){let f=n[s.id];if(f){i=i?i+" "+f:f;break}}return i},scope:r}}function bE(t,e){let n=null;for(let r of t){let o=r.style(e);o&&(n=n?n+" "+o:o)}return n}function Mk(t,e,n,r=0,o=t.length){let a=new Ig(r,Array.isArray(e)?e:[e],n);a.highlightRange(t.cursor(),r,o,"",a.highlighters),a.flush(o)}function IE(t){let e=t.type.prop(Dk);for(;e&&e.context&&!t.matchContext(e.context);)e=e.next;return e||null}var hE,On,xE,Yu,Dk,ca,Ig,M,Xu,yo,Ok,Bk,bo,Qu,bg,Jn,fa,Kn,Yn,vg,Vs,Ku,T,Y6,Sg=F(()=>{ws();hE=0,On=class t{constructor(e,n,r,o){this.name=e,this.set=n,this.base=r,this.modified=o,this.id=hE++}toString(){let{name:e}=this;for(let n of this.modified)n.name&&(e=`${n.name}(${e})`);return e}static define(e,n){let r=typeof e=="string"?e:"?";if(e instanceof t&&(n=e),n?.base)throw new Error("Can not derive from a modified tag");let o=new t(r,[],null,[]);if(o.set.push(o),n)for(let a of n.set)o.set.push(a);return o}static defineModifier(e){let n=new Yu(e);return r=>r.modified.indexOf(n)>-1?r:Yu.get(r.base||r,r.modified.concat(n).sort((o,a)=>o.id-a.id))}},xE=0,Yu=class t{constructor(e){this.name=e,this.instances=[],this.id=xE++}static get(e,n){if(!n.length)return e;let r=n[0].instances.find(l=>l.base==e&&gE(n,l.modified));if(r)return r;let o=[],a=new On(e.name,o,e,n);for(let l of n)l.instances.push(a);let i=yE(n);for(let l of e.set)if(!l.modified.length)for(let s of i)o.push(t.get(l,s));return a}};Dk=new j({combine(t,e){let n,r,o;for(;t||e;){if(!t||e&&t.depth<=e.depth?(o=e,e=e.next):(o=t,t=t.next),n&&n.mode==o.mode&&!o.context&&!n.context)continue;let a=new ca(o.tags,o.mode,o.context);n?n.next=a:r=a,n=a}return r}}),ca=class{constructor(e,n,r,o){this.tags=e,this.mode=n,this.context=r,this.next=o}get opaque(){return this.mode==0}get inherit(){return this.mode==1}sort(e){return!e||e.depth<this.depth?(this.next=e,this):(e.next=this.sort(e.next),e)}get depth(){return this.context?this.context.length:0}};ca.empty=new ca([],2,null);Ig=class{constructor(e,n,r){this.at=e,this.highlighters=n,this.span=r,this.class=""}startSpan(e,n){n!=this.class&&(this.flush(e),e>this.at&&(this.at=e),this.class=n)}flush(e){e>this.at&&this.class&&this.span(this.at,e,this.class)}highlightRange(e,n,r,o,a){let{type:i,from:l,to:s}=e;if(l>=r||s<=n)return;i.isTop&&(a=this.highlighters.filter(p=>!p.scope||p.scope(i)));let f=o,c=IE(e)||ca.empty,u=bE(a,c.tags);if(u&&(f&&(f+=" "),f+=u,c.mode==1&&(o+=(o?" ":"")+u)),this.startSpan(Math.max(n,l),f),c.opaque)return;let d=e.tree&&e.tree.prop(j.mounted);if(d&&d.overlay){let p=e.node.enter(d.overlay[0].from+l,1),m=this.highlighters.filter(b=>!b.scope||b.scope(d.tree.type)),x=e.firstChild();for(let b=0,h=l;;b++){let y=b<d.overlay.length?d.overlay[b]:null,g=y?y.from+l:s,I=Math.max(n,h),v=Math.min(r,g);if(I<v&&x)for(;e.from<v&&(this.highlightRange(e,I,v,o,a),this.startSpan(Math.min(v,e.to),f),!(e.to>=g||!e.nextSibling())););if(!y||g>r)break;h=y.to+l,h>n&&(this.highlightRange(p.cursor(),Math.max(n,y.from+l),Math.min(r,h),"",m),this.startSpan(Math.min(r,h),f))}x&&e.parent()}else if(e.firstChild()){d&&(o="");do if(!(e.to<=n)){if(e.from>=r)break;this.highlightRange(e,n,r,o,a),this.startSpan(Math.min(r,e.to),f)}while(e.nextSibling());e.parent()}}};M=On.define,Xu=M(),yo=M(),Ok=M(yo),Bk=M(yo),bo=M(),Qu=M(bo),bg=M(bo),Jn=M(),fa=M(Jn),Kn=M(),Yn=M(),vg=M(),Vs=M(vg),Ku=M(),T={comment:Xu,lineComment:M(Xu),blockComment:M(Xu),docComment:M(Xu),name:yo,variableName:M(yo),typeName:Ok,tagName:M(Ok),propertyName:Bk,attributeName:M(Bk),className:M(yo),labelName:M(yo),namespace:M(yo),macroName:M(yo),literal:bo,string:Qu,docString:M(Qu),character:M(Qu),attributeValue:M(Qu),number:bg,integer:M(bg),float:M(bg),bool:M(bo),regexp:M(bo),escape:M(bo),color:M(bo),url:M(bo),keyword:Kn,self:M(Kn),null:M(Kn),atom:M(Kn),unit:M(Kn),modifier:M(Kn),operatorKeyword:M(Kn),controlKeyword:M(Kn),definitionKeyword:M(Kn),moduleKeyword:M(Kn),operator:Yn,derefOperator:M(Yn),arithmeticOperator:M(Yn),logicOperator:M(Yn),bitwiseOperator:M(Yn),compareOperator:M(Yn),updateOperator:M(Yn),definitionOperator:M(Yn),typeOperator:M(Yn),controlOperator:M(Yn),punctuation:vg,separator:M(vg),bracket:Vs,angleBracket:M(Vs),squareBracket:M(Vs),paren:M(Vs),brace:M(Vs),content:Jn,heading:fa,heading1:M(fa),heading2:M(fa),heading3:M(fa),heading4:M(fa),heading5:M(fa),heading6:M(fa),contentSeparator:M(Jn),list:M(Jn),quote:M(Jn),emphasis:M(Jn),strong:M(Jn),link:M(Jn),monospace:M(Jn),strikethrough:M(Jn),inserted:M(),deleted:M(),changed:M(),invalid:M(),meta:Ku,documentMeta:M(Ku),annotation:M(Ku),processingInstruction:M(Ku),definition:On.defineModifier("definition"),constant:On.defineModifier("constant"),function:On.defineModifier("function"),standard:On.defineModifier("standard"),local:On.defineModifier("local"),special:On.defineModifier("special")};for(let t in T){let e=T[t];e instanceof On&&(e.name=t)}Y6=wg([{tag:T.link,class:"tok-link"},{tag:T.heading,class:"tok-heading"},{tag:T.emphasis,class:"tok-emphasis"},{tag:T.strong,class:"tok-strong"},{tag:T.keyword,class:"tok-keyword"},{tag:T.atom,class:"tok-atom"},{tag:T.bool,class:"tok-bool"},{tag:T.url,class:"tok-url"},{tag:T.labelName,class:"tok-labelName"},{tag:T.inserted,class:"tok-inserted"},{tag:T.deleted,class:"tok-deleted"},{tag:T.literal,class:"tok-literal"},{tag:T.string,class:"tok-string"},{tag:T.number,class:"tok-number"},{tag:[T.regexp,T.escape,T.special(T.string)],class:"tok-string2"},{tag:T.variableName,class:"tok-variableName"},{tag:T.local(T.variableName),class:"tok-variableName tok-local"},{tag:T.definition(T.variableName),class:"tok-variableName tok-definition"},{tag:T.special(T.variableName),class:"tok-variableName2"},{tag:T.definition(T.propertyName),class:"tok-propertyName tok-definition"},{tag:T.typeName,class:"tok-typeName"},{tag:T.namespace,class:"tok-namespace"},{tag:T.className,class:"tok-className"},{tag:T.macroName,class:"tok-macroName"},{tag:T.propertyName,class:"tok-propertyName"},{tag:T.operator,class:"tok-operator"},{tag:T.comment,class:"tok-comment"},{tag:T.meta,class:"tok-meta"},{tag:T.invalid,class:"tok-invalid"},{tag:T.punctuation,class:"tok-punctuation"}])});function vE(t){return N.define({combine:t?e=>e.concat(t):void 0})}function Rk(t,e,n){let r=t.facet(Wi),o=lt(t).topNode;if(!r||r.allowsNesting)for(let a=o;a;a=a.enter(e,n,Ae.ExcludeBuffers|Ae.EnterBracketed))a.type.isTop&&(o=a);return o}function lt(t){let e=t.field(Qt.state,!1);return e?e.tree:Le.empty}function Ek(t,e,n){return Zo.applyChanges(t,[{fromA:e,toA:n,fromB:e,toB:n}])}function Qs(t){let e=t.facet(Xs);return e.charCodeAt(0)==9?t.tabSize*e.length:e.length}function Ks(t,e){let n="",r=t.tabSize,o=t.facet(Xs)[0];if(o=="	"){for(;e>=r;)n+="	",e-=r;o=" "}for(let a=0;a<e;a++)n+=o;return n}function Lg(t,e){t instanceof Te&&(t=new ua(t));for(let r of t.state.facet(kE)){let o=r(t,e);if(o!==void 0)return o}let n=lt(t.state);return n.length>=e?CE(t,n,e):null}function CE(t,e,n){let r=e.resolveStack(n),o=e.resolveInner(n,-1).resolve(n,0).enterUnfinishedNodesBefore(n);if(o!=r.node){let a=[];for(let i=o;i&&!(i.from<r.node.from||i.to>r.node.to||i.from==r.node.from&&i.type==r.node.type);i=i.parent)a.push(i);for(let i=a.length-1;i>=0;i--)r={node:a[i],next:r}}return Pk(r,t,n)}function Pk(t,e,n){for(let r=t;r;r=r.next){let o=TE(r.node);if(o)return o(Dg.create(e,n,r))}return 0}function AE(t){return t.pos==t.options.simulateBreak&&t.options.simulateDoubleBreak}function TE(t){let e=t.type.prop(Ng);if(e)return e;let n=t.firstChild,r;if(n&&(r=n.type.prop(j.closedBy))){let o=t.lastChild,a=o&&r.indexOf(o.name)>-1;return i=>ME(i,!0,1,void 0,a&&!AE(i)?o.from:void 0)}return t.parent==null?OE:null}function OE(){return 0}function BE(t,e){for(let n=e;n;n=n.parent)if(t==n)return!0;return!1}function DE(t){let e=t.node,n=e.childAfter(e.from),r=e.lastChild;if(!n)return null;let o=t.options.simulateBreak,a=t.state.doc.lineAt(n.from),i=o==null||o<=a.from?a.to:Math.min(a.to,o);for(let l=n.to;;){let s=e.childAfter(l);if(!s||s==r)return null;if(!s.type.isSkipped){if(s.from>=i)return null;let f=/^ */.exec(a.text.slice(n.to-a.from))[0].length;return{from:n.from,to:n.to+f}}l=s.to}}function ME(t,e,n,r,o){let a=t.textAfter,i=a.match(/^\s*/)[0].length,l=r&&a.slice(i,i+r.length)==r||o==t.pos+i,s=e?DE(t):null;return s?l?t.column(s.from):t.column(s.to):t.baseIndent+(l?0:t.unit*n)}function zk({except:t,units:e=1}={}){return n=>{let r=t&&t.test(n.textAfter);return n.baseIndent+(r?0:e*n.unit)}}function Ag(t){let e=t.facet(Mg);return e.length?e:t.facet(Uk)}function jk(t,e){let n=[RE],r;return t instanceof Xi&&(t.module&&n.push(q.styleModule.of(t.module)),r=t.themeType),e?.fallback?n.push(Uk.of(t)):r?n.push(Mg.computeN([q.darkTheme],o=>o.facet(q.darkTheme)==(r=="dark")?[t]:[])):n.push(Mg.of(t)),n}function NE(t){let e=[],n=t.matched?FE:LE;return e.push(n.range(t.start.from,t.start.to)),t.end&&e.push(n.range(t.end.from,t.end.to)),e}function Fk(t){let e=[],n=t.facet(Xk);for(let r of t.selection.ranges){if(!r.empty)continue;let o=Bn(t,r.head,-1,n)||r.head>0&&Bn(t,r.head-1,1,n)||n.afterCursor&&(Bn(t,r.head,1,n)||r.head<t.doc.length&&Bn(t,r.head+1,-1,n));o&&(e=e.concat(n.renderMatch(o,t)))}return ee.set(e,!0)}function Qk(t={}){return[Xk.of(t),qE]}function Eg(t,e,n){let r=t.prop(e<0?j.openedBy:j.closedBy);if(r)return r;if(t.name.length==1){let o=n.indexOf(t.name);if(o>-1&&o%2==(e<0?1:0))return[n[o+e]]}return null}function Fg(t){let e=t.type.prop(PE);return e?e(t.node):t}function Bn(t,e,n,r={}){let o=r.maxScanDistance||Gk,a=r.brackets||Wk,i=lt(t),l=i.resolveInner(e,n);for(let s=l;s;s=s.parent){let f=Eg(s.type,n,a);if(f&&s.from<s.to){let c=Fg(s);if(c&&(n>0?e>=c.from&&e<c.to:e>c.from&&e<=c.to))return zE(t,e,n,s,c,f,a)}}return HE(t,e,n,i,l.type,o,a)}function zE(t,e,n,r,o,a,i){let l=r.parent,s={from:o.from,to:o.to},f=0,c=l?.cursor();if(c&&(n<0?c.childBefore(r.from):c.childAfter(r.to)))do if(n<0?c.to<=r.from:c.from>=r.to){if(f==0&&a.indexOf(c.type.name)>-1&&c.from<c.to){let u=Fg(c);return{start:s,end:u?{from:u.from,to:u.to}:void 0,matched:!0}}else if(Eg(c.type,n,i))f++;else if(Eg(c.type,-n,i)){if(f==0){let u=Fg(c);return{start:s,end:u&&u.from<u.to?{from:u.from,to:u.to}:void 0,matched:!1}}f--}}while(n<0?c.prevSibling():c.nextSibling());return{start:s,matched:!1}}function HE(t,e,n,r,o,a,i){if(n<0?!e:e==t.doc.length)return null;let l=n<0?t.sliceDoc(e-1,e):t.sliceDoc(e,e+1),s=i.indexOf(l);if(s<0||s%2==0!=n>0)return null;let f={from:n<0?e-1:e,to:n>0?e+1:e},c=t.doc.iterRange(e,n>0?t.doc.length:0),u=0;for(let d=0;!c.next().done&&d<=a;){let p=c.value;n<0&&(d+=p.length);let m=e+d*n;for(let x=n>0?0:p.length-1,b=n>0?p.length:-1;x!=b;x+=n){let h=i.indexOf(p[x]);if(!(h<0||r.resolveInner(m+x,1).type!=o))if(h%2==0==n>0)u++;else{if(u==1)return{start:f,end:{from:m+x,to:m+x+1},matched:h>>1==s>>1};u--}}n>0&&(d+=p.length)}return c.done?{start:f,matched:!1}:null}function Tg(t,e){Nk.indexOf(t)>-1||(Nk.push(t),console.warn(e))}function VE(t,e){let n=[];for(let l of e.split(" ")){let s=[];for(let f of l.split(".")){let c=t[f]||T[f];c?typeof c=="function"?s.length?s=s.map(c):Tg(f,`Modifier ${f} used at start of tag`):s.length?Tg(f,`Tag ${f} used as modifier`):s=Array.isArray(c)?c:[c]:Tg(f,`Unknown highlighting tag ${f}`)}for(let f of s)n.push(f)}if(!n.length)return 0;let r=e.replace(/ /g,"_"),o=r+" "+n.map(l=>l.id),a=_k[o];if(a)return a.id;let i=_k[o]=at.define({id:Lk.length,name:r,props:[Ju({[r]:n})]});return Lk.push(i),i.id}var kg,Gi,wE,Qt,Zu,Og,Gs,Bg,Ws,qk,Cg,SE,Wi,$u,kE,Xs,ua,Ng,Dg,Hk,Xi,Mg,Uk,Rg,RE,Vk,EE,Gk,Wk,Xk,FE,LE,_E,qE,PE,UE,Lk,Nk,_k,jE,a8,Ys=F(()=>{ws();Bi();js();Sg();fx();Gi=new j;wE=new j,Qt=class{constructor(e,n,r=[],o=""){this.data=e,this.name=o,Te.prototype.hasOwnProperty("tree")||Object.defineProperty(Te.prototype,"tree",{get(){return lt(this)}}),this.parser=n,this.extension=[Wi.of(this),Te.languageData.of((a,i,l)=>{let s=Rk(a,i,l),f=s.type.prop(Gi);if(!f)return[];let c=a.facet(f),u=s.type.prop(wE);if(u){let d=s.resolve(i-s.from,l);for(let p of u)if(p.test(d,a)){let m=a.facet(p.facet);return p.type=="replace"?m:m.concat(c)}}return c})].concat(r)}isActiveAt(e,n,r=-1){return Rk(e,n,r).type.prop(Gi)==this.data}findRegions(e){let n=e.facet(Wi);if(n?.data==this.data)return[{from:0,to:e.doc.length}];if(!n||!n.allowsNesting)return[];let r=[],o=(a,i)=>{if(a.prop(Gi)==this.data){r.push({from:i,to:i+a.length});return}let l=a.prop(j.mounted);if(l){if(l.tree.prop(Gi)==this.data){if(l.overlay)for(let s of l.overlay)r.push({from:s.from+i,to:s.to+i});else r.push({from:i,to:i+a.length});return}else if(l.overlay){let s=r.length;if(o(l.tree,l.overlay[0].from+i),r.length>s)return}}for(let s=0;s<a.children.length;s++){let f=a.children[s];f instanceof Le&&o(f,a.positions[s]+i)}};return o(lt(e),0),r}get allowsNesting(){return!0}};Qt.setState=oe.define();Zu=class t extends Qt{constructor(e,n,r){super(e,n,[],r),this.parser=n}static define(e){let n=vE(e.languageData);return new t(n,e.parser.configure({props:[Gi.add(r=>r.isTop?n:void 0)]}),e.name)}configure(e,n){return new t(this.data,this.parser.configure(e),n||this.name)}get allowsNesting(){return this.parser.hasWrappers()}};Og=class{constructor(e){this.doc=e,this.cursorPos=0,this.string="",this.cursor=e.iter()}get length(){return this.doc.length}syncTo(e){return this.string=this.cursor.next(e-this.cursorPos).value,this.cursorPos=e+this.string.length,this.cursorPos-this.string.length}chunk(e){return this.syncTo(e),this.string}get lineChunks(){return!0}read(e,n){let r=this.cursorPos-this.string.length;return e<r||n>=this.cursorPos?this.doc.sliceString(e,n):this.string.slice(e-r,n-r)}},Gs=null,Bg=class t{constructor(e,n,r=[],o,a,i,l,s){this.parser=e,this.state=n,this.fragments=r,this.tree=o,this.treeLen=a,this.viewport=i,this.skipped=l,this.scheduleOn=s,this.parse=null,this.tempSkipped=[]}static create(e,n,r){return new t(e,n,[],Le.empty,0,r,[],null)}startParse(){return this.parser.startParse(new Og(this.state.doc),this.fragments)}work(e,n){return n!=null&&n>=this.state.doc.length&&(n=void 0),this.tree!=Le.empty&&this.isDone(n??this.state.doc.length)?(this.takeTree(),!0):this.withContext(()=>{var r;if(typeof e=="number"){let o=Date.now()+e;e=()=>Date.now()>o}for(this.parse||(this.parse=this.startParse()),n!=null&&(this.parse.stoppedAt==null||this.parse.stoppedAt>n)&&n<this.state.doc.length&&this.parse.stopAt(n);;){let o=this.parse.advance();if(o)if(this.fragments=this.withoutTempSkipped(Zo.addTree(o,this.fragments,this.parse.stoppedAt!=null)),this.treeLen=(r=this.parse.stoppedAt)!==null&&r!==void 0?r:this.state.doc.length,this.tree=o,this.parse=null,this.treeLen<(n??this.state.doc.length))this.parse=this.startParse();else return!0;if(e())return!1}})}takeTree(){let e,n;this.parse&&(e=this.parse.parsedPos)>=this.treeLen&&((this.parse.stoppedAt==null||this.parse.stoppedAt>e)&&this.parse.stopAt(e),this.withContext(()=>{for(;!(n=this.parse.advance()););}),this.treeLen=e,this.tree=n,this.fragments=this.withoutTempSkipped(Zo.addTree(this.tree,this.fragments,!0)),this.parse=null)}withContext(e){let n=Gs;Gs=this;try{return e()}finally{Gs=n}}withoutTempSkipped(e){for(let n;n=this.tempSkipped.pop();)e=Ek(e,n.from,n.to);return e}changes(e,n){let{fragments:r,tree:o,treeLen:a,viewport:i,skipped:l}=this;if(this.takeTree(),!e.empty){let s=[];if(e.iterChangedRanges((f,c,u,d)=>s.push({fromA:f,toA:c,fromB:u,toB:d})),r=Zo.applyChanges(r,s),o=Le.empty,a=0,i={from:e.mapPos(i.from,-1),to:e.mapPos(i.to,1)},this.skipped.length){l=[];for(let f of this.skipped){let c=e.mapPos(f.from,1),u=e.mapPos(f.to,-1);c<u&&l.push({from:c,to:u})}}}return new t(this.parser,n,r,o,a,i,l,this.scheduleOn)}updateViewport(e){if(this.viewport.from==e.from&&this.viewport.to==e.to)return!1;this.viewport=e;let n=this.skipped.length;for(let r=0;r<this.skipped.length;r++){let{from:o,to:a}=this.skipped[r];o<e.to&&a>e.from&&(this.fragments=Ek(this.fragments,o,a),this.skipped.splice(r--,1))}return this.skipped.length>=n?!1:(this.reset(),!0)}reset(){this.parse&&(this.takeTree(),this.parse=null)}skipUntilInView(e,n){this.skipped.push({from:e,to:n})}static getSkippingParser(e){return new class extends wi{createParse(n,r,o){let a=o[0].from,i=o[o.length-1].to;return{parsedPos:a,advance(){let s=Gs;if(s){for(let f of o)s.tempSkipped.push(f);e&&(s.scheduleOn=s.scheduleOn?Promise.all([s.scheduleOn,e]):e)}return this.parsedPos=i,new Le(at.none,[],[],i-a)},stoppedAt:null,stopAt(){}}}}}isDone(e){e=Math.min(e,this.state.doc.length);let n=this.fragments;return this.treeLen>=e&&n.length&&n[0].from==0&&n[0].to>=e}static get(){return Gs}};Ws=class t{constructor(e){this.context=e,this.tree=e.tree}apply(e){if(!e.docChanged&&this.tree==this.context.tree)return this;let n=this.context.changes(e.changes,e.state),r=this.context.treeLen==e.startState.doc.length?void 0:Math.max(e.changes.mapPos(this.context.treeLen),n.viewport.to);return n.work(20,r)||n.takeTree(),new t(n)}static init(e){let n=Math.min(3e3,e.doc.length),r=Bg.create(e.facet(Wi).parser,e,{from:0,to:n});return r.work(20,n)||r.takeTree(),new t(r)}};Qt.state=xt.define({create:Ws.init,update(t,e){for(let n of e.effects)if(n.is(Qt.setState))return n.value;return e.startState.facet(Wi)!=e.state.facet(Wi)?Ws.init(e.state):t.apply(e)}});qk=t=>{let e=setTimeout(()=>t(),500);return()=>clearTimeout(e)};typeof requestIdleCallback<"u"&&(qk=t=>{let e=-1,n=setTimeout(()=>{e=requestIdleCallback(t,{timeout:400})},100);return()=>e<0?clearTimeout(n):cancelIdleCallback(e)});Cg=typeof navigator<"u"&&(!((kg=navigator.scheduling)===null||kg===void 0)&&kg.isInputPending)?()=>navigator.scheduling.isInputPending():null,SE=Xt.fromClass(class{constructor(e){this.view=e,this.working=null,this.workScheduled=0,this.chunkEnd=-1,this.chunkBudget=-1,this.work=this.work.bind(this),this.scheduleWork()}update(e){let n=this.view.state.field(Qt.state).context;(n.updateViewport(e.view.viewport)||this.view.viewport.to>n.treeLen)&&this.scheduleWork(),(e.docChanged||e.selectionSet)&&(this.view.hasFocus&&(this.chunkBudget+=50),this.scheduleWork()),this.checkAsyncSchedule(n)}scheduleWork(){if(this.working)return;let{state:e}=this.view,n=e.field(Qt.state);(n.tree!=n.context.tree||!n.context.isDone(e.doc.length))&&(this.working=qk(this.work))}work(e){this.working=null;let n=Date.now();if(this.chunkEnd<n&&(this.chunkEnd<0||this.view.hasFocus)&&(this.chunkEnd=n+3e4,this.chunkBudget=3e3),this.chunkBudget<=0)return;let{state:r,viewport:{to:o}}=this.view,a=r.field(Qt.state);if(a.tree==a.context.tree&&a.context.isDone(o+1e5))return;let i=Date.now()+Math.min(this.chunkBudget,100,e&&!Cg?Math.max(25,e.timeRemaining()-5):1e9),l=a.context.treeLen<o&&r.doc.length>o+1e3,s=a.context.work(()=>Cg&&Cg()||Date.now()>i,o+(l?0:1e5));this.chunkBudget-=Date.now()-n,(s||this.chunkBudget<=0)&&(a.context.takeTree(),this.view.dispatch({effects:Qt.setState.of(new Ws(a.context))})),this.chunkBudget>0&&!(s&&!l)&&this.scheduleWork(),this.checkAsyncSchedule(a.context)}checkAsyncSchedule(e){e.scheduleOn&&(this.workScheduled++,e.scheduleOn.then(()=>this.scheduleWork()).catch(n=>yt(this.view.state,n)).then(()=>this.workScheduled--),e.scheduleOn=null)}destroy(){this.working&&this.working()}isWorking(){return!!(this.working||this.workScheduled>0)}},{eventHandlers:{focus(){this.scheduleWork()}}}),Wi=N.define({combine(t){return t.length?t[0]:null},enables:t=>[Qt.state,SE,q.contentAttributes.compute([t],e=>{let n=e.facet(t);return n&&n.name?{"data-language":n.name}:{}})]}),$u=class{constructor(e,n=[]){this.language=e,this.support=n,this.extension=[e,n]}},kE=N.define(),Xs=N.define({combine:t=>{if(!t.length)return"  ";let e=t[0];if(!e||/\S/.test(e)||Array.from(e).some(n=>n!=e[0]))throw new Error("Invalid indent unit: "+JSON.stringify(t[0]));return e}});ua=class{constructor(e,n={}){this.state=e,this.options=n,this.unit=Qs(e)}lineAt(e,n=1){let r=this.state.doc.lineAt(e),{simulateBreak:o,simulateDoubleBreak:a}=this.options;return o!=null&&o>=r.from&&o<=r.to?a&&o==e?{text:"",from:e}:(n<0?o<e:o<=e)?{text:r.text.slice(o-r.from),from:o}:{text:r.text.slice(0,o-r.from),from:r.from}:r}textAfterPos(e,n=1){if(this.options.simulateDoubleBreak&&e==this.options.simulateBreak)return"";let{text:r,from:o}=this.lineAt(e,n);return r.slice(e-o,Math.min(r.length,e+100-o))}column(e,n=1){let{text:r,from:o}=this.lineAt(e,n),a=this.countColumn(r,e-o),i=this.options.overrideIndentation?this.options.overrideIndentation(o):-1;return i>-1&&(a+=i-this.countColumn(r,r.search(/\S|$/))),a}countColumn(e,n=e.length){return oa(e,this.state.tabSize,n)}lineIndent(e,n=1){let{text:r,from:o}=this.lineAt(e,n),a=this.options.overrideIndentation;if(a){let i=a(o);if(i>-1)return i}return this.countColumn(r,r.search(/\S|$/))}get simulatedBreak(){return this.options.simulateBreak||null}},Ng=new j;Dg=class t extends ua{constructor(e,n,r){super(e.state,e.options),this.base=e,this.pos=n,this.context=r}get node(){return this.context.node}static create(e,n,r){return new t(e,n,r)}get textAfter(){return this.textAfterPos(this.pos)}get baseIndent(){return this.baseIndentFor(this.node)}baseIndentFor(e){let n=this.state.doc.lineAt(e.from);for(;;){let r=e.resolve(n.from);for(;r.parent&&r.parent.from==r.from;)r=r.parent;if(BE(r,e))break;n=this.state.doc.lineAt(r.from)}return this.lineIndent(n.from)}continue(){return Pk(this.context.next,this.base,this.pos)}};Hk=new j,Xi=class t{constructor(e,n){this.specs=e;let r;function o(l){let s=dn.newName();return(r||(r=Object.create(null)))["."+s]=l,s}let a=typeof n.all=="string"?n.all:n.all?o(n.all):void 0,i=n.scope;this.scope=i instanceof Qt?l=>l.prop(Gi)==i.data:i?l=>l==i:void 0,this.style=wg(e.map(l=>({tag:l.tag,class:l.class||o(Object.assign({},l,{tag:null}))})),{all:a}).style,this.module=r?new dn(r):null,this.themeType=n.themeType}static define(e,n){return new t(e,n||{})}},Mg=N.define(),Uk=N.define({combine(t){return t.length?[t[0]]:null}});Rg=class{constructor(e){this.markCache=Object.create(null),this.tree=lt(e.state),this.decorations=this.buildDeco(e,Ag(e.state)),this.decoratedTo=e.viewport.to}update(e){let n=lt(e.state),r=Ag(e.state),o=r!=Ag(e.startState),{viewport:a}=e.view,i=e.changes.mapPos(this.decoratedTo,1);n.length<a.to&&!o&&n.type==this.tree.type&&i>=a.to?(this.decorations=this.decorations.map(e.changes),this.decoratedTo=i):(n!=this.tree||e.viewportChanged||o)&&(this.tree=n,this.decorations=this.buildDeco(e.view,r),this.decoratedTo=a.to)}buildDeco(e,n){if(!n||!this.tree.length)return ee.none;let r=new fo;for(let{from:o,to:a}of e.visibleRanges)Mk(this.tree,n,(i,l,s)=>{r.add(i,l,this.markCache[s]||(this.markCache[s]=ee.mark({class:s})))},o,a);return r.finish()}},RE=kn.high(Xt.fromClass(Rg,{decorations:t=>t.decorations})),Vk=Xi.define([{tag:T.meta,color:"#404740"},{tag:T.link,textDecoration:"underline"},{tag:T.heading,textDecoration:"underline",fontWeight:"bold"},{tag:T.emphasis,fontStyle:"italic"},{tag:T.strong,fontWeight:"bold"},{tag:T.strikethrough,textDecoration:"line-through"},{tag:T.keyword,color:"#708"},{tag:[T.atom,T.bool,T.url,T.contentSeparator,T.labelName],color:"#219"},{tag:[T.literal,T.inserted],color:"#164"},{tag:[T.string,T.deleted],color:"#a11"},{tag:[T.regexp,T.escape,T.special(T.string)],color:"#e40"},{tag:T.definition(T.variableName),color:"#00f"},{tag:T.local(T.variableName),color:"#30a"},{tag:[T.typeName,T.namespace],color:"#085"},{tag:T.className,color:"#167"},{tag:[T.special(T.variableName),T.macroName],color:"#256"},{tag:T.definition(T.propertyName),color:"#00c"},{tag:T.comment,color:"#940"},{tag:T.invalid,color:"#f00"}]),EE=q.baseTheme({"&.cm-focused .cm-matchingBracket":{backgroundColor:"#328c8252"},"&.cm-focused .cm-nonmatchingBracket":{backgroundColor:"#bb555544"}}),Gk=1e4,Wk="()[]{}",Xk=N.define({combine(t){return uo(t,{afterCursor:!0,brackets:Wk,maxScanDistance:Gk,renderMatch:NE})}}),FE=ee.mark({class:"cm-matchingBracket"}),LE=ee.mark({class:"cm-nonmatchingBracket"});_E=Xt.fromClass(class{constructor(t){this.paused=!1,this.decorations=Fk(t.state)}update(t){(t.docChanged||t.selectionSet||this.paused)&&(t.view.composing?(this.decorations=this.decorations.map(t.changes),this.paused=!0):(this.decorations=Fk(t.state),this.paused=!1))}},{decorations:t=>t.decorations}),qE=[_E,EE];PE=new j;UE=Object.create(null),Lk=[at.none],Nk=[],_k=Object.create(null),jE=Object.create(null);for(let[t,e]of[["variable","variableName"],["variable-2","variableName.special"],["string-2","string.special"],["def","variableName.definition"],["tag","tagName"],["attribute","attributeName"],["type","typeName"],["builtin","variableName.standard"],["qualifier","modifier"],["error","invalid"],["header","heading"],["property","propertyName"]])jE[t]=VE(UE,e);a8={rtl:ee.mark({class:"cm-iso",inclusive:!0,attributes:{dir:"rtl"},bidiIsolate:pe.RTL}),ltr:ee.mark({class:"cm-iso",inclusive:!0,attributes:{dir:"ltr"},bidiIsolate:pe.LTR}),auto:ee.mark({class:"cm-iso",inclusive:!0,attributes:{dir:"auto"},bidiIsolate:null})}});function Js(t,e=Uint16Array){if(typeof t!="string")return t;let n=null;for(let r=0,o=0;r<t.length;){let a=0;for(;;){let i=t.charCodeAt(r++),l=!1;if(i==126){a=65535;break}i>=92&&i--,i>=34&&i--;let s=i-32;if(s>=46&&(s-=46,l=!0),a+=s,l)break;a*=46}n?n[o++]=a:n=new e(a)}return n}function eC(t,e,n,r,o,a){let i=0,l=1<<r,{dialect:s}=n.p.parser;e:for(;(l&t[i])!=0;){let f=t[i+1];for(let p=i+3;p<f;p+=2)if((t[p+1]&l)>0){let m=t[p];if(s.allows(m)&&(e.token.value==-1||e.token.value==m||WE(m,e.token.value,o,a))){e.acceptToken(m);break}}let c=e.next,u=0,d=t[i+2];if(e.next<0&&d>u&&t[f+d*3-3]==65535){i=t[f+d*3-1];continue e}for(;u<d;){let p=u+d>>1,m=f+p+(p<<1),x=t[m],b=t[m+1]||65536;if(c<x)d=p;else if(c>=b)u=p+1;else{i=t[m+2],e.advance();continue e}}break}}function Yk(t,e,n){for(let r=e,o;(o=t[r])!=65535;r++)if(o==n)return r-e;return-1}function WE(t,e,n,r){let o=Yk(n,r,e);return o<0||Yk(n,r,t)<o}function Jk(t,e,n){let r=t.cursor(Ae.IncludeAnonymous);for(r.moveTo(e);;)if(!(n<0?r.childBefore(e):r.childAfter(e)))for(;;){if((n<0?r.to<e:r.from>e)&&!r.type.isError)return n<0?Math.max(0,Math.min(r.to-1,e-25)):Math.min(t.length,Math.max(r.from+1,e+25));if(n<0?r.prevSibling():r.nextSibling())break;if(!r.parent())return n<0?0:t.length}}function Zk(t,e){for(let n=0;n<e.length;n++){let r=e[n];if(r.pos==t.pos&&r.sameState(t)){e[n].score<t.score&&(e[n]=t);return}}e.push(t)}function Tr(t,e){return t[e]|t[e+1]<<16}function XE(t){let e=null;for(let n of t){let r=n.p.stoppedAt;(n.pos==n.p.stream.end||r!=null&&n.pos>r)&&n.p.parser.stateFlag(n.state,2)&&(!e||e.score<n.score)&&(e=n)}return e}function $k(t){if(t.external){let e=t.extend?1:0;return(n,r)=>t.external(n,r)<<1|e}return t.get}var qg,ed,Pg,zg,Qi,Kk,Hg,Io,Ug,td,Kt,_g,jg,Vg,Gg,Wg,nd,tC=F(()=>{ws();qg=class t{constructor(e,n,r,o,a,i,l,s,f,c=0,u){this.p=e,this.stack=n,this.state=r,this.reducePos=o,this.pos=a,this.score=i,this.buffer=l,this.bufferBase=s,this.curContext=f,this.lookAhead=c,this.parent=u}toString(){return`[${this.stack.filter((e,n)=>n%3==0).concat(this.state)}]@${this.pos}${this.score?"!"+this.score:""}`}static start(e,n,r=0){let o=e.parser.context;return new t(e,[],n,r,r,0,[],0,o?new ed(o,o.start):null,0,null)}get context(){return this.curContext?this.curContext.context:null}pushState(e,n){this.stack.push(this.state,n,this.bufferBase+this.buffer.length),this.state=e}reduce(e){var n;let r=e>>19,o=e&65535,{parser:a}=this.p,i=this.reducePos<this.pos-25&&this.setLookAhead(this.pos),l=a.dynamicPrecedence(o);if(l&&(this.score+=l),r==0){o<a.minRepeatTerm&&this.reducePos<this.pos&&(this.reducePos=this.pos),this.pushState(a.getGoto(this.state,o,!0),this.reducePos),o<a.minRepeatTerm&&this.storeNode(o,this.reducePos,this.reducePos,i?8:4,!0),this.reduceContext(o,this.reducePos);return}let s=this.stack.length-(r-1)*3-(e&262144?6:0),f=s?this.stack[s-2]:this.p.ranges[0].from;o<a.minRepeatTerm&&f==this.reducePos&&this.reducePos<this.pos&&(this.reducePos=this.pos);let c=this.reducePos-f;c>=2e3&&!(!((n=this.p.parser.nodeSet.types[o])===null||n===void 0)&&n.isAnonymous)&&(f==this.p.lastBigReductionStart?(this.p.bigReductionCount++,this.p.lastBigReductionSize=c):this.p.lastBigReductionSize<c&&(this.p.bigReductionCount=1,this.p.lastBigReductionStart=f,this.p.lastBigReductionSize=c));let u=s?this.stack[s-1]:0,d=this.bufferBase+this.buffer.length-u;if(o<a.minRepeatTerm||e&131072){let p=a.stateFlag(this.state,1)?this.pos:this.reducePos;this.storeNode(o,f,p,d+4,!0)}if(e&262144)this.state=this.stack[s];else{let p=this.stack[s-3];this.state=a.getGoto(p,o,!0)}for(;this.stack.length>s;)this.stack.pop();this.reduceContext(o,f)}storeNode(e,n,r,o=4,a=!1){if(e==0&&(!this.stack.length||this.stack[this.stack.length-1]<this.buffer.length+this.bufferBase)){let i=this.buffer.length;if(i>0&&this.buffer[i-4]==0&&this.buffer[i-1]>-1){if(n==r)return;if(this.buffer[i-2]>=n){this.buffer[i-2]=r;return}}}if(!a||this.pos==r)this.buffer.push(e,n,r,o);else{let i=this.buffer.length;if(i>0&&(this.buffer[i-4]!=0||this.buffer[i-1]<0)){let l=!1;for(let s=i;s>0&&this.buffer[s-2]>r;s-=4)if(this.buffer[s-1]>=0){l=!0;break}if(l)for(;i>0&&this.buffer[i-2]>r;)this.buffer[i]=this.buffer[i-4],this.buffer[i+1]=this.buffer[i-3],this.buffer[i+2]=this.buffer[i-2],this.buffer[i+3]=this.buffer[i-1],i-=4,o>4&&(o-=4)}this.buffer[i]=e,this.buffer[i+1]=n,this.buffer[i+2]=r,this.buffer[i+3]=o}}shift(e,n,r,o){if(e&131072)this.pushState(e&65535,this.pos);else if((e&262144)==0){let a=e,{parser:i}=this.p;this.pos=o;let l=i.stateFlag(a,1);!l&&(o>r||n<=i.maxNode)&&(this.reducePos=o),this.pushState(a,l?r:Math.min(r,this.reducePos)),this.shiftContext(n,r),n<=i.maxNode&&this.buffer.push(n,r,o,4)}else this.pos=o,this.shiftContext(n,r),n<=this.p.parser.maxNode&&this.buffer.push(n,r,o,4)}apply(e,n,r,o){e&65536?this.reduce(e):this.shift(e,n,r,o)}useNode(e,n,r){let o=this.p.reused.length-1;(o<0||this.p.reused[o]!=e)&&(this.p.reused.push(e),o++);let a=this.reducePos=this.pos=r+e.length;this.pushState(n,r),this.buffer.push(o,r,a,-1),this.curContext&&this.updateContext(this.curContext.tracker.reuse(this.curContext.context,e,this,this.p.stream.reset(this.pos-e.length)))}split(){let e=this,n=e.buffer.length;for(n&&e.buffer[n-4]==0&&(n-=4);n>0&&e.buffer[n-2]>e.reducePos;)n-=4;let r=e.buffer.slice(n),o=e.bufferBase+n;for(;e&&o==e.bufferBase;)e=e.parent;return new t(this.p,this.stack.slice(),this.state,this.reducePos,this.pos,this.score,r,o,this.curContext,this.lookAhead,e)}recoverByDelete(e,n){let r=e<=this.p.parser.maxNode;r&&this.storeNode(e,this.pos,n,4),this.storeNode(0,this.pos,n,r?8:4),this.pos=this.reducePos=n,this.score-=190}canShift(e){for(let n=new Pg(this);;){let r=this.p.parser.stateSlot(n.state,4)||this.p.parser.hasAction(n.state,e);if(r==0)return!1;if((r&65536)==0)return!0;n.reduce(r)}}recoverByInsert(e){if(this.stack.length>=300)return[];let n=this.p.parser.nextStates(this.state);if(n.length>8||this.stack.length>=120){let o=[];for(let a=0,i;a<n.length;a+=2)(i=n[a+1])!=this.state&&this.p.parser.hasAction(i,e)&&o.push(n[a],i);if(this.stack.length<120)for(let a=0;o.length<8&&a<n.length;a+=2){let i=n[a+1];o.some((l,s)=>s&1&&l==i)||o.push(n[a],i)}n=o}let r=[];for(let o=0;o<n.length&&r.length<4;o+=2){let a=n[o+1];if(a==this.state)continue;let i=this.split();i.pushState(a,this.pos),i.storeNode(0,i.pos,i.pos,4,!0),i.shiftContext(n[o],this.pos),i.reducePos=this.pos,i.score-=200,r.push(i)}return r}forceReduce(){let{parser:e}=this.p,n=e.stateSlot(this.state,5);if((n&65536)==0)return!1;if(!e.validAction(this.state,n)){let r=n>>19,o=n&65535,a=this.stack.length-r*3;if(a<0||e.getGoto(this.stack[a],o,!1)<0){let i=this.findForcedReduction();if(i==null)return!1;n=i}this.storeNode(0,this.pos,this.pos,4,!0),this.score-=100}return this.reducePos=this.pos,this.reduce(n),!0}findForcedReduction(){let{parser:e}=this.p,n=[],r=(o,a)=>{if(!n.includes(o))return n.push(o),e.allActions(o,i=>{if(!(i&393216))if(i&65536){let l=(i>>19)-a;if(l>1){let s=i&65535,f=this.stack.length-l*3;if(f>=0&&e.getGoto(this.stack[f],s,!1)>=0)return l<<19|65536|s}}else{let l=r(i,a+1);if(l!=null)return l}})};return r(this.state,0)}forceAll(){for(;!this.p.parser.stateFlag(this.state,2);)if(!this.forceReduce()){this.storeNode(0,this.pos,this.pos,4,!0);break}return this}get deadEnd(){if(this.stack.length!=3)return!1;let{parser:e}=this.p;return e.data[e.stateSlot(this.state,1)]==65535&&!e.stateSlot(this.state,4)}restart(){this.storeNode(0,this.pos,this.pos,4,!0),this.state=this.stack[0],this.stack.length=0}sameState(e){if(this.state!=e.state||this.stack.length!=e.stack.length)return!1;for(let n=0;n<this.stack.length;n+=3)if(this.stack[n]!=e.stack[n])return!1;return!0}get parser(){return this.p.parser}dialectEnabled(e){return this.p.parser.dialect.flags[e]}shiftContext(e,n){this.curContext&&this.updateContext(this.curContext.tracker.shift(this.curContext.context,e,this,this.p.stream.reset(n)))}reduceContext(e,n){this.curContext&&this.updateContext(this.curContext.tracker.reduce(this.curContext.context,e,this,this.p.stream.reset(n)))}emitContext(){let e=this.buffer.length-1;(e<0||this.buffer[e]!=-3)&&this.storeNode(this.curContext.hash,this.reducePos,this.reducePos,-3,!0)}emitLookAhead(){let e=this.buffer.length-1;(e<0||this.buffer[e]!=-4)&&this.buffer.push(this.lookAhead,this.pos,this.pos,-4)}updateContext(e){if(e!=this.curContext.context){let n=new ed(this.curContext.tracker,e);n.hash!=this.curContext.hash&&this.emitContext(),this.curContext=n}}setLookAhead(e){return e<=this.lookAhead?!1:(this.emitLookAhead(),this.lookAhead=e,!0)}close(){this.curContext&&this.curContext.tracker.strict&&this.emitContext(),this.lookAhead>0&&this.emitLookAhead()}},ed=class{constructor(e,n){this.tracker=e,this.context=n,this.hash=e.strict?e.hash(n):0}},Pg=class{constructor(e){this.start=e,this.state=e.state,this.stack=e.stack,this.base=this.stack.length}reduce(e){let n=e&65535,r=e>>19;r==0?(this.stack==this.start.stack&&(this.stack=this.stack.slice()),this.stack.push(this.state,0,0),this.base+=3):this.base-=(r-1)*3;let o=this.start.p.parser.getGoto(this.stack[this.base-3],n,!0);this.state=o}},zg=class t{constructor(e,n,r){this.stack=e,this.pos=n,this.index=r,this.buffer=e.buffer,this.index==0&&this.maybeNext()}static create(e,n=e.bufferBase+e.buffer.length){return new t(e,n,n-e.bufferBase)}maybeNext(){let e=this.stack.parent;e!=null&&(this.index=this.stack.bufferBase-e.bufferBase,this.stack=e,this.buffer=e.buffer)}get id(){return this.buffer[this.index-4]}get start(){return this.buffer[this.index-3]}get end(){return this.buffer[this.index-2]}get size(){return this.buffer[this.index-1]}next(){this.index-=4,this.pos-=4,this.index==0&&this.maybeNext()}fork(){return new t(this.stack,this.pos,this.index)}};Qi=class{constructor(){this.start=-1,this.value=-1,this.end=-1,this.extended=-1,this.lookAhead=0,this.mask=0,this.context=0}},Kk=new Qi,Hg=class{constructor(e,n){this.input=e,this.ranges=n,this.chunk="",this.chunkOff=0,this.chunk2="",this.chunk2Pos=0,this.next=-1,this.token=Kk,this.rangeIndex=0,this.pos=this.chunkPos=n[0].from,this.range=n[0],this.end=n[n.length-1].to,this.readNext()}resolveOffset(e,n){let r=this.range,o=this.rangeIndex,a=this.pos+e;for(;a<r.from;){if(!o)return null;let i=this.ranges[--o];a-=r.from-i.to,r=i}for(;n<0?a>r.to:a>=r.to;){if(o==this.ranges.length-1)return null;let i=this.ranges[++o];a+=i.from-r.to,r=i}return a}clipPos(e){if(e>=this.range.from&&e<this.range.to)return e;for(let n of this.ranges)if(n.to>e)return Math.max(e,n.from);return this.end}peek(e){let n=this.chunkOff+e,r,o;if(n>=0&&n<this.chunk.length)r=this.pos+e,o=this.chunk.charCodeAt(n);else{let a=this.resolveOffset(e,1);if(a==null)return-1;if(r=a,r>=this.chunk2Pos&&r<this.chunk2Pos+this.chunk2.length)o=this.chunk2.charCodeAt(r-this.chunk2Pos);else{let i=this.rangeIndex,l=this.range;for(;l.to<=r;)l=this.ranges[++i];this.chunk2=this.input.chunk(this.chunk2Pos=r),r+this.chunk2.length>l.to&&(this.chunk2=this.chunk2.slice(0,l.to-r)),o=this.chunk2.charCodeAt(0)}}return r>=this.token.lookAhead&&(this.token.lookAhead=r+1),o}acceptToken(e,n=0){let r=n?this.resolveOffset(n,-1):this.pos;if(r==null||r<this.token.start)throw new RangeError("Token end out of bounds");this.token.value=e,this.token.end=r}acceptTokenTo(e,n){this.token.value=e,this.token.end=n}getChunk(){if(this.pos>=this.chunk2Pos&&this.pos<this.chunk2Pos+this.chunk2.length){let{chunk:e,chunkPos:n}=this;this.chunk=this.chunk2,this.chunkPos=this.chunk2Pos,this.chunk2=e,this.chunk2Pos=n,this.chunkOff=this.pos-this.chunkPos}else{this.chunk2=this.chunk,this.chunk2Pos=this.chunkPos;let e=this.input.chunk(this.pos),n=this.pos+e.length;this.chunk=n>this.range.to?e.slice(0,this.range.to-this.pos):e,this.chunkPos=this.pos,this.chunkOff=0}}readNext(){return this.chunkOff>=this.chunk.length&&(this.getChunk(),this.chunkOff==this.chunk.length)?this.next=-1:this.next=this.chunk.charCodeAt(this.chunkOff)}advance(e=1){for(this.chunkOff+=e;this.pos+e>=this.range.to;){if(this.rangeIndex==this.ranges.length-1)return this.setDone();e-=this.range.to-this.pos,this.range=this.ranges[++this.rangeIndex],this.pos=this.range.from}return this.pos+=e,this.pos>=this.token.lookAhead&&(this.token.lookAhead=this.pos+1),this.readNext()}setDone(){return this.pos=this.chunkPos=this.end,this.range=this.ranges[this.rangeIndex=this.ranges.length-1],this.chunk="",this.next=-1}reset(e,n){if(n?(this.token=n,n.start=e,n.lookAhead=e+1,n.value=n.extended=-1):this.token=Kk,this.pos!=e){if(this.pos=e,e==this.end)return this.setDone(),this;for(;e<this.range.from;)this.range=this.ranges[--this.rangeIndex];for(;e>=this.range.to;)this.range=this.ranges[++this.rangeIndex];e>=this.chunkPos&&e<this.chunkPos+this.chunk.length?this.chunkOff=e-this.chunkPos:(this.chunk="",this.chunkOff=0),this.readNext()}return this}read(e,n){if(e>=this.chunkPos&&n<=this.chunkPos+this.chunk.length)return this.chunk.slice(e-this.chunkPos,n-this.chunkPos);if(e>=this.chunk2Pos&&n<=this.chunk2Pos+this.chunk2.length)return this.chunk2.slice(e-this.chunk2Pos,n-this.chunk2Pos);if(e>=this.range.from&&n<=this.range.to)return this.input.read(e,n);let r="";for(let o of this.ranges){if(o.from>=n)break;o.to>e&&(r+=this.input.read(Math.max(o.from,e),Math.min(o.to,n)))}return r}},Io=class{constructor(e,n){this.data=e,this.id=n}token(e,n){let{parser:r}=n.p;eC(this.data,e,n,this.id,r.data,r.tokenPrecTable)}};Io.prototype.contextual=Io.prototype.fallback=Io.prototype.extend=!1;Ug=class{constructor(e,n,r){this.precTable=n,this.elseToken=r,this.data=typeof e=="string"?Js(e):e}token(e,n){let r=e.pos,o=0;for(;;){let a=e.next<0,i=e.resolveOffset(1,1);if(eC(this.data,e,n,0,this.data,this.precTable),e.token.value>-1)break;if(this.elseToken==null)return;if(a||o++,i==null)break;e.reset(i,e.token)}o&&(e.reset(r,e.token),e.acceptToken(this.elseToken,o))}};Ug.prototype.contextual=Io.prototype.fallback=Io.prototype.extend=!1;td=class{constructor(e,n={}){this.token=e,this.contextual=!!n.contextual,this.fallback=!!n.fallback,this.extend=!!n.extend}};Kt=typeof process<"u"&&process.env&&/\bparse\b/.test(process.env.LOG),_g=null;jg=class{constructor(e,n){this.fragments=e,this.minRepeat=n,this.i=0,this.fragment=null,this.safeFrom=-1,this.safeTo=-1,this.trees=[],this.start=[],this.index=[],this.lastRepeat=null,this.lastRepeatPos=-1,this.nextFragment()}nextFragment(){let e=this.fragment=this.i==this.fragments.length?null:this.fragments[this.i++];if(e){for(this.safeFrom=e.openStart?Jk(e.tree,e.from+e.offset,1)-e.offset:e.from,this.safeTo=e.openEnd?Jk(e.tree,e.to+e.offset,-1)-e.offset:e.to;this.trees.length;)this.trees.pop(),this.start.pop(),this.index.pop();this.trees.push(e.tree),this.start.push(-e.offset),this.index.push(0),this.nextStart=this.safeFrom}else this.nextStart=1e9}nodeAt(e){if(e<this.nextStart)return null;for(;this.fragment&&this.safeTo<=e;)this.nextFragment();if(!this.fragment)return null;for(;;){let n=this.trees.length-1;if(n<0)return this.nextFragment(),null;let r=this.trees[n],o=this.index[n];if(o==r.children.length){this.trees.pop(),this.start.pop(),this.index.pop();continue}let a=r.children[o],i=this.start[n]+r.positions[o];if(i>e)return this.nextStart=i,null;if(a instanceof Le){let l=i>this.lastRepeatPos&&a.type.id>=this.minRepeat;if(i==e||l){let s=i+a.length,f;if(i>=this.safeFrom&&s<=this.safeTo&&(!(f=a.prop(j.lookAhead))||s+f<this.fragment.to)){if(l&&(this.lastRepeat=a,this.lastRepeatPos=i),i==e)return a}else if(i==e)return null}this.index[n]++,i+a.length>=Math.max(this.safeFrom,e)&&(this.trees.push(a),this.start.push(i),this.index.push(0))}else this.index[n]++,this.nextStart=i+a.length}}},Vg=class{constructor(e,n){this.stream=n,this.tokens=[],this.mainToken=null,this.actions=[],this.tokens=e.tokenizers.map(r=>new Qi)}getActions(e){let n=0,r=null,{parser:o}=e.p,{tokenizers:a}=o,i=o.stateSlot(e.state,3),l=e.curContext?e.curContext.hash:0,s=0;for(let f=0;f<a.length;f++){if((1<<f&i)==0)continue;let c=a[f],u=this.tokens[f];if(!(r&&!c.fallback)&&((c.contextual||u.start!=e.pos||u.mask!=i||u.context!=l)&&(this.updateCachedToken(u,c,e),u.mask=i,u.context=l),u.lookAhead>u.end+25&&(s=Math.max(u.lookAhead,s)),u.value!=0)){let d=n;if(u.extended>-1&&(n=this.addActions(e,u.extended,u.end,n)),n=this.addActions(e,u.value,u.end,n),!c.extend&&(r=u,n>d))break}}for(;this.actions.length>n;)this.actions.pop();return s&&e.setLookAhead(s),!r&&e.pos==this.stream.end&&(r=new Qi,r.value=e.p.parser.eofTerm,r.start=r.end=e.pos,n=this.addActions(e,r.value,r.end,n)),this.mainToken=r,this.actions}getMainToken(e){if(this.mainToken)return this.mainToken;let n=new Qi,{pos:r,p:o}=e;return n.start=r,n.end=Math.min(r+1,o.stream.end),n.value=r==o.stream.end?o.parser.eofTerm:0,n}updateCachedToken(e,n,r){let o=this.stream.clipPos(r.pos);if(n.token(this.stream.reset(o,e),r),e.value>-1){let{parser:a}=r.p;for(let i=0;i<a.specialized.length;i++)if(a.specialized[i]==e.value){let l=a.specializers[i](this.stream.read(e.start,e.end),r);if(l>=0&&r.p.parser.dialect.allows(l>>1)){(l&1)==0?e.value=l>>1:e.extended=l>>1;break}}}else e.value=0,e.end=this.stream.clipPos(o+1)}putAction(e,n,r,o){for(let a=0;a<o;a+=3)if(this.actions[a]==e)return o;return this.actions[o++]=e,this.actions[o++]=n,this.actions[o++]=r,o}addActions(e,n,r,o){let{state:a}=e,{parser:i}=e.p,{data:l}=i;for(let s=0;s<2;s++)for(let f=i.stateSlot(a,s?2:1);;f+=3){if(l[f]==65535)if(l[f+1]==1)f=Tr(l,f+2);else{o==0&&l[f+1]==2&&(o=this.putAction(Tr(l,f+2),n,r,o));break}l[f]==n&&(o=this.putAction(Tr(l,f+1),n,r,o))}return o}},Gg=class{constructor(e,n,r,o){this.parser=e,this.input=n,this.ranges=o,this.recovering=0,this.nextStackID=9812,this.minStackPos=0,this.reused=[],this.stoppedAt=null,this.lastBigReductionStart=-1,this.lastBigReductionSize=0,this.bigReductionCount=0,this.stream=new Hg(n,o),this.tokens=new Vg(e,this.stream),this.topTerm=e.top[1];let{from:a}=o[0];this.stacks=[qg.start(this,e.top[0],a)],this.fragments=r.length&&this.stream.end-a>e.bufferLength*4?new jg(r,e.minRepeatTerm):null}get parsedPos(){return this.minStackPos}advance(){let e=this.stacks,n=this.minStackPos,r=this.stacks=[],o,a;if(this.bigReductionCount>300&&e.length==1){let[i]=e;for(;i.forceReduce()&&i.stack.length&&i.stack[i.stack.length-2]>=this.lastBigReductionStart;);this.bigReductionCount=this.lastBigReductionSize=0}for(let i=0;i<e.length;i++){let l=e[i];for(;;){if(this.tokens.mainToken=null,l.pos>n)r.push(l);else{if(this.advanceStack(l,r,e))continue;{o||(o=[],a=[]),o.push(l);let s=this.tokens.getMainToken(l);a.push(s.value,s.end)}}break}}if(!r.length){let i=o&&XE(o);if(i)return Kt&&console.log("Finish with "+this.stackID(i)),this.stackToTree(i);if(this.parser.strict)throw Kt&&o&&console.log("Stuck with token "+(this.tokens.mainToken?this.parser.getName(this.tokens.mainToken.value):"none")),new SyntaxError("No parse at "+n);this.recovering||(this.recovering=5)}if(this.recovering&&o){let i=this.stoppedAt!=null&&o[0].pos>this.stoppedAt?o[0]:this.runRecovery(o,a,r);if(i)return Kt&&console.log("Force-finish "+this.stackID(i)),this.stackToTree(i.forceAll())}if(this.recovering){let i=this.recovering==1?1:this.recovering*3;if(r.length>i)for(r.sort((l,s)=>s.score-l.score);r.length>i;)r.pop();r.some(l=>l.reducePos>n)&&this.recovering--}else if(r.length>1){e:for(let i=0;i<r.length-1;i++){let l=r[i];for(let s=i+1;s<r.length;s++){let f=r[s];if(l.sameState(f)||l.buffer.length>500&&f.buffer.length>500)if((l.score-f.score||l.buffer.length-f.buffer.length)>0)r.splice(s--,1);else{r.splice(i--,1);continue e}}}r.length>12&&(r.sort((i,l)=>l.score-i.score),r.splice(12,r.length-12))}this.minStackPos=r[0].pos;for(let i=1;i<r.length;i++)r[i].pos<this.minStackPos&&(this.minStackPos=r[i].pos);return null}stopAt(e){if(this.stoppedAt!=null&&this.stoppedAt<e)throw new RangeError("Can't move stoppedAt forward");this.stoppedAt=e}tryReuse(e,n,r,o){if(!r)return null;let a=e.curContext&&e.curContext.tracker.strict,i=a?e.curContext.hash:0;for(;r;){let l=this.parser.nodeSet.types[r.type.id]!=r.type?-1:this.parser.getGoto(e.state,r.type.id);if(l>-1&&r.length&&(!a||(r.prop(j.contextHash)||0)==i))return e.useNode(r,l,n),r;if(r.children.length==0||r.positions[0]>0)break;let s=r.children[0];if(s instanceof Le&&(!o||s.type.id>=this.parser.minRepeatTerm))r=s;else break}return null}advanceStack(e,n,r){let o=e.pos,{parser:a}=this,i=Kt?this.stackID(e)+" -> ":"";if(this.stoppedAt!=null&&o>this.stoppedAt)return e.forceReduce()?e:null;if(this.fragments){let f=e.reducePos<o&&e.buffer.length&&e.buffer[e.buffer.length-2]<=e.reducePos&&this.fragments.lastRepeatPos==e.reducePos&&this.tryReuse(e,e.reducePos,this.fragments.lastRepeat,!0)||this.tryReuse(e,o,this.fragments.nodeAt(o),!1);if(f)return Kt&&console.log(i+this.stackID(e)+` (via reuse of ${a.getName(f.type.id)})`),!0}let l=a.stateSlot(e.state,4);if(l>0)return e.reduce(l),Kt&&console.log(i+this.stackID(e)+` (via always-reduce ${a.getName(l&65535)})`),!0;if(e.stack.length>=8400)for(;e.stack.length>6e3&&e.forceReduce(););let s=this.tokens.getActions(e);for(let f=0;f<s.length;){let c=s[f++],u=s[f++],d=s[f++],p=f==s.length||!r,m=p?e:e.split(),x=this.tokens.mainToken;if(m.apply(c,u,x?x.start:m.pos,d),Kt&&console.log(i+this.stackID(m)+` (via ${(c&65536)==0?"shift":`reduce of ${a.getName(c&65535)}`} for ${a.getName(u)} @ ${o}${m==e?"":", split"})`),p)return!0;m.pos>o?n.push(m):r.push(m)}return!1}advanceFully(e,n){let r=e.pos;for(;;){if(!this.advanceStack(e,null,null))return!1;if(e.pos>r)return Zk(e,n),!0}}runRecovery(e,n,r){let o=null,a=!1;for(let i=0;i<e.length;i++){let l=e[i],s=n[i<<1],f=n[(i<<1)+1],c=Kt?this.stackID(l)+" -> ":"";if(l.deadEnd&&(a||(a=!0,l.restart(),Kt&&console.log(c+this.stackID(l)+" (restarted)"),this.advanceFully(l,r))))continue;let u=l.split(),d=c;for(let p=0;p<10&&u.forceReduce()&&(Kt&&console.log(d+this.stackID(u)+" (via force-reduce)"),!this.advanceFully(u,r));p++)Kt&&(d=this.stackID(u)+" -> ");for(let p of l.recoverByInsert(s))Kt&&console.log(c+this.stackID(p)+" (via recover-insert)"),this.advanceFully(p,r);this.stream.end>l.pos?(f==l.pos&&(f++,s=0),l.recoverByDelete(s,f),Kt&&console.log(c+this.stackID(l)+` (via recover-delete ${this.parser.getName(s)})`),Zk(l,r)):(!o||o.score<u.score)&&(o=u)}return o}stackToTree(e){return e.close(),Le.build({buffer:zg.create(e),nodeSet:this.parser.nodeSet,topID:this.topTerm,maxBufferLength:this.parser.bufferLength,reused:this.reused,start:this.ranges[0].from,length:e.pos-this.ranges[0].from,minRepeatType:this.parser.minRepeatTerm})}stackID(e){let n=(_g||(_g=new WeakMap)).get(e);return n||_g.set(e,n=String.fromCodePoint(this.nextStackID++)),n+e}};Wg=class{constructor(e,n,r){this.source=e,this.flags=n,this.disabled=r}allows(e){return!this.disabled||this.disabled[e]==0}},nd=class t extends wi{constructor(e){if(super(),this.wrappers=[],e.version!=14)throw new RangeError(`Parser version (${e.version}) doesn't match runtime version (14)`);let n=e.nodeNames.split(" ");this.minRepeatTerm=n.length;for(let l=0;l<e.repeatNodeCount;l++)n.push("");let r=Object.keys(e.topRules).map(l=>e.topRules[l][1]),o=[];for(let l=0;l<n.length;l++)o.push([]);function a(l,s,f){o[l].push([s,s.deserialize(String(f))])}if(e.nodeProps)for(let l of e.nodeProps){let s=l[0];typeof s=="string"&&(s=j[s]);for(let f=1;f<l.length;){let c=l[f++];if(c>=0)a(c,s,l[f++]);else{let u=l[f+-c];for(let d=-c;d>0;d--)a(l[f++],s,u);f++}}}this.nodeSet=new ys(n.map((l,s)=>at.define({name:s>=this.minRepeatTerm?void 0:l,id:s,props:o[s],top:r.indexOf(s)>-1,error:s==0,skipped:e.skippedNodes&&e.skippedNodes.indexOf(s)>-1}))),e.propSources&&(this.nodeSet=this.nodeSet.extend(...e.propSources)),this.strict=!1,this.bufferLength=1024;let i=Js(e.tokenData);this.context=e.context,this.specializerSpecs=e.specialized||[],this.specialized=new Uint16Array(this.specializerSpecs.length);for(let l=0;l<this.specializerSpecs.length;l++)this.specialized[l]=this.specializerSpecs[l].term;this.specializers=this.specializerSpecs.map($k),this.states=Js(e.states,Uint32Array),this.data=Js(e.stateData),this.goto=Js(e.goto),this.maxTerm=e.maxTerm,this.tokenizers=e.tokenizers.map(l=>typeof l=="number"?new Io(i,l):l),this.topRules=e.topRules,this.dialects=e.dialects||{},this.dynamicPrecedences=e.dynamicPrecedences||null,this.tokenPrecTable=e.tokenPrec,this.termNames=e.termNames||null,this.maxNode=this.nodeSet.types.length-1,this.dialect=this.parseDialect(),this.top=this.topRules[Object.keys(this.topRules)[0]]}createParse(e,n,r){let o=new Gg(this,e,n,r);for(let a of this.wrappers)o=a(o,e,n,r);return o}getGoto(e,n,r=!1){let o=this.goto;if(n>=o[0])return-1;for(let a=o[n+1];;){let i=o[a++],l=i&1,s=o[a++];if(l&&r)return s;for(let f=a+(i>>1);a<f;a++)if(o[a]==e)return s;if(l)return-1}}hasAction(e,n){let r=this.data;for(let o=0;o<2;o++)for(let a=this.stateSlot(e,o?2:1),i;;a+=3){if((i=r[a])==65535)if(r[a+1]==1)i=r[a=Tr(r,a+2)];else{if(r[a+1]==2)return Tr(r,a+2);break}if(i==n||i==0)return Tr(r,a+1)}return 0}stateSlot(e,n){return this.states[e*6+n]}stateFlag(e,n){return(this.stateSlot(e,0)&n)>0}validAction(e,n){return!!this.allActions(e,r=>r==n?!0:null)}allActions(e,n){let r=this.stateSlot(e,4),o=r?n(r):void 0;for(let a=this.stateSlot(e,1);o==null;a+=3){if(this.data[a]==65535)if(this.data[a+1]==1)a=Tr(this.data,a+2);else break;o=n(Tr(this.data,a+1))}return o}nextStates(e){let n=[];for(let r=this.stateSlot(e,1);;r+=3){if(this.data[r]==65535)if(this.data[r+1]==1)r=Tr(this.data,r+2);else break;if((this.data[r+2]&1)==0){let o=this.data[r+1];n.some((a,i)=>i&1&&a==o)||n.push(this.data[r],o)}}return n}configure(e){let n=Object.assign(Object.create(t.prototype),this);if(e.props&&(n.nodeSet=this.nodeSet.extend(...e.props)),e.top){let r=this.topRules[e.top];if(!r)throw new RangeError(`Invalid top rule name ${e.top}`);n.top=r}return e.tokenizers&&(n.tokenizers=this.tokenizers.map(r=>{let o=e.tokenizers.find(a=>a.from==r);return o?o.to:r})),e.specializers&&(n.specializers=this.specializers.slice(),n.specializerSpecs=this.specializerSpecs.map((r,o)=>{let a=e.specializers.find(l=>l.from==r.external);if(!a)return r;let i=Object.assign(Object.assign({},r),{external:a.to});return n.specializers[o]=$k(i),i})),e.contextTracker&&(n.context=e.contextTracker),e.dialect&&(n.dialect=this.parseDialect(e.dialect)),e.strict!=null&&(n.strict=e.strict),e.wrap&&(n.wrappers=n.wrappers.concat(e.wrap)),e.bufferLength!=null&&(n.bufferLength=e.bufferLength),n}hasWrappers(){return this.wrappers.length>0}getName(e){return this.termNames?this.termNames[e]:String(e<=this.maxNode&&this.nodeSet.types[e].name||e)}get eofTerm(){return this.maxNode+1}get topNode(){return this.nodeSet.types[this.top[1]]}dynamicPrecedence(e){let n=this.dynamicPrecedences;return n==null?0:n[e]||0}parseDialect(e){let n=Object.keys(this.dialects),r=n.map(()=>!1);if(e)for(let a of e.split(" ")){let i=n.indexOf(a);i>=0&&(r[i]=!0)}let o=null;for(let a=0;a<n.length;a++)if(!r[a])for(let i=this.dialects[n[a]],l;(l=this.data[i++])!=65535;)(o||(o=new Uint8Array(this.maxTerm+1)))[l]=1;return new Wg(e,r,o)}static deserialize(e){return new t(e)}}});function nC(t){let e=Object.keys(t).join(""),n=/\w/.test(e);return n&&(e=e.replace(/\w/g,"")),`[${n?"\\w":""}${e.replace(/[^\w\s]/g,"\\$&")}]`}function QE(t){let e=Object.create(null),n=Object.create(null);for(let{label:o}of t){e[o[0]]=!0;for(let a=1;a<o.length;a++)n[o[a]]=!0}let r=nC(e)+nC(n)+"*$";return[new RegExp("^"+r),new RegExp(r)]}function ty(t){let e=t.map(o=>typeof o=="string"?{label:o}:o),[n,r]=e.every(o=>/^\w+$/.test(o.label))?[/\w*$/,/\w+$/]:QE(e);return o=>{let a=o.matchBefore(r);return a||o.explicit?{from:a?a.from:o.pos,options:e,validFor:n}:null}}function lC(t,e){return n=>{for(let r=lt(n.state).resolveInner(n.pos,-1);r;r=r.parent){if(t.indexOf(r.name)>-1)return null;if(r.type.isTop)break}return e(n)}}function da(t){return t.selection.main.from}function sC(t,e){var n;let{source:r}=t,o=e&&r[0]!="^",a=r[r.length-1]!="$";return!o&&!a?t:new RegExp(`${o?"^":""}(?:${r})${a?"$":""}`,(n=t.flags)!==null&&n!==void 0?n:t.ignoreCase?"i":"")}function KE(t,e,n,r){let{main:o}=t.selection,a=n-o.from,i=r-o.from;return{...t.changeByRange(l=>{if(l!=o&&n!=r&&t.sliceDoc(l.from+a,l.from+i)!=t.sliceDoc(n,r))return{range:l};let s=t.toText(e);return{changes:{from:l.from+a,to:r==o.from?l.to:l.from+i,insert:s},range:O.cursor(l.from+a+s.length)}}),scrollIntoView:!0,userEvent:"input.complete"}}function YE(t){if(!Array.isArray(t))return t;let e=rC.get(t);return e||rC.set(t,e=ty(t)),e}function oC(t,e){return t?e?t+" "+e:t:e}function JE(t,e,n,r,o,a){let i=t.textDirection==pe.RTL,l=i,s=!1,f="top",c,u,d=e.left-o.left,p=o.right-e.right,m=r.right-r.left,x=r.bottom-r.top;if(l&&d<Math.min(m,p)?l=!1:!l&&p<Math.min(m,d)&&(l=!0),m<=(l?d:p))c=Math.max(o.top,Math.min(n.top,o.bottom-x))-e.top,u=Math.min(400,l?d:p);else{s=!0,u=Math.min(400,(i?e.right:o.right-e.left)-30);let y=o.bottom-e.bottom;y>=x||y>e.top?c=n.bottom-e.top:(f="bottom",c=e.bottom-n.top)}let b=(e.bottom-e.top)/a.offsetHeight,h=(e.right-e.left)/a.offsetWidth;return{style:`${f}: ${c/b}px; max-width: ${u/h}px`,class:"cm-completionInfo-"+(s?i?"left-narrow":"right-narrow":l?"left":"right")}}function ZE(t){let e=t.addToOptions.slice();return t.icons&&e.push({render(n){let r=document.createElement("div");return r.classList.add("cm-completionIcon"),n.type&&r.classList.add(...n.type.split(/\s+/g).map(o=>"cm-completionIcon-"+o)),r.setAttribute("aria-hidden","true"),r},position:20}),e.push({render(n,r,o,a){let i=document.createElement("span");i.className="cm-completionLabel";let l=n.displayLabel||n.label,s=0;for(let f=0;f<a.length;){let c=a[f++],u=a[f++];c>s&&i.appendChild(document.createTextNode(l.slice(s,c)));let d=i.appendChild(document.createElement("span"));d.appendChild(document.createTextNode(l.slice(c,u))),d.className="cm-completionMatchedText",s=u}return s<l.length&&i.appendChild(document.createTextNode(l.slice(s))),i},position:50},{render(n){if(!n.detail)return null;let r=document.createElement("span");return r.className="cm-completionDetail",r.textContent=n.detail,r},position:80}),e.sort((n,r)=>n.position-r.position).map(n=>n.render)}function Xg(t,e,n){if(t<=n)return{from:0,to:t};if(e<0&&(e=0),e<=t>>1){let o=Math.floor(e/n);return{from:o*n,to:(o+1)*n}}let r=Math.ceil((t-e)/n);return{from:t-r*n,to:t-(r-1)*n}}function $E(t,e){return n=>new Jg(n,t,e)}function eF(t,e){let n=t.getBoundingClientRect(),r=e.getBoundingClientRect(),o=n.height/t.offsetHeight;r.top<n.top?t.scrollTop-=(n.top-r.top)/o:r.bottom>n.bottom&&(t.scrollTop+=(r.bottom-n.bottom)/o)}function aC(t){return(t.boost||0)*100+(t.apply?10:0)+(t.info?5:0)+(t.type?1:0)}function tF(t,e){let n=[],r=null,o=null,a=c=>{n.push(c);let{section:u}=c.completion;if(u){r||(r=[]);let d=typeof u=="string"?u:u.name;r.some(p=>p.name==d)||r.push(typeof u=="string"?{name:d}:u)}},i=e.facet(Ye);for(let c of t)if(c.hasResult()){let u=c.result.getMatch;if(c.result.filter===!1)for(let d of c.result.options)a(new ad(d,c.source,u?u(d):[],1e9-n.length));else{let d=e.sliceDoc(c.from,c.to),p,m=i.filterStrict?new Yg(d):new Kg(d);for(let x of c.result.options)if(p=m.match(x.label)){let b=x.displayLabel?u?u(x,p.matched):[]:p.matched,h=p.score+(x.boost||0);if(a(new ad(x,c.source,b,h)),typeof x.section=="object"&&x.section.rank==="dynamic"){let{name:y}=x.section;o||(o=Object.create(null)),o[y]=Math.max(h,o[y]||-1e9)}}}}if(r){let c=Object.create(null),u=0,d=(p,m)=>(p.rank==="dynamic"&&m.rank==="dynamic"?o[m.name]-o[p.name]:0)||(typeof p.rank=="number"?p.rank:1e9)-(typeof m.rank=="number"?m.rank:1e9)||(p.name<m.name?-1:1);for(let p of r.sort(d))u-=1e5,c[p.name]=u;for(let p of n){let{section:m}=p.completion;m&&(p.score+=c[typeof m=="string"?m:m.name])}}let l=[],s=null,f=i.compareCompletions;for(let c of n.sort((u,d)=>d.score-u.score||f(u.completion,d.completion))){let u=c.completion;!s||s.label!=u.label||s.detail!=u.detail||s.type!=null&&u.type!=null&&s.type!=u.type||s.apply!=u.apply||s.boost!=u.boost?l.push(c):aC(c.completion)>aC(s)&&(l[l.length-1]=c),s=c.completion}return l}function nF(t,e){if(t==e)return!0;for(let n=0,r=0;;){for(;n<t.length&&!t[n].hasResult();)n++;for(;r<e.length&&!e[r].hasResult();)r++;let o=n==t.length,a=r==e.length;if(o||a)return o==a;if(t[n++].result!=e[r++].result)return!1}}function iC(t,e){let n={"aria-autocomplete":"list","aria-haspopup":"listbox","aria-controls":t};return e>-1&&(n["aria-activedescendant"]=t+"-"+e),n}function cC(t,e){if(t.isUserEvent("input.complete")){let r=t.annotation(fC);if(r&&e.activateOnCompletion(r))return 12}let n=t.isUserEvent("input.type");return n&&e.activateOnTyping?5:n?1:t.isUserEvent("delete.backward")?2:t.selection?8:t.docChanged?16:0}function iF(t,e,n,r){if(!t)return!1;let o=e.sliceDoc(n,r);return typeof t=="function"?t(o,n,r,e):sC(t,!0).test(o)}function oy(t,e){let n=e.completion.apply||e.completion.label,r=t.state.field(Mt).active.find(o=>o.source==e.source);return r instanceof ld?(typeof n=="string"?t.dispatch({...KE(t.state,n,r.from,r.to),annotations:fC.of(e.completion)}):n(t,e.completion,r.from,r.to),!0):!1}function rd(t,e="option"){return n=>{let r=n.state.field(Mt,!1);if(!r||!r.open||r.open.disabled||Date.now()-r.open.timestamp<n.state.facet(Ye).interactionDelay)return!1;let o=1,a;e=="page"&&(a=yg(n,r.open.tooltip))&&(o=Math.max(2,Math.floor(a.dom.offsetHeight/a.dom.querySelector("li").offsetHeight)-1));let{length:i}=r.open.options,l=r.open.selected>-1?r.open.selected+o*(t?1:-1):t?0:i-1;return l<0?l=e=="page"?0:i-1:l>=i&&(l=e=="page"?i-1:0),n.dispatch({effects:ny.of(l)}),!0}}function dC(t={}){return[mF,Mt,Ye.of(t),dF,xF,hF]}var od,ad,fC,rC,id,Zs,Kg,Yg,Ye,ny,Jg,Zg,$g,rF,oF,aF,Or,ld,ry,Mt,lF,sF,Qg,fF,ey,cF,uF,dF,pF,mF,hF,uC,m8,ay,xF,iy=F(()=>{Bi();js();Ys();od=class{constructor(e,n,r,o){this.state=e,this.pos=n,this.explicit=r,this.view=o,this.abortListeners=[],this.abortOnDocChange=!1}tokenBefore(e){let n=lt(this.state).resolveInner(this.pos,-1);for(;n&&e.indexOf(n.name)<0;)n=n.parent;return n?{from:n.from,to:this.pos,text:this.state.sliceDoc(n.from,this.pos),type:n.type}:null}matchBefore(e){let n=this.state.doc.lineAt(this.pos),r=Math.max(n.from,this.pos-250),o=n.text.slice(r-n.from,this.pos-n.from),a=o.search(sC(e,!1));return a<0?null:{from:r+a,to:this.pos,text:o.slice(a)}}get aborted(){return this.abortListeners==null}addEventListener(e,n,r){e=="abort"&&this.abortListeners&&(this.abortListeners.push(n),r&&r.onDocChange&&(this.abortOnDocChange=!0))}};ad=class{constructor(e,n,r,o){this.completion=e,this.source=n,this.match=r,this.score=o}};fC=Ot.define();rC=new WeakMap;id=oe.define(),Zs=oe.define(),Kg=class{constructor(e){this.pattern=e,this.chars=[],this.folded=[],this.any=[],this.precise=[],this.byWord=[],this.score=0,this.matched=[];for(let n=0;n<e.length;){let r=wr(e,n),o=co(r);this.chars.push(r);let a=e.slice(n,n+o),i=a.toUpperCase();this.folded.push(wr(i==a?a.toLowerCase():i,0)),n+=o}this.astral=e.length!=this.chars.length}ret(e,n){return this.score=e,this.matched=n,this}match(e){if(this.pattern.length==0)return this.ret(-100,[]);if(e.length<this.pattern.length)return null;let{chars:n,folded:r,any:o,precise:a,byWord:i}=this;if(n.length==1){let y=wr(e,0),g=co(y),I=g==e.length?0:-100;if(y!=n[0])if(y==r[0])I+=-200;else return null;return this.ret(I,[0,g])}let l=e.indexOf(this.pattern);if(l==0)return this.ret(e.length==this.pattern.length?0:-100,[0,this.pattern.length]);let s=n.length,f=0;if(l<0){for(let y=0,g=Math.min(e.length,200);y<g&&f<s;){let I=wr(e,y);(I==n[f]||I==r[f])&&(o[f++]=y),y+=co(I)}if(f<s)return null}let c=0,u=0,d=!1,p=0,m=-1,x=-1,b=/[a-z]/.test(e),h=!0;for(let y=0,g=Math.min(e.length,200),I=0;y<g&&u<s;){let v=wr(e,y);l<0&&(c<s&&v==n[c]&&(a[c++]=y),p<s&&(v==n[p]||v==r[p]?(p==0&&(m=y),x=y+1,p++):p=0));let S,w=v<255?v>=48&&v<=57||v>=97&&v<=122?2:v>=65&&v<=90?1:0:(S=_w(v))!=S.toLowerCase()?1:S!=S.toUpperCase()?2:0;(!y||w==1&&b||I==0&&w!=0)&&(n[u]==v||r[u]==v&&(d=!0)?i[u++]=y:i.length&&(h=!1)),I=w,y+=co(v)}return u==s&&i[0]==0&&h?this.result(-100+(d?-200:0),i,e):p==s&&m==0?this.ret(-200-e.length+(x==e.length?0:-100),[0,x]):l>-1?this.ret(-700-e.length,[l,l+this.pattern.length]):p==s?this.ret(-900-e.length,[m,x]):u==s?this.result(-100+(d?-200:0)+-700+(h?0:-1100),i,e):n.length==2?null:this.result((o[0]?-700:0)+-200+-1100,o,e)}result(e,n,r){let o=[],a=0;for(let i of n){let l=i+(this.astral?co(wr(r,i)):1);a&&o[a-1]==i?o[a-1]=l:(o[a++]=i,o[a++]=l)}return this.ret(e-r.length,o)}},Yg=class{constructor(e){this.pattern=e,this.matched=[],this.score=0,this.folded=e.toLowerCase()}match(e){if(e.length<this.pattern.length)return null;let n=e.slice(0,this.pattern.length),r=n==this.pattern?0:n.toLowerCase()==this.folded?-200:null;return r==null?null:(this.matched=[0,n.length],this.score=r+(e.length==this.pattern.length?0:-100),this)}},Ye=N.define({combine(t){return uo(t,{activateOnTyping:!0,activateOnCompletion:()=>!1,activateOnTypingDelay:100,selectOnOpen:!0,override:null,closeOnBlur:!0,maxRenderedOptions:100,defaultKeymap:!0,tooltipClass:()=>"",optionClass:()=>"",aboveCursor:!1,icons:!0,addToOptions:[],positionInfo:JE,filterStrict:!1,compareCompletions:(e,n)=>(e.sortText||e.label).localeCompare(n.sortText||n.label),interactionDelay:75,updateSyncTime:100},{defaultKeymap:(e,n)=>e&&n,closeOnBlur:(e,n)=>e&&n,icons:(e,n)=>e&&n,tooltipClass:(e,n)=>r=>oC(e(r),n(r)),optionClass:(e,n)=>r=>oC(e(r),n(r)),addToOptions:(e,n)=>e.concat(n),filterStrict:(e,n)=>e||n})}});ny=oe.define();Jg=class{constructor(e,n,r){this.view=e,this.stateField=n,this.applyCompletion=r,this.info=null,this.infoDestroy=null,this.placeInfoReq={read:()=>this.measureInfo(),write:s=>this.placeInfo(s),key:this},this.space=null,this.currentClass="";let o=e.state.field(n),{options:a,selected:i}=o.open,l=e.state.facet(Ye);this.optionContent=ZE(l),this.optionClass=l.optionClass,this.tooltipClass=l.tooltipClass,this.range=Xg(a.length,i,l.maxRenderedOptions),this.dom=document.createElement("div"),this.dom.className="cm-tooltip-autocomplete",this.updateTooltipClass(e.state),this.dom.addEventListener("mousedown",s=>{let{options:f}=e.state.field(n).open;for(let c=s.target,u;c&&c!=this.dom;c=c.parentNode)if(c.nodeName=="LI"&&(u=/-(\d+)$/.exec(c.id))&&+u[1]<f.length){this.applyCompletion(e,f[+u[1]]),s.preventDefault();return}if(s.target==this.list){let c=this.list.classList.contains("cm-completionListIncompleteTop")&&s.clientY<this.list.firstChild.getBoundingClientRect().top?this.range.from-1:this.list.classList.contains("cm-completionListIncompleteBottom")&&s.clientY>this.list.lastChild.getBoundingClientRect().bottom?this.range.to:null;c!=null&&(e.dispatch({effects:ny.of(c)}),s.preventDefault())}}),this.dom.addEventListener("focusout",s=>{let f=e.state.field(this.stateField,!1);f&&f.tooltip&&e.state.facet(Ye).closeOnBlur&&s.relatedTarget!=e.contentDOM&&e.dispatch({effects:Zs.of(null)})}),this.showOptions(a,o.id)}mount(){this.updateSel()}showOptions(e,n){this.list&&this.list.remove(),this.list=this.dom.appendChild(this.createListBox(e,n,this.range)),this.list.addEventListener("scroll",()=>{this.info&&this.view.requestMeasure(this.placeInfoReq)})}update(e){var n;let r=e.state.field(this.stateField),o=e.startState.field(this.stateField);if(this.updateTooltipClass(e.state),r!=o){let{options:a,selected:i,disabled:l}=r.open;(!o.open||o.open.options!=a)&&(this.range=Xg(a.length,i,e.state.facet(Ye).maxRenderedOptions),this.showOptions(a,r.id)),this.updateSel(),l!=((n=o.open)===null||n===void 0?void 0:n.disabled)&&this.dom.classList.toggle("cm-tooltip-autocomplete-disabled",!!l)}}updateTooltipClass(e){let n=this.tooltipClass(e);if(n!=this.currentClass){for(let r of this.currentClass.split(" "))r&&this.dom.classList.remove(r);for(let r of n.split(" "))r&&this.dom.classList.add(r);this.currentClass=n}}positioned(e){this.space=e,this.info&&this.view.requestMeasure(this.placeInfoReq)}updateSel(){let e=this.view.state.field(this.stateField),n=e.open;(n.selected>-1&&n.selected<this.range.from||n.selected>=this.range.to)&&(this.range=Xg(n.options.length,n.selected,this.view.state.facet(Ye).maxRenderedOptions),this.showOptions(n.options,e.id));let r=this.updateSelectedOption(n.selected);if(r){this.destroyInfo();let{completion:o}=n.options[n.selected],{info:a}=o;if(!a)return;let i=typeof a=="string"?document.createTextNode(a):a(o);if(!i)return;"then"in i?i.then(l=>{l&&this.view.state.field(this.stateField,!1)==e&&this.addInfoPane(l,o)}).catch(l=>yt(this.view.state,l,"completion info")):(this.addInfoPane(i,o),r.setAttribute("aria-describedby",this.info.id))}}addInfoPane(e,n){this.destroyInfo();let r=this.info=document.createElement("div");if(r.className="cm-tooltip cm-completionInfo",r.id="cm-completionInfo-"+Math.floor(Math.random()*65535).toString(16),e.nodeType!=null)r.appendChild(e),this.infoDestroy=null;else{let{dom:o,destroy:a}=e;r.appendChild(o),this.infoDestroy=a||null}this.dom.appendChild(r),this.view.requestMeasure(this.placeInfoReq)}updateSelectedOption(e){let n=null;for(let r=this.list.firstChild,o=this.range.from;r;r=r.nextSibling,o++)r.nodeName!="LI"||!r.id?o--:o==e?r.hasAttribute("aria-selected")||(r.setAttribute("aria-selected","true"),n=r):r.hasAttribute("aria-selected")&&(r.removeAttribute("aria-selected"),r.removeAttribute("aria-describedby"));return n&&eF(this.list,n),n}measureInfo(){let e=this.dom.querySelector("[aria-selected]");if(!e||!this.info)return null;let n=this.dom.getBoundingClientRect(),r=this.info.getBoundingClientRect(),o=e.getBoundingClientRect(),a=this.space;if(!a){let i=this.dom.ownerDocument.documentElement;a={left:0,top:0,right:i.clientWidth,bottom:i.clientHeight}}return o.top>Math.min(a.bottom,n.bottom)-10||o.bottom<Math.max(a.top,n.top)+10?null:this.view.state.facet(Ye).positionInfo(this.view,n,o,r,a,this.dom)}placeInfo(e){this.info&&(e?(e.style&&(this.info.style.cssText=e.style),this.info.className="cm-tooltip cm-completionInfo "+(e.class||"")):this.info.style.cssText="top: -1e6px")}createListBox(e,n,r){let o=document.createElement("ul");o.id=n,o.setAttribute("role","listbox"),o.setAttribute("aria-expanded","true"),o.setAttribute("aria-label",this.view.state.phrase("Completions")),o.addEventListener("mousedown",i=>{i.target==o&&i.preventDefault()});let a=null;for(let i=r.from;i<r.to;i++){let{completion:l,match:s}=e[i],{section:f}=l;if(f){let d=typeof f=="string"?f:f.name;if(d!=a&&(i>r.from||r.from==0))if(a=d,typeof f!="string"&&f.header)o.appendChild(f.header(f));else{let p=o.appendChild(document.createElement("completion-section"));p.textContent=d}}let c=o.appendChild(document.createElement("li"));c.id=n+"-"+i,c.setAttribute("role","option");let u=this.optionClass(l);u&&(c.className=u);for(let d of this.optionContent){let p=d(l,this.view.state,this.view,s);p&&c.appendChild(p)}}return r.from&&o.classList.add("cm-completionListIncompleteTop"),r.to<e.length&&o.classList.add("cm-completionListIncompleteBottom"),o}destroyInfo(){this.info&&(this.infoDestroy&&this.infoDestroy(),this.info.remove(),this.info=null)}destroy(){this.destroyInfo()}};Zg=class t{constructor(e,n,r,o,a,i){this.options=e,this.attrs=n,this.tooltip=r,this.timestamp=o,this.selected=a,this.disabled=i}setSelected(e,n){return e==this.selected||e>=this.options.length?this:new t(this.options,iC(n,e),this.tooltip,this.timestamp,e,this.disabled)}static build(e,n,r,o,a,i){if(o&&!i&&e.some(f=>f.isPending))return o.setDisabled();let l=tF(e,n);if(!l.length)return o&&e.some(f=>f.isPending)?o.setDisabled():null;let s=n.facet(Ye).selectOnOpen?0:-1;if(o&&o.selected!=s&&o.selected!=-1){let f=o.options[o.selected].completion;for(let c=0;c<l.length;c++)if(l[c].completion==f){s=c;break}}return new t(l,iC(r,s),{pos:e.reduce((f,c)=>c.hasResult()?Math.min(f,c.from):f,1e8),create:lF,above:a.aboveCursor},o?o.timestamp:Date.now(),s,!1)}map(e){return new t(this.options,this.attrs,{...this.tooltip,pos:e.mapPos(this.tooltip.pos)},this.timestamp,this.selected,this.disabled)}setDisabled(){return new t(this.options,this.attrs,this.tooltip,this.timestamp,this.selected,!0)}},$g=class t{constructor(e,n,r){this.active=e,this.id=n,this.open=r}static start(){return new t(aF,"cm-ac-"+Math.floor(Math.random()*2e6).toString(36),null)}update(e){let{state:n}=e,r=n.facet(Ye),a=(r.override||n.languageDataAt("autocomplete",da(n)).map(YE)).map(s=>(this.active.find(c=>c.source==s)||new Or(s,this.active.some(c=>c.state!=0)?1:0)).update(e,r));a.length==this.active.length&&a.every((s,f)=>s==this.active[f])&&(a=this.active);let i=this.open,l=e.effects.some(s=>s.is(ry));i&&e.docChanged&&(i=i.map(e.changes)),e.selection||a.some(s=>s.hasResult()&&e.changes.touchesRange(s.from,s.to))||!nF(a,this.active)||l?i=Zg.build(a,n,this.id,i,r,l):i&&i.disabled&&!a.some(s=>s.isPending)&&(i=null),!i&&a.every(s=>!s.isPending)&&a.some(s=>s.hasResult())&&(a=a.map(s=>s.hasResult()?new Or(s.source,0):s));for(let s of e.effects)s.is(ny)&&(i=i&&i.setSelected(s.value,this.id));return a==this.active&&i==this.open?this:new t(a,this.id,i)}get tooltip(){return this.open?this.open.tooltip:null}get attrs(){return this.open?this.open.attrs:this.active.length?rF:oF}};rF={"aria-autocomplete":"list"},oF={};aF=[];Or=class t{constructor(e,n,r=!1){this.source=e,this.state=n,this.explicit=r}hasResult(){return!1}get isPending(){return this.state==1}update(e,n){let r=cC(e,n),o=this;(r&8||r&16&&this.touches(e))&&(o=new t(o.source,0)),r&4&&o.state==0&&(o=new t(this.source,1)),o=o.updateFor(e,r);for(let a of e.effects)if(a.is(id))o=new t(o.source,1,a.value);else if(a.is(Zs))o=new t(o.source,0);else if(a.is(ry))for(let i of a.value)i.source==o.source&&(o=i);return o}updateFor(e,n){return this.map(e.changes)}map(e){return this}touches(e){return e.changes.touchesRange(da(e.state))}},ld=class t extends Or{constructor(e,n,r,o,a,i){super(e,3,n),this.limit=r,this.result=o,this.from=a,this.to=i}hasResult(){return!0}updateFor(e,n){var r;if(!(n&3))return this.map(e.changes);let o=this.result;o.map&&!e.changes.empty&&(o=o.map(o,e.changes));let a=e.changes.mapPos(this.from),i=e.changes.mapPos(this.to,1),l=da(e.state);if(l>i||!o||n&2&&(da(e.startState)==this.from||l<this.limit))return new Or(this.source,n&4?1:0);let s=e.changes.mapPos(this.limit);return iF(o.validFor,e.state,a,i)?new t(this.source,this.explicit,s,o,a,i):o.update&&(o=o.update(o,a,i,new od(e.state,l,!1)))?new t(this.source,this.explicit,s,o,o.from,(r=o.to)!==null&&r!==void 0?r:da(e.state)):new Or(this.source,1,this.explicit)}map(e){if(e.empty)return this;let n=this.result.map?this.result.map(this.result,e):this.result;return n?new t(this.source,this.explicit,e.mapPos(this.limit),n,e.mapPos(this.from),e.mapPos(this.to,1)):new Or(this.source,0)}touches(e){return e.changes.touchesRange(this.from,this.to)}};ry=oe.define({map(t,e){return t.map(n=>n.map(e))}}),Mt=xt.define({create(){return $g.start()},update(t,e){return t.update(e)},provide:t=>[gg.from(t,e=>e.tooltip),q.contentAttributes.from(t,e=>e.attrs)]});lF=$E(Mt,oy);sF=t=>{let e=t.state.field(Mt,!1);return t.state.readOnly||!e||!e.open||e.open.selected<0||e.open.disabled||Date.now()-e.open.timestamp<t.state.facet(Ye).interactionDelay?!1:oy(t,e.open.options[e.open.selected])},Qg=t=>t.state.field(Mt,!1)?(t.dispatch({effects:id.of(!0)}),!0):!1,fF=t=>{let e=t.state.field(Mt,!1);return!e||!e.active.some(n=>n.state!=0)?!1:(t.dispatch({effects:Zs.of(null)}),!0)},ey=class{constructor(e,n){this.active=e,this.context=n,this.time=Date.now(),this.updates=[],this.done=void 0}},cF=50,uF=1e3,dF=Xt.fromClass(class{constructor(t){this.view=t,this.debounceUpdate=-1,this.running=[],this.debounceAccept=-1,this.pendingStart=!1,this.composing=0;for(let e of t.state.field(Mt).active)e.isPending&&this.startQuery(e)}update(t){let e=t.state.field(Mt),n=t.state.facet(Ye);if(!t.selectionSet&&!t.docChanged&&t.startState.field(Mt)==e)return;let r=t.transactions.some(a=>{let i=cC(a,n);return i&8||(a.selection||a.docChanged)&&!(i&3)});for(let a=0;a<this.running.length;a++){let i=this.running[a];if(r||i.context.abortOnDocChange&&t.docChanged||i.updates.length+t.transactions.length>cF&&Date.now()-i.time>uF){for(let l of i.context.abortListeners)try{l()}catch(s){yt(this.view.state,s)}i.context.abortListeners=null,this.running.splice(a--,1)}else i.updates.push(...t.transactions)}this.debounceUpdate>-1&&clearTimeout(this.debounceUpdate),t.transactions.some(a=>a.effects.some(i=>i.is(id)))&&(this.pendingStart=!0);let o=this.pendingStart?50:n.activateOnTypingDelay;if(this.debounceUpdate=e.active.some(a=>a.isPending&&!this.running.some(i=>i.active.source==a.source))?setTimeout(()=>this.startUpdate(),o):-1,this.composing!=0)for(let a of t.transactions)a.isUserEvent("input.type")?this.composing=2:this.composing==2&&a.selection&&(this.composing=3)}startUpdate(){this.debounceUpdate=-1,this.pendingStart=!1;let{state:t}=this.view,e=t.field(Mt);for(let n of e.active)n.isPending&&!this.running.some(r=>r.active.source==n.source)&&this.startQuery(n);this.running.length&&e.open&&e.open.disabled&&(this.debounceAccept=setTimeout(()=>this.accept(),this.view.state.facet(Ye).updateSyncTime))}startQuery(t){let{state:e}=this.view,n=da(e),r=new od(e,n,t.explicit,this.view),o=new ey(t,r);this.running.push(o),Promise.resolve(t.source(r)).then(a=>{o.context.aborted||(o.done=a||null,this.scheduleAccept())},a=>{this.view.dispatch({effects:Zs.of(null)}),yt(this.view.state,a)})}scheduleAccept(){this.running.every(t=>t.done!==void 0)?this.accept():this.debounceAccept<0&&(this.debounceAccept=setTimeout(()=>this.accept(),this.view.state.facet(Ye).updateSyncTime))}accept(){var t;this.debounceAccept>-1&&clearTimeout(this.debounceAccept),this.debounceAccept=-1;let e=[],n=this.view.state.facet(Ye),r=this.view.state.field(Mt);for(let o=0;o<this.running.length;o++){let a=this.running[o];if(a.done===void 0)continue;if(this.running.splice(o--,1),a.done){let l=da(a.updates.length?a.updates[0].startState:this.view.state),s=Math.min(l,a.done.from+(a.active.explicit?0:1)),f=new ld(a.active.source,a.active.explicit,s,a.done,a.done.from,(t=a.done.to)!==null&&t!==void 0?t:l);for(let c of a.updates)f=f.update(c,n);if(f.hasResult()){e.push(f);continue}}let i=r.active.find(l=>l.source==a.active.source);if(i&&i.isPending)if(a.done==null){let l=new Or(a.active.source,0);for(let s of a.updates)l=l.update(s,n);l.isPending||e.push(l)}else this.startQuery(i)}(e.length||r.open&&r.open.disabled)&&this.view.dispatch({effects:ry.of(e)})}},{eventHandlers:{blur(t){let e=this.view.state.field(Mt,!1);if(e&&e.tooltip&&this.view.state.facet(Ye).closeOnBlur){let n=e.open&&yg(this.view,e.open.tooltip);(!n||!n.dom.contains(t.relatedTarget))&&setTimeout(()=>this.view.dispatch({effects:Zs.of(null)}),10)}},compositionstart(){this.composing=1},compositionend(){this.composing==3&&setTimeout(()=>this.view.dispatch({effects:id.of(!1)}),20),this.composing=0}}}),pF=typeof navigator=="object"&&/Win/.test(navigator.platform),mF=kn.highest(q.domEventHandlers({keydown(t,e){let n=e.state.field(Mt,!1);if(!n||!n.open||n.open.disabled||n.open.selected<0||!t.key||t.key.length>1||t.ctrlKey&&!(pF&&t.altKey)||t.metaKey)return!1;let r=n.open.options[n.open.selected],o=n.active.find(i=>i.source==r.source),a=r.completion.commitCharacters||o.result.commitCharacters;return a&&a.indexOf(t.key)>-1&&oy(e,r),!1}})),hF=q.baseTheme({".cm-tooltip.cm-tooltip-autocomplete":{"& > ul":{fontFamily:"monospace",whiteSpace:"nowrap",overflow:"hidden auto",maxWidth_fallback:"700px",maxWidth:"min(700px, 95vw)",minWidth:"250px",maxHeight:"10em",height:"100%",listStyle:"none",margin:0,padding:0,"& > li, & > completion-section":{padding:"1px 3px",lineHeight:1.2},"& > li":{overflowX:"hidden",textOverflow:"ellipsis",cursor:"pointer"},"& > completion-section":{display:"list-item",borderBottom:"1px solid silver",paddingLeft:"0.5em",opacity:.7}}},"&light .cm-tooltip-autocomplete ul li[aria-selected]":{background:"#17c",color:"white"},"&light .cm-tooltip-autocomplete-disabled ul li[aria-selected]":{background:"#777"},"&dark .cm-tooltip-autocomplete ul li[aria-selected]":{background:"#347",color:"white"},"&dark .cm-tooltip-autocomplete-disabled ul li[aria-selected]":{background:"#444"},".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after":{content:'"\xB7\xB7\xB7"',opacity:.5,display:"block",textAlign:"center",cursor:"pointer"},".cm-tooltip.cm-completionInfo":{position:"absolute",padding:"3px 9px",width:"max-content",maxWidth:"400px",boxSizing:"border-box",whiteSpace:"pre-line"},".cm-completionInfo.cm-completionInfo-left":{right:"100%"},".cm-completionInfo.cm-completionInfo-right":{left:"100%"},".cm-completionInfo.cm-completionInfo-left-narrow":{right:"30px"},".cm-completionInfo.cm-completionInfo-right-narrow":{left:"30px"},"&light .cm-snippetField":{backgroundColor:"#00000022"},"&dark .cm-snippetField":{backgroundColor:"#ffffff22"},".cm-snippetFieldPosition":{verticalAlign:"text-top",width:0,height:"1.15em",display:"inline-block",margin:"0 -0.7px -.7em",borderLeft:"1.4px dotted #888"},".cm-completionMatchedText":{textDecoration:"underline"},".cm-completionDetail":{marginLeft:"0.5em",fontStyle:"italic"},".cm-completionIcon":{fontSize:"90%",width:".8em",display:"inline-block",textAlign:"center",paddingRight:".6em",opacity:"0.6",boxSizing:"content-box"},".cm-completionIcon-function, .cm-completionIcon-method":{"&:after":{content:"'\u0192'"}},".cm-completionIcon-class":{"&:after":{content:"'\u25CB'"}},".cm-completionIcon-interface":{"&:after":{content:"'\u25CC'"}},".cm-completionIcon-variable":{"&:after":{content:"'\u{1D465}'"}},".cm-completionIcon-constant":{"&:after":{content:"'\u{1D436}'"}},".cm-completionIcon-type":{"&:after":{content:"'\u{1D461}'"}},".cm-completionIcon-enum":{"&:after":{content:"'\u222A'"}},".cm-completionIcon-property":{"&:after":{content:"'\u25A1'"}},".cm-completionIcon-keyword":{"&:after":{content:"'\u{1F511}\uFE0E'"}},".cm-completionIcon-namespace":{"&:after":{content:"'\u25A2'"}},".cm-completionIcon-text":{"&:after":{content:"'abc'",fontSize:"50%",verticalAlign:"middle"}}}),uC=new class extends un{};uC.startSide=1;uC.endSide=-1;m8=typeof navigator=="object"&&/Android\b/.test(navigator.userAgent);ay=[{key:"Ctrl-Space",run:Qg},{mac:"Alt-`",run:Qg},{mac:"Alt-i",run:Qg},{key:"Escape",run:fF},{key:"ArrowDown",run:rd(!0)},{key:"ArrowUp",run:rd(!1)},{key:"PageDown",run:rd(!0,"page")},{key:"PageUp",run:rd(!1,"page")},{key:"Enter",run:sF}],xF=kn.highest(Vi.computeN([Ye],t=>t.facet(Ye).defaultKeymap?[ay]:[]))});function fy(t){return t>=65&&t<=90||t>=97&&t<=122||t>=48&&t<=57}function LF(t){return t>=48&&t<=57||t>=97&&t<=102||t>=65&&t<=70}function ma(t,e,n){for(let r=!1;;){if(t.next<0)return;if(t.next==e&&!r){t.advance();return}r=n&&!r&&t.next==92,t.advance()}}function NF(t,e){e:for(;;){if(t.next<0)return;if(t.next==36){t.advance();for(let n=0;n<e.length;n++){if(t.next!=e.charCodeAt(n))continue e;t.advance()}if(t.next==36){t.advance();return}}else t.advance()}}function _F(t,e){let n="[{<(".indexOf(String.fromCharCode(e)),r=n<0?e:"]}>)".charCodeAt(n);for(;;){if(t.next<0)return;if(t.next==r&&t.peek(1)==39){t.advance(2);return}t.advance()}}function cy(t,e){for(;!(t.next!=95&&!fy(t.next));)e!=null&&(e+=String.fromCharCode(t.next)),t.advance();return e}function qF(t){if(t.next==39||t.next==34||t.next==96){let e=t.next;t.advance(),ma(t,e,!1)}else cy(t)}function xC(t,e){for(;t.next==48||t.next==49;)t.advance();e&&t.next==e&&t.advance()}function gC(t,e){for(;;){if(t.next==46){if(e)break;e=!0}else if(t.next<48||t.next>57)break;t.advance()}if(t.next==69||t.next==101)for(t.advance(),(t.next==43||t.next==45)&&t.advance();t.next>=48&&t.next<=57;)t.advance()}function yC(t){for(;!(t.next<0||t.next==10);)t.advance()}function pa(t,e){for(let n=0;n<e.length;n++)if(e.charCodeAt(n)==t)return!0;return!1}function kC(t,e,n){let r=Object.create(null);r.true=r.false=bF,r.null=r.unknown=IF;for(let o of t.split(" "))o&&(r[o]=wC);for(let o of e.split(" "))o&&(r[o]=SC);for(let o of(n||"").split(" "))o&&(r[o]=FF);return r}function PF(t,e,n,r){let o={};for(let a in uy)o[a]=(t.hasOwnProperty(a)?t:uy)[a];return e&&(o.words=kC(e,n||"",r)),o}function CC(t){return new td(e=>{var n;let{next:r}=e;if(e.advance(),pa(r,sy)){for(;pa(e.next,sy);)e.advance();e.acceptToken(gF)}else if(r==36&&t.doubleDollarQuotedStrings){let o=cy(e,"");e.next==36&&(e.advance(),NF(e,o),e.acceptToken(Ki))}else if(r==39||r==34&&t.doubleQuotedStrings)ma(e,r,t.backslashEscapes),e.acceptToken(Ki);else if(r==35&&t.hashComments||r==47&&e.next==47&&t.slashComments)yC(e),e.acceptToken(pC);else if(r==45&&e.next==45&&(!t.spaceAfterDashes||e.peek(1)==32))yC(e),e.acceptToken(pC);else if(r==47&&e.next==42){e.advance();for(let o=1;;){let a=e.next;if(e.next<0)break;if(e.advance(),a==42&&e.next==47){if(o--,e.advance(),!o)break}else a==47&&e.next==42&&(o++,e.advance())}e.acceptToken(yF)}else if((r==101||r==69)&&e.next==39)e.advance(),ma(e,39,!0),e.acceptToken(Ki);else if((r==110||r==78)&&e.next==39&&t.charSetCasts)e.advance(),ma(e,39,t.backslashEscapes),e.acceptToken(Ki);else if(r==95&&t.charSetCasts)for(let o=0;;o++){if(e.next==39&&o>1){e.advance(),ma(e,39,t.backslashEscapes),e.acceptToken(Ki);break}if(!fy(e.next))break;e.advance()}else if(t.plsqlQuotingMechanism&&(r==113||r==81)&&e.next==39&&e.peek(1)>0&&!pa(e.peek(1),sy)){let o=e.peek(1);e.advance(2),_F(e,o),e.acceptToken(Ki)}else if(pa(r,t.identifierQuotes)){let o=r==91?93:r;ma(e,o,!1),e.acceptToken(RF)}else if(r==40)e.acceptToken(vF);else if(r==41)e.acceptToken(wF);else if(r==123)e.acceptToken(SF);else if(r==125)e.acceptToken(kF);else if(r==91)e.acceptToken(CF);else if(r==93)e.acceptToken(AF);else if(r==59)e.acceptToken(TF);else if(t.unquotedBitLiterals&&r==48&&e.next==98)e.advance(),xC(e),e.acceptToken(hC);else if((r==98||r==66)&&(e.next==39||e.next==34)){let o=e.next;e.advance(),t.treatBitsAsBytes?(ma(e,o,t.backslashEscapes),e.acceptToken(EF)):(xC(e,o),e.acceptToken(hC))}else if(r==48&&(e.next==120||e.next==88)||(r==120||r==88)&&e.next==39){let o=e.next==39;for(e.advance();LF(e.next);)e.advance();o&&e.next==39&&e.advance(),e.acceptToken(ly)}else if(r==46&&e.next>=48&&e.next<=57)gC(e,!0),e.acceptToken(ly);else if(r==46)e.acceptToken(OF);else if(r>=48&&r<=57)gC(e,!1),e.acceptToken(ly);else if(pa(r,t.operatorChars)){for(;pa(e.next,t.operatorChars);)e.advance();e.acceptToken(BF)}else if(pa(r,t.specialVar))e.next==r&&e.advance(),qF(e),e.acceptToken(MF);else if(r==58||r==44)e.acceptToken(DF);else if(fy(r)){let o=cy(e,String.fromCharCode(r));e.acceptToken(e.next==46||e.peek(-o.length-1)==46?mC:(n=t.words[o.toLowerCase()])!==null&&n!==void 0?n:mC)}})}function dy(t){let e=t.cursor().moveTo(t.from,-1);for(;/Comment/.test(e.name);)e.moveTo(e.from,-1);return e.node}function $s(t,e){let n=t.sliceString(e.from,e.to),r=/^([`'"\[])(.*)([`'"\]])$/.exec(n);return r?r[2]:n}function sd(t){return t&&(t.name=="Identifier"||t.name=="QuotedIdentifier")}function HF(t,e){if(e.name=="CompositeIdentifier"){let n=[];for(let r=e.firstChild;r;r=r.nextSibling)sd(r)&&n.push($s(t,r));return n}return[$s(t,e)]}function bC(t,e){for(let n=[];;){if(!e||e.name!=".")return n;let r=dy(e);if(!sd(r))return n;n.unshift($s(t,r)),e=dy(r)}}function UF(t,e){let n=lt(t).resolveInner(e,-1),r=VF(t.doc,n);return n.name=="Identifier"||n.name=="QuotedIdentifier"||n.name=="Keyword"?{from:n.from,quoted:n.name=="QuotedIdentifier"?t.doc.sliceString(n.from,n.from+1):null,parents:bC(t.doc,dy(n)),aliases:r}:n.name=="."?{from:e,quoted:null,parents:bC(t.doc,n),aliases:r}:{from:e,quoted:null,parents:[],empty:!0,aliases:r}}function VF(t,e){let n;for(let o=e;!n;o=o.parent){if(!o)return null;o.name=="Statement"&&(n=o)}let r=null;for(let o=n.firstChild,a=!1,i=null;o;o=o.nextSibling){let l=o.name=="Keyword"?t.sliceString(o.from,o.to).toLowerCase():null,s=null;if(!a)a=l=="from";else if(l=="as"&&i&&sd(o.nextSibling))s=$s(t,o.nextSibling);else{if(l&&jF.has(l))break;i&&sd(o)&&(s=$s(t,o))}s&&(r||(r=Object.create(null)),r[s]=HF(t,i)),i=/Identifier$/.test(o.name)?o:null}return r}function GF(t,e,n){return n.map(r=>({...r,label:r.label[0]==t?r.label:t+r.label+e,apply:void 0}))}function IC(t){return t.self&&typeof t.self.label=="string"}function vC(t,e,n,r){return new RegExp("^[a-z_][a-z_\\d]*$",r?"i":"").test(t)?{label:t,type:e}:{label:t,type:e,apply:n+t+TC(n)}}function TC(t){return t==="["?"]":t}function QF(t,e,n,r,o,a){var i;let l=((i=a?.spec.identifierQuotes)===null||i===void 0?void 0:i[0])||'"',s=new py(l,!!a?.spec.caseInsensitiveIdentifiers),f=o?s.child(o):null;return s.addNamespace(t),e&&(f||s).addCompletions(e),n&&s.addCompletions(n),f&&s.addCompletions(f.list),r&&s.addCompletions((f||s).child(r).list),c=>{let{parents:u,from:d,quoted:p,empty:m,aliases:x}=UF(c.state,c.pos);if(m&&!c.explicit)return null;x&&u.length==1&&(u=x[u[0]]||u);let b=s;for(let y of u){for(;!b.children||!b.children[y];)if(b==s&&f)b=f;else if(b==f&&r)b=b.child(r);else return null;let g=b.maybeChild(y);if(!g)return null;b=g}let h=b.list;if(b==s&&x&&(h=h.concat(Object.keys(x).map(y=>({label:y,type:"constant"})))),p){let y=p[0],g=TC(y),I=c.state.sliceDoc(c.pos,c.pos+1)==g;return{from:d,to:I?c.pos+1:void 0,options:GF(y,g,h),validFor:XF}}else return{from:d,options:h,validFor:WF}}}function KF(t){return t==SC?"type":t==wC?"keyword":"variable"}function YF(t,e,n){let r=Object.keys(t).map(o=>n(e?o.toUpperCase():o,KF(t[o])));return lC(["QuotedIdentifier","String","LineComment","BlockComment","."],ty(r))}function ZF(t,e){return{label:t,type:e,boost:-1}}function $F(t,e=!1,n){return YF(t.dialect.words,e,n||ZF)}function eL(t){return t.schema?QF(t.schema,t.tables,t.schemas,t.defaultTable,t.defaultSchema,t.dialect||my):()=>null}function tL(t){return t.schema?(t.dialect||my).language.data.of({autocomplete:eL(t)}):[]}function OC(t={}){let e=t.dialect||my;return new $u(e.language,[tL(t),e.language.data.of({autocomplete:$F(e,t.upperCaseKeywords,t.keywordCompletion)})])}var gF,pC,yF,Ki,ly,bF,IF,vF,wF,SF,kF,CF,AF,TF,OF,BF,DF,MF,mC,RF,wC,SC,hC,EF,FF,sy,ha,xa,uy,AC,zF,jF,WF,XF,py,JF,Zn,my,BC,DC,MC,RC,EC,w8,nL,S8,FC,k8,C8,hy=F(()=>{Ys();Sg();tC();iy();gF=36,pC=1,yF=2,Ki=3,ly=4,bF=5,IF=6,vF=7,wF=8,SF=9,kF=10,CF=11,AF=12,TF=13,OF=14,BF=15,DF=16,MF=17,mC=18,RF=19,wC=20,SC=21,hC=22,EF=23,FF=24;sy=` 	\r
`;ha="array binary bit boolean char character clob date decimal double float int integer interval large national nchar nclob numeric object precision real smallint time timestamp varchar varying ",xa="absolute action add after all allocate alter and any are as asc assertion at authorization before begin between both breadth by call cascade cascaded case cast catalog check close collate collation column commit condition connect connection constraint constraints constructor continue corresponding count create cross cube current current_date current_default_transform_group current_transform_group_for_type current_path current_role current_time current_timestamp current_user cursor cycle data day deallocate declare default deferrable deferred delete depth deref desc describe descriptor deterministic diagnostics disconnect distinct do domain drop dynamic each else elseif end end-exec equals escape except exception exec execute exists exit external fetch first for foreign found from free full function general get global go goto grant group grouping handle having hold hour identity if immediate in indicator initially inner inout input insert intersect into is isolation join key language last lateral leading leave left level like limit local localtime localtimestamp locator loop map match method minute modifies module month names natural nesting new next no none not of old on only open option or order ordinality out outer output overlaps pad parameter partial path prepare preserve primary prior privileges procedure public read reads recursive redo ref references referencing relative release repeat resignal restrict result return returns revoke right role rollback rollup routine row rows savepoint schema scroll search second section select session session_user set sets signal similar size some space specific specifictype sql sqlexception sqlstate sqlwarning start state static system_user table temporary then timezone_hour timezone_minute to trailing transaction translation treat trigger under undo union unique unnest until update usage user using value values view when whenever where while with without work write year zone ",uy={backslashEscapes:!1,hashComments:!1,spaceAfterDashes:!1,slashComments:!1,doubleQuotedStrings:!1,doubleDollarQuotedStrings:!1,unquotedBitLiterals:!1,treatBitsAsBytes:!1,charSetCasts:!1,plsqlQuotingMechanism:!1,operatorChars:"*+-%<>!=&|~^/",specialVar:"?",identifierQuotes:'"',caseInsensitiveIdentifiers:!1,words:kC(xa,ha)};AC=CC(uy),zF=nd.deserialize({version:14,states:"%vQ]QQOOO#wQRO'#DSO$OQQO'#CwO%eQQO'#CxO%lQQO'#CyO%sQQO'#CzOOQQ'#DS'#DSOOQQ'#C}'#C}O'UQRO'#C{OOQQ'#Cv'#CvOOQQ'#C|'#C|Q]QQOOQOQQOOO'`QQO'#DOO(xQRO,59cO)PQQO,59cO)UQQO'#DSOOQQ,59d,59dO)cQQO,59dOOQQ,59e,59eO)jQQO,59eOOQQ,59f,59fO)qQQO,59fOOQQ-E6{-E6{OOQQ,59b,59bOOQQ-E6z-E6zOOQQ,59j,59jOOQQ-E6|-E6|O+VQRO1G.}O+^QQO,59cOOQQ1G/O1G/OOOQQ1G/P1G/POOQQ1G/Q1G/QP+kQQO'#C}O+rQQO1G.}O)PQQO,59cO,PQQO'#Cw",stateData:",[~OtOSPOSQOS~ORUOSUOTUOUUOVROXSOZTO]XO^QO_UO`UOaPObPOcPOdUOeUOfUOgUOhUO~O^]ORvXSvXTvXUvXVvXXvXZvX]vX_vX`vXavXbvXcvXdvXevXfvXgvXhvX~OsvX~P!jOa_Ob_Oc_O~ORUOSUOTUOUUOVROXSOZTO^tO_UO`UOa`Ob`Oc`OdUOeUOfUOgUOhUO~OWaO~P$ZOYcO~P$ZO[eO~P$ZORUOSUOTUOUUOVROXSOZTO^QO_UO`UOaPObPOcPOdUOeUOfUOgUOhUO~O]hOsoX~P%zOajObjOcjO~O^]ORkaSkaTkaUkaVkaXkaZka]ka_ka`kaakabkackadkaekafkagkahka~Oska~P'kO^]O~OWvXYvX[vX~P!jOWnO~P$ZOYoO~P$ZO[pO~P$ZO^]ORkiSkiTkiUkiVkiXkiZki]ki_ki`kiakibkickidkiekifkigkihki~Oski~P)xOWkaYka[ka~P'kO]hO~P$ZOWkiYki[ki~P)xOasObsOcsO~O",goto:"#hwPPPPPPPPPPPPPPPPPPPPPPPPPPx||||!Y!^!d!xPPP#[TYOZeUORSTWZbdfqT[OZQZORiZSWOZQbRQdSQfTZgWbdfqQ^PWk^lmrQl_Qm`RrseVORSTWZbdfq",nodeNames:"\u26A0 LineComment BlockComment String Number Bool Null ( ) { } [ ] ; . Operator Punctuation SpecialVar Identifier QuotedIdentifier Keyword Type Bits Bytes Builtin Script Statement CompositeIdentifier Parens Braces Brackets Statement",maxTerm:38,nodeProps:[["isolate",-4,1,2,3,19,""]],skippedNodes:[0,1,2],repeatNodeCount:3,tokenData:"RORO",tokenizers:[0,AC],topRules:{Script:[0,25]},tokenPrec:0});jF=new Set("where group having order union intersect except all distinct limit offset fetch for".split(" "));WF=/^\w*$/,XF=/^[`'"\[]?\w*[`'"\]]?$/;py=class t{constructor(e,n){this.idQuote=e,this.idCaseInsensitive=n,this.list=[],this.children=void 0}child(e){let n=this.children||(this.children=Object.create(null)),r=n[e];return r||(e&&!this.list.some(o=>o.label==e)&&this.list.push(vC(e,"type",this.idQuote,this.idCaseInsensitive)),n[e]=new t(this.idQuote,this.idCaseInsensitive))}maybeChild(e){return this.children?this.children[e]:null}addCompletion(e){let n=this.list.findIndex(r=>r.label==e.label);n>-1?this.list[n]=e:this.list.push(e)}addCompletions(e){for(let n of e)this.addCompletion(typeof n=="string"?vC(n,"property",this.idQuote,this.idCaseInsensitive):n)}addNamespace(e){Array.isArray(e)?this.addCompletions(e):IC(e)?this.addNamespace(e.children):this.addNamespaceObject(e)}addNamespaceObject(e){for(let n of Object.keys(e)){let r=e[n],o=null,a=n.replace(/\\?\./g,l=>l=="."?"\0":l).split("\0"),i=this;IC(r)&&(o=r.self,r=r.children);for(let l=0;l<a.length;l++)o&&l==a.length-1&&i.addCompletion(o),i=i.child(a[l].replace(/\\\./g,"."));i.addNamespace(r)}}};JF=zF.configure({props:[Ng.add({Statement:zk()}),Hk.add({Statement(t,e){return{from:Math.min(t.from+100,e.doc.lineAt(t.from).to),to:t.to}},BlockComment(t){return{from:t.from+2,to:t.to-2}}}),Ju({Keyword:T.keyword,Type:T.typeName,Builtin:T.standard(T.name),Bits:T.number,Bytes:T.string,Bool:T.bool,Null:T.null,Number:T.number,String:T.string,Identifier:T.name,QuotedIdentifier:T.special(T.string),SpecialVar:T.special(T.name),LineComment:T.lineComment,BlockComment:T.blockComment,Operator:T.operator,"Semi Punctuation":T.punctuation,"( )":T.paren,"{ }":T.brace,"[ ]":T.squareBracket})]}),Zn=class t{constructor(e,n,r){this.dialect=e,this.language=n,this.spec=r}get extension(){return this.language.extension}configureLanguage(e,n){return new t(this.dialect,this.language.configure(e,n),this.spec)}static define(e){let n=PF(e,e.keywords,e.types,e.builtin),r=Zu.define({name:"sql",parser:JF.configure({tokenizers:[{from:AC,to:CC(n)}]}),languageData:{commentTokens:{line:"--",block:{open:"/*",close:"*/"}},closeBrackets:{brackets:["(","[","{","'",'"',"`"]}}});return new t(n,r,e)}};my=Zn.define({}),BC=Zn.define({charSetCasts:!0,doubleDollarQuotedStrings:!0,operatorChars:"+-*/<>=~!@#%^&|`?",specialVar:"",keywords:xa+"abort abs absent access according ada admin aggregate alias also always analyse analyze array_agg array_max_cardinality asensitive assert assignment asymmetric atomic attach attribute attributes avg backward base64 begin_frame begin_partition bernoulli bit_length blocked bom cache called cardinality catalog_name ceil ceiling chain char_length character_length character_set_catalog character_set_name character_set_schema characteristics characters checkpoint class class_origin cluster coalesce cobol collation_catalog collation_name collation_schema collect column_name columns command_function command_function_code comment comments committed concurrently condition_number configuration conflict connection_name constant constraint_catalog constraint_name constraint_schema contains content control conversion convert copy corr cost covar_pop covar_samp csv cume_dist current_catalog current_row current_schema cursor_name database datalink datatype datetime_interval_code datetime_interval_precision db debug defaults defined definer degree delimiter delimiters dense_rank depends derived detach detail dictionary disable discard dispatch dlnewcopy dlpreviouscopy dlurlcomplete dlurlcompleteonly dlurlcompletewrite dlurlpath dlurlpathonly dlurlpathwrite dlurlscheme dlurlserver dlvalue document dump dynamic_function dynamic_function_code element elsif empty enable encoding encrypted end_frame end_partition endexec enforced enum errcode error event every exclude excluding exclusive exp explain expression extension extract family file filter final first_value flag floor following force foreach fortran forward frame_row freeze fs functions fusion generated granted greatest groups handler header hex hierarchy hint id ignore ilike immediately immutable implementation implicit import include including increment indent index indexes info inherit inherits inline insensitive instance instantiable instead integrity intersection invoker isnull key_member key_type label lag last_value lead leakproof least length library like_regex link listen ln load location lock locked log logged lower mapping matched materialized max max_cardinality maxvalue member merge message message_length message_octet_length message_text min minvalue mod mode more move multiset mumps name namespace nfc nfd nfkc nfkd nil normalize normalized nothing notice notify notnull nowait nth_value ntile nullable nullif nulls number occurrences_regex octet_length octets off offset oids operator options ordering others over overlay overriding owned owner parallel parameter_mode parameter_name parameter_ordinal_position parameter_specific_catalog parameter_specific_name parameter_specific_schema parser partition pascal passing passthrough password percent percent_rank percentile_cont percentile_disc perform period permission pg_context pg_datatype_name pg_exception_context pg_exception_detail pg_exception_hint placing plans pli policy portion position position_regex power precedes preceding prepared print_strict_params procedural procedures program publication query quote raise range rank reassign recheck recovery refresh regr_avgx regr_avgy regr_count regr_intercept regr_r2 regr_slope regr_sxx regr_sxy regr_syy reindex rename repeatable replace replica requiring reset respect restart restore result_oid returned_cardinality returned_length returned_octet_length returned_sqlstate returning reverse routine_catalog routine_name routine_schema routines row_count row_number rowtype rule scale schema_name schemas scope scope_catalog scope_name scope_schema security selective self sensitive sequence sequences serializable server server_name setof share show simple skip slice snapshot source specific_name sqlcode sqlerror sqrt stable stacked standalone statement statistics stddev_pop stddev_samp stdin stdout storage strict strip structure style subclass_origin submultiset subscription substring substring_regex succeeds sum symmetric sysid system system_time table_name tables tablesample tablespace temp template ties token top_level_count transaction_active transactions_committed transactions_rolled_back transform transforms translate translate_regex trigger_catalog trigger_name trigger_schema trim trim_array truncate trusted type types uescape unbounded uncommitted unencrypted unlink unlisten unlogged unnamed untyped upper uri use_column use_variable user_defined_type_catalog user_defined_type_code user_defined_type_name user_defined_type_schema vacuum valid validate validator value_of var_pop var_samp varbinary variable_conflict variadic verbose version versioning views volatile warning whitespace width_bucket window within wrapper xmlagg xmlattributes xmlbinary xmlcast xmlcomment xmlconcat xmldeclaration xmldocument xmlelement xmlexists xmlforest xmliterate xmlnamespaces xmlparse xmlpi xmlquery xmlroot xmlschema xmlserialize xmltable xmltext xmlvalidate yes",types:ha+"bigint int8 bigserial serial8 varbit bool box bytea cidr circle precision float8 inet int4 json jsonb line lseg macaddr macaddr8 money numeric pg_lsn point polygon float4 int2 smallserial serial2 serial serial4 text timetz timestamptz tsquery tsvector txid_snapshot uuid xml"}),DC="accessible algorithm analyze asensitive authors auto_increment autocommit avg avg_row_length binlog btree cache catalog_name chain change changed checkpoint checksum class_origin client_statistics coalesce code collations columns comment committed completion concurrent consistent contains contributors convert database databases day_hour day_microsecond day_minute day_second delay_key_write delayed delimiter des_key_file dev_pop dev_samp deviance directory disable discard distinctrow div dual dumpfile enable enclosed ends engine engines enum errors escaped even event events every explain extended fast field fields flush force found_rows fulltext grants handler hash high_priority hosts hour_microsecond hour_minute hour_second ignore ignore_server_ids import index index_statistics infile innodb insensitive insert_method install invoker iterate keys kill linear lines list load lock logs low_priority master master_heartbeat_period master_ssl_verify_server_cert masters max max_rows maxvalue message_text middleint migrate min min_rows minute_microsecond minute_second mod mode modify mutex mysql_errno no_write_to_binlog offline offset one online optimize optionally outfile pack_keys parser partition partitions password phase plugin plugins prev processlist profile profiles purge query quick range read_write rebuild recover regexp relaylog remove rename reorganize repair repeatable replace require resume rlike row_format rtree schedule schema_name schemas second_microsecond security sensitive separator serializable server share show slave slow snapshot soname spatial sql_big_result sql_buffer_result sql_cache sql_calc_found_rows sql_no_cache sql_small_result ssl starting starts std stddev stddev_pop stddev_samp storage straight_join subclass_origin sum suspend table_name table_statistics tables tablespace terminated triggers truncate uncommitted uninstall unlock upgrade use use_frm user_resources user_statistics utc_date utc_time utc_timestamp variables views warnings xa xor year_month zerofill",MC=ha+"bool blob long longblob longtext medium mediumblob mediumint mediumtext tinyblob tinyint tinytext text bigint int1 int2 int3 int4 int8 float4 float8 varbinary varcharacter precision datetime unsigned signed",RC="charset clear edit ego help nopager notee nowarning pager print prompt quit rehash source status system tee",EC=Zn.define({operatorChars:"*+-%<>!=&|^",charSetCasts:!0,doubleQuotedStrings:!0,unquotedBitLiterals:!0,hashComments:!0,spaceAfterDashes:!0,specialVar:"@?",identifierQuotes:"`",keywords:xa+"group_concat "+DC,types:MC,builtin:RC}),w8=Zn.define({operatorChars:"*+-%<>!=&|^",charSetCasts:!0,doubleQuotedStrings:!0,unquotedBitLiterals:!0,hashComments:!0,spaceAfterDashes:!0,specialVar:"@?",identifierQuotes:"`",keywords:xa+"always generated groupby_concat hard persistent shutdown soft virtual "+DC,types:MC,builtin:RC}),nL="approx_count_distinct approx_percentile_cont approx_percentile_disc avg checksum_agg count count_big grouping grouping_id max min product stdev stdevp sum var varp ai_generate_embeddings ai_generate_chunks cume_dist first_value lag last_value lead percentile_cont percentile_disc percent_rank left_shift right_shift bit_count get_bit set_bit collationproperty tertiary_weights @@datefirst @@dbts @@langid @@language @@lock_timeout @@max_connections @@max_precision @@nestlevel @@options @@remserver @@servername @@servicename @@spid @@textsize @@version cast convert parse try_cast try_convert try_parse asymkey_id asymkeyproperty certproperty cert_id crypt_gen_random decryptbyasymkey decryptbycert decryptbykey decryptbykeyautoasymkey decryptbykeyautocert decryptbypassphrase encryptbyasymkey encryptbycert encryptbykey encryptbypassphrase hashbytes is_objectsigned key_guid key_id key_name signbyasymkey signbycert symkeyproperty verifysignedbycert verifysignedbyasymkey @@cursor_rows @@fetch_status cursor_status datalength ident_current ident_incr ident_seed identity sql_variant_property @@datefirst current_timestamp current_timezone current_timezone_id date_bucket dateadd datediff datediff_big datefromparts datename datepart datetime2fromparts datetimefromparts datetimeoffsetfromparts datetrunc day eomonth getdate getutcdate isdate month smalldatetimefromparts switchoffset sysdatetime sysdatetimeoffset sysutcdatetime timefromparts todatetimeoffset year edit_distance edit_distance_similarity jaro_winkler_distance jaro_winkler_similarity edge_id_from_parts graph_id_from_edge_id graph_id_from_node_id node_id_from_parts object_id_from_edge_id object_id_from_node_id json isjson json_array json_contains json_modify json_object json_path_exists json_query json_value regexp_like regexp_replace regexp_substr regexp_instr regexp_count regexp_matches regexp_split_to_table abs acos asin atan atn2 ceiling cos cot degrees exp floor log log10 pi power radians rand round sign sin sqrt square tan choose greatest iif least @@procid app_name applock_mode applock_test assemblyproperty col_length col_name columnproperty databasepropertyex db_id db_name file_id file_idex file_name filegroup_id filegroup_name filegroupproperty fileproperty filepropertyex fulltextcatalogproperty fulltextserviceproperty index_col indexkey_property indexproperty next value for object_definition object_id object_name object_schema_name objectproperty objectpropertyex original_db_name parsename schema_id schema_name scope_identity serverproperty stats_date type_id type_name typeproperty dense_rank ntile rank row_number publishingservername certenclosed certprivatekey current_user database_principal_id has_dbaccess has_perms_by_name is_member is_rolemember is_srvrolemember loginproperty original_login permissions pwdencrypt pwdcompare session_user sessionproperty suser_id suser_name suser_sid suser_sname system_user user user_id user_name ascii char charindex concat concat_ws difference format left len lower ltrim nchar patindex quotename replace replicate reverse right rtrim soundex space str string_agg string_escape stuff substring translate trim unicode upper $partition @@error @@identity @@pack_received @@rowcount @@trancount binary_checksum checksum compress connectionproperty context_info current_request_id current_transaction_id decompress error_line error_message error_number error_procedure error_severity error_state formatmessage get_filestream_transaction_context getansinull host_id host_name isnull isnumeric min_active_rowversion newid newsequentialid rowcount_big session_context xact_state @@connections @@cpu_busy @@idle @@io_busy @@pack_sent @@packet_errors @@timeticks @@total_errors @@total_read @@total_write textptr textvalid columns_updated eventdata trigger_nestlevel vector_distance vectorproperty vector_search generate_series opendatasource openjson openquery openrowset openxml predict string_split coalesce nullif apply catch filter force include keep keepfixed modify optimize parameterization parameters partition recompile sequence set",S8=Zn.define({keywords:xa+"add external procedure all fetch public alter file raiserror and fillfactor read any for readtext as foreign reconfigure asc freetext references authorization freetexttable replication backup from restore begin full restrict between function return break goto revert browse grant revoke bulk group right by having rollback cascade holdlock rowcount case identity rowguidcol check identity_insert rule checkpoint identitycol save close if schema clustered in securityaudit coalesce index select collate inner semantickeyphrasetable column insert semanticsimilaritydetailstable commit intersect semanticsimilaritytable compute into session_user constraint is set contains join setuser containstable key shutdown continue kill some convert left statistics create like system_user cross lineno table current load tablesample current_date merge textsize current_time national then current_timestamp nocheck to current_user nonclustered top cursor not tran database null transaction dbcc nullif trigger deallocate of truncate declare off try_convert default offsets tsequal delete on union deny open unique desc opendatasource unpivot disk openquery update distinct openrowset updatetext distributed openxml use double option user drop or values dump order varying else outer view end over waitfor errlvl percent when escape pivot where except plan while exec precision with execute primary within group exists print writetext exit proc noexpand index forceseek forcescan holdlock nolock nowait paglock readcommitted readcommittedlock readpast readuncommitted repeatableread rowlock serializable snapshot spatial_window_max_cells tablock tablockx updlock xlock keepidentity keepdefaults ignore_constraints ignore_triggers",types:ha+"smalldatetime datetimeoffset datetime2 datetime bigint smallint smallmoney tinyint money real text nvarchar ntext varbinary image hierarchyid uniqueidentifier sql_variant xml",builtin:nL,operatorChars:"*+-%<>!=^&|/",specialVar:"@",identifierQuotes:'"['}),FC=Zn.define({keywords:xa+"abort analyze attach autoincrement conflict database detach exclusive fail glob ignore index indexed instead isnull notnull offset plan pragma query raise regexp reindex rename replace temp vacuum virtual",types:ha+"bool blob long longblob longtext medium mediumblob mediumint mediumtext tinyblob tinyint tinytext text bigint int2 int8 unsigned signed real",builtin:"auth backup bail changes clone databases dbinfo dump echo eqp explain fullschema headers help import imposter indexes iotrace lint load log mode nullvalue once print prompt quit restore save scanstats separator shell show stats system tables testcase timeout timer trace vfsinfo vfslist vfsname width",operatorChars:"*+-%<>!=&|/~",identifierQuotes:'`"',specialVar:"@:?$"}),k8=Zn.define({keywords:"add all allow alter and any apply as asc authorize batch begin by clustering columnfamily compact consistency count create custom delete desc distinct drop each_quorum exists filtering from grant if in index insert into key keyspace keyspaces level limit local_one local_quorum modify nan norecursive nosuperuser not of on one order password permission permissions primary quorum rename revoke schema select set storage superuser table three to token truncate ttl two type unlogged update use user users using values where with writetime infinity NaN",types:ha+"ascii bigint blob counter frozen inet list map static text timeuuid tuple uuid varint",slashComments:!0}),C8=Zn.define({keywords:xa+"abort accept access add all alter and any arraylen as asc assert assign at attributes audit authorization avg base_table begin between binary_integer body by case cast char_base check close cluster clusters colauth column comment commit compress connected constant constraint crash create current currval cursor data_base database dba deallocate debugoff debugon declare default definition delay delete desc digits dispose distinct do drop else elseif elsif enable end entry exception exception_init exchange exclusive exists external fast fetch file for force form from function generic goto grant group having identified if immediate in increment index indexes indicator initial initrans insert interface intersect into is key level library like limited local lock log logging loop master maxextents maxtrans member minextents minus mislabel mode modify multiset new next no noaudit nocompress nologging noparallel not nowait number_base of off offline on online only option or order out package parallel partition pctfree pctincrease pctused pls_integer positive positiven pragma primary prior private privileges procedure public raise range raw rebuild record ref references refresh rename replace resource restrict return returning returns reverse revoke rollback row rowid rowlabel rownum rows run savepoint schema segment select separate set share snapshot some space split sql start statement storage subtype successful synonym tabauth table tables tablespace task terminate then to trigger truncate type union unique unlimited unrecoverable unusable update use using validate value values variable view views when whenever where while with work",builtin:"appinfo arraysize autocommit autoprint autorecovery autotrace blockterminator break btitle cmdsep colsep compatibility compute concat copycommit copytypecheck define echo editfile embedded feedback flagger flush heading headsep instance linesize lno loboffset logsource longchunksize markup native newpage numformat numwidth pagesize pause pno recsep recsepchar repfooter repheader serveroutput shiftinout show showmode spool sqlblanklines sqlcase sqlcode sqlcontinue sqlnumber sqlpluscompatibility sqlprefix sqlprompt sqlterminator suffix tab term termout timing trimout trimspool ttitle underline verify version wrap",types:ha+"ascii bfile bfilename bigserial bit blob dec long number nvarchar nvarchar2 serial smallint string text uid varchar2 xml",operatorChars:"*/+-%<>!=~",doubleQuotedStrings:!0,charSetCasts:!0,plsqlQuotingMechanism:!0})});function ef(t){return t==="postgres"?BC:t==="mysql"?EC:FC}function LC(t,e){let n=ef(e).language.parser.parse(t),r=[],o=n.cursor();if(!o.firstChild())return r;do{if(o.name!=="Statement")continue;let a=o.from,i=o.to,l=a,s=i;for(;s>l&&/\s/.test(t[s-1]);)s--;for(s>l&&t[s-1]===";"&&s--;s>l&&/\s/.test(t[s-1]);)s--;for(;l<s&&/\s/.test(t[l]);)l++;l>=s||r.push({from:l,to:s,text:t.slice(l,s),nodeTo:i})}while(o.nextSibling());return r}function tf(t,e){return LC(t,e).map(({from:n,to:r,text:o})=>({from:n,to:r,text:o}))}function NC(t,e,n){let r=LC(t,n);if(r.length===0)return null;let o=r.find(a=>e>=a.from&&e<a.nodeTo);if(o||(o=r.find(a=>e===a.nodeTo)),!o)for(let a of r)a.nodeTo<e&&(o=a);return o||(o=r.find(a=>a.from>e)),o?{from:o.from,to:o.to,text:o.text}:null}var nf=F(()=>{"use strict";hy()});function sL(t,e){let n=Array.from({length:e.length+1},(r,o)=>o);for(let r=1;r<=t.length;r++){let o=[r];for(let a=1;a<=e.length;a++)o[a]=Math.min(n[a]+1,o[a-1]+1,n[a-1]+(t[r-1]===e[a-1]?0:1));n=o}return n[e.length]}function fL(t){return t.length>=4&&iL.some(e=>e.length>=4&&sL(t,e)<=2)}function cL(t,e){let n=ef(e).language.parser.parse(t),r=-1,o=n.cursor();if(o.firstChild())do if(o.name==="Statement"){r=o.to;break}while(o.nextSibling());let a=[],i=!1,l=0;if(n.iterate({enter(c){if(i||r>=0&&c.from>=r)return!1;if(c.type.isError)return i=!0,!1;if(c.name==="Parens"){l++;return}if(c.name==="Script"||c.name==="Statement")return;let u=t.slice(c.from,c.to);if(/^[A-Za-z_][A-Za-z_0-9]*$/.test(u))a.push({word:u.toLowerCase(),text:u,depth:l});else{if(/^\s*$/.test(u)||/^(--|\/\*|#)/.test(u))return;a.push({word:"",text:u,depth:l})}},leave(c){c.name==="Parens"&&l--}}),i)return null;let s=a.filter(c=>c.text==="(").length,f=a.filter(c=>c.text===")").length;return s!==f?null:a.filter(c=>c.text!=="("&&c.text!==")")}function uL(t,e){let n=cL(t,e);if(!n||n.length===0)return rf;let r=n.filter(s=>s.word),o=r[0];if(!o||n[0]!==o)return rf;let a=0,i=o.word,l=!1;if(i==="explain"){let s=!1,f=1;for(;f<n.length;f++){let c=n[f];if(c.depth>0||c.word&&rL.has(c.word)||!c.word){(c.word==="analyze"||c.word==="analyse")&&(s=!0);continue}break}n.slice(1,f).some(c=>c.word==="analyze"||c.word==="analyse")&&(s=!0),s&&f<n.length?(a=f,i=n[f].word):l=!0}if(i==="with"){let s=n.findIndex((f,c)=>c>a&&f.depth===0&&oL.has(f.word));s>0&&(a=s,i=n[s].word)}if(qC.has(i)&&!l)return{kind:"dangerous",reason:i.toUpperCase()};if((i==="delete"||i==="update")&&!l&&!n.some((f,c)=>c>a&&f.depth===0&&f.word==="where"))return{kind:"dangerous",reason:`${i.toUpperCase()} without WHERE`};for(let s=0;s<n.length;s++){let f=n[s];if(PC.has(f.word)&&!(f.word==="replace"&&s>0&&n[s+1]&&n[s+1].depth>f.depth))return{kind:"write",reason:f.word.toUpperCase()}}if((i==="select"||o.word==="select")&&n.some(s=>s.depth===0&&s.word==="into"))return{kind:"write",reason:"SELECT INTO"};if(o.word==="pragma"){if(n.some(s=>s.depth===0&&s.text==="="))return{kind:"write",reason:"PRAGMA assignment"};if(n.some(s=>s.depth>0)&&!r.slice(1,4).some(s=>s.depth===0&&aL.has(s.word)))return{kind:"write",reason:"PRAGMA assignment"}}if(o.word==="pragma"&&!n.some(s=>s.depth>0)){let s=[...n].reverse().find(f=>f.depth===0&&f.word);if(!s||s===o||!lL.has(s.word))return{kind:"write",reason:"PRAGMA"}}return zC.has(o.word)?{kind:"read",reason:""}:r.length>1&&fL(o.word)?rf:{kind:"write",reason:"unrecognized statement"}}function Yi(t,e){let n=tf(t,e);if(n.length===0)return rf;let r=null;for(let o of n){let a=uL(o.text,e);(!r||_C[a.kind]>_C[r.kind])&&(r=a)}return r??rf}var qC,PC,zC,rL,oL,aL,iL,lL,rf,_C,fd=F(()=>{"use strict";nf();qC=new Set(["drop","truncate","alter","grant","revoke"]),PC=new Set(["insert","update","delete","replace","merge","create","attach","detach","vacuum","reindex","copy","call","do","set","reset","lock"]),zC=new Set(["select","with","values","explain","pragma","show","describe","desc","table"]),rL=new Set(["analyze","analyse","verbose","query","plan","costs","buffers","timing","summary","format","json","text","xml","yaml","true","false","on","off","settings","wal"]),oL=new Set(["select","values","insert","update","delete","replace","merge","table"]),aL=new Set(["table_info","table_xinfo","table_list","index_list","index_info","index_xinfo","foreign_key_list","foreign_key_check","integrity_check","quick_check","function_list","collation_list","database_list","compile_options","pragma_list","module_list"]),iL=[...qC,...PC,...zC,"begin","commit","rollback","savepoint","release"],lL=new Set(["table_info","table_xinfo","index_list","index_info","index_xinfo","foreign_key_list","database_list","collation_list","function_list","module_list","pragma_list","compile_options","schema_version","user_version","application_id","page_count","page_size","freelist_count","encoding","journal_mode","foreign_keys","query_only","integrity_check","quick_check","foreign_key_check","data_version"]),rf={kind:"dangerous",reason:"could not parse"};_C={read:0,write:1,dangerous:2}});function pL(t){if(typeof t!="object"||t===null)return!1;let e=t;return typeof e.code=="string"&&dL.has(e.code)&&typeof e.message=="string"&&e.message!==""}function mL(t){let e="";return typeof t=="string"?e=t:(t instanceof Error||typeof t=="object"&&t!==null&&typeof t.message=="string")&&(e=t.message),e.trim()===""?"Unknown SQL error.":e}function Dn(t,e){if(pL(t))return t;let n=typeof t=="object"&&t!==null?t.name:void 0,r=mL(t);if(n==="AbortError")return{code:"cancelled",message:r==="Unknown SQL error."?"Query cancelled.":r};if(/readonly|read-only|query_only/i.test(r))return{code:"read-only",message:r};if(/not a database|file is not a database|malformed/i.test(r))return{code:"not-a-database",message:r};if(/syntax error|near "/i.test(r)){let o={code:"syntax",message:r},a=/near "([^"]*)"/i.exec(r);if(a&&e!==void 0&&a[1]!==""){let i=e.indexOf(a[1]);i>=0&&(o.position=i)}return o}return{code:"server",message:r}}var dL,cd=F(()=>{"use strict";dL=new Set(["helper-missing","helper-outdated","auth-failed","tls-failed","network","timeout","cancelled","read-only","syntax","server","connection-lost","limit-reached","not-a-database"])});function el(t,e){let n=typeof t=="string"?t:"",r=n.length,o=0,a=r>0&&n.charCodeAt(0)===65279;a&&(o=1);let i,l=Mn(n,o,r);for(let b of hL)if(n.startsWith(b,l)){i=b,o=l+b.length;break}let s=vL(e?.contentType);if(xL.has(s)||s===HC){let b=UC(n,o,r,s===HC?gL:`
`);return of(n,"ndjson",{t:"arr",items:b},i,a)}Zi=0,$i=0,Br=-1;let f=Mn(n,o,r),c=XC(n,f,r);if(c===null)return of(n,"json",null,i,a);let u=cf,d=Mn(n,u,r);if(d>=r)return of(n,"json",c,i,a);let p=d,m=`${ud(n,d)} after the JSON value`,x=n.indexOf(`
`,f);if(x>=u&&x<d){let b=UC(n,o,r,`
`);if(b.length>=2)return of(n,"ndjson",{t:"arr",items:b},i,a)}return Br=p,Ji=m,of(n,"json",null,i,a)}function vL(t){if(typeof t!="string")return"";let e=t.indexOf(";");return(e<0?t:t.slice(0,e)).trim().toLowerCase()}function of(t,e,n,r,o){let a=Br>=0,i=n===null?0:Zi,l=n===null?0:$i,s;return a?s={ok:!1,kind:e,root:n,error:wL(t,Br,Ji),duplicates:i,inexactNumbers:l}:s={ok:!0,kind:e,root:n,duplicates:i,inexactNumbers:l},r!==void 0&&(s.prefix=r),o&&(s.bom=!0),s}function wL(t,e,n){let r=1,o=0,a=t.indexOf(`
`);for(;a!==-1&&a<e;)r+=1,o=a+1,a=t.indexOf(`
`,o);return{pos:e,line:r,col:e-o+1,message:n}}function UC(t,e,n,r){Zi=0,$i=0;let o=-1,a="",i=[],l=e;for(;;){let s=t.indexOf(r,l);(s===-1||s>n)&&(s=n);let f=Mn(t,l,s);if(f<s){let c=Zi,u=$i;Br=-1;let d=XC(t,f,s);if(d!==null){let p=Mn(t,cf,s);p<s&&(Br=p,Ji=`${ud(t,p)} after the JSON value`,d=null)}d!==null?i.push(d):(Zi=c,$i=u,o<0&&(o=Br,a=Ji))}if(s>=n)break;l=s+1}return Br=o,Ji=a,i}function Mn(t,e,n){for(;e<n;){let r=t.charCodeAt(e);if(r>32||r!==32&&r!==10&&r!==13&&r!==9)break;e++}return e}function Re(t,e){return Br=t,Ji=e,null}function ud(t,e){let n=t.codePointAt(e)??0;return`Unexpected token ${n>32&&n<127?String.fromCharCode(n):`U+${n.toString(16).toUpperCase().padStart(4,"0")}`}`}function XC(t,e,n){let r=e,o=null,a=[],i=[],l=null,s=null,f="",c,u=!1,d=af;for(;;)if(d===af){if(r=Mn(t,r,n),r>=n)return Re(r,lf);let p=t.charCodeAt(r),m;if(p===34){if(r=GC(t,r,n),r<0)return null;m=ff===void 0?{t:"str",value:sf}:{t:"str",value:sf,raw:ff}}else if(p===123)m={t:"obj",entries:[]},r++;else if(p===91)m={t:"arr",items:[]},r++;else if(p===45||p>=48&&p<=57){let x=CL(t,r,n);if(x===null)return null;m=x,r=cf}else if(p===116){if(!xy(t,r,n,"true"))return null;m={t:"bool",value:!0},r+=4}else if(p===102){if(!xy(t,r,n,"false"))return null;m={t:"bool",value:!1},r+=5}else if(p===110){if(!xy(t,r,n,"null"))return null;m={t:"null"},r+=4}else return Re(r,ud(t,r));if(l===null)o=m;else if(l.t==="arr")l.items.push(m);else{let x={key:f,value:m};c!==void 0&&(x.keyRaw=c),u&&(x.dup=!0),l.entries.push(x)}if(m.t==="obj"||m.t==="arr")if(r=Mn(t,r,n),r<n&&t.charCodeAt(r)===(m.t==="obj"?125:93))r++;else{l!==null&&(a.push(l),i.push(s)),l=m,s=null,d=m.t==="obj"?VC:af;continue}d=jC}else if(d===jC){if(l===null)return cf=r,o;if(r=Mn(t,r,n),r>=n)return Re(r,lf);let p=t.charCodeAt(r),m=l.t==="obj"?125:93;if(p===44){let x=r;if(r=Mn(t,r+1,n),r<n&&t.charCodeAt(r)===m)return Re(x,"Trailing comma");d=l.t==="obj"?VC:af}else if(p===m)r++,l=a.pop()??null,s=i.pop()??null;else return Re(r,l.t==="obj"?"Expected ',' or '}' after property value":"Expected ',' or ']' after array element")}else{if(r=Mn(t,r,n),r>=n)return Re(r,lf);if(t.charCodeAt(r)!==34)return Re(r,"Expected property name");if(r=GC(t,r,n),r<0)return null;if(f=sf,c=ff,u=!1,s!==null)s.has(f)?u=!0:s.add(f);else{let p=l.entries;for(let m=0;m<p.length;m++)if(p[m].key===f){u=!0;break}if(p.length>=yL){s=new Set;for(let m=0;m<p.length;m++)s.add(p[m].key);s.add(f)}}if(u&&Zi++,r=Mn(t,r,n),r>=n)return Re(r,lf);if(t.charCodeAt(r)!==58)return Re(r,"Expected ':' after property name");r++,d=af}}function xy(t,e,n,r){for(let o=1;o<r.length;o++){let a=e+o;if(a>=n)return Re(a,lf),!1;if(t.charCodeAt(a)!==r.charCodeAt(o))return Re(a,ud(t,a)),!1}return!0}function GC(t,e,n){let r=!1;for(let o=e+1;o<n;o++){let a=t.charCodeAt(o);if(a===34)return sf=t.slice(e+1,o),ff=r?t.slice(e,o+1):void 0,o+1;if(a===92)return SL(t,e,o,n);if(a<32)return Re(o,"Bad control character in string"),-1;(a&63488)===55296&&(a<56320&&o+1<n&&(t.charCodeAt(o+1)&64512)===56320?o++:r=!0)}return Re(e,"Unterminated string"),-1}function SL(t,e,n,r){let o=t.slice(e+1,n),a=n,i=n;for(;i<r;){let l=t.charCodeAt(i);if(l===34){o+=t.slice(a,i);let s=t.slice(e,i+1);return sf=o,ff=JSON.stringify(o)===s?void 0:s,i+1}if(l===92){if(o+=t.slice(a,i),i+1>=r)return Re(e,"Unterminated string"),-1;let s=t.charCodeAt(i+1),f,c=2;if(s===34)f='"';else if(s===92)f="\\";else if(s===47)f="/";else if(s===98)f="\b";else if(s===102)f="\f";else if(s===110)f=`
`;else if(s===114)f="\r";else if(s===116)f="	";else if(s===117){let u=kL(t,i+2,r);if(u<0)return Re(i,"Invalid Unicode escape"),-1;f=String.fromCharCode(u),c=6}else return Re(i,"Invalid escape sequence"),-1;o+=f,i+=c,a=i;continue}if(l<32)return Re(i,"Bad control character in string"),-1;i++}return Re(e,"Unterminated string"),-1}function kL(t,e,n){if(e+4>n)return-1;let r=0;for(let o=0;o<4;o++){let a=t.charCodeAt(e+o),i;if(a>=48&&a<=57)i=a-48;else if(a>=97&&a<=102)i=a-97+10;else if(a>=65&&a<=70)i=a-65+10;else return-1;r=r*16+i}return r}function CL(t,e,n){let r=e,o=t.charCodeAt(r),a=o===45;if(a&&(r++,o=r<n?t.charCodeAt(r):-1,o<48||o>57))return Re(r,"No number after minus sign");let i=!1,l=-1,s=0;if(o===48){if(r++,r<n){let d=t.charCodeAt(r);if(d>=48&&d<=57)return Re(r-1,"Leading zeros are not allowed")}}else for(;r<n&&(o=t.charCodeAt(r),!(o<48||o>57));)s++,r++;if(r<n&&t.charCodeAt(r)===46){if(l=r-e,r++,o=r<n?t.charCodeAt(r):-1,o<48||o>57)return Re(r,"Unterminated fractional number");for(;r<n&&(o=t.charCodeAt(r),!(o<48||o>57));)o!==48&&(i=!0),(s>0||o!==48)&&s++,r++}if(r<n&&(o=t.charCodeAt(r),o===101||o===69)){if(i=!0,r++,r<n&&(o=t.charCodeAt(r),(o===43||o===45)&&r++),o=r<n?t.charCodeAt(r):-1,o<48||o>57)return Re(r,"Exponent part is missing a number");for(;r<n&&(o=t.charCodeAt(r),!(o<48||o>57));)r++}let f=t.slice(e,r),c=+f,u=AL(f,c,i,l,s,a);return u||$i++,cf=r,{t:"num",raw:f,value:c,exact:u}}function AL(t,e,n,r,o,a){return e===0?o===0&&!a:Number.isFinite(e)?n||o<=15?!0:BigInt(e)===BigInt(r<0?t:t.slice(0,r)):!1}function dd(t,e){let n=e?.bigint===!0;if(t.t!=="obj"&&t.t!=="arr")return gy(t,n);let r=t.t==="obj"?{}:[],o=[t],a=[r],i=[0];e:for(;o.length>0;){let l=o.length-1,s=o[l];if(s.t==="arr"){let f=s.items,c=a[l];for(let u=i[l];u<f.length;u++){let d=f[u];if(d.t==="obj"||d.t==="arr"){let p=d.t==="obj"?{}:[];c.push(p),i[l]=u+1,o.push(d),a.push(p),i.push(0);continue e}c.push(gy(d,n))}}else{let f=s.entries,c=a[l];for(let u=i[l];u<f.length;u++){let d=f[u],p=d.value;if(p.t==="obj"||p.t==="arr"){let m=p.t==="obj"?{}:[];WC(c,d.key,m),i[l]=u+1,o.push(p),a.push(m),i.push(0);continue e}WC(c,d.key,gy(p,n))}}o.pop(),a.pop(),i.pop()}return r}function WC(t,e,n){Object.defineProperty(t,e,{value:n,writable:!0,enumerable:!0,configurable:!0})}function gy(t,e){if(t.t==="num"){let{raw:n,value:r}=t;if(!(Math.abs(r)<=Number.MAX_SAFE_INTEGER)&&IL.test(n)){if(!e)return new Dr(n);let o=n.indexOf(".");return BigInt(o<0?n:n.slice(0,o))}return r}return t.t==="str"||t.t==="bool"?t.value:null}var lf,hL,xL,HC,gL,yL,bL,IL,cf,Br,Ji,Zi,$i,sf,ff,af,jC,VC,Dr,ga=F(()=>{"use strict";lf="Unexpected end of input",hL=[")]}',",")]}'","while(1);","for(;;);","for (;;);"],xL=new Set(["application/x-ndjson","application/jsonl"]),HC="application/json-seq",gL="",yL=8,bL=/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/,IL=/^-?\d+(?:\.0+)?$/,cf=0,Br=0,Ji="",Zi=0,$i=0,sf="";af=0,jC=1,VC=2;Dr=class{constructor(e){er(this,"raw");if(typeof e!="string"||!bL.test(e))throw new TypeError(`Not a JSON number: ${String(e).slice(0,40)}`);this.raw=e}valueOf(){return Number(this.raw)}toString(){return this.raw}toJSON(){let e=JSON.rawJSON;return typeof e=="function"?e.call(JSON,this.raw):this.raw}}});var pd=F(()=>{"use strict"});function md(t){return typeof t=="object"&&t!==null}function hd(t){if(t===null)return{text:"NULL",truncated:!1,kind:"null"};if(typeof t=="number")return{text:String(t),truncated:!1,kind:"number"};if(typeof t=="boolean")return{text:String(t),truncated:!1,kind:"boolean"};if(md(t))return{text:`\\x${t.hex}\u2026 (${t.length} bytes)`,truncated:!1,kind:"blob"};let e=t.length>QC,n=e?t.slice(0,QC):t,r=t.trimStart()[0],o=(r==="{"||r==="[")&&el(t).ok;return{text:n,truncated:e,kind:o?"json":"text"}}function KC(t){if(t===null)return"";let e=md(t)?t.hex:String(t);return/[,"\r\n]/.test(e)?`"${e.replace(/"/g,'""')}"`:e}function YC(t,e){let n=[t.map(r=>KC(r.name)).join(",")];for(let r of e)n.push(r.map(KC).join(","));return n.join(`\r
`)}function JC(t,e){let n=e.map(r=>{let o={};return t.forEach((a,i)=>{o[a.name]=r[i]??null}),o});return JSON.stringify(n,null,2)}function tl(t,e){let n=e==="mysql"?"`":'"';return n+t.split(n).join(n+n)+n}function BL(t){return t===null?"NULL":typeof t=="number"?String(t):typeof t=="boolean"?t?"TRUE":"FALSE":md(t)?`X'${t.hex}'`:`'${t.replace(/'/g,"''")}'`}function DL(t,e,n,r){let o=`INSERT INTO ${tl(t,r)} (${e.map(a=>tl(a.name,r)).join(", ")}) VALUES (`;return n.map(a=>`${o}${a.map(BL).join(", ")});`).join(`
`)}function ZC(t){return md(t)&&t.hex.length<t.length*2}function $C(t){let e=0;for(let n of t)for(let r of n)ZC(r)&&e++;return e}function e2(t){return`${t} blob values were truncated to ${OL} bytes`}function t2(t,e,n,r){let o=[],a=0;for(let i of n){let l=i.filter(ZC).map(s=>`${s.length} bytes`);l.length&&o.push(`-- blob truncated: ${l.join(", ")}`),a+=l.length,o.push(DL(t,e,[i],r))}return{text:o.join(`
`),truncatedBlobs:a}}function nl(t){return Number.isNaN(t)?1e3:Math.min(5e4,Math.max(1,Math.trunc(t)))}var QC,OL,vo=F(()=>{"use strict";ga();pd();QC=65536,OL=256});var n2,r2=F(()=>{"use strict";fd();cd();nf();vo();n2={readOnlyEnforced:!0,cancel:!0,transactions:!0,cursor:!1,multiStatement:!0}});function l2(){let t=typeof chrome<"u"?chrome.runtime?.getURL?.(ML):void 0;if(!t)throw{code:"connection-lost",message:"The SQL worker is only available on the extension page."};return new Worker(t)}function s2(t){let e=null,n=1,r=new Map,o=null,a=!0,i=!1,l=null,s=Promise.resolve();function f(){let g=t();return g.onmessage=I=>{if(g!==e)return;let v=I.data,S=r.get(v.id);S&&(r.delete(v.id),v.ok?S.resolve(v.value):S.reject(Dn(v.error)))},g.onerror=()=>{g===e&&(l=a2,c(a2))},e=g,g}function c(g=o2){let I=e;e=null,I?.terminate();for(let v of r.values())v.reject(g);r.clear()}function u(g,I){let v=e;if(!v)return Promise.reject(l??o2);let S=n++;return new Promise((w,k)=>{r.set(S,{resolve:w,reject:k});try{v.postMessage({id:S,...g},I)}catch(D){r.delete(S),k(Dn(D))}})}function d(g,I){return Promise.resolve().then(()=>(c(),f(),u({op:"open",bytes:g,readOnly:I})))}async function p(g,I){let v=d(g,I);s=v.catch(()=>{});try{await v}catch(S){throw c(),o=null,l=null,S}o=g.slice(),a=I,i=!1,l=null}async function m(){if(await s,l)throw l}async function x(g,I,v){if(v?.aborted||(await m(),v?.aborted))throw yy;let S=u({op:"execute",sql:g,opts:I}),w=!1,k=()=>{w=!0;let D=o,L=a;c(),D&&(s=d(D,L).then(()=>{i=!1},()=>{c(i2),l=i2}))};v?.addEventListener("abort",k,{once:!0});try{let D=await S;return!a&&Yi(g,"sqlite").kind!=="read"&&(i=!0),D}catch(D){throw w?yy:(!a&&D.code!=="cancelled"&&Yi(g,"sqlite").kind!=="read"&&(i=!0),D)}finally{v?.removeEventListener("abort",k)}}async function b(){return await m(),u({op:"introspect"})}async function h(){await m();let g=await u({op:"export"});return o=g,i=!1,g.slice()}async function y(){c(),o=null,i=!1,l=null,s=Promise.resolve()}return{dialect:"sqlite",capabilities:n2,open:p,introspect:b,execute:x,exportBytes:h,close:y,get dirty(){return i}}}var yy,o2,a2,i2,ML,f2=F(()=>{"use strict";fd();cd();r2();yy={code:"cancelled",message:"Query cancelled."},o2={code:"connection-lost",message:"No database is open."},a2={code:"connection-lost",message:"The SQL worker stopped. Open the file again."},i2={code:"connection-lost",message:"The database could not be reopened. Open the file again."},ML="dist/sql-worker.js?opfs-disable&opfs-wl-disable"});function xd(t,e){let n=typeof e=="object"&&e!==null&&"code"in e&&e.code==="storage-unavailable"?"storage-unavailable":t,r=n==="storage-write-failed"&&typeof e=="object"&&e!==null&&"reason"in e&&e.reason==="quota";return Object.assign(new Error(n),{code:n},r?{reason:"quota"}:{})}async function uf(t,e){if(typeof window.XRAY_Store?.get!="function")throw xd("storage-unavailable");try{return await window.XRAY_Store.get(t,e,!0)??e}catch(n){throw xd("storage-read-failed",n)}}async function c2(t,e){if(typeof window.XRAY_Store?.set!="function")throw xd("storage-unavailable");try{await window.XRAY_Store.set(t,e,!0)}catch(n){throw xd("storage-write-failed",n)}}var by=F(()=>{"use strict"});function u2(t,e,n){return`SELECT * FROM ${n==="sqlite"&&t==="main"?tl(e,n):`${tl(t,n)}.${tl(e,n)}`} LIMIT 100;`}function d2(t,e="sqlite"){let n={},r=e==="mysql"?null:RL[e];for(let o of t.schemas){let a=e==="mysql"||o.name===r;for(let i of[...o.tables,...o.views])n[a?i.name:`${o.name}.${i.name}`]=i.columns.map(l=>l.name)}return n}var RL,Iy=F(()=>{"use strict";vo();RL={sqlite:"main",postgres:"public",mysql:null}});function m2(t,e,n){let r=t[e]??[],o=r[0]&&r[0].sql===n.sql?r.slice(1):r;return{...t,[e]:[n,...o].slice(0,EL)}}function df(){return typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():(p2+=1,`tab-${Date.now().toString(36)}-${p2}`)}function gd(t,e){let n=Array.isArray(t)?t:t&&typeof t=="object"?t[e]:void 0,r=[];if(Array.isArray(n))for(let o of n){if(!o||typeof o!="object"||typeof o.sql!="string")continue;let a=o;r.push({id:typeof a.id=="string"&&a.id?a.id:df(),title:typeof a.title=="string"&&a.title?a.title:`Query ${r.length+1}`,sql:a.sql,maxRows:typeof a.maxRows=="number"?nl(a.maxRows):1e3})}return r.length?r:[{id:df(),title:"Query 1",sql:"",maxRows:1e3}]}function h2(t,e){return`sqlite:${t}:${e}`}var vy,wy,EL,p2,x2=F(()=>{"use strict";vo();pd();vy="sql_history",wy="sql_editor_tabs",EL=200;p2=0});function So(){return Sy??(Sy=s2(l2)),Sy}function al(){return So().dirty||ba}function Ay(t){k2=t}function y2(t){if(!t||typeof t!="object"||Array.isArray(t))return{};let e={};for(let[n,r]of Object.entries(t))Array.isArray(r)&&(e[n]=r);return e}function Ty(){return ky??(ky=Promise.all([uf(vy,{}).catch(()=>({})),uf(wy,{}).catch(()=>({}))]).then(([t,e])=>{ll=y2(t),sl=y2(e)})),ky}function LL(t,e){let n=pf.get(t);n&&clearTimeout(n),Id.set(t,e),pf.set(t,setTimeout(()=>{pf.delete(t),Id.delete(t),e()},FL))}function Oy(){for(let[t,e]of pf)clearTimeout(e),Id.get(t)?.();pf.clear(),Id.clear()}function b2(t,e){LL(t,()=>{c2(t,e()).catch(()=>{})})}function il(t){return t.code==="not-a-database"?{...t,message:S2,detail:t.message}:t}function wo(t,...e){let n=[...t,...e];return n.length>g2?n.slice(n.length-g2):n}function I2(t){return`${Math.round(t)} ms`}function By(t){return t.columns.length===0?`${t.affected??0} rows affected \xB7 ${I2(t.durationMs)}`:`${t.rowCount} rows \xB7 ${I2(t.durationMs)}`}function NL(t){if(t.length===0)return!0;if(t.length<Cy.length)return!1;for(let e=0;e<Cy.length;e++)if(t[e]!==Cy.charCodeAt(e))return!1;return!0}function v2(t){return{id:df(),title:`Query ${t}`,sql:"",maxRows:1e3}}function _L(t,e){let n=URL.createObjectURL(new Blob([t],{type:"application/vnd.sqlite3"})),r=document.createElement("a");r.href=n,r.download=e,r.rel="noopener",document.body.appendChild(r),r.click(),r.remove(),setTimeout(()=>URL.revokeObjectURL(n),6e4)}var S2,g2,FL,Sy,rl,ol,ba,k2,yd,bd,ll,sl,ky,pf,Id,Cy,w2,G,Ia=F(()=>{"use strict";gw();f2();by();fd();cd();Iy();nf();vo();x2();pd();S2="This file is not a SQLite database.",g2=500,FL=300,Sy=null,rl=null,ol=null,ba=!1,k2=null,yd=null,bd=null,ll={},sl={},ky=null,pf=new Map,Id=new Map;Cy="SQLite format 3\0";w2=gd(void 0,""),G=hw((t,e)=>{function n(){let d=e().connection;d&&(sl={...sl,[d.key]:e().tabs},b2(wy,()=>sl))}function r(d){let p=e().connection;p&&(ll=m2(ll,p.key,d),t({history:ll[p.key]??[]}),b2(vy,()=>ll))}function o(...d){t({messages:wo(e().messages,...d)})}function a(d,p){bd=p,t({pendingPrompt:d})}async function i(){try{let d=await So().introspect();t({schema:d,dirty:al()})}catch(d){let p=il(Dn(d));t({dirty:al()}),o(p.message)}}async function l(d,p){await Ty(),Oy();let m=!!e().connection,x=m?!0:e().readOnlyChoice;t({opening:!0,error:null,errorAt:null});let b;try{b=new Uint8Array(await d.arrayBuffer())}catch(v){let S=v instanceof Error?v.message:String(v);t({opening:!1,bottomTab:"messages",messages:wo(e().messages,`${d.name}: ${S}`)});return}if(!NL(b)){let v={code:"not-a-database",message:S2};t({opening:!1,error:v,bottomTab:"messages",messages:wo(e().messages,`${d.name}: ${v.message}`)});return}try{await So().open(b,x)}catch(v){let S=il(Dn(v));rl=null,ol=null,ba=!1;let w=m?gd(void 0,""):null;t({...w?{tabs:w,activeTabId:w[0].id,errorAt:null}:{},opening:!1,connection:null,schema:null,result:null,resultTable:null,dirty:!1,history:[],readOnlyChoice:!0,error:S,bottomTab:"messages",messages:wo(e().messages,`${d.name}: ${S.message}`)});return}rl=b,ol=p??null,ba=!1;let h=h2(d.name,d.size),y=sl[h]||m?gd(sl,h):e().tabs,g=null,I=null;try{g=await So().introspect()}catch(v){I=il(Dn(v)).message}t({opening:!1,connection:{name:d.name,size:d.size,readOnly:x,key:h},readOnlyChoice:x,schema:g,tabs:y,activeTabId:y[0].id,result:null,resultTable:null,error:null,errorAt:null,dirty:!1,history:ll[h]??[],bottomTab:"results",messages:wo(e().messages,`Opened ${d.name}${x?" (read-only)":""}.`,...I?[I]:[])}),n()}async function s(d){let p=e().connection;if(!(!p||!rl)){try{await So().open(rl,d)}catch(m){let x=il(Dn(m));rl=null,ol=null,ba=!1,t({connection:null,schema:null,dirty:!1,error:x,bottomTab:"messages"}),o(x.message);return}ba=!1,t({connection:{...p,readOnly:d},readOnlyChoice:d,dirty:!1}),o(d?`${p.name} is read-only.`:`${p.name} is open for writing. Save writes changes back.`),await i()}}async function f(d,p,m){let x=new AbortController;t({running:{tabId:d.tabId,controller:x},error:null,errorAt:null});let b=Date.now();try{let h=await So().execute(p.text,{maxRows:d.maxRows},x.signal);r({sql:p.text,at:b,durationMs:Math.round(h.durationMs),rowCount:h.columns.length?h.rowCount:h.affected,ok:!0});let y=[...h.notices];return h.truncatedCells>0&&y.push(`${h.truncatedCells} long text values were cut for display.`),t({running:null,result:h,resultTable:d.resultTable,dirty:al(),bottomTab:"results",messages:wo(e().messages,By(h),...y)}),m!=="read"&&await i(),!0}catch(h){let y=il(Dn(h));return r({sql:p.text,at:b,durationMs:Date.now()-b,rowCount:null,ok:!1,error:y.message}),t({running:null,error:y,errorAt:y.position===void 0?null:{tabId:d.tabId,position:y.position+p.from},dirty:al(),bottomTab:"messages",messages:wo(e().messages,y.message)}),y.code==="cancelled"&&await i(),!1}}async function c(d,p){for(yd=null;d.index<d.items.length;){let m=e().connection;if(!m)return;let x=d.items[d.index],b=Yi(x.text,"sqlite");if(m.readOnly&&b.kind!=="read"&&b.reason!=="could not parse"){let h={code:"read-only",message:`This connection is read-only. Turn off Read-only to run ${b.reason}.`};t({error:h,errorAt:null,bottomTab:"messages",messages:wo(e().messages,h.message)});return}if(!m.readOnly&&b.kind==="dangerous"&&d.index!==p){yd=d,t({pendingConfirm:{sql:x.text,reason:b.reason}});return}if(!await f(d,x,b.kind))return;d.index+=1}}function u(){let d=e();return!!d.connection&&!d.running&&!d.opening&&!d.pendingConfirm&&!d.pendingPrompt}return{connection:null,schema:null,tabs:w2,activeTabId:w2[0].id,running:null,result:null,error:null,messages:[],history:[],pendingConfirm:null,dirty:!1,opening:!1,readOnlyChoice:!0,errorAt:null,resultTable:null,bottomTab:"results",pendingPrompt:null,async openFile(d,p){let m=e();if(!(m.running||m.opening)){if(m.dirty&&m.connection){a({title:"Discard unsaved changes?",message:`Opening ${d.name} discards the unsaved changes in ${m.connection.name}.`,confirmLabel:"Discard changes"},()=>l(d,p));return}await l(d,p)}},async run(d){if(!u())return;let p=e(),m=p.tabs.find(h=>h.id===p.activeTabId);if(!m)return;let x=m.sql,b=[];if(d==="all")b=tf(x,"sqlite").map(h=>({text:h.text,from:h.from}));else{let h=k2?.()??{from:x.length,to:x.length,head:x.length},y=Math.max(0,Math.min(h.from,x.length)),g=Math.max(y,Math.min(h.to,x.length));if(g>y&&x.slice(y,g).trim())b=[{text:x.slice(y,g),from:y}];else{let I=NC(x,Math.min(h.head,x.length),"sqlite");I&&(b=[{text:I.text,from:I.from}])}}if(!b.length){o("Nothing to run.");return}await c({tabId:m.id,items:b,index:0,maxRows:m.maxRows,resultTable:null},-1)},stop(){let d=e().running;if(d){if(So().dirty){a({title:"Stop the query?",message:"Stopping restarts the database and loses unsaved changes.",confirmLabel:"Stop anyway"},()=>e().running?.controller.abort());return}d.controller.abort()}},async confirmPending(){let d=yd;t({pendingConfirm:null}),d&&await c(d,d.index)},cancelPending(){yd=null,t({pendingConfirm:null}),o("Statement not run.")},async confirmPrompt(){let d=bd;bd=null,t({pendingPrompt:null}),await d?.()},cancelPrompt(){bd=null,t({pendingPrompt:null})},async previewTable(d,p){if(!u())return;let m=u2(d,p,"sqlite"),x=e().tabs.find(h=>h.title===p&&h.sql===m),b=x??{id:df(),title:p,sql:m,maxRows:1e3};t({tabs:x?e().tabs:[...e().tabs,b],activeTabId:b.id}),n(),await c({tabId:b.id,items:[{text:m,from:0}],index:0,maxRows:b.maxRows,resultTable:p},-1)},async setReadOnly(d){let p=e();if(!p.connection){t({readOnlyChoice:d});return}if(!(d===p.connection.readOnly||p.running||p.opening)){if(d&&(p.dirty||al())){a({title:"Discard unsaved changes?",message:`Turning Read-only back on reopens ${p.connection.name} as last opened or saved. Unsaved changes are lost.`,confirmLabel:"Discard changes"},async()=>{t({readOnlyChoice:!0,opening:!0});try{await s(!0)}finally{t({opening:!1,readOnlyChoice:e().connection?.readOnly??!0})}});return}t({readOnlyChoice:d,opening:!0});try{await s(d)}finally{t({opening:!1,readOnlyChoice:e().connection?.readOnly??!0})}}},async save(){let d=e(),p=d.connection;if(!p||!d.dirty||d.running)return;let m;try{m=await So().exportBytes()}catch(x){let b=il(Dn(x));t({error:b,bottomTab:"messages"}),o(`Could not save ${p.name}: ${b.message}`);return}try{if(ol&&typeof ol.createWritable=="function"){let x=await ol.createWritable();await x.write(m),await x.close(),o(`Saved ${p.name}.`)}else _L(m,p.name),o(`Downloaded ${p.name}.`);rl=m,ba=!1,t({dirty:al()})}catch(x){let b=x instanceof Error?x.message:String(x);ba=!0,t({dirty:!0,bottomTab:"messages"}),o(`Could not save ${p.name}: ${b}`)}},setMaxRows(d){let p=e().activeTabId,m=nl(d);t({tabs:e().tabs.map(x=>x.id===p?{...x,maxRows:m}:x)}),n()},addTab(){let d=v2(e().tabs.length+1);t({tabs:[...e().tabs,d],activeTabId:d.id}),n()},closeTab(d){let p=e();if(p.running?.tabId===d)return;let m=p.tabs.findIndex(h=>h.id===d);if(m<0)return;let x=p.tabs.filter(h=>h.id!==d);x.length||(x=[v2(1)]);let b=p.activeTabId===d?x[Math.min(m,x.length-1)].id:p.activeTabId;t({tabs:x,activeTabId:b,errorAt:p.errorAt?.tabId===d?null:p.errorAt}),n()},setActiveTab(d){e().tabs.some(p=>p.id===d)&&t({activeTabId:d})},updateTabSql(d,p){let m=e(),x=m.tabs.find(b=>b.id===d);!x||x.sql===p||(t({tabs:m.tabs.map(b=>b.id===d?{...b,sql:p}:b),errorAt:m.errorAt?.tabId===d?null:m.errorAt}),n())},setBottomTab(d){t({bottomTab:d})}}})});function vd(t){return typeof t=="string"&&D2.test(t)}function PL(t){return Rt(t,"")!==""}function Rt(t,e){if(typeof t=="string"){let n=t.trim();if(/^[0-9a-fA-F]{6}$/.test(n)&&(n="#"+n),/^#[0-9a-fA-F]{3}$/.test(n)&&(n="#"+n.slice(1).split("").map(r=>r+r).join("")),D2.test(n))return n.toLowerCase()}return e}function M2(t){let e=t||{},n={bg:Rt(e.bg,xn.bg),surface:Rt(e.surface,xn.surface),text:Rt(e.text,xn.text),accent:Rt(e.accent,xn.accent)};for(let r of qL){let o=e[r];PL(o)&&(n[r]=Rt(o,"#000000"))}return n}function me(t){let e=parseInt(t.slice(1),16);return[e>>16&255,e>>8&255,e&255]}function ge([t,e,n]){let r=o=>Math.max(0,Math.min(255,Math.round(o))).toString(16).padStart(2,"0");return`#${r(t)}${r(e)}${r(n)}`}function va([t,e,n]){return`${Math.round(t)}, ${Math.round(e)}, ${Math.round(n)}`}function Be(t,e,n){return[t[0]+(e[0]-t[0])*n,t[1]+(e[1]-t[1])*n,t[2]+(e[2]-t[2])*n]}function R2([t,e,n]){return .2126*t+.7152*e+.0722*n}function Dy(t){let e=t/255;return e<=.03928?e/12.92:Math.pow((e+.055)/1.055,2.4)}function C2([t,e,n]){return .2126*Dy(t)+.7152*Dy(e)+.0722*Dy(n)}function wd(t,e){let n=C2(t),r=C2(e);return(Math.max(n,r)+.05)/(Math.min(n,r)+.05)}function E2(t){let e=t/255;return e<=.04045?e/12.92:((e+.055)/1.055)**2.4}function zL(t){return(t<=.0031308?12.92*t:1.055*t**.4166666666666667-.055)*255}function mf(t){let[e,n,r]=t.map(E2),o=Math.cbrt(.4122214708*e+.5363325363*n+.0514459929*r),a=Math.cbrt(.2119034982*e+.6806995451*n+.1073969566*r),i=Math.cbrt(.0883024619*e+.2817188376*n+.6299787005*r),l=.2104542553*o+.793617785*a-.0040720468*i,s=1.9779984951*o-2.428592205*a+.4505937099*i,f=.0259040371*o+.7827717662*a-.808675766*i;return[l,Math.hypot(s,f),Math.atan2(f,s)]}function My(t,e,n){let r=e*Math.cos(n),o=e*Math.sin(n),a=(t+.3963377774*r+.2158037573*o)**3,i=(t-.1055613458*r-.0638541728*o)**3,l=(t-.0894841775*r-1.291485548*o)**3;return[4.0767416621*a-3.3077115913*i+.2309699292*l,-1.2684380046*a+2.6097574011*i-.3413193965*l,-.0041960863*a-.7034186147*i+1.707614701*l]}function HL(t,e,n){let r=i=>i.every(l=>l>=-1e-6&&l<=1.000001),o=0,a=e;if(!r(My(t,a,n))){for(let i=0;i<24;i++){let l=(o+a)/2;r(My(t,l,n))?o=l:a=l}a=o}return My(t,a,n).map(i=>zL(Math.min(1,Math.max(0,i))))}function A2(t){let[e,n,r]=t.map(E2),o=s=>s>216/24389?Math.cbrt(s):(24389/27*s+16)/116,a=o((.4124564*e+.3575761*n+.1804375*r)/.95047),i=o(.2126729*e+.7151522*n+.072175*r),l=o((.0193339*e+.119192*n+.9503041*r)/1.08883);return[116*i-16,500*(a-i),200*(i-l)]}function UL(t,e){let[n,r,o]=A2(t),[a,i,l]=A2(e),s=Math.PI/180,f=(Math.hypot(r,o)+Math.hypot(i,l))/2,c=.5*(1-Math.sqrt(f**7/(f**7+25**7))),u=(1+c)*r,d=(1+c)*i,p=Math.hypot(u,o),m=Math.hypot(d,l),x=(C,z)=>z===0&&C===0?0:(Math.atan2(C,z)/s+360)%360,b=x(o,u),h=x(l,d),y=p*m!==0,g=y?h-b>180?h-b-360:h-b<-180?h-b+360:h-b:0,I=2*Math.sqrt(p*m)*Math.sin(g*s/2),v=(n+a)/2,S=(p+m)/2,w=y?Math.abs(b-h)<=180?(b+h)/2:b+h<360?(b+h+360)/2:(b+h-360)/2:b+h,k=1-.17*Math.cos((w-30)*s)+.24*Math.cos(2*w*s)+.32*Math.cos((3*w+6)*s)-.2*Math.cos((4*w-63)*s),D=1+.015*(v-50)**2/Math.sqrt(20+(v-50)**2),L=1+.045*S,P=1+.015*S*k,E=-Math.sin(60*Math.exp(-(((w-275)/25)**2))*s)*2*Math.sqrt(S**7/(S**7+25**7));return Math.sqrt(((a-n)/D)**2+((m-p)/L)**2+(I/P)**2+E*((m-p)/L)*(I/P))}function fl(t,e,n,r,o=()=>!0){let a=c=>Math.min(...n(c).map(u=>wd(c,u)))>=r&&o(c);if(a(t))return t;let[i,l,s]=mf(t),f=t;for(let c=i+e*.005;c>=0&&c<=1;c+=e*.005)if(f=me(ge(HL(c,l,s))),a(f))return f;return f}function F2(t){let e=me(Rt(t.bg,xn.bg)),n=me(Rt(t.surface,xn.surface)),r=me(Rt(t.text,xn.text)),o=Rt(t.accent,xn.accent),a=R2(e)>140,i=a?VL:jL,l=k=>{let D=t[k];return vd(D)?me(Rt(D,"#000000")):null},s=l("surface2")??me(ge(Be(n,r,.1))),f=s,c=s,u=l("hover")??me(ge(Be(e,r,.08))),d=k=>me(ge(Be(me(o),e,1-k))),p=l("selection")??d(a?.09:.12);for(let k=a?.1:.13;!l("selection")&&k<=.18+1e-9&&UL(p,u)<3.6;k+=.01)p=d(k);let m=mf(r)[0]>mf(e)[0]?1:-1,x=4.51,b=fl(me(ge(Be(r,e,a?.32:.38))),m,()=>[e,n,s,f],x),h=fl(me(ge(Be(r,e,a?.26:.34))),m,()=>[e,n,s],x,k=>wd(k,e)>=wd(b,e)*1.08),y=fl(me(ge(Be(r,e,a?.34:.46))),m,()=>[e,n,c],x),g=fl(me(ge(Be(n,r,a?.56:.44))),m,()=>[f,e],3.01),I=k=>[e,n,s,c,p,u,Be(e,k,.1),Be(n,k,.1),Be(s,k,.1),Be(p,k,.1)],v=k=>ge(fl(me(k),m,I,x)),S={bg:ge(e),surface:ge(n),surface2:ge(Be(n,r,.1)),surface3:ge(Be(n,r,.18)),text:ge(r),subtext:ge(h),hint:ge(b),border:ge(Be(n,r,.16)),"border-control":ge(g),focus:o,selection:ge(p),hover:ge(u),active:ge(Be(me(o),e,.68)),disabled:ge(Be(r,e,.62)),accent:o,"accent-soft":ge(p),green:v(i.green),red:v(i.red),yellow:v(i.yellow),blue:v(i.blue),mauve:v(i.mauve),teal:v(i.teal),peach:v(i.peach),pending:v(i.yellow),neutral:ge(y),shadow:"#000000",overlay:ge(e)},w={...S};for(let k of B2){let D=t[k];vd(D)&&(w[k]=Rt(D,S[k]))}return w}function T2(t,e){return!O2.includes(e)&&vd(t[e])}function GL(t,e,n,r){for(let o=r;o<1;o=Math.round((o+.02)*100)/100)if([e,n].every(i=>{let l=Be(i,e,.44);return wd(Be(l,t,o),l)>=3.01}))return o;return 1}function L2(t){let e=F2(t),n=me(e.bg),r=me(e.surface),o=me(e.surface2),a=me(e.text),i=R2(n)>140,l=vd(t.border)?Rt(t.border,e.border):`rgba(${va(a)}, 0.16)`;return{"--xray-bg":e.bg,"--xray-surface":e.surface,"--xray-surface2":e.surface2,"--xray-surface3":e.surface3,"--xray-text":e.text,"--xray-subtext":e.subtext,"--xray-hint":e.hint,"--xray-bg-rgb":va(n),"--xray-surface-rgb":va(r),"--xray-surface2-rgb":va(o),"--xray-text-rgb":va(a),"--xray-border":l,"--xray-border-control":e["border-control"],"--xray-focus":e.focus,"--xray-selection":e.selection,"--xray-hover":e.hover,"--xray-active":e.active,"--xray-disabled":e.disabled,"--xray-accent":e.accent,"--xray-accent-soft":e["accent-soft"],"--xray-green":e.green,"--xray-red":e.red,"--xray-yellow":e.yellow,"--xray-blue":e.blue,"--xray-mauve":e.mauve,"--xray-teal":e.teal,"--xray-peach":e.peach,"--xray-pending":e.pending,"--xray-neutral":e.neutral,"--xray-shadow":T2(t,"shadow")?e.shadow:"rgba(0, 0, 0, .38)","--xray-overlay":T2(t,"overlay")?e.overlay:`rgba(${va(n)}, .74)`,"--xray-operator-grid":`color-mix(in srgb, ${e.accent} ${i?"4%":"3.5%"}, transparent)`,"--xray-sink":i?"#ffffff":"#000000","--xray-scroll-thumb":`rgba(${va(me(e.hint))}, ${GL(me(e.hint),n,r,i?.8:.64)})`}}function Ry(t,e=4.51){let n=F2(t),r=me(n.bg),o=me(n.surface),a=me(n.surface2),i=me(n.text),l=me(n.mauve),s=mf(i)[0]>mf(r)[0]?1:-1,f=u=>[Be(o,u,.1),Be(a,u,.1),Be(o,l,.1),Be(a,l,.1),Be(r,u,.14)],c=ge(fl(me(Rt(t.accent,xn.accent)),s,f,e));return{...t,accent:c}}var xn,O2,B2,qL,D2,jL,VL,u_,Ey=F(()=>{"use strict";xn={bg:"#0f1117",surface:"#171a23",text:"#e7e9f0",accent:"#a99aff"},O2=["bg","surface","text","accent"],B2=["bg","surface","surface2","surface3","text","subtext","hint","border","border-control","focus","selection","hover","active","disabled","accent","accent-soft","green","red","yellow","blue","mauve","teal","peach","pending","neutral","shadow","overlay"],qL=B2.filter(t=>!O2.includes(t)),D2=/^#[0-9a-fA-F]{6}$/;jL={green:"#a6e3a1",red:"#f38ba8",yellow:"#f9e2af",blue:"#89b4fa",mauve:"#cba6f7",teal:"#94e2d5",peach:"#fab387"},VL={green:"#0e7e48",red:"#ad2353",yellow:"#805516",blue:"#1970c0",mauve:"#6135e6",teal:"#0b788a",peach:"#a6370b"};u_=[{label:"Slate",theme:{bg:"#0f1117",surface:"#171a23",text:"#e7e9f0",accent:"#9479ff"}},{label:"Graphite",theme:{bg:"#0e0e10",surface:"#19191c",text:"#ededed",accent:"#22d3ee"}},{label:"Ros\xE9",theme:{bg:"#1a1114",surface:"#241519",text:"#f4e9ec",accent:"#fb7185"}},{label:"Emerald",theme:{bg:"#0b1210",surface:"#131c19",text:"#e6f0ec",accent:"#34d399"}},{label:"Nord",theme:{bg:"#2e3440",surface:"#3b4252",text:"#eceff4",accent:"#88c0d0"}},{label:"Solarized",theme:{bg:"#002b36",surface:"#073642",text:"#eee8d5",accent:"#268bd2"}},{label:"Amber",theme:{bg:"#161207",surface:"#211a0c",text:"#f6ecd6",accent:"#f5a623"}},{label:"Sakura",theme:{bg:"#1c141a",surface:"#281b26",text:"#f6e9f1",accent:"#ec4899"}},{label:"Paper",theme:{bg:"#faf9f6",surface:"#ffffff",text:"#1c1b19",accent:"#2563eb"}},{label:"Sky",theme:{bg:"#eef4fb",surface:"#ffffff",text:"#16273b",accent:"#0284c7"}},{label:"Sage",theme:{bg:"#eef2ec",surface:"#fbfdfa",text:"#1e2a20",accent:"#3f8a4f"}}].map(({label:t,theme:e})=>({label:t,theme:Ry(e)}))});var N2=F(()=>{"use strict";ga()});function ko(t,e,n,r){if(typeof t=="string"&&t.trim()===""||typeof t!="number"&&typeof t!="string")return e;let o=Number(t);return Number.isFinite(o)?Math.min(r,Math.max(n,Math.round(o))):e}function Fy(t,e=2,n=8e4){let r=[],o="";try{o=JSON.stringify(t,function(a,i){if(typeof i=="bigint")return i.toString()+"n";if(i&&typeof i=="object"){for(;r.length>0&&r[r.length-1]!==this;)r.pop();if(r.includes(i))return"[Circular]";r.push(i)}return i},e)??"undefined"}catch{try{o=String(t)}catch{o="[unserializable]"}}return o.length<=n?o:o.slice(0,n)+`
... truncated ${o.length-n} chars`}var S_,Ly=F(()=>{"use strict";N2();ga();S_=new Intl.DateTimeFormat("en-US",{hour12:!1,hour:"2-digit",minute:"2-digit",second:"2-digit"})});function WL(t){return typeof t=="string"&&Object.prototype.hasOwnProperty.call(_y,t)?t:null}function nN(t,e){let n=qy.find(({id:a})=>a===t.theme);if(!n)return Ny[e]??Ny.blue;let r=`${n.id}:${e}`,o=_2.get(r);if(!o){let a=n.kind==="light"?tN:Ny,i=a[e]??a.blue;o=Ry({bg:n.preview.bg,text:n.preview.text,accent:i,...n.hosts},n.contrast+.01).accent,_2.set(r,o)}return o}function P2(t){return t.theme==="custom"?t.customTheme?.accent??xn.accent:t.accentChosen?nN(t,t.accent):void 0}function rN(t,e){return QL.includes(t)?t:e}function oN(t,e){return q2.includes(t)?t:e}function aN(t,e){return KL.includes(t)?t:e}function iN(t,e){return YL.includes(t)?t:e}function lN(t,e){return JL.includes(t)?t:e}function sN(t,e){return ZL.includes(t)?t:e}function H2(t){let e=Object.fromEntries(Object.entries(t||{}).filter(([,u])=>u!==void 0)),n={...Je,...e},r=q2.includes(n.accent),o=oN(n.accent,Je.accent),a=typeof e.themeRefreshPending!="boolean",i=WL(n.theme),l=i?_y[i].to:aN(n.theme,Je.theme),s=i?_y[i].accent:a&&l==="midnight"?"peach":null,f=s?r&&o!==s:typeof e.accentChosen=="boolean"?e.accentChosen:o!==Je.accent,c=!!n.themeRefreshPending||i!==null||s!==null&&!f;return{captureFetch:!!n.captureFetch,captureXhr:!!n.captureXhr,captureWs:!!n.captureWs,maxEntries:ko(n.maxEntries,Je.maxEntries,50,5e3),slowThresholdMs:ko(n.slowThresholdMs,Je.slowThresholdMs,100,5e3),verySlowThresholdMs:ko(n.verySlowThresholdMs,Je.verySlowThresholdMs,200,1e4),defaultDetailView:rN(n.defaultDetailView,Je.defaultDetailView),compactRows:!!n.compactRows,showHostInPath:!!n.showHostInPath,accent:o,accentChosen:f,theme:l,customTheme:M2(n.customTheme),font:iN(n.font,Je.font),density:lN(n.density,Je.density),radius:ko(n.radius,Je.radius,0,20),glow:!!n.glow,hacker:!!n.hacker,confirmDestructiveActions:!!n.confirmDestructiveActions,panelWidth:ko(n.panelWidth,Je.panelWidth,$L,eN),dockSide:sN(n.dockSide,Je.dockSide),apiSplit:ko(n.apiSplit,Je.apiSplit,0,2e3),logsSplit:ko(n.logsSplit,Je.logsSplit,0,2e3),firstRunDismissed:!!n.firstRunDismissed,themeRefreshPending:c}}var qy,_y,T_,XL,QL,q2,KL,YL,JL,ZL,$L,eN,Ny,tN,_2,z2,Je,Sd=F(()=>{"use strict";Ey();Ly();qy=[{id:"xray-dark",label:"XRAY Dark",kind:"dark",contrast:4.5,preview:{bg:"#141517",accent:"#3dc8f5",text:"#eeeff1"},hosts:{surface:"#1b1c1f",surface2:"#25272a",mauve:"#c6a0f2"}},{id:"xray-light",label:"XRAY Light",kind:"light",contrast:4.5,preview:{bg:"#f3f4f6",accent:"#00698f",text:"#16171a"},hosts:{surface:"#ffffff",surface2:"#eaecef",mauve:"#793fad"}},{id:"github-dark",label:"GitHub Dark",kind:"dark",contrast:4.5,preview:{bg:"#0d1117",accent:"#5297ff",text:"#e6edf3"},hosts:{surface:"#161b22",surface2:"#21262d",mauve:"#ad7fff"}},{id:"github-light",label:"GitHub Light",kind:"light",contrast:4.5,preview:{bg:"#f6f8fa",accent:"#005eca",text:"#1f2328"},hosts:{surface:"#ffffff",surface2:"#eaeef2",mauve:"#723cca"}},{id:"tokyo-night",label:"Tokyo Night",kind:"dark",contrast:4.5,preview:{bg:"#16161e",accent:"#7ba4f9",text:"#c0caf5"},hosts:{surface:"#1a1b26",surface2:"#292e42",mauve:"#bb9af7"}},{id:"catppuccin-mocha",label:"Catppuccin Mocha",kind:"dark",contrast:4.5,preview:{bg:"#181825",accent:"#cba6f7",text:"#cdd6f4"},hosts:{surface:"#1e1e2e",surface2:"#313244",mauve:"#f5c2e7"}},{id:"dracula",label:"Dracula",kind:"dark",contrast:4.5,preview:{bg:"#21222c",accent:"#c59dff",text:"#f8f8f2"},hosts:{surface:"#282a36",surface2:"#343746",mauve:"#ff86ca"}},{id:"gruvbox-dark",label:"Gruvbox Dark",kind:"dark",contrast:4.5,preview:{bg:"#1d2021",accent:"#8ec07c",text:"#ebdbb2"},hosts:{surface:"#282828",surface2:"#3c3836",mauve:"#ea9bb0"}},{id:"midnight",label:"High Contrast",kind:"dark",contrast:7,preview:{bg:"#000000",accent:"#00e5ff",text:"#ffffff"},hosts:{surface:"#101010",surface2:"#1d1d1d",mauve:"#d4a8ff"}}],_y={operator:{to:"xray-dark",accent:"blue"},"dev-edition":{to:"xray-dark",accent:"coral"},"light-lab":{to:"xray-light",accent:"blue"},claude:{to:"xray-light",accent:"coral"}};T_={...Object.fromEntries(qy.map(({id:t,label:e})=>[t,e])),custom:"Custom"},XL=new Map(qy.map(({id:t,kind:e})=>[t,e])),QL=["tree","grid","raw","schema","diff","viz","waterfall","headers"],q2=["blue","mauve","teal","green","peach","coral"],KL=[...XL.keys(),"custom"],YL=["jetbrains","cascadia","iosevka","system"],JL=["compact","comfortable","spacious"],ZL=["left","right"],$L=360,eN=2e3,Ny={blue:"#d99a2b",mauve:"#cba6f7",teal:"#94e2d5",green:"#a6e3a1",peach:"#f2d457",coral:"#eaa388"},tN={blue:"#845600",mauve:"#7418ec",teal:"#0d696e",green:"#226d15",peach:"#6e6200",coral:"#a23f1e"},_2=new Map;z2={jetbrains:"'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",cascadia:"'Cascadia Code', 'Cascadia Mono', 'JetBrains Mono', monospace",iosevka:"'Iosevka', 'JetBrains Mono', 'Fira Code', monospace",system:"ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"},Je={captureFetch:!0,captureXhr:!0,captureWs:!0,maxEntries:1e3,slowThresholdMs:500,verySlowThresholdMs:1e3,defaultDetailView:"tree",compactRows:!1,showHostInPath:!0,accent:"blue",accentChosen:!1,theme:"xray-dark",customTheme:xn,font:"jetbrains",density:"compact",radius:10,glow:!1,hacker:!1,confirmDestructiveActions:!0,panelWidth:960,dockSide:"right",apiSplit:0,logsSplit:0,firstRunDismissed:!1,themeRefreshPending:!1}});var j2=In(kd=>{"use strict";var fN=Symbol.for("react.transitional.element"),cN=Symbol.for("react.fragment");function U2(t,e,n){var r=null;if(n!==void 0&&(r=""+n),e.key!==void 0&&(r=""+e.key),"key"in e){n={};for(var o in e)o!=="key"&&(n[o]=e[o])}else n=e;return e=n.ref,{$$typeof:fN,type:t,key:r,ref:e!==void 0?e:null,props:n}}kd.Fragment=cN;kd.jsx=U2;kd.jsxs=U2});var Ne=In((D_,V2)=>{"use strict";V2.exports=j2()});function dN(t){let e=t.getRootNode();return e instanceof ShadowRoot?e:document}function Cd(t){let e=t.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e}function W2(t,e){let n=Cd(e);return Array.from(t.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(r=>r.offsetParent!==null||r===n)}function zy(t){let e=Array.from(t.querySelectorAll('[role="dialog"]')).filter(n=>Py.has(n));return e[e.length-1]}function pN(t,e){return zy(t)===e}function G2(t,e,n){let r=n?.current;if(r&&t.contains(r)){r.focus();return}let o=W2(t,e);(o.find(i=>i.matches('input, select, textarea, [contenteditable="true"]'))||o[0]||null)?.focus()}function Hy({title:t,subtitle:e,icon:n,className:r="",children:o,footer:a,initialFocusRef:i,onClose:l}){let s=(0,cl.useRef)(null);return(0,cl.useLayoutEffect)(()=>{let f=s.current;if(f)return Py.set(f,l),()=>{Py.delete(f)}},[l]),(0,cl.useEffect)(()=>{let f=s.current;if(!f)return;let c=dN(f),u=Cd(c),d=zy(c);d&&(d===f||!d.contains(u))&&G2(d,c,d===f?i:void 0);function p(m){if(m.key!=="Tab"||!f||!pN(c,f))return;let x=W2(f,c);if(!x.length){m.preventDefault();return}let b=x[0],h=x[x.length-1],y=Cd(c);m.shiftKey&&y===b?(m.preventDefault(),h.focus()):!m.shiftKey&&y===h&&(m.preventDefault(),b.focus())}return document.addEventListener("keydown",p,!0),()=>{document.removeEventListener("keydown",p,!0);let m=zy(c),x=Cd(c);m&&x&&m.contains(x)||(u instanceof HTMLElement&&u.isConnected&&(!m||m.contains(u))?u.focus():m&&G2(m,c))}},[]),(0,Yt.jsx)("div",{className:"xray-modal-backdrop",onMouseDown:l,children:(0,Yt.jsxs)("section",{ref:s,className:`xray-modal ${r}`,role:"dialog","aria-modal":"true","aria-label":t,onMouseDown:f=>f.stopPropagation(),children:[(0,Yt.jsxs)("header",{className:"xray-modal-head",children:[n&&(0,Yt.jsx)("span",{className:"xray-modal-title-icon",children:n}),(0,Yt.jsxs)("div",{children:[(0,Yt.jsx)("h3",{children:t}),e&&(0,Yt.jsx)("div",{className:"xray-modal-subtitle",children:e})]}),(0,Yt.jsx)("span",{className:"xray-spacer"}),(0,Yt.jsx)("button",{className:"xray-icon-btn",onClick:l,"aria-label":`Close ${t}`,children:(0,Yt.jsx)(Ko,{...uN})})]}),o,a&&(0,Yt.jsx)("footer",{className:"xray-modal-foot",children:a})]})})}var cl,Yt,uN,Py,X2=F(()=>{"use strict";cl=$(ct());Yo();Yt=$(Ne()),uN={size:16,stroke:1.8},Py=new WeakMap});function mN(t){return t.columns.map(e=>`${e.name}${e.type?` ${e.type}`:""}${e.pk?" PK":""}`).join(`
`)}function hN({schema:t,table:e,view:n}){let r=G(i=>i.previewTable),o=G(i=>!!i.running||i.opening),a=()=>{o||r(t,e.name)};return(0,st.jsxs)("div",{role:"treeitem",tabIndex:0,"aria-level":2,"aria-disabled":o||void 0,className:"xray-sql-rail-item",title:mN(e),onClick:a,onKeyDown:i=>{(i.key==="Enter"||i.key===" ")&&(i.preventDefault(),a())},children:[n?(0,st.jsx)(Oh,{size:14,stroke:1.8,"aria-hidden":"true"}):(0,st.jsx)(Eh,{size:14,stroke:1.8,"aria-hidden":"true"}),(0,st.jsx)("span",{className:"xray-sql-rail-name",children:e.name})]})}function K2(){let t=G(n=>n.connection),e=G(n=>n.schema);return(0,st.jsxs)("nav",{className:"xray-sql-rail","aria-label":"Schema",children:[!t&&(0,st.jsx)("p",{className:"xray-sql-empty",children:"Open a SQLite file to browse its tables."}),t&&e&&(0,st.jsxs)("div",{role:"tree","aria-label":"Tables and views",className:"xray-sql-tree",children:[e.schemas.map(n=>(0,st.jsxs)(Q2.default.Fragment,{children:[e.schemas.length>1&&(0,st.jsx)("div",{className:"xray-sql-rail-schema","aria-hidden":"true",children:n.name}),[["Tables",n.tables,!1],["Views",n.views,!0]].map(([r,o,a])=>o.length?(0,st.jsxs)("div",{role:"group","aria-label":e.schemas.length>1?`${n.name} ${r}`:r,children:[(0,st.jsxs)("div",{className:"xray-sql-rail-heading","aria-hidden":"true",children:[r," ",(0,st.jsx)("span",{className:"xray-sql-rail-count",children:o.length})]}),o.map(i=>(0,st.jsx)(hN,{schema:n.name,table:i,view:a},i.name))]},r):null)]},n.name)),e.schemas.every(n=>!n.tables.length&&!n.views.length)&&(0,st.jsx)("p",{className:"xray-sql-empty",children:"No tables or views."})]})]})}var Q2,st,Y2=F(()=>{"use strict";Q2=$(ct());Yo();Ia();st=$(Ne())});function Z2({disabled:t}){let e=(0,J2.useRef)(null),n=G(o=>o.openFile);async function r(){let o=window.showOpenFilePicker;if(typeof o!="function"){e.current?.click();return}let a;try{[a]=await o.call(window,{multiple:!1,types:gN})}catch{return}a&&await n(await a.getFile(),a)}return(0,Co.jsxs)(Co.Fragment,{children:[(0,Co.jsxs)("button",{className:"xray-btn",disabled:t,onClick:()=>{r()},children:[(0,Co.jsx)(Bh,{size:16,stroke:1.8}),"Open SQLite file"]}),(0,Co.jsx)("input",{ref:e,type:"file",accept:xN,hidden:!0,tabIndex:-1,"aria-hidden":"true",onChange:o=>{let a=o.target.files?.[0];o.target.value="",a&&n(a)}})]})}var J2,Co,xN,gN,$2=F(()=>{"use strict";J2=$(ct());Yo();Ia();Co=$(Ne()),xN=".sqlite,.sqlite3,.db,.db3,application/vnd.sqlite3",gN=[{description:"SQLite database",accept:{"application/vnd.sqlite3":[".sqlite",".sqlite3",".db",".db3"]}}]});function ye(t,e,n,r){let o=r?`${t}(${r.map(a=>a.name).join(", ")})`:t;return r?{name:t,signature:o,description:n,group:e,params:r}:{name:t,signature:o,description:n,group:e}}function Uy(t,e){let n=t;for(let r of e)typeof r=="number"?n+=`[${r}]`:yN.test(r)?n+=`.${r}`:n+=`[${JSON.stringify(r)}]`;return n}var yN,hf,wa,xf,Mr,U_,eA=F(()=>{"use strict";ga();yN=/^[A-Za-z_$][\w$]*$/,hf="Request data",wa="Find entries",xf="Transform",Mr="Output";U_=[ye("res",hf,"Parsed response body of the selected request."),ye("req",hf,"Parsed request body of the selected request."),ye("entry",hf,"The full captured entry for the selected request."),ye("schema",xf,"Infer a structural schema of a value.",[{name:"x",description:"Value to describe."}]),ye("diff",xf,"Structural diff of two values.",[{name:"a",description:"The baseline value."},{name:"b",description:"The value to compare against a."}]),ye("pick",xf,"Copy of obj with only the listed keys.",[{name:"obj",description:"Object to copy from."},{name:"keys",description:"Array of key names to keep.",values:"keys"}]),ye("omit",xf,"Copy of obj without the listed keys.",[{name:"obj",description:"Object to copy from."},{name:"keys",description:"Array of key names to drop.",values:"keys"}]),ye("flatten",xf,"Flatten nested keys into dotted paths.",[{name:"obj",description:"Object to flatten."}]),ye("toTable",Mr,"Render an array of objects as a table.",[{name:"rows",description:"Array of objects to show."}]),ye("table",Mr,"Alias of toTable: render rows as a table.",[{name:"rows",description:"Array of objects to show."}]),ye("csv",Mr,"Alias of toCSV: convert rows to CSV text.",[{name:"rows",description:"Array of objects to convert."}]),ye("prev",hf,"Response body of the previous call to this endpoint."),ye("next",hf,"Response body of the next call to this endpoint."),ye("toCSV",Mr,"Convert an array of objects to CSV text.",[{name:"rows",description:"Array of objects to convert."}]),ye("copy",Mr,"Copy a value to the clipboard.",[{name:"x",description:"Value to copy."}]),ye("$prev",wa,"Previous captured entry in the list.",[]),ye("$next",wa,"Next captured entry in the list.",[]),ye("$all",wa,"Every captured entry.",[]),ye("$errors",wa,"Entries with a status of 400 or above.",[]),ye("$slow",wa,"Entries slower than ms milliseconds.",[{name:"ms = 1000",description:"Duration threshold in milliseconds.",values:"duration"}]),ye("$status",wa,"Entries with the given status code.",[{name:"code",description:"HTTP status code to match.",values:"status"}]),ye("$endpoint",wa,"Entries whose URL path contains the text.",[{name:"path",description:"Text the URL path must contain.",values:"endpoint"}]),ye("$help",Mr,"List all console helpers."),ye("$curl",Mr,"Copy-ready cURL command for the selected request."),ye("$fetch",Mr,"Copy-ready fetch() snippet for the selected request."),ye("$mock",Mr,"Build a mock response from an entry.",[{name:"entry?",description:"Entry to mock; defaults to the selected request."}])]});var ul,Sa,tA=F(()=>{"use strict";ul=class{constructor(e,n){er(this,"text");er(this,"tone");this.text=e,this.tone=n}toJSON(){return this.text}},Sa=class{constructor(e,n,r,o=r.length){er(this,"kind");er(this,"label");er(this,"children");er(this,"count");this.kind=e,this.label=n,this.children=r,this.count=o}toJSON(){if(this.kind==="array")return this.children.map(n=>n.value);let e={};for(let n of this.children){let r=n.name??(n.label===void 0?String(n.key):n.label||"\u2026");Object.defineProperty(e,r,{value:n.value,enumerable:!0,configurable:!0,writable:!0})}return e}}});function Td(){return{all:null,overrides:new Map,shown:new Map,budget:2e4}}function bN(t){return t.t==="obj"||t.t==="arr"}function Ad(t){return t.t==="obj"?t.entries.length:t.items.length}function jy(t,e,n){let r=t.overrides.get(e);return r!==void 0?r:t.all===null?n<4:t.all}function rA(t,e){let n=[],r=Math.max(1,Math.floor(e.budget)),o=[],a=[],i=[],l=[],s=(f,c,u,d)=>{if(!bN(f)||Ad(f)===0){n.push({type:"node",node:f,depth:c,key:u,dup:d,open:null});return}let p=jy(e,f,c);n.push({type:"node",node:f,depth:c,key:u,dup:d,open:p}),p&&(o.push(f),a.push(c),i.push(0),l.push(Math.min(Ad(f),Math.max(1,e.shown.get(f)??100))))};for(s(t,0,null,!1);o.length>0;){if(n.length>=r)return n.push({type:"budget",depth:0}),n;let f=o.length-1,c=o[f],u=a[f],d=i[f];if(d<l[f]){if(i[f]=d+1,c.t==="arr")s(c.items[d],u+1,d,!1);else{let m=c.entries[d];s(m.value,u+1,m.key,m.dup===!0)}continue}let p=Ad(c);l[f]<p&&n.push({type:"more",node:c,depth:u+1,hidden:p-l[f]}),n.push({type:"close",node:c,depth:u}),o.pop(),a.pop(),i.pop(),l.pop()}return n}function oA(t){return t.exact?null:`JavaScript reads this as ${Object.is(t.value,-0)?"0":String(t.value)}`}function aA(t){let e=Ad(t);return t.t==="arr"?`${e} ${e===1?"item":"items"}`:`${e} ${e===1?"key":"keys"}`}function vN(t){let e=nA.get(t);return e===void 0&&(e=++IN,nA.set(t,e)),e}function iA(t){if(t.type==="budget")return"budget";let e=vN(t.node);return t.type==="node"?`n${e}`:t.type==="close"?`c${e}`:`m${e}`}var nA,IN,lA=F(()=>{"use strict";nA=new WeakMap,IN=0});function fA(t){if(!t)return[];if(!wN.test(t))return[t];let e=[],n=0;for(let r=0;r<t.length;r++){let o=t.charCodeAt(r);sA[o]!==void 0&&(r>n&&e.push(t.slice(n,r)),e.push(o),n=r+1)}return n<t.length&&e.push(t.slice(n)),e}function cA(t){return"\\u"+t.toString(16).toUpperCase().padStart(4,"0")}function uA(t){return`U+${t.toString(16).toUpperCase().padStart(4,"0")} ${sA[t]??"BIDI CONTROL"}`}var wN,sA,dA=F(()=>{"use strict";wN=/[‎‏‪-‮⁦-⁩]/,sA={8206:"LEFT-TO-RIGHT MARK",8207:"RIGHT-TO-LEFT MARK",8234:"LEFT-TO-RIGHT EMBEDDING",8235:"RIGHT-TO-LEFT EMBEDDING",8236:"POP DIRECTIONAL FORMATTING",8237:"LEFT-TO-RIGHT OVERRIDE",8238:"RIGHT-TO-LEFT OVERRIDE",8294:"LEFT-TO-RIGHT ISOLATE",8295:"RIGHT-TO-LEFT ISOLATE",8296:"FIRST STRONG ISOLATE",8297:"POP DIRECTIONAL ISOLATE"}});function Rr(t){let e=fA(t);return e.length===0||e.length===1&&typeof e[0]=="string"?t:e.map((n,r)=>typeof n=="number"?(0,Od.jsx)("span",{className:"xray-bidi",title:`${uA(n)}, shown escaped`,children:cA(n)},r):(0,Od.jsx)(pA.default.Fragment,{children:n},r))}var pA,Od,mA=F(()=>{"use strict";pA=$(ct());dA();Od=$(Ne())});function hA(t,e,n){let r=new Array(t);return new Proxy(r,{get(o,a,i){if(typeof a=="string"){let l=a.charCodeAt(0);if(l>=48&&l<=57){let s=+a;if(Number.isInteger(s)&&s>=0&&s<t){let f=o[s];if(!f){let c=e[s*2];f=o[s]={index:s,key:n(s),start:c,size:e[s*2+1],end:c+e[s*2+1],lane:0}}return f}}if(a==="length")return t}return Reflect.get(o,a,i)}})}var xA=F(()=>{});function ka(t,e,n){let r=n.initialDeps??[],o,a=!0;function i(){var l;let f=0,c=t();if(!(c.length!==r.length||c.some((p,m)=>r[m]!==p)))return o;r=c;let d=0;return o=e(...c),n?.onChange&&!(a&&n.skipInitialOnChange)&&n.onChange(o),a=!1,o}return i.updateDeps=l=>{r=l},i}function Vy(t,e){if(t===void 0)throw new Error(`Unexpected undefined${e?`: ${e}`:""}`);return t}var Gy,gA,yA=F(()=>{Gy=(t,e)=>Math.abs(t-e)<1.01,gA=(t,e,n)=>{let r;return function(...o){t.clearTimeout(r),r=t.setTimeout(()=>e.apply(this,o),n)}}});function BN({measurements:t,outerSize:e,scrollOffset:n,lanes:r,flat:o}){let a=t.length-1,i=o?c=>o[c*2]:c=>t[c].start,l=o?c=>o[c*2]+o[c*2+1]:c=>t[c].end;if(t.length<=r)return{startIndex:0,endIndex:a};let s=kA(0,a,i,n),f=s;if(r===1)for(;f<a&&l(f)<n+e;)f++;else if(r>1){let c=Array(r).fill(0);for(;f<a&&c.some(d=>d<n+e);){let d=t[f];c[d.lane]=d.end,f++}let u=Array(r).fill(n+e);for(;s>=0&&u.some(d=>d>=n);){let d=t[s];u[d.lane]=d.start,s--}s=Math.max(0,s-s%r),f=Math.min(a,f+(r-1-f%r))}return{startIndex:s,endIndex:f}}var gf,bA,IA,SN,kN,vA,Bd,CN,AN,wA,TN,ON,SA,Dd,kA,Wy=F(()=>{xA();yA();bA=()=>{if(gf!==void 0)return gf;if(typeof navigator>"u")return gf=!1;if(/iP(hone|od|ad)/.test(navigator.userAgent))return gf=!0;let t=navigator.maxTouchPoints;return gf=navigator.platform==="MacIntel"&&t!==void 0&&t>0},IA=t=>{let{offsetWidth:e,offsetHeight:n}=t;return{width:e,height:n}},SN=t=>t,kN=t=>{let e=Math.max(t.startIndex-t.overscan,0),r=Math.min(t.endIndex+t.overscan,t.count-1)-e+1,o=new Array(r);for(let a=0;a<r;a++)o[a]=e+a;return o},vA=(t,e)=>{let n=t.scrollElement;if(!n)return;let r=t.targetWindow;if(!r)return;let o=i=>{let{width:l,height:s}=i;e({width:Math.round(l),height:Math.round(s)})};if(o(IA(n)),!r.ResizeObserver)return()=>{};let a=new r.ResizeObserver(i=>{let l=()=>{let s=i[0];if(s?.borderBoxSize){let f=s.borderBoxSize[0];if(f){o({width:f.inlineSize,height:f.blockSize});return}}o(IA(n))};t.options.useAnimationFrameWithResizeObserver?requestAnimationFrame(l):l()});return a.observe(n,{box:"border-box"}),()=>{a.unobserve(n)}},Bd={passive:!0},CN=typeof window>"u"?!0:"onscrollend"in window,AN=(t,e,n)=>{let r=t.scrollElement;if(!r)return;let o=t.targetWindow;if(!o)return;let a=t.options.useScrollendEvent&&CN,i=0,l=a?null:gA(o,()=>e(i,!1),t.options.isScrollingResetDelay),s=u=>()=>{i=n(r),l?.(),e(i,u)},f=s(!0),c=s(!1);return r.addEventListener("scroll",f,Bd),a&&r.addEventListener("scrollend",c,Bd),()=>{r.removeEventListener("scroll",f),a&&r.removeEventListener("scrollend",c)}},wA=(t,e)=>AN(t,e,n=>{let{horizontal:r,isRtl:o}=t.options;return r?n.scrollLeft*(o&&-1||1):n.scrollTop}),TN=(t,e,n)=>{if(e?.borderBoxSize){let r=e.borderBoxSize[0];if(r)return Math.round(r[n.options.horizontal?"inlineSize":"blockSize"])}return t[n.options.horizontal?"offsetWidth":"offsetHeight"]},ON=(t,{adjustments:e=0,behavior:n},r)=>{var o,a;(a=(o=r.scrollElement)==null?void 0:o.scrollTo)==null||a.call(o,{[r.options.horizontal?"left":"top"]:t+e,behavior:n})},SA=ON,Dd=class{constructor(e){this.unsubs=[],this.scrollElement=null,this.targetWindow=null,this.isScrolling=!1,this.scrollState=null,this.measurementsCache=[],this._flatMeasurements=null,this.itemSizeCache=new Map,this.itemSizeCacheVersion=0,this.laneAssignments=new Map,this.pendingMin=null,this.prevLanes=void 0,this.lanesChangedFlag=!1,this.lanesSettling=!1,this.pendingScrollAnchor=null,this.scrollRect=null,this.scrollOffset=null,this.scrollDirection=null,this.scrollAdjustments=0,this._iosDeferredAdjustment=0,this._iosTouching=!1,this._iosJustTouchEnded=!1,this._iosTouchEndTimerId=null,this._intendedScrollOffset=null,this.elementsCache=new Map,this.now=()=>{var n,r,o;return((o=(r=(n=this.targetWindow)==null?void 0:n.performance)==null?void 0:r.now)==null?void 0:o.call(r))??Date.now()},this.observer=(()=>{let n=null,r=()=>n||(!this.targetWindow||!this.targetWindow.ResizeObserver?null:n=new this.targetWindow.ResizeObserver(o=>{o.forEach(a=>{let i=()=>{let l=a.target,s=this.indexFromElement(l);if(!l.isConnected){this.observer.unobserve(l);for(let[f,c]of this.elementsCache)if(c===l){this.elementsCache.delete(f);break}return}this.shouldMeasureDuringScroll(s)&&this.resizeItem(s,this.options.measureElement(l,a,this))};this.options.useAnimationFrameWithResizeObserver?requestAnimationFrame(i):i()})}));return{disconnect:()=>{var o;(o=r())==null||o.disconnect(),n=null},observe:o=>{var a;return(a=r())==null?void 0:a.observe(o,{box:"border-box"})},unobserve:o=>{var a;return(a=r())==null?void 0:a.unobserve(o)}}})(),this.range=null,this.setOptions=n=>{var r,o;let a={debug:!1,initialOffset:0,overscan:1,paddingStart:0,paddingEnd:0,scrollPaddingStart:0,scrollPaddingEnd:0,horizontal:!1,getItemKey:SN,rangeExtractor:kN,onChange:()=>{},measureElement:TN,initialRect:{width:0,height:0},scrollMargin:0,gap:0,indexAttribute:"data-index",initialMeasurementsCache:[],lanes:1,anchorTo:"start",followOnAppend:!1,scrollEndThreshold:1,isScrollingResetDelay:150,enabled:!0,isRtl:!1,useScrollendEvent:!1,useAnimationFrameWithResizeObserver:!1,laneAssignmentMode:"estimate"};for(let f in n){let c=n[f];c!==void 0&&(a[f]=c)}let i=this.options,l=null,s=null;if(i!==void 0&&i.enabled&&a.enabled&&a.anchorTo==="end"&&this.scrollElement!==null){let f=i.count,c=a.count,u=this.getMeasurements(),d=f>0?((r=u[0])==null?void 0:r.key)??i.getItemKey(0):null,p=f>0?((o=u[f-1])==null?void 0:o.key)??i.getItemKey(f-1):null;if(c!==f||f>0&&c>0&&(a.getItemKey(0)!==d||a.getItemKey(c-1)!==p)){let b=f>0?this.getVirtualItemForOffset(this.getScrollOffset())??u[0]:null;b&&(l=[b.key,this.getScrollOffset()-b.start]);let h=a.followOnAppend===!0?"auto":a.followOnAppend||null;h&&c>f&&this.isAtEnd(i.scrollEndThreshold)&&(f===0||a.getItemKey(c-1)!==p)&&(s=h)}}this.options=a,(l||s)&&(this.pendingScrollAnchor=[l?.[0]??null,l?.[1]??0,s])},this.notify=n=>{var r,o;(o=(r=this.options).onChange)==null||o.call(r,this,n)},this.maybeNotify=ka(()=>(this.calculateRange(),[this.isScrolling,this.range?this.range.startIndex:null,this.range?this.range.endIndex:null]),n=>{this.notify(n)},{key:!1,debug:()=>this.options.debug,initialDeps:[this.isScrolling,this.range?this.range.startIndex:null,this.range?this.range.endIndex:null]}),this.cleanup=()=>{this.unsubs.filter(Boolean).forEach(n=>n()),this.unsubs=[],this.observer.disconnect(),this.rafId!=null&&this.targetWindow&&(this.targetWindow.cancelAnimationFrame(this.rafId),this.rafId=null),this.scrollState=null,this.scrollElement=null,this.targetWindow=null},this._didMount=()=>()=>{this.cleanup()},this._willUpdate=()=>{var n;let r=this.options.enabled?this.options.getScrollElement():null;if(this.scrollElement!==r){if(this.cleanup(),!r){this.maybeNotify();return}if(this.scrollElement=r,this.scrollElement&&"ownerDocument"in this.scrollElement?this.targetWindow=this.scrollElement.ownerDocument.defaultView:this.targetWindow=((n=this.scrollElement)==null?void 0:n.window)??null,this.elementsCache.forEach(a=>{this.observer.observe(a)}),this.unsubs.push(this.options.observeElementRect(this,a=>{this.scrollRect=a,this.maybeNotify()})),this.unsubs.push(this.options.observeElementOffset(this,(a,i)=>{this._intendedScrollOffset!==null&&Math.abs(a-this._intendedScrollOffset)<1.5&&(a=this._intendedScrollOffset),this._intendedScrollOffset=null,this.scrollAdjustments=0,this.scrollDirection=i?this.getScrollOffset()<a?"forward":"backward":null,this.scrollOffset=a,this.isScrolling=i,this._flushIosDeferredIfReady(),this.scrollState&&this.scheduleScrollReconcile(),this.maybeNotify()})),"addEventListener"in this.scrollElement){let a=this.scrollElement,i=()=>{this._iosTouching=!0,this._iosJustTouchEnded=!1,this._iosTouchEndTimerId!==null&&this.targetWindow!=null&&(this.targetWindow.clearTimeout(this._iosTouchEndTimerId),this._iosTouchEndTimerId=null)},l=()=>{this._iosTouching=!1,!(!bA()||this.targetWindow==null)&&(this._iosJustTouchEnded=!0,this._iosTouchEndTimerId=this.targetWindow.setTimeout(()=>{this._iosJustTouchEnded=!1,this._iosTouchEndTimerId=null,this._flushIosDeferredIfReady()},150))};a.addEventListener("touchstart",i,Bd),a.addEventListener("touchend",l,Bd),this.unsubs.push(()=>{a.removeEventListener("touchstart",i),a.removeEventListener("touchend",l),this._iosTouchEndTimerId!==null&&this.targetWindow!=null&&(this.targetWindow.clearTimeout(this._iosTouchEndTimerId),this._iosTouchEndTimerId=null)})}this._scrollToOffset(this.getScrollOffset(),{adjustments:void 0,behavior:void 0})}let o=this.pendingScrollAnchor;if(this.pendingScrollAnchor=null,o&&this.scrollElement&&this.options.enabled){let[a,i,l]=o;if(a!==null){let{count:s,getItemKey:f}=this.options,c=0;for(;c<s&&f(c)!==a;)c++;let u=c<s?this.getMeasurements()[c]:void 0;if(u){let d=u.start+i-this.getScrollOffset();Gy(d,0)||this.applyScrollAdjustment(d)}}l&&this.scrollToEnd({behavior:l})}},this._flushIosDeferredIfReady=()=>{if(this._iosDeferredAdjustment===0||this.isScrolling||this._iosTouching||this._iosJustTouchEnded)return;let n=this.getScrollOffset(),r=this.getMaxScrollOffset();if(n<0||n>r)return;let o=this._iosDeferredAdjustment;this._iosDeferredAdjustment=0,this._scrollToOffset(n,{adjustments:this.scrollAdjustments+=o,behavior:void 0})},this.rafId=null,this.getSize=()=>this.options.enabled?(this.scrollRect=this.scrollRect??this.options.initialRect,this.scrollRect[this.options.horizontal?"width":"height"]):(this.scrollRect=null,0),this.getScrollOffset=()=>this.options.enabled?(this.scrollOffset=this.scrollOffset??(typeof this.options.initialOffset=="function"?this.options.initialOffset():this.options.initialOffset),this.scrollOffset):(this.scrollOffset=null,0),this.getFurthestMeasurement=(n,r)=>{let o=new Map,a=new Map;for(let i=r-1;i>=0;i--){let l=n[i];if(o.has(l.lane))continue;let s=a.get(l.lane);if(s==null||l.end>s.end?a.set(l.lane,l):l.end<s.end&&o.set(l.lane,!0),o.size===this.options.lanes)break}return a.size===this.options.lanes?Array.from(a.values()).sort((i,l)=>i.end===l.end?i.index-l.index:i.end-l.end)[0]:void 0},this.getMeasurementOptions=ka(()=>[this.options.count,this.options.paddingStart,this.options.scrollMargin,this.options.getItemKey,this.options.enabled,this.options.lanes,this.options.laneAssignmentMode],(n,r,o,a,i,l,s)=>(this.prevLanes!==void 0&&this.prevLanes!==l&&(this.lanesChangedFlag=!0),this.prevLanes=l,this.pendingMin=null,{count:n,paddingStart:r,scrollMargin:o,getItemKey:a,enabled:i,lanes:l,laneAssignmentMode:s}),{key:!1}),this.getMeasurements=ka(()=>[this.getMeasurementOptions(),this.itemSizeCacheVersion],({count:n,paddingStart:r,scrollMargin:o,getItemKey:a,enabled:i,lanes:l,laneAssignmentMode:s},f)=>{let c=this.itemSizeCache;if(!i)return this.measurementsCache=[],this.itemSizeCache.clear(),this.laneAssignments.clear(),[];if(this.laneAssignments.size>n)for(let m of this.laneAssignments.keys())m>=n&&this.laneAssignments.delete(m);this.lanesChangedFlag&&(this.lanesChangedFlag=!1,this.lanesSettling=!0,this.measurementsCache=[],this.itemSizeCache.clear(),this.laneAssignments.clear(),this.pendingMin=null),this.measurementsCache.length===0&&!this.lanesSettling&&(this.measurementsCache=this.options.initialMeasurementsCache,this.measurementsCache.forEach(m=>{this.itemSizeCache.set(m.key,m.size)}));let u=this.lanesSettling?0:this.pendingMin??0;if(this.pendingMin=null,this.lanesSettling&&this.measurementsCache.length===n&&(this.lanesSettling=!1),l===1){let m=this.options.gap,x=n*2,b=this._flatMeasurements;if(!b||b.length<x){let g=new Float64Array(x);b&&u>0&&g.set(b.subarray(0,u*2)),b=g,this._flatMeasurements=b}let h;if(u===0)h=r+o;else{let g=u-1;h=b[g*2]+b[g*2+1]+m}for(let g=u;g<n;g++){let I=a(g),v=c.get(I),S=typeof v=="number"?v:this.options.estimateSize(g);b[g*2]=h,b[g*2+1]=S,h+=S+m}let y=hA(n,b,a);return this.measurementsCache=y,y}let d=this.measurementsCache.slice(0,u),p=new Array(l).fill(void 0);for(let m=0;m<u;m++){let x=d[m];x&&(p[x.lane]=m)}for(let m=u;m<n;m++){let x=a(m),b=this.laneAssignments.get(m),h,y,g=s==="estimate"||c.has(x);if(b!==void 0&&this.options.lanes>1){h=b;let w=p[h],k=w!==void 0?d[w]:void 0;y=k?k.end+this.options.gap:r+o}else{let w=this.options.lanes===1?d[m-1]:this.getFurthestMeasurement(d,m);y=w?w.end+this.options.gap:r+o,h=w?w.lane:m%this.options.lanes,this.options.lanes>1&&g&&this.laneAssignments.set(m,h)}let I=c.get(x),v=typeof I=="number"?I:this.options.estimateSize(m),S=y+v;d[m]={index:m,start:y,size:v,end:S,key:x,lane:h},p[h]=m}return this.measurementsCache=d,d},{key:!1,debug:()=>this.options.debug}),this.calculateRange=ka(()=>[this.getMeasurements(),this.getSize(),this.getScrollOffset(),this.options.lanes],(n,r,o,a)=>this.range=n.length>0&&r>0?BN({measurements:n,outerSize:r,scrollOffset:o,lanes:a,flat:a===1&&this._flatMeasurements!=null?this._flatMeasurements:null}):null,{key:!1,debug:()=>this.options.debug}),this.getVirtualIndexes=ka(()=>{let n=null,r=null,o=this.calculateRange();return o&&(n=o.startIndex,r=o.endIndex),this.maybeNotify.updateDeps([this.isScrolling,n,r]),[this.options.rangeExtractor,this.options.overscan,this.options.count,n,r]},(n,r,o,a,i)=>a===null||i===null?[]:n({startIndex:a,endIndex:i,overscan:r,count:o}),{key:!1,debug:()=>this.options.debug}),this.indexFromElement=n=>{let r=this.options.indexAttribute,o=n.getAttribute(r);return o?parseInt(o,10):(console.warn(`Missing attribute name '${r}={index}' on measured element.`),-1)},this.shouldMeasureDuringScroll=n=>{var r;if(!this.scrollState||this.scrollState.behavior!=="smooth")return!0;let o=this.scrollState.index??((r=this.getVirtualItemForOffset(this.scrollState.lastTargetOffset))==null?void 0:r.index);if(o!==void 0&&this.range){let a=Math.max(this.options.overscan,Math.ceil((this.range.endIndex-this.range.startIndex)/2)),i=Math.max(0,o-a),l=Math.min(this.options.count-1,o+a);return n>=i&&n<=l}return!0},this.measureElement=n=>{if(!n){this.elementsCache.forEach((i,l)=>{i.isConnected||(this.observer.unobserve(i),this.elementsCache.delete(l))});return}let r=this.indexFromElement(n),o=this.options.getItemKey(r),a=this.elementsCache.get(o);a!==n&&(a&&this.observer.unobserve(a),this.observer.observe(n),this.elementsCache.set(o,n)),(!this.isScrolling||this.scrollState)&&this.shouldMeasureDuringScroll(r)&&this.resizeItem(r,this.options.measureElement(n,void 0,this))},this.resizeItem=(n,r)=>{var o,a;if(n<0||n>=this.options.count)return;let i,l,s,f=this._flatMeasurements;if(this.options.lanes===1&&f!==null)s=this.options.getItemKey(n),l=f[n*2],i=f[n*2+1];else{let d=this.measurementsCache[n];if(!d)return;s=d.key,l=d.start,i=d.size}let c=this.itemSizeCache.get(s)??i,u=r-c;if(u!==0){let d=this.options.anchorTo==="end"&&((o=this.scrollState)==null?void 0:o.behavior)!=="smooth"&&this.getVirtualDistanceFromEnd()<=this.options.scrollEndThreshold,p=d?this.getTotalSize():0,m=((a=this.scrollState)==null?void 0:a.behavior)!=="smooth"&&(this.shouldAdjustScrollPositionOnItemSizeChange!==void 0?this.shouldAdjustScrollPositionOnItemSizeChange(this.measurementsCache[n]??{index:n,key:s,start:l,size:i,end:l+i,lane:0},u,this):l<this.getScrollOffset()+this.scrollAdjustments&&this.scrollDirection!=="backward");(this.pendingMin===null||n<this.pendingMin)&&(this.pendingMin=n),this.itemSizeCache.set(s,r),this.itemSizeCacheVersion++,d?this.applyScrollAdjustment(this.getTotalSize()-p):m&&this.applyScrollAdjustment(u),this.notify(!1)}},this.getVirtualItems=ka(()=>[this.getVirtualIndexes(),this.getMeasurements()],(n,r)=>{let o=[];for(let a=0,i=n.length;a<i;a++){let l=n[a],s=r[l];o.push(s)}return o},{key:!1,debug:()=>this.options.debug}),this.getVirtualItemForOffset=n=>{let r=this.getMeasurements();if(r.length===0)return;let o=this._flatMeasurements,a=this.options.lanes===1&&o!=null,i=kA(0,r.length-1,a?l=>o[l*2]:l=>Vy(r[l]).start,n);return Vy(r[i])},this.getMaxScrollOffset=()=>{if(!this.scrollElement)return 0;if("scrollHeight"in this.scrollElement)return this.options.horizontal?this.scrollElement.scrollWidth-this.scrollElement.clientWidth:this.scrollElement.scrollHeight-this.scrollElement.clientHeight;{let n=this.scrollElement.document.documentElement;return this.options.horizontal?n.scrollWidth-this.scrollElement.innerWidth:n.scrollHeight-this.scrollElement.innerHeight}},this.getVirtualDistanceFromEnd=()=>Math.max(this.getTotalSize()-this.getSize()-this.getScrollOffset(),0),this.getDistanceFromEnd=()=>Math.max(this.getMaxScrollOffset()-this.getScrollOffset(),0),this.isAtEnd=(n=this.options.scrollEndThreshold)=>this.getDistanceFromEnd()<=n,this.getOffsetForAlignment=(n,r,o=0)=>{if(!this.scrollElement)return 0;let a=this.getSize(),i=this.getScrollOffset();r==="auto"&&(r=n>=i+a?"end":"start"),r==="center"?n+=(o-a)/2:r==="end"&&(n-=a);let l=this.getMaxScrollOffset();return Math.max(Math.min(l,n),0)},this.getOffsetForIndex=(n,r="auto")=>{n=Math.max(0,Math.min(n,this.options.count-1));let o=this.getSize(),a=this.getScrollOffset(),i=this.measurementsCache[n];if(!i)return;if(r==="auto")if(i.end>=a+o-this.options.scrollPaddingEnd)r="end";else if(i.start<=a+this.options.scrollPaddingStart)r="start";else return[a,r];if(r==="end"&&n===this.options.count-1)return[this.getMaxScrollOffset(),r];let l=r==="end"?i.end+this.options.scrollPaddingEnd:i.start-this.options.scrollPaddingStart;return[this.getOffsetForAlignment(l,r,i.size),r]},this.scrollToOffset=(n,{align:r="start",behavior:o="auto"}={})=>{let a=this.getOffsetForAlignment(n,r),i=this.now();this.scrollState={index:null,align:r,behavior:o,startedAt:i,lastTargetOffset:a,stableFrames:0},this._scrollToOffset(a,{adjustments:void 0,behavior:o}),this.scheduleScrollReconcile()},this.scrollToIndex=(n,{align:r="auto",behavior:o="auto"}={})=>{n=Math.max(0,Math.min(n,this.options.count-1));let a=this.getOffsetForIndex(n,r);if(!a)return;let[i,l]=a,s=this.now();this.scrollState={index:n,align:l,behavior:o,startedAt:s,lastTargetOffset:i,stableFrames:0},this._scrollToOffset(i,{adjustments:void 0,behavior:o}),this.scheduleScrollReconcile()},this.scrollBy=(n,{behavior:r="auto"}={})=>{let o=this.getScrollOffset()+n,a=this.now();this.scrollState={index:null,align:"start",behavior:r,startedAt:a,lastTargetOffset:o,stableFrames:0},this._scrollToOffset(o,{adjustments:void 0,behavior:r}),this.scheduleScrollReconcile()},this.scrollToEnd=({behavior:n="auto"}={})=>{if(this.options.count>0){this.scrollToIndex(this.options.count-1,{align:"end",behavior:n});return}this.scrollToOffset(Math.max(this.getTotalSize()-this.getSize(),0),{behavior:n})},this.getTotalSize=()=>{var n;let r=this.getMeasurements(),o;if(r.length===0)o=this.options.paddingStart;else if(this.options.lanes===1){let a=r.length-1,i=this._flatMeasurements;i!=null?o=i[a*2]+i[a*2+1]:o=((n=r[a])==null?void 0:n.end)??0}else{let a=Array(this.options.lanes).fill(null),i=r.length-1;for(;i>=0&&a.some(l=>l===null);){let l=r[i];a[l.lane]===null&&(a[l.lane]=l.end),i--}o=Math.max(...a.filter(l=>l!==null))}return Math.max(o-this.options.scrollMargin+this.options.paddingEnd,0)},this.takeSnapshot=()=>{let n=[];if(this.itemSizeCache.size===0)return n;let r=this.getMeasurements();for(let o of r)o&&this.itemSizeCache.has(o.key)&&n.push({index:o.index,key:o.key,start:o.start,size:o.size,end:o.end,lane:o.lane});return n},this._scrollToOffset=(n,{adjustments:r,behavior:o})=>{this._intendedScrollOffset=n+(r??0),this.options.scrollToFn(n,{behavior:o,adjustments:r},this)},this.measure=()=>{this.pendingMin=null,this.itemSizeCache.clear(),this.laneAssignments.clear(),this.itemSizeCacheVersion++,this.notify(!1)},this.setOptions(e)}applyScrollAdjustment(e,n){e!==0&&(bA()&&(this.isScrolling||this._iosTouching||this._iosJustTouchEnded)?this._iosDeferredAdjustment+=e:this._scrollToOffset(this.getScrollOffset(),{adjustments:this.scrollAdjustments+=e,behavior:n}))}scheduleScrollReconcile(){if(!this.targetWindow){this.scrollState=null;return}this.rafId==null&&(this.rafId=this.targetWindow.requestAnimationFrame(()=>{this.rafId=null,this.reconcileScroll()}))}reconcileScroll(){if(!this.scrollState||!this.scrollElement)return;if(this.now()-this.scrollState.startedAt>5e3){this.scrollState=null;return}let r=this.scrollState.index!=null?this.getOffsetForIndex(this.scrollState.index,this.scrollState.align):void 0,o=r?r[0]:this.scrollState.lastTargetOffset,a=1,i=o!==this.scrollState.lastTargetOffset;if(!i&&Gy(o,this.getScrollOffset())){if(this.scrollState.stableFrames++,this.scrollState.stableFrames>=a){this.getScrollOffset()!==o&&this._scrollToOffset(o,{adjustments:void 0,behavior:"auto"}),this.scrollState=null;return}}else if(this.scrollState.stableFrames=0,i){let l=this.getSize()||600,s=Math.abs(o-this.getScrollOffset()),f=this.scrollState.behavior==="smooth"&&s>l;this.scrollState.lastTargetOffset=o,f||(this.scrollState.behavior="auto"),this._scrollToOffset(o,{adjustments:void 0,behavior:f?"smooth":"auto"})}this.scheduleScrollReconcile()}},kA=(t,e,n,r)=>{for(;t<=e;){let o=(t+e)/2|0,a=n(o);if(a<r)t=o+1;else if(a>r)e=o-1;else return o}return t>0?t-1:0}});function DN({useFlushSync:t=!0,...e}){let n=Ao.useReducer(a=>a+1,0)[1],r={...e,onChange:(a,i)=>{var l;t&&i?(0,AA.flushSync)(n):n(),(l=e.onChange)==null||l.call(e,a,i)}},[o]=Ao.useState(()=>new Dd(r));return o.setOptions(r),CA(()=>o._didMount(),[]),CA(()=>o._willUpdate()),o}function yf(t){return DN({observeElementRect:vA,observeElementOffset:wA,scrollToFn:SA,...t})}var Ao,AA,CA,Xy=F(()=>{Ao=$(ct(),1),AA=$(np(),1);Wy();Wy();CA=typeof document<"u"?Ao.useLayoutEffect:Ao.useEffect});function TA({count:t,scrollRef:e,estimateSize:n,getItemKey:r,overscan:o=10}){return yf({count:t,getScrollElement:()=>e.current,estimateSize:n,getItemKey:r,measureElement:a=>a.getBoundingClientRect().height,overscan:o,initialRect:{width:800,height:480}})}var OA=F(()=>{"use strict";Xy()});function If(t){return t instanceof ul||t instanceof Dr?null:t instanceof Sa?t.kind:Array.isArray(t)?"array":t!==null&&typeof t=="object"?"object":null}function Yy(t){return t instanceof ul?NN[t.tone]:typeof t=="string"?"xray-json-string":typeof t=="number"||t instanceof Dr?"xray-json-number":typeof t=="boolean"?"xray-json-bool":t==null?"xray-json-null":"xray-json-punct"}function Jy(t){return t instanceof ul?Rr(t.text):t instanceof Dr?t.raw:typeof t=="string"?Rr(JSON.stringify(t)):t===void 0?"undefined":t===null?"null":String(t)}function Zy(t,e){return t instanceof Sa?t.children.map(n=>[n.key,n.value,n.label,n.name]):e==="array"?t.map((n,r)=>[r,n]):Object.entries(t)}function FA(t,e){return t==="array"?`${e} ${e===1?"item":"items"}`:`${e} ${e===1?"key":"keys"}`}function LA(t,e){return t instanceof Sa?t.count:e==="array"?t.length:Object.keys(t).length}function NA(t){return t instanceof Sa&&t.label?(0,B.jsxs)("span",{className:"xray-json-typed xray-json-label",children:[t.label," "]}):null}function _A(t,e,n){return n!==void 0?(0,B.jsxs)(B.Fragment,{children:[(0,B.jsx)("span",{className:"xray-json-key",children:Rr(JSON.stringify(n))}),(0,B.jsx)("span",{className:"xray-json-punct",children:": "})]}):e!==void 0?e?(0,B.jsxs)(B.Fragment,{children:[(0,B.jsx)("span",{className:"xray-json-key",children:Rr(e)}),(0,B.jsx)("span",{className:"xray-json-punct",children:" "})]}):null:t===null?null:(0,B.jsxs)(B.Fragment,{children:[(0,B.jsx)("span",{className:"xray-json-key",children:typeof t=="number"?t:Rr(JSON.stringify(t))}),(0,B.jsx)("span",{className:"xray-json-punct",children:": "})]})}function _N(t){let e=Uy("",[t]);return e.startsWith(".")?e.slice(1):e}function qN(t,e){let n=e.trim().toLowerCase(),r=new Set,o=new Set,a=/[.[\]]/.test(n),i=EA,l=(s,f,c,u)=>{let d=If(s);if(!d||u>=EN)return!1;let p=!1;for(let[m,x]of Zy(s,d)){if(--i<0)break;let b=f+Ca+m,h=a?[...c,m]:c,y=a?Uy("",h).toLowerCase().includes(n):String(m).toLowerCase().includes(n);y&&r.add(b);let g=l(x,b,h,u+1);g&&o.add(b),(y||g)&&(p=!0)}return p};return l(t,"$",[],0)&&o.add("$"),{matched:r,ancestors:o,limited:i<0}}function PN(t,e,n,r){let o=[],a=(i,l,s,f,c,u,d,p)=>{let m=If(l);if(!m){o.push({id:s,kind:"leaf",depth:c,nodeKey:i,label:d,name:p,value:l,segments:f});return}let x=e(s,c);if(o.push({id:s,kind:"branch",depth:c,nodeKey:i,label:d,name:p,value:l,segments:f,open:x}),!x)return;let b=Zy(l,m);n&&!u&&(b=b.filter(([g])=>n.matched.has(s+Ca+g)||n.ancestors.has(s+Ca+g)));let h=r(s),y=b.length>h?b.slice(0,h):b;for(let[g,I,v,S]of y){let w=s+Ca+g;a(g,I,w,[...f,g],c+1,u||!!n&&n.matched.has(w),v,S)}b.length>y.length&&o.push({id:s+FN,kind:"more",depth:c+1,nodeKey:null,segments:f,parentId:s,hidden:b.length-y.length}),o.push({id:s+LN,kind:"close",depth:c,nodeKey:null,segments:f,bracket:m==="array"?"]":"}"})};return a(null,t,"$",[],0,!1),o}function zN({value:t,isOpen:e,setOpen:n,filter:r,shown:o,showMore:a,selected:i,active:l,setActive:s,onSelect:f}){let c=se.default.useMemo(()=>PN(t,e,r,o),[t,e,r,o]),u=se.default.useRef(null),d=se.default.useRef(null),p=c.filter(g=>g.kind!=="close"),m=g=>!!g&&p.some(I=>I.id===g),x=m(l)?l:m(i)?i:p[0]?.id??null;se.default.useLayoutEffect(()=>{let g=d.current;if(g===null)return;d.current=null;let I=c[g];!I||I.kind==="close"||(I.id!==l&&s(I.id),u.current?.querySelector(`[data-row="${g}"]`)?.focus())});function b(g){g&&(g.id!==l&&s(g.id),u.current?.querySelector(`[data-row="${c.indexOf(g)}"]`)?.focus())}function h(g){if(g.kind==="more"&&g.parentId){a(g.parentId),d.current=c.indexOf(g);return}f(g)}function y(g){let I=g.target.closest("[data-row]");if(!I)return;let v=Number(I.dataset.row),S=c[v];if(!S)return;let w=p.indexOf(S);switch(g.key){case"ArrowDown":b(p[w+1]);break;case"ArrowUp":b(p[w-1]);break;case"Home":b(p[0]);break;case"End":b(p[p.length-1]);break;case"ArrowRight":if(S.kind!=="branch")return;S.open?c[v+1]&&c[v+1].depth>S.depth&&c[v+1].kind!=="close"&&b(c[v+1]):n(S.id,S.depth,!0);break;case"ArrowLeft":if(S.kind==="branch"&&S.open){n(S.id,S.depth,!1);break}for(let k=v-1;k>=0;k--)if(c[k].kind==="branch"&&c[k].depth===S.depth-1){b(c[k]);break}break;case"Enter":case" ":h(S);break;default:return}g.preventDefault()}return(0,B.jsx)("div",{className:"xray-json-tree-body",role:"tree","aria-label":"JSON viewer",ref:u,onKeyDown:y,children:c.map((g,I)=>{if(g.kind==="close")return(0,B.jsxs)("div",{className:"xray-json-row",role:"none","aria-hidden":"true",style:{paddingLeft:g.depth*14+8},children:[(0,B.jsx)("span",{className:"xray-json-gutter"}),(0,B.jsx)("span",{className:"xray-json-punct",children:g.bracket})]},g.id);let v={"data-row":I,role:"treeitem","aria-level":g.depth+1,tabIndex:g.id===x?0:-1,onFocus:()=>{l!==g.id&&s(g.id)}};if(g.kind==="more")return(0,B.jsx)("div",{...v,className:"xray-json-row xray-json-flatrow xray-json-more-row",style:{paddingLeft:g.depth*14+8},onClick:()=>h(g),children:(0,B.jsxs)("span",{className:"xray-json-tree-btn xray-json-more",children:["Show ",Math.min(g.hidden??0,Rd)," more \xB7 ",g.hidden," hidden"]})},g.id);let S=_A(g.nodeKey,g.label,g.name),w=i===g.id;if(g.kind==="leaf")return(0,B.jsxs)("div",{...v,"aria-selected":w,className:"xray-json-row xray-json-flatrow",style:{paddingLeft:g.depth*14+8},onClick:()=>f(g),children:[(0,B.jsx)("span",{className:"xray-json-gutter"}),S,(0,B.jsx)("span",{className:`xray-json-value ${Yy(g.value)}`,children:Jy(g.value)})]},g.id);let k=If(g.value),D=LA(g.value,k),L=g.nodeKey===null?"value":_N(g.nodeKey);return(0,B.jsxs)("div",{...v,"aria-expanded":!!g.open,"aria-selected":w,className:"xray-json-row xray-json-flatrow xray-json-branch-row",style:{paddingLeft:g.depth*14},onClick:()=>f(g),onDoubleClick:()=>n(g.id,g.depth),children:[(0,B.jsx)("span",{className:"xray-json-toggle","aria-hidden":"true",title:`${g.open?"Collapse":"Expand"} ${L}`,onClick:P=>{P.stopPropagation(),s(g.id),n(g.id,g.depth)},onDoubleClick:P=>P.stopPropagation(),children:(0,B.jsx)(hs,{size:13,stroke:2.2,className:`xray-json-chevron ${g.open?"":"closed"}`})}),S,NA(g.value),(0,B.jsx)("span",{className:"xray-json-punct",children:k==="array"?"[":"{"}),!g.open&&(0,B.jsx)("span",{className:"xray-json-summary",children:FA(k,D)}),!g.open&&(0,B.jsx)("span",{className:"xray-json-punct",children:k==="array"?"]":"}"})]},g.id)})})}function PA({nodeKey:t,label:e,name:n,value:r,path:o,depth:a,isOpen:i,toggle:l}){let s=If(r),f=_A(t,e,n);if(!s)return(0,B.jsxs)("div",{className:"xray-json-row",role:"treeitem",style:{paddingLeft:a*14+8},children:[(0,B.jsx)("span",{className:"xray-json-gutter"}),f,(0,B.jsx)("span",{className:`xray-json-value ${Yy(r)}`,children:Jy(r)})]});let c=Zy(r,s),u=i(o,a),d=s==="array"?["[","]"]:["{","}"],p=FA(s,LA(r,s));return(0,B.jsxs)("div",{className:"xray-json-node",role:"treeitem","aria-expanded":u,children:[(0,B.jsxs)("button",{className:"xray-json-row xray-json-branch",style:{paddingLeft:a*14},onClick:()=>l(o,a),children:[(0,B.jsx)(hs,{size:13,stroke:2.2,className:`xray-json-chevron ${u?"":"closed"}`}),f,NA(r),(0,B.jsx)("span",{className:"xray-json-punct",children:d[0]}),!u&&(0,B.jsx)("span",{className:"xray-json-summary",children:p}),!u&&(0,B.jsx)("span",{className:"xray-json-punct",children:d[1]})]}),u&&(0,B.jsxs)("div",{className:"xray-json-children",children:[c.map(([m,x,b,h])=>(0,B.jsx)(PA,{nodeKey:m,label:b,name:h,value:x,path:o+Ca+m,depth:a+1,isOpen:i,toggle:l},m)),(0,B.jsxs)("div",{className:"xray-json-row",style:{paddingLeft:a*14+8},children:[(0,B.jsx)("span",{className:"xray-json-gutter"}),(0,B.jsx)("span",{className:"xray-json-punct",children:d[1]})]})]})]})}function Md(t){return Math.min(t,zA)*14}function jN(t){return t.t==="str"?"xray-json-string":t.t==="num"?"xray-json-number":t.t==="bool"?"xray-json-bool":t.t==="null"?"xray-json-null":"xray-json-punct"}function VN(t){return t.t==="str"?Rr(JSON.stringify(t.value)):t.t==="num"?t.raw:t.t==="bool"?t.value?"true":"false":t.t==="null"?"null":t.t==="arr"?"[]":"{}"}function MA(t){return t===null?null:(0,B.jsxs)(B.Fragment,{children:[(0,B.jsx)("span",{className:"xray-json-key",children:typeof t=="number"?t:Rr(JSON.stringify(t))}),(0,B.jsx)("span",{className:"xray-json-punct",children:": "})]})}function Ky(t){return t>zA?(0,B.jsx)("span",{className:"xray-json-depth",title:`Nesting depth ${t}`,children:t}):null}function RA(t){return t.type==="node"&&t.dup?(0,B.jsx)("span",{className:"xray-json-tag dup",title:UN,children:"duplicate"}):null}function GN(t){return t?(0,B.jsx)("span",{className:"xray-json-tag inexact",title:t,children:"inexact in JS"}):null}var se,B,BA,MN,RN,DA,Rd,EA,EN,Ca,FN,LN,NN,qA,HN,zA,UN,g5,HA=F(()=>{"use strict";se=$(ct());Yo();Ly();eA();tA();ga();lA();mA();OA();B=$(Ne()),BA=6e4,MN=4,RN=1,DA=4,Rd=100,EA=2e5,EN=32,Ca="\0",FN=Ca+"more",LN=Ca+"close";NN={string:"xray-json-string",number:"xray-json-number",bool:"xray-json-bool",null:"xray-json-null",typed:"xray-json-typed",muted:"xray-json-muted"};qA=se.default.memo(function({value:e,onSelectPath:n,filter:r=""}){let o=!!n,a=se.default.useMemo(()=>!o&&Fy(e,0,BA+1).length>BA,[e,o]),i=o?RN:MN,l=o?r.trim():"",s=se.default.useMemo(()=>l?qN(e,l):null,[e,l]),[f,c]=se.default.useState(()=>new Map),[u,d]=se.default.useState(null),[p,m]=se.default.useState(null),[x,b]=se.default.useState(null),[h,y]=se.default.useState(()=>new Map),[g,I]=se.default.useState({value:e,query:l}),v=!Object.is(g.value,e);(v||g.query!==l)&&(v&&(d(null),m(null),b(null)),I({value:e,query:l}),c(new Map),y(new Map));let S=se.default.useCallback((E,C)=>u!==null?u&&(!o||C<DA):s?.ancestors.has(E)?!0:C<i,[u,o,s,i]),w=se.default.useCallback((E,C)=>{let z=f.get(E);return z!==void 0?z:S(E,C)},[f,S]),k=se.default.useCallback((E,C,z)=>{c(K=>{let te=new Map(K),Ze=K.get(E)??S(E,C);return te.set(E,z??!Ze),te})},[S]),D=se.default.useCallback(E=>h.get(E)??Rd,[h]),L=se.default.useCallback(E=>{y(C=>new Map(C).set(E,(C.get(E)??Rd)+Rd))},[]),P=(0,B.jsxs)("div",{className:"xray-json-tree-toolbar",children:[(0,B.jsxs)("button",{className:"xray-json-tree-btn",onClick:()=>{d(!0),c(new Map)},title:o?`Expand nodes up to ${DA} levels deep`:"Expand all nodes",children:[(0,B.jsx)(ru,{size:13,stroke:2}),"Expand all"]}),(0,B.jsxs)("button",{className:"xray-json-tree-btn",onClick:()=>{d(!1),c(new Map)},title:"Collapse all nodes",children:[(0,B.jsx)(ou,{size:13,stroke:2}),"Collapse all"]})]});if(a){let E=Fy(e);return(0,B.jsx)("pre",{className:"xray-json xray-json-editor xray-json-text",children:Rr(E)})}return If(e)===null?(0,B.jsx)("pre",{className:"xray-json xray-json-scalar",children:(0,B.jsx)("span",{className:Yy(e),children:Jy(e)})}):o?(0,B.jsxs)("div",{className:"xray-json xray-json-tree is-selectable",children:[P,s?.limited&&(0,B.jsxs)("p",{className:"xray-json-empty",children:["Filter limited to the first ",EA.toLocaleString("en-US")," nodes."]}),s&&!s.ancestors.has("$")?(0,B.jsxs)("p",{className:"xray-json-empty",children:["No keys or paths match \u201C",l,"\u201D."]}):(0,B.jsx)(zN,{value:e,isOpen:w,setOpen:k,filter:s,shown:D,showMore:L,selected:p,active:x,setActive:b,onSelect:E=>{m(E.id),n?.(E.segments)}})]}):(0,B.jsxs)("div",{className:"xray-json xray-json-tree",role:"tree","aria-label":"JSON viewer",children:[P,(0,B.jsx)("div",{className:"xray-json-tree-body",children:(0,B.jsx)(PA,{nodeKey:null,value:e,path:"$",depth:0,isOpen:w,toggle:(E,C)=>k(E,C)})})]})});HN=19,zA=40,UN="This key repeats an earlier key of the same object. JSON.parse keeps only the last value, at the first key\u2019s position.";g5=se.default.memo(function({root:e,label:n="JSON viewer",notes:r}){let[o,a]=se.default.useState(Td),[i,l]=se.default.useState(0),[s,f]=se.default.useState(e),c=s!==e;c&&(f(e),a(Td()),l(0));let u=c?null:o,d=se.default.useMemo(()=>rA(e,u??Td()),[e,u]),p=se.default.useRef(null),m=se.default.useRef(null),x=TA({count:d.length,scrollRef:p,estimateSize:()=>HN,getItemKey:C=>d[C]?iA(d[C]):C,overscan:12}),b=se.default.useCallback((C,z,K)=>{a(te=>({...te,overrides:new Map(te.overrides).set(C,K??!jy(te,C,z))}))},[]),h=C=>{a(z=>({...z,shown:new Map(z.shown).set(C,(z.shown.get(C)??100)+100)}))},y=()=>a(C=>({...C,budget:C.budget+2e4})),g=C=>a(z=>({...z,all:C,overrides:new Map,budget:2e4})),I=se.default.useCallback(()=>{let C=m.current;if(C===null)return;let z=p.current?.querySelector(`[data-index="${C}"]`);z&&(m.current=null,z.focus({preventScroll:!0}))},[]);se.default.useLayoutEffect(()=>{I()});let v=C=>C>=0&&C<d.length&&d[C].type!=="close",S=(C,z)=>{for(let K=C+z;K>=0&&K<d.length;K+=z)if(v(K))return K;return-1};function w(C){v(C)&&(l(C),m.current=C,x.scrollToIndex(C,{align:"auto"}),I())}function k(C){C.type==="node"&&C.open!==null?b(C.node,C.depth):C.type==="more"?h(C.node):C.type==="budget"&&y()}function D(C){let z=C.target.closest("[data-index]");if(!z)return;let K=Number(z.dataset.index),te=d[K];if(te){switch(C.key){case"ArrowDown":w(S(K,1));break;case"ArrowUp":w(S(K,-1));break;case"Home":w(S(-1,1));break;case"End":w(S(d.length,-1));break;case"ArrowRight":if(te.type!=="node"||te.open===null)return;te.open?w(S(K,1)):b(te.node,te.depth,!0);break;case"ArrowLeft":if(te.type==="node"&&te.open===!0){b(te.node,te.depth,!1);break}for(let Ze=K-1;Ze>=0;Ze--){let bn=d[Ze];if(bn.type==="node"&&bn.depth===te.depth-1){w(Ze);break}}break;case"Enter":case" ":k(te);break;default:return}C.preventDefault()}}let L=x.getVirtualItems(),P=L.some(C=>C.index===i&&v(i))?i:L.find(C=>v(C.index))?.index??-1;function E(C,z,K,te){let Ze={transform:`translateY(${K}px)`};if(C.type==="close")return(0,B.jsxs)("div",{"data-index":z,ref:x.measureElement,className:"xray-json-row xray-json-vrow",role:"none","aria-hidden":"true",style:{...Ze,paddingLeft:Md(C.depth)+8},children:[(0,B.jsx)("span",{className:"xray-json-gutter"}),Ky(C.depth),(0,B.jsx)("span",{className:"xray-json-punct",children:C.node.t==="arr"?"]":"}"})]},te);let bn={"data-index":z,ref:x.measureElement,role:"treeitem","aria-level":C.depth+1,tabIndex:z===P?0:-1,onFocus:()=>{i!==z&&l(z)}};if(C.type==="more"||C.type==="budget")return(0,B.jsx)("div",{...bn,className:`xray-json-row xray-json-vrow xray-json-flatrow ${C.type==="more"?"xray-json-more-row":"xray-json-budget-row"}`,style:{...Ze,paddingLeft:Md(C.depth)+8},onClick:()=>k(C),children:C.type==="more"?(0,B.jsxs)("span",{className:"xray-json-tree-btn xray-json-more",children:["Show ",Math.min(C.hidden,100)," more \xB7 ",C.hidden.toLocaleString("en-US")," hidden"]}):(0,B.jsxs)(B.Fragment,{children:[(0,B.jsxs)("span",{className:"xray-json-tree-btn xray-json-more",children:["Show ",2e4.toLocaleString("en-US")," more rows"]}),(0,B.jsxs)("span",{className:"xray-json-muted",children:["The tree stops after ",(u?.budget??2e4).toLocaleString("en-US")," rows; Raw has the whole text."]})]})},te);let Et=C.node;if(C.open!==null){let It=Et;return(0,B.jsxs)("div",{...bn,"aria-expanded":C.open,className:"xray-json-row xray-json-vrow xray-json-flatrow xray-json-branch-row",style:{...Ze,paddingLeft:Md(C.depth)},onClick:()=>{window.getSelection?.()?.toString()||(l(z),b(It,C.depth))},children:[(0,B.jsx)(hs,{size:13,stroke:2.2,"aria-hidden":"true",className:`xray-json-chevron ${C.open?"":"closed"}`}),Ky(C.depth),MA(C.key),RA(C),(0,B.jsx)("span",{className:"xray-json-punct",children:It.t==="arr"?"[":"{"}),!C.open&&(0,B.jsx)("span",{className:"xray-json-summary",children:aA(It)}),!C.open&&(0,B.jsx)("span",{className:"xray-json-punct",children:It.t==="arr"?"]":"}"})]},te)}let pl=Et.t==="num"?oA(Et):null;return(0,B.jsxs)("div",{...bn,className:`xray-json-row xray-json-vrow xray-json-flatrow${pl?" has-hint":""}`,style:{...Ze,paddingLeft:Md(C.depth)+8},children:[(0,B.jsx)("span",{className:"xray-json-gutter"}),Ky(C.depth),MA(C.key),RA(C),(0,B.jsx)("span",{className:`xray-json-value ${jN(Et)}`,children:VN(Et)}),GN(pl)]},te)}return(0,B.jsxs)("div",{className:"xray-json xray-json-tree is-virtual",children:[(0,B.jsxs)("div",{className:"xray-json-tree-toolbar",children:[(0,B.jsxs)("button",{type:"button",className:"xray-json-tree-btn",onClick:()=>g(!0),title:`Expand all nodes (${2e4.toLocaleString("en-US")} rows at a time)`,children:[(0,B.jsx)(ru,{size:13,stroke:2}),"Expand all"]}),(0,B.jsxs)("button",{type:"button",className:"xray-json-tree-btn",onClick:()=>g(!1),title:"Collapse all nodes",children:[(0,B.jsx)(ou,{size:13,stroke:2}),"Collapse all"]}),r]}),(0,B.jsx)("div",{ref:p,className:"xray-json-vscroll",children:(0,B.jsx)("div",{className:"xray-json-vlist",role:"tree","aria-label":n,style:{height:x.getTotalSize()},onKeyDown:D,children:L.map(C=>E(d[C.index],C.index,C.start,C.key))})})]})})});function jA({result:t,selected:e,onSelect:n}){let r=(0,UA.useRef)(null),o=yf({count:t.rows.length,getScrollElement:()=>r.current,estimateSize:()=>WN,overscan:12,initialRect:{width:1e3,height:400}}),a=yf({horizontal:!0,count:t.columns.length,getScrollElement:()=>r.current,estimateSize:()=>XN,overscan:3,initialRect:{width:1e3,height:400}}),i=wf+a.getTotalSize(),l=a.getVirtualItems();return(0,$n.jsx)("div",{ref:r,className:"xray-sql-grid",role:"grid","aria-label":"Query results","aria-rowcount":t.rows.length+1,"aria-colcount":t.columns.length+1,children:(0,$n.jsxs)("div",{style:{width:i,height:vf+o.getTotalSize(),position:"relative"},children:[(0,$n.jsxs)("div",{className:"xray-sql-grid-head",role:"row","aria-rowindex":1,style:{width:i,height:vf},children:[(0,$n.jsx)("div",{className:"xray-sql-grid-index",role:"columnheader",style:{width:wf,height:vf},children:"#"}),l.map(s=>{let f=t.columns[s.index];return(0,$n.jsx)("div",{className:"xray-sql-grid-th",role:"columnheader","aria-colindex":s.index+2,title:f.type?`${f.name} ${f.type}`:f.name,style:{left:wf+s.start,width:s.size,height:vf},children:f.name},s.key)})]}),o.getVirtualItems().map(s=>{let f=t.rows[s.index];return(0,$n.jsxs)("div",{className:"xray-sql-grid-row",role:"row","aria-rowindex":s.index+2,style:{top:vf+s.start,height:s.size,width:i},children:[(0,$n.jsx)("div",{className:"xray-sql-grid-index",role:"rowheader",style:{width:wf,height:s.size},children:s.index+1}),l.map(c=>{let u=hd(f[c.index]??null),d=e?.row===s.index&&e.col===c.index;return(0,$n.jsx)("div",{role:"gridcell","aria-colindex":c.index+2,"aria-selected":d,className:`xray-sql-grid-cell kind-${u.kind}${d?" selected":""}`,style:{left:wf+c.start,width:c.size,height:s.size},onClick:()=>n({row:s.index,col:c.index}),children:u.text.length>400?u.text.slice(0,400):u.text},c.key)})]},s.key)})]})})}var UA,$n,WN,vf,wf,XN,VA=F(()=>{"use strict";UA=$(ct());Xy();vo();$n=$(Ne()),WN=26,vf=28,wf=56,XN=180});function QN(t,e,n){if(t==="INSERT"){let{text:o,truncatedBlobs:a}=t2(n,e.columns,e.rows,"sqlite");return{text:o,truncated:a}}return{text:t==="CSV"?YC(e.columns,e.rows):JC(e.columns,e.rows),truncated:$C(e.rows)}}function KN({result:t,cell:e,onClose:n}){let r=t.columns[e.col],o=hd(t.rows[e.row]?.[e.col]??null),a=Rn.default.useMemo(()=>{if(o.kind!=="json")return null;let i=el(o.text);return i.ok?{value:dd(i.root)}:null},[o.kind,o.text]);return(0,U.jsxs)("aside",{className:"xray-sql-inspector","aria-label":"Cell inspector",children:[(0,U.jsxs)("header",{className:"xray-sql-inspector-head",children:[(0,U.jsxs)("span",{className:"xray-sql-inspector-title",children:[r?.name??""," ",(0,U.jsxs)("span",{className:"xray-sql-muted",children:["row ",e.row+1," \xB7 ",o.kind]})]}),(0,U.jsx)("button",{className:"xray-icon-btn","aria-label":"Close cell inspector",onClick:n,children:(0,U.jsx)(Ko,{size:14,stroke:1.8})})]}),(0,U.jsxs)("div",{className:"xray-sql-inspector-body",children:[a?(0,U.jsx)(qA,{value:a.value}):(0,U.jsx)("pre",{className:"xray-sql-inspector-text",children:o.text}),o.truncated&&(0,U.jsx)("p",{className:"xray-sql-muted",children:"Showing the first 65,536 characters."})]})]})}function YN(){let t=G(u=>u.result),e=G(u=>u.resultTable),[n,r]=(0,Rn.useState)(null),[o,a]=(0,Rn.useState)(null),i=(0,Rn.useRef)(null);if((0,Rn.useEffect)(()=>()=>{i.current&&clearTimeout(i.current)},[]),!t)return(0,U.jsx)("p",{className:"xray-sql-empty",children:"Run a query to see results here."});let l=n&&n.result===t?n.cell:null;function s(...u){a(u),i.current&&clearTimeout(i.current),i.current=setTimeout(()=>a(null),4e3)}async function f(u){if(!t)return;let{text:d,truncated:p}=QN(u,t,e??"query_result");try{await navigator.clipboard.writeText(d)}catch{s("Could not copy to the clipboard.");return}let m=`Copied ${t.rows.length} rows as ${u}.`;p?s(m,e2(p)):s(m)}let c=t.columns.length>0;return(0,U.jsxs)("div",{className:"xray-sql-results",children:[(0,U.jsxs)("div",{className:"xray-sql-results-head",children:[(0,U.jsxs)("span",{className:"xray-sql-results-summary",children:[By(t),t.hasMore?" \xB7 more rows available, Run with higher limit":""]}),(0,U.jsx)("span",{className:"xray-spacer"}),o&&(0,U.jsx)("span",{className:"xray-sql-toast",role:"status",children:o.map(u=>(0,U.jsx)("span",{className:"xray-sql-toast-line",children:u},u))}),c&&(0,U.jsxs)("div",{className:"xray-sql-copy",role:"group","aria-label":"Copy results",children:[(0,U.jsx)("span",{className:"xray-sql-muted",children:"Copy"}),["CSV","JSON","INSERT"].map(u=>(0,U.jsx)("button",{className:"xray-btn xray-btn-sm",onClick:()=>{f(u)},"aria-label":`Copy as ${u}`,children:u},u))]})]}),c?(0,U.jsxs)("div",{className:"xray-sql-results-body",children:[(0,U.jsx)(jA,{result:t,selected:l,onSelect:u=>r({result:t,cell:u})}),l&&(0,U.jsx)(KN,{result:t,cell:l,onClose:()=>r(null)})]}):(0,U.jsx)("p",{className:"xray-sql-empty",children:"The statement returned no rows."})]})}function JN(){let t=G(r=>r.messages),e=G(r=>r.error),n=(0,Rn.useRef)(null);return(0,Rn.useEffect)(()=>{n.current?.scrollIntoView({block:"nearest"})},[t]),(0,U.jsxs)("div",{className:"xray-sql-messages",role:"log","aria-label":"Messages",children:[t.length===0&&(0,U.jsx)("p",{className:"xray-sql-empty",children:"No messages yet."}),t.map((r,o)=>(0,U.jsx)("div",{className:`xray-sql-message${e&&o===t.length-1&&r.endsWith(e.message)?" error":""}`,children:r},o)),e&&(e.hint||e.detail)&&(0,U.jsx)("div",{className:"xray-sql-message xray-sql-muted",children:[e.hint,e.detail].filter(Boolean).join(" \xB7 ")}),(0,U.jsx)("div",{ref:n})]})}function ZN(){let t=G(r=>r.history),e=G(r=>r.connection),{updateTabSql:n}=G.getState();return e?t.length?(0,U.jsx)("ul",{className:"xray-sql-history","aria-label":"Query history",children:t.map((r,o)=>(0,U.jsx)("li",{children:(0,U.jsxs)("button",{className:"xray-sql-history-item",title:"Load into the editor",onClick:()=>{let a=G.getState();n(a.activeTabId,r.sql)},children:[(0,U.jsx)("code",{className:"xray-sql-history-sql",children:r.sql}),(0,U.jsxs)("span",{className:`xray-sql-history-meta${r.ok?"":" error"}`,children:[new Date(r.at).toLocaleTimeString()," \xB7"," ",r.ok?`${r.rowCount??0} rows \xB7 ${r.durationMs} ms`:r.error??"failed"]})]})},`${r.at}-${o}`))}):(0,U.jsxs)("p",{className:"xray-sql-empty",children:["Queries you run on ",e.name," appear here."]}):(0,U.jsx)("p",{className:"xray-sql-empty",children:"History is kept per database file."})}function GA(){let t=G(r=>r.bottomTab),e=G(r=>!!r.running),n=G(r=>r.setBottomTab);return(0,U.jsxs)("section",{className:"xray-sql-bottom","aria-label":"Output",children:[(0,U.jsxs)("div",{className:"xray-sql-bottom-tabs",role:"tablist","aria-label":"Output",children:[$N.map(r=>(0,U.jsx)("button",{role:"tab",id:`xray-sql-tab-${r.id}`,"aria-selected":t===r.id,"aria-controls":"xray-sql-bottom-panel",className:`xray-tab${t===r.id?" active":""}`,onClick:()=>n(r.id),children:r.label},r.id)),(0,U.jsx)("span",{className:"xray-spacer"}),e&&(0,U.jsx)("span",{className:"xray-sql-running",role:"status",children:"Running\u2026"})]}),(0,U.jsxs)("div",{className:"xray-sql-bottom-panel",id:"xray-sql-bottom-panel",role:"tabpanel","aria-labelledby":`xray-sql-tab-${t}`,children:[t==="results"&&(0,U.jsx)(YN,{}),t==="messages"&&(0,U.jsx)(JN,{}),t==="history"&&(0,U.jsx)(ZN,{})]})]})}var Rn,U,$N,WA=F(()=>{"use strict";Rn=$(ct());Yo();Ia();vo();ga();HA();VA();U=$(Ne());$N=[{id:"results",label:"Results"},{id:"messages",label:"Messages"},{id:"history",label:"History"}]});function ob(t,e){return({state:n,dispatch:r})=>{if(n.readOnly)return!1;let o=t(e,n);return o?(r(n.update(o)),!0):!1}}function ab(t,e){let n=t.languageDataAt("commentTokens",e,1);return n.length?n[0]:{}}function o4(t,{open:e,close:n},r,o){let a=t.sliceDoc(r-Sf,r),i=t.sliceDoc(o,o+Sf),l=/\s*$/.exec(a)[0].length,s=/^\s*/.exec(i)[0].length,f=a.length-l;if(a.slice(f-e.length,f)==e&&i.slice(s,s+n.length)==n)return{open:{pos:r-l,margin:l&&1},close:{pos:o+s,margin:s&&1}};let c,u;o-r<=2*Sf?c=u=t.sliceDoc(r,o):(c=t.sliceDoc(r,r+Sf),u=t.sliceDoc(o-Sf,o));let d=/^\s*/.exec(c)[0].length,p=/\s*$/.exec(u)[0].length,m=u.length-p-n.length;return c.slice(d,d+e.length)==e&&u.slice(m,m+n.length)==n?{open:{pos:r+d+e.length,margin:/\s/.test(c.charAt(d+e.length))?1:0},close:{pos:o-p-n.length,margin:/\s/.test(u.charAt(m-1))?1:0}}:null}function a4(t){let e=[];for(let n of t.selection.ranges){let r=t.doc.lineAt(n.from),o=n.to<=r.to?r:t.doc.lineAt(n.to);o.from>r.from&&o.from==n.to&&(o=n.to==r.to+1?r:t.doc.lineAt(n.to-1));let a=e.length-1;a>=0&&e[a].to>r.from?e[a].to=o.to:e.push({from:r.from+/^\s*/.exec(r.text)[0].length,to:o.to})}return e}function tT(t,e,n=e.selection.ranges){let r=n.map(a=>ab(e,a.from).block);if(!r.every(a=>a))return null;let o=n.map((a,i)=>o4(e,r[i],a.from,a.to));if(t!=2&&!o.every(a=>a))return{changes:e.changes(n.map((a,i)=>o[i]?[]:[{from:a.from,insert:r[i].open+" "},{from:a.to,insert:" "+r[i].close}]))};if(t!=1&&o.some(a=>a)){let a=[];for(let i=0,l;i<o.length;i++)if(l=o[i]){let s=r[i],{open:f,close:c}=l;a.push({from:f.pos-s.open.length,to:f.pos+f.margin},{from:c.pos-c.margin,to:c.pos+s.close.length})}return{changes:a}}return null}function i4(t,e,n=e.selection.ranges){let r=[],o=-1;e:for(let{from:a,to:i}of n){let l=r.length,s=1e9,f;for(let c=a;c<=i;){let u=e.doc.lineAt(c);if(f==null&&(f=ab(e,u.from).line,!f))continue e;if(u.from>o&&(a==i||i>u.from)){o=u.from;let d=/^\s*/.exec(u.text)[0].length,p=d==u.length,m=u.text.slice(d,d+f.length)==f?d:-1;d<u.text.length&&d<s&&(s=d),r.push({line:u,comment:m,token:f,indent:d,empty:p,single:!1})}c=u.to+1}if(s<1e9)for(let c=l;c<r.length;c++)r[c].indent<r[c].line.text.length&&(r[c].indent=s);r.length==l+1&&(r[l].single=!0)}if(t!=2&&r.some(a=>a.comment<0&&(!a.empty||a.single))){let a=[];for(let{line:l,token:s,indent:f,empty:c,single:u}of r)(u||!c)&&a.push({from:l.from+f,insert:s+" "});let i=e.changes(a);return{changes:i,selection:e.selection.map(i,1)}}else if(t!=1&&r.some(a=>a.comment>=0)){let a=[];for(let{line:i,comment:l,token:s}of r)if(l>=0){let f=i.from+l,c=f+s.length;i.text[c-i.from]==" "&&c++,a.push({from:f,to:c})}return{changes:a}}return null}function oT(t={}){return[rT,nT.of(t),q.domEventHandlers({beforeinput(e,n){let r=e.inputType=="historyUndo"?aT:e.inputType=="historyRedo"?tb:null;return r?(e.preventDefault(),r(n)):!1}})]}function Ld(t,e){return function({state:n,dispatch:r}){if(!e&&n.readOnly)return!1;let o=n.field(rT,!1);if(!o)return!1;let a=o.pop(t,n,e);return a?(r(a),!0):!1}}function Fd(t,e,n,r){let o=e+1>n+20?e-n-1:0,a=t.slice(o,e);return a.push(r),a}function u4(t,e){let n=[],r=!1;return t.iterChangedRanges((o,a)=>n.push(o,a)),e.iterChangedRanges((o,a,i,l)=>{for(let s=0;s<n.length;){let f=n[s++],c=n[s++];l>=f&&i<=c&&(r=!0)}}),r}function d4(t,e){return t.ranges.length==e.ranges.length&&t.ranges.filter((n,r)=>n.empty!=e.ranges[r].empty).length===0}function iT(t,e){return t.length?e.length?t.concat(e):t:e}function lT(t,e){if(t.length){let n=t[t.length-1],r=n.selectionsAfter.slice(Math.max(0,n.selectionsAfter.length-p4));return r.length&&r[r.length-1].eq(e)?t:(r.push(e),Fd(t,t.length-1,1e9,n.setSelAfter(r)))}else return[En.selection([e])]}function m4(t){let e=t[t.length-1],n=t.slice();return n[t.length-1]=e.setSelAfter(e.selectionsAfter.slice(0,e.selectionsAfter.length-1)),n}function $y(t,e){if(!t.length)return t;let n=t.length,r=gn;for(;n;){let o=h4(t[n-1],e,r);if(o.changes&&!o.changes.empty||o.effects.length){let a=t.slice(0,n);return a[n-1]=o,a}else e=o.mapped,n--,r=o.selectionsAfter}return r.length?[En.selection(r)]:gn}function h4(t,e,n){let r=iT(t.selectionsAfter.length?t.selectionsAfter.map(l=>l.map(e)):gn,n);if(!t.changes)return En.selection(r);let o=t.changes.map(e),a=e.mapDesc(t.changes,!0),i=t.mapped?t.mapped.composeDesc(a):a;return new En(o,oe.mapEffects(t.effects,e),i,t.startSelection.map(a),r)}function dl(t,e){return O.create(t.ranges.map(e),t.mainIndex)}function Fn(t,e){return t.update({selection:e,scrollIntoView:!0,userEvent:"select"})}function Ln({state:t,dispatch:e},n){let r=dl(t.selection,n);return r.eq(t.selection,!0)?!1:(e(Fn(t,r)),!0)}function Nd(t,e){return O.cursor(e?t.to:t.from)}function fT(t,e){return Ln(t,n=>n.empty?t.moveByChar(n,e):Nd(n,e))}function ft(t){return t.textDirectionAt(t.state.selection.main.head)==pe.LTR}function dT(t,e){return Ln(t,n=>n.empty?t.moveByGroup(n,e):Nd(n,e))}function b4(t,e,n){if(e.type.prop(n))return!0;let r=e.to-e.from;return r&&(r>2||/[^\s,.;:]/.test(t.sliceDoc(e.from,e.to)))||e.firstChild}function _d(t,e,n){let r=lt(t).resolveInner(e.head),o=n?j.closedBy:j.openedBy;for(let s=e.head;;){let f=n?r.childAfter(s):r.childBefore(s);if(!f)break;b4(t,f,o)?r=f:s=n?f.to:f.from}let a=r.type.prop(o),i,l;return a&&(i=n?Bn(t,r.from,1):Bn(t,r.to,-1))&&i.matched?l=n?i.end.to:i.end.from:l=n?r.to:r.from,O.cursor(l,n?-1:1)}function pT(t,e){return Ln(t,n=>{if(!n.empty)return Nd(n,e);let r=t.moveVertically(n,e);return r.head!=n.head?r:t.moveToLineBoundary(n,e)})}function xT(t){let e=t.scrollDOM.clientHeight<t.scrollDOM.scrollHeight-2,n=0,r=0,o;if(e){for(let a of t.state.facet(q.scrollMargins)){let i=a(t);i?.top&&(n=Math.max(i?.top,n)),i?.bottom&&(r=Math.max(i?.bottom,r))}o=t.scrollDOM.clientHeight-n-r}else o=(t.dom.ownerDocument.defaultView||window).innerHeight;return{marginTop:n,marginBottom:r,selfScroll:e,height:Math.max(t.defaultLineHeight,o-5)}}function gT(t,e){let n=xT(t),{state:r}=t,o=dl(r.selection,i=>i.empty?t.moveVertically(i,e,n.height):Nd(i,e));if(o.eq(r.selection))return!1;let a;if(n.selfScroll){let i=t.coordsAtPos(r.selection.main.head),l=t.scrollDOM.getBoundingClientRect(),s=l.top+n.marginTop,f=l.bottom-n.marginBottom;i&&i.top>s&&i.bottom<f&&(a=q.scrollIntoView(o.main.head,{y:"start",yMargin:i.top-s}))}return t.dispatch(Fn(r,o),{effects:a}),!0}function To(t,e,n){let r=t.lineBlockAt(e.head),o=t.moveToLineBoundary(e,n);if(o.head==e.head&&o.head!=(n?r.to:r.from)&&(o=t.moveToLineBoundary(e,n,!1)),!n&&o.head==r.from&&r.length){let a=/^\s*/.exec(t.state.sliceDoc(r.from,Math.min(r.from+100,r.to)))[0].length;a&&e.head!=r.from+a&&(o=O.cursor(r.from+a))}return o}function O4(t,e,n){let r=!1,o=dl(t.selection,a=>{let i=Bn(t,a.head,-1)||Bn(t,a.head,1)||a.head>0&&Bn(t,a.head-1,1)||a.head<t.doc.length&&Bn(t,a.head+1,-1);if(!i||!i.end)return a;r=!0;let l=i.start.from==a.head?i.end.to:i.end.from;return n?O.range(a.anchor,l):O.cursor(l)});return r?(e(Fn(t,o)),!0):!1}function yn(t,e,n){let r=dl(t.state.selection,o=>{o.undirectional&&o.head>=o.anchor!=e&&(o=O.range(o.head,o.anchor));let a=n(o);return O.range(o.anchor,a.head,a.goalColumn,a.bidiLevel||void 0,a.assoc)});return r.eq(t.state.selection)?!1:(t.dispatch(Fn(t.state,r)),!0)}function yT(t,e){return yn(t,e,n=>t.moveByChar(n,e))}function vT(t,e){return yn(t,e,n=>t.moveByGroup(n,e))}function wT(t,e){return yn(t,e,n=>t.moveVertically(n,e))}function CT(t,e){return yn(t,e,n=>t.moveVertically(n,e,xT(t).height))}function AT(t,e){let{state:n}=t,r=n.selection,o=n.selection.ranges.slice();for(let a of n.selection.ranges){let i=n.doc.lineAt(a.head);if(e?i.to<t.state.doc.length:i.from>0)for(let l=a;;){let s=t.moveVertically(l,e);if(s.head<i.from||s.head>i.to){o.some(f=>f.head==s.head)||o.push(s);break}else{if(s.head==l.head)break;l=s}}}return o.length==r.ranges.length?!1:(t.dispatch(Fn(n,O.create(o,o.length-1))),!0)}function kf(t,e){if(t.state.readOnly)return!1;let n="delete.selection",{state:r}=t,o=r.changeByRange(a=>{let{from:i,to:l}=a;if(i==l){let s=e(a);s<i?(n="delete.backward",s=Ed(t,s,!1)):s>i&&(n="delete.forward",s=Ed(t,s,!0)),i=Math.min(i,s),l=Math.max(l,s)}else i=Ed(t,i,!1),l=Ed(t,l,!0);return i==l?{range:a}:{changes:{from:i,to:l},range:O.cursor(i,i<a.head?-1:1)}});return o.changes.empty?!1:(t.dispatch(r.update(o,{scrollIntoView:!0,userEvent:n,effects:n=="delete.selection"?q.announce.of(r.phrase("Selection deleted")):void 0})),!0)}function Ed(t,e,n){if(t instanceof q)for(let r of t.state.facet(q.atomicRanges).map(o=>o(t)))r.between(e,e,(o,a)=>{o<e&&a>e&&(e=n?a:o)});return e}function qd(t){let e=[],n=-1;for(let r of t.selection.ranges){let o=t.doc.lineAt(r.from),a=t.doc.lineAt(r.to);if(!r.empty&&r.to==a.from&&(a=t.doc.lineAt(r.to-1)),n>=o.number){let i=e[e.length-1];i.to=a.to,i.ranges.push(r)}else e.push({from:o.from,to:a.to,ranges:[r]});n=a.number+1}return e}function MT(t,e,n){if(t.readOnly)return!1;let r=[],o=[];for(let a of qd(t)){if(n?a.to==t.doc.length:a.from==0)continue;let i=t.doc.lineAt(n?a.to+1:a.from-1),l=i.length+1;if(n){r.push({from:a.to,to:i.to},{from:a.from,insert:i.text+t.lineBreak});for(let s of a.ranges)o.push(O.range(Math.min(t.doc.length,s.anchor+l),Math.min(t.doc.length,s.head+l)))}else{r.push({from:i.from,to:a.from},{from:a.to,insert:t.lineBreak+i.text});for(let s of a.ranges)o.push(O.range(s.anchor-l,s.head-l))}}return r.length?(e(t.update({changes:r,scrollIntoView:!0,selection:O.create(o,t.selection.mainIndex),userEvent:"move.line"})),!0):!1}function RT(t,e,n){if(t.readOnly)return!1;let r=[];for(let a of qd(t))n?r.push({from:a.from,insert:t.doc.slice(a.from,a.to)+t.lineBreak}):r.push({from:a.to,insert:t.lineBreak+t.doc.slice(a.from,a.to)});let o=t.changes(r);return e(t.update({changes:o,selection:t.selection.map(o,n?1:-1),scrollIntoView:!0,userEvent:"input.copyline"})),!0}function r3(t,e){if(/\(\)|\[\]|\{\}/.test(t.sliceDoc(e-1,e+1)))return{from:e,to:e};let n=lt(t).resolveInner(e),r=n.childBefore(e),o=n.childAfter(e),a;return r&&o&&r.to<=e&&o.from>=e&&(a=r.type.prop(j.closedBy))&&a.indexOf(o.name)>-1&&t.doc.lineAt(r.to).from==t.doc.lineAt(o.from).from&&!/\S/.test(t.sliceDoc(r.to,o.from))?{from:r.to,to:o.from}:null}function ET(t){return({state:e,dispatch:n})=>{if(e.readOnly)return!1;let r=e.changeByRange(o=>{let{from:a,to:i}=o,l=e.doc.lineAt(a),s=!t&&a==i&&r3(e,a);t&&(a=i=(i<=l.to?l:e.doc.lineAt(i)).to);let f=new ua(e,{simulateBreak:a,simulateDoubleBreak:!!s}),c=Lg(f,a);for(c==null&&(c=oa(/^\s*/.exec(e.doc.lineAt(a).text)[0],e.tabSize));i<l.to&&/\s/.test(l.text[i-l.from]);)i++;s?{from:a,to:i}=s:a>l.from&&a<l.from+100&&!/\S/.test(l.text.slice(0,a))&&(a=l.from);let u=["",Ks(e,c)];return s&&u.push(Ks(e,f.lineIndent(l.from,-1))),{changes:{from:a,to:i,insert:J.of(u)},range:O.cursor(a+1+u[1].length)}});return n(e.update(r,{scrollIntoView:!0,userEvent:"input"})),!0}}function ib(t,e){let n=-1;return t.changeByRange(r=>{let o=[];for(let i=r.from;i<=r.to;){let l=t.doc.lineAt(i);l.number>n&&(r.empty||r.to>l.from)&&(e(l,o,r),n=l.number),i=l.to+1}let a=t.changes(o);return{changes:o,range:O.range(a.mapPos(r.anchor,1),a.mapPos(r.head,1))}})}var e4,t4,n4,r4,Sf,eb,l4,s4,nT,rT,aT,tb,f4,c4,En,gn,p4,x4,Aa,sT,cT,uT,g4,y4,F5,I4,v4,mT,hT,XA,nb,w4,S4,k4,C4,A4,T4,B4,bT,IT,D4,M4,R4,E4,ST,kT,QA,KA,F4,L4,N4,_4,q4,P4,YA,JA,ZA,$A,z4,H4,U4,j4,V4,G4,TT,rb,OT,BT,DT,W4,X4,Q4,K4,Y4,J4,Z4,$4,e3,t3,n3,eT,o3,a3,i3,l3,s3,f3,c3,FT,LT=F(()=>{Bi();js();Ys();ws();e4=t=>{let{state:e}=t,n=e.doc.lineAt(e.selection.main.from),r=ab(t.state,n.from);return r.line?t4(t):r.block?r4(t):!1};t4=ob(i4,0),n4=ob(tT,0),r4=ob((t,e)=>tT(t,e,a4(e)),0);Sf=50;eb=Ot.define(),l4=Ot.define(),s4=N.define(),nT=N.define({combine(t){return uo(t,{minDepth:100,newGroupDelay:500,joinToEvent:(e,n)=>n},{minDepth:Math.max,newGroupDelay:Math.min,joinToEvent:(e,n)=>(r,o)=>e(r,o)||n(r,o)})}}),rT=xt.define({create(){return Aa.empty},update(t,e){let n=e.state.facet(nT),r=e.annotation(eb);if(r){let s=En.fromTransaction(e,r.selection),f=r.side,c=f==0?t.undone:t.done;return s?c=Fd(c,c.length,n.minDepth,s):c=lT(c,e.startState.selection),new Aa(f==0?r.rest:c,f==0?c:r.rest)}let o=e.annotation(l4);if((o=="full"||o=="before")&&(t=t.isolate()),e.annotation(Ve.addToHistory)===!1)return e.changes.empty?t:t.addMapping(e.changes.desc);let a=En.fromTransaction(e),i=e.annotation(Ve.time),l=e.annotation(Ve.userEvent);return a?t=t.addChanges(a,i,l,n,e):e.selection&&(t=t.addSelection(e.startState.selection,i,l,n.newGroupDelay)),(o=="full"||o=="after")&&(t=t.isolate()),t},toJSON(t){return{done:t.done.map(e=>e.toJSON()),undone:t.undone.map(e=>e.toJSON())}},fromJSON(t){return new Aa(t.done.map(En.fromJSON),t.undone.map(En.fromJSON))}});aT=Ld(0,!1),tb=Ld(1,!1),f4=Ld(0,!0),c4=Ld(1,!0),En=class t{constructor(e,n,r,o,a){this.changes=e,this.effects=n,this.mapped=r,this.startSelection=o,this.selectionsAfter=a}setSelAfter(e){return new t(this.changes,this.effects,this.mapped,this.startSelection,e)}toJSON(){var e,n,r;return{changes:(e=this.changes)===null||e===void 0?void 0:e.toJSON(),mapped:(n=this.mapped)===null||n===void 0?void 0:n.toJSON(),startSelection:(r=this.startSelection)===null||r===void 0?void 0:r.toJSON(),selectionsAfter:this.selectionsAfter.map(o=>o.toJSON())}}static fromJSON(e){return new t(e.changes&&ht.fromJSON(e.changes),[],e.mapped&&vr.fromJSON(e.mapped),e.startSelection&&O.fromJSON(e.startSelection),e.selectionsAfter.map(O.fromJSON))}static fromTransaction(e,n){let r=gn;for(let o of e.startState.facet(s4)){let a=o(e);a.length&&(r=r.concat(a))}return!r.length&&e.changes.empty?null:new t(e.changes.invert(e.startState.doc),r,void 0,n||e.startState.selection,gn)}static selection(e){return new t(void 0,gn,void 0,void 0,e)}};gn=[],p4=200;x4=/^(input\.type|delete)($|\.)/,Aa=class t{constructor(e,n,r=0,o=void 0){this.done=e,this.undone=n,this.prevTime=r,this.prevUserEvent=o}isolate(){return this.prevTime?new t(this.done,this.undone):this}addChanges(e,n,r,o,a){let i=this.done,l=i[i.length-1];return l&&l.changes&&!l.changes.empty&&e.changes&&(!r||x4.test(r))&&(!l.selectionsAfter.length&&n-this.prevTime<o.newGroupDelay&&o.joinToEvent(a,u4(l.changes,e.changes))||r=="input.type.compose")?i=Fd(i,i.length-1,o.minDepth,new En(e.changes.compose(l.changes),iT(oe.mapEffects(e.effects,l.changes),l.effects),l.mapped,l.startSelection,gn)):i=Fd(i,i.length,o.minDepth,e),new t(i,gn,n,r)}addSelection(e,n,r,o){let a=this.done.length?this.done[this.done.length-1].selectionsAfter:gn;return a.length>0&&n-this.prevTime<o&&r==this.prevUserEvent&&r&&/^select($|\.)/.test(r)&&d4(a[a.length-1],e)?this:new t(lT(this.done,e),this.undone,n,r)}addMapping(e){return new t($y(this.done,e),$y(this.undone,e),this.prevTime,this.prevUserEvent)}pop(e,n,r){let o=e==0?this.done:this.undone;if(o.length==0)return null;let a=o[o.length-1],i=a.selectionsAfter[0]||(a.startSelection?a.startSelection.map(a.changes.invertedDesc,1):n.selection);if(r&&a.selectionsAfter.length)return n.update({selection:a.selectionsAfter[a.selectionsAfter.length-1],annotations:eb.of({side:e,rest:m4(o),selection:i}),userEvent:e==0?"select.undo":"select.redo",scrollIntoView:!0});if(a.changes){let l=o.length==1?gn:o.slice(0,o.length-1);return a.mapped&&(l=$y(l,a.mapped)),n.update({changes:a.changes,selection:a.startSelection,effects:a.effects,annotations:eb.of({side:e,rest:l,selection:i}),filter:!1,userEvent:e==0?"undo":"redo",scrollIntoView:!0})}else return null}};Aa.empty=new Aa(gn,gn);sT=[{key:"Mod-z",run:aT,preventDefault:!0},{key:"Mod-y",mac:"Mod-Shift-z",run:tb,preventDefault:!0},{linux:"Ctrl-Shift-z",run:tb,preventDefault:!0},{key:"Mod-u",run:f4,preventDefault:!0},{key:"Alt-u",mac:"Mod-Shift-u",run:c4,preventDefault:!0}];cT=t=>fT(t,!ft(t)),uT=t=>fT(t,ft(t));g4=t=>dT(t,!ft(t)),y4=t=>dT(t,ft(t)),F5=typeof Intl<"u"&&Intl.Segmenter?new Intl.Segmenter(void 0,{granularity:"word"}):null;I4=t=>Ln(t,e=>_d(t.state,e,!ft(t))),v4=t=>Ln(t,e=>_d(t.state,e,ft(t)));mT=t=>pT(t,!1),hT=t=>pT(t,!0);XA=t=>gT(t,!1),nb=t=>gT(t,!0);w4=t=>Ln(t,e=>To(t,e,!0)),S4=t=>Ln(t,e=>To(t,e,!1)),k4=t=>Ln(t,e=>To(t,e,!ft(t))),C4=t=>Ln(t,e=>To(t,e,ft(t))),A4=t=>Ln(t,e=>t.moveToLineBoundary(e,!1,!1)),T4=t=>Ln(t,e=>t.moveToLineBoundary(e,!0,!1));B4=({state:t,dispatch:e})=>O4(t,e,!1);bT=t=>yT(t,!ft(t)),IT=t=>yT(t,ft(t));D4=t=>vT(t,!ft(t)),M4=t=>vT(t,ft(t)),R4=t=>{let e=!ft(t);return yn(t,e,n=>_d(t.state,n,e))},E4=t=>{let e=ft(t);return yn(t,e,n=>_d(t.state,n,e))};ST=t=>wT(t,!1),kT=t=>wT(t,!0);QA=t=>CT(t,!1),KA=t=>CT(t,!0),F4=t=>yn(t,!0,e=>To(t,e,!0)),L4=t=>yn(t,!1,e=>To(t,e,!1)),N4=t=>{let e=!ft(t);return yn(t,e,n=>To(t,n,e))},_4=t=>{let e=ft(t);return yn(t,e,n=>To(t,n,e))},q4=t=>yn(t,!1,e=>O.cursor(t.lineBlockAt(e.head).from)),P4=t=>yn(t,!0,e=>O.cursor(t.lineBlockAt(e.head).to)),YA=({state:t,dispatch:e})=>(e(Fn(t,{anchor:0})),!0),JA=({state:t,dispatch:e})=>(e(Fn(t,{anchor:t.doc.length})),!0),ZA=({state:t,dispatch:e})=>(e(Fn(t,{anchor:t.selection.main.anchor,head:0})),!0),$A=({state:t,dispatch:e})=>(e(Fn(t,{anchor:t.selection.main.anchor,head:t.doc.length})),!0),z4=({state:t,dispatch:e})=>(e(t.update({selection:{anchor:0,head:t.doc.length},userEvent:"select"})),!0),H4=({state:t,dispatch:e})=>{let n=qd(t).map(({from:r,to:o})=>O.undirectionalRange(r,Math.min(o+1,t.doc.length)));return e(t.update({selection:O.create(n),userEvent:"select"})),!0},U4=({state:t,dispatch:e})=>{let n=dl(t.selection,r=>{let o=lt(t),a=o.resolveStack(r.from,1);if(r.empty){let i=o.resolveStack(r.from,-1);i.node.from>=a.node.from&&i.node.to<=a.node.to&&(a=i)}for(let i=a;i;i=i.next){let{node:l}=i;if((l.from<r.from&&l.to>=r.to||l.to>r.to&&l.from<=r.from)&&i.next)return O.undirectionalRange(l.from,l.to)}return r});return n.eq(t.selection)?!1:(e(Fn(t,n)),!0)};j4=t=>AT(t,!1),V4=t=>AT(t,!0),G4=({state:t,dispatch:e})=>{let n=t.selection,r=null;return n.ranges.length>1?r=O.create([n.main]):n.main.empty||(r=O.create([O.cursor(n.main.head)])),r?(e(Fn(t,r)),!0):!1};TT=(t,e,n)=>kf(t,r=>{let o=r.from,{state:a}=t,i=a.doc.lineAt(o),l,s;if(n&&!e&&o>i.from&&o<i.from+200&&!/[^ \t]/.test(l=i.text.slice(0,o-i.from))){if(l[l.length-1]=="	")return o-1;let f=oa(l,a.tabSize),c=f%Qs(a)||Qs(a);for(let u=0;u<c&&l[l.length-1-u]==" ";u++)o--;s=o}else s=Qe(i.text,o-i.from,e,e)+i.from,s==o&&i.number!=(e?a.doc.lines:1)?s+=e?1:-1:!e&&/[\ufe00-\ufe0f]/.test(i.text.slice(s-i.from,o-i.from))&&(s=Qe(i.text,s-i.from,!1,!1)+i.from);return s}),rb=t=>TT(t,!1,!0),OT=t=>TT(t,!0,!1),BT=(t,e)=>kf(t,n=>{let r=n.head,{state:o}=t,a=o.doc.lineAt(r),i=o.charCategorizer(r);for(let l=null;;){if(r==(e?a.to:a.from)){r==n.head&&a.number!=(e?o.doc.lines:1)&&(r+=e?1:-1);break}let s=Qe(a.text,r-a.from,e)+a.from,f=a.text.slice(Math.min(r,s)-a.from,Math.max(r,s)-a.from),c=i(f);if(l!=null&&c!=l)break;(f!=" "||r!=n.head)&&(l=c),r=s}return r}),DT=t=>BT(t,!1),W4=t=>BT(t,!0),X4=t=>kf(t,e=>{let n=t.lineBlockAt(e.head).to;return e.head<n?n:Math.min(t.state.doc.length,e.head+1)}),Q4=t=>kf(t,e=>{let n=t.moveToLineBoundary(e,!1).head;return e.head>n?n:Math.max(0,e.head-1)}),K4=t=>kf(t,e=>{let n=t.moveToLineBoundary(e,!0).head;return e.head<n?n:Math.min(t.state.doc.length,e.head+1)}),Y4=({state:t,dispatch:e})=>{if(t.readOnly)return!1;let n=t.changeByRange(r=>({changes:{from:r.from,to:r.to,insert:J.of(["",""])},range:O.cursor(r.from)}));return e(t.update(n,{scrollIntoView:!0,userEvent:"input"})),!0},J4=({state:t,dispatch:e})=>{if(t.readOnly)return!1;let n=t.changeByRange(r=>{if(!r.empty||r.from==0||r.from==t.doc.length)return{range:r};let o=r.from,a=t.doc.lineAt(o),i=o==a.from?o-1:Qe(a.text,o-a.from,!1)+a.from,l=o==a.to?o+1:Qe(a.text,o-a.from,!0)+a.from;return{changes:{from:i,to:l,insert:t.doc.slice(o,l).append(t.doc.slice(i,o))},range:O.cursor(l)}});return n.changes.empty?!1:(e(t.update(n,{scrollIntoView:!0,userEvent:"move.character"})),!0)};Z4=({state:t,dispatch:e})=>MT(t,e,!1),$4=({state:t,dispatch:e})=>MT(t,e,!0);e3=({state:t,dispatch:e})=>RT(t,e,!1),t3=({state:t,dispatch:e})=>RT(t,e,!0),n3=t=>{if(t.state.readOnly)return!1;let{state:e}=t,n=e.changes(qd(e).map(({from:o,to:a})=>(o>0?o--:a<e.doc.length&&a++,{from:o,to:a}))),r=dl(e.selection,o=>{let a;if(t.lineWrapping){let i=t.lineBlockAt(o.head),l=t.coordsAtPos(o.head,o.assoc||1);l&&(a=i.bottom+t.documentTop-l.bottom+t.defaultLineHeight/2)}return t.moveVertically(o,!0,a)}).map(n);return t.dispatch({changes:n,selection:r,scrollIntoView:!0,userEvent:"delete.line"}),!0};eT=ET(!1),o3=ET(!0);a3=({state:t,dispatch:e})=>{if(t.readOnly)return!1;let n=Object.create(null),r=new ua(t,{overrideIndentation:a=>{let i=n[a];return i??-1}}),o=ib(t,(a,i,l)=>{let s=Lg(r,a.from);if(s==null)return;/\S/.test(a.text)||(s=0);let f=/^\s*/.exec(a.text)[0],c=Ks(t,s);(f!=c||l.from<a.from+f.length)&&(n[a.from]=s,i.push({from:a.from,to:a.from+f.length,insert:c}))});return o.changes.empty||e(t.update(o,{userEvent:"indent"})),!0},i3=({state:t,dispatch:e})=>t.readOnly?!1:(e(t.update(ib(t,(n,r)=>{r.push({from:n.from,insert:t.facet(Xs)})}),{userEvent:"input.indent"})),!0),l3=({state:t,dispatch:e})=>t.readOnly?!1:(e(t.update(ib(t,(n,r)=>{let o=/^\s*/.exec(n.text)[0];if(!o)return;let a=oa(o,t.tabSize),i=0,l=Ks(t,Math.max(0,a-Qs(t)));for(;i<o.length&&i<l.length&&o.charCodeAt(i)==l.charCodeAt(i);)i++;r.push({from:n.from+i,to:n.from+o.length,insert:l.slice(i)})}),{userEvent:"delete.dedent"})),!0),s3=t=>(t.setTabFocusMode(),!0),f3=[{key:"Ctrl-b",run:cT,shift:bT,preventDefault:!0},{key:"Ctrl-f",run:uT,shift:IT},{key:"Ctrl-p",run:mT,shift:ST},{key:"Ctrl-n",run:hT,shift:kT},{key:"Ctrl-a",run:A4,shift:q4},{key:"Ctrl-e",run:T4,shift:P4},{key:"Ctrl-d",run:OT},{key:"Ctrl-h",run:rb},{key:"Ctrl-k",run:X4},{key:"Ctrl-Alt-h",run:DT},{key:"Ctrl-o",run:Y4},{key:"Ctrl-t",run:J4},{key:"Ctrl-v",run:nb}],c3=[{key:"ArrowLeft",run:cT,shift:bT,preventDefault:!0},{key:"Mod-ArrowLeft",mac:"Alt-ArrowLeft",run:g4,shift:D4,preventDefault:!0},{mac:"Cmd-ArrowLeft",run:k4,shift:N4,preventDefault:!0},{key:"ArrowRight",run:uT,shift:IT,preventDefault:!0},{key:"Mod-ArrowRight",mac:"Alt-ArrowRight",run:y4,shift:M4,preventDefault:!0},{mac:"Cmd-ArrowRight",run:C4,shift:_4,preventDefault:!0},{key:"ArrowUp",run:mT,shift:ST,preventDefault:!0},{mac:"Cmd-ArrowUp",run:YA,shift:ZA},{mac:"Ctrl-ArrowUp",run:XA,shift:QA},{key:"ArrowDown",run:hT,shift:kT,preventDefault:!0},{mac:"Cmd-ArrowDown",run:JA,shift:$A},{mac:"Ctrl-ArrowDown",run:nb,shift:KA},{key:"PageUp",run:XA,shift:QA},{key:"PageDown",run:nb,shift:KA},{key:"Home",run:S4,shift:L4,preventDefault:!0},{key:"Mod-Home",run:YA,shift:ZA},{key:"End",run:w4,shift:F4,preventDefault:!0},{key:"Mod-End",run:JA,shift:$A},{key:"Enter",run:eT,shift:eT},{key:"Mod-a",run:z4},{key:"Backspace",run:rb,shift:rb,preventDefault:!0},{key:"Delete",run:OT,preventDefault:!0},{key:"Mod-Backspace",mac:"Alt-Backspace",run:DT,preventDefault:!0},{key:"Mod-Delete",mac:"Alt-Delete",run:W4,preventDefault:!0},{mac:"Mod-Backspace",run:Q4,preventDefault:!0},{mac:"Mod-Delete",run:K4,preventDefault:!0}].concat(f3.map(t=>({mac:t.key,run:t.run,shift:t.shift}))),FT=[{key:"Alt-ArrowLeft",mac:"Ctrl-ArrowLeft",run:I4,shift:R4},{key:"Alt-ArrowRight",mac:"Ctrl-ArrowRight",run:v4,shift:E4},{key:"Alt-ArrowUp",run:Z4},{key:"Shift-Alt-ArrowUp",run:e3},{key:"Alt-ArrowDown",run:$4},{key:"Shift-Alt-ArrowDown",run:t3},{key:"Mod-Alt-ArrowUp",run:j4},{key:"Mod-Alt-ArrowDown",run:V4},{key:"Escape",run:G4},{key:"Mod-Enter",run:o3},{key:"Alt-l",mac:"Ctrl-l",run:H4},{key:"Mod-i",run:U4,preventDefault:!0},{key:"Mod-[",run:l3},{key:"Mod-]",run:i3},{key:"Mod-Alt-\\",run:a3},{key:"Shift-Mod-k",run:n3},{key:"Shift-Mod-\\",run:B4},{key:"Mod-/",run:e4},{key:"Alt-A",mac:"Ctrl-A",run:n4},{key:"Ctrl-m",mac:"Shift-Alt-m",run:s3}].concat(c3)});function NT(t){return OC({dialect:ef("sqlite"),schema:t?d2(t,"sqlite"):{},upperCaseKeywords:!1})}function x3(t,e){if(!t.length)return null;let n=Math.max(0,Math.min(e,t.length-1)),r=/^[\w$"'`[\].]+/.exec(t.slice(n,n+200));return{from:n,to:Math.min(t.length,n+(r?r[0].length:1))}}function qT(){let t=(0,Nn.useRef)(null),e=(0,Nn.useRef)(null),n=(0,Nn.useRef)(new Oi),r=G(c=>c.activeTabId),o=G(c=>c.tabs.find(u=>u.id===c.activeTabId)?.sql??""),a=G(c=>c.schema),i=G(c=>c.errorAt),l=(0,Nn.useRef)({tabId:r,schema:a}),s=(0,Nn.useRef)(null);function f(c){let{run:u}=G.getState();return Te.create({doc:c,extensions:[kn.highest(Vi.of([{key:"Mod-Enter",run:()=>(u("current"),!0)},{key:"Mod-Shift-Enter",run:()=>(u("all"),!0)}])),Tk(),kk(),oT(),Qk(),dC(),Vi.of([...ay,...FT,...sT]),n.current.of(NT(l.current.schema)),jk(m3),h3,d3,q.contentAttributes.of({"aria-label":"SQL editor"}),q.updateListener.of(d=>{d.docChanged&&G.getState().updateTabSql(l.current.tabId,d.state.doc.toString())})]})}return(0,Nn.useEffect)(()=>{let c=t.current;if(!c)return;let u=new q({state:f(o),parent:c});return e.current=u,s.current=r,Ay(()=>{let d=u.state.selection.main;return{from:d.from,to:d.to,head:d.head}}),()=>{Ay(null),u.destroy(),e.current=null}},[]),(0,Nn.useEffect)(()=>{l.current.tabId=r;let c=e.current;c&&(s.current!==r?(s.current=r,c.setState(f(o))):c.state.doc.toString()!==o&&c.dispatch({changes:{from:0,to:c.state.doc.length,insert:o}}))},[r,o]),(0,Nn.useEffect)(()=>{l.current.schema=a,e.current?.dispatch({effects:n.current.reconfigure(NT(a))})},[a]),(0,Nn.useEffect)(()=>{let c=e.current;if(!c)return;let u=i&&i.tabId===r?x3(c.state.doc.toString(),i.position):null;c.dispatch({effects:_T.of(u)}),u&&c.dispatch({effects:q.scrollIntoView(u.from,{y:"nearest"})})},[i,r]),(0,PT.jsx)("div",{ref:t,className:"xray-sql-editor"})}var Nn,PT,_T,u3,d3,p3,m3,h3,zT=F(()=>{"use strict";Nn=$(ct());Bi();js();LT();iy();Ys();hy();Ia();nf();Iy();PT=$(Ne()),_T=oe.define(),u3=ee.mark({class:"xray-sql-error-mark"}),d3=xt.define({create:()=>ee.none,update(t,e){let n=e.docChanged?ee.none:t;for(let r of e.effects)r.is(_T)&&(n=r.value?ee.set([u3.range(r.value.from,r.value.to)]):ee.none);return n},provide:t=>q.decorations.from(t)}),p3={"#708":"var(--xray-mauve)","#219":"var(--xray-peach)","#164":"var(--xray-peach)","#a11":"var(--xray-green)","#e40":"var(--xray-yellow)","#00f":"var(--xray-blue)","#30a":"var(--xray-blue)","#085":"var(--xray-teal)","#167":"var(--xray-teal)","#256":"var(--xray-blue)","#00c":"var(--xray-blue)","#940":"var(--xray-hint)","#f00":"var(--xray-red)","#404740":"var(--xray-subtext)"},m3=Xi.define(Vk.specs.map(t=>t.color?{...t,color:p3[t.color]??"var(--xray-text)"}:t)),h3=q.theme({"&":{height:"100%",color:"var(--xray-text)",backgroundColor:"var(--xray-bg)",fontSize:"13px"},"&.cm-focused":{outline:"none"},".cm-scroller":{fontFamily:"var(--xray-font)",lineHeight:"1.55"},".cm-content":{caretColor:"var(--xray-accent)"},".cm-cursor, .cm-dropCursor":{borderLeftColor:"var(--xray-accent)"},"&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection":{backgroundColor:"var(--xray-active)"},".cm-activeLine":{backgroundColor:"rgba(var(--xray-text-rgb), .04)"},".cm-gutters":{backgroundColor:"var(--xray-surface)",color:"var(--xray-hint)",border:"none",borderRight:"1px solid var(--xray-border)"},".cm-activeLineGutter":{backgroundColor:"rgba(var(--xray-text-rgb), .06)",color:"var(--xray-subtext)"},".cm-matchingBracket":{backgroundColor:"var(--xray-selection)",outline:"1px solid var(--xray-border-control)"},".cm-tooltip":{backgroundColor:"var(--xray-surface2)",color:"var(--xray-text)",border:"1px solid var(--xray-border)"},".cm-tooltip-autocomplete > ul":{fontFamily:"var(--xray-font)"},".cm-tooltip-autocomplete > ul > li[aria-selected]":{backgroundColor:"var(--xray-active)",color:"var(--xray-text)"},".xray-sql-error-mark":{textDecoration:"underline wavy var(--xray-red)",textUnderlineOffset:"3px"}})});function g3(t){return t<1024?`${t} B`:t<1024*1024?`${(t/1024).toFixed(1)} KB`:`${(t/(1024*1024)).toFixed(1)} MB`}function y3(){let t=G(l=>l.tabs.find(s=>s.id===l.activeTabId)?.maxRows??1e3),e=G(l=>l.setMaxRows),[n,r]=(0,Ta.useState)(String(t)),[o,a]=(0,Ta.useState)(t);o!==t&&(a(t),r(String(t)));function i(){let l=nl(Number(n));e(l),r(String(l))}return(0,_.jsxs)("label",{className:"xray-sql-field",children:[(0,_.jsx)("span",{children:"Max rows"}),(0,_.jsx)("input",{className:"xray-input xray-sql-max-rows",type:"number",min:1,max:5e4,value:n,onChange:l=>r(l.target.value),onBlur:i,onKeyDown:l=>{l.key==="Enter"&&i()}})]})}function b3(){let t=G(c=>c.connection),e=G(c=>c.readOnlyChoice),n=G(c=>c.running),r=G(c=>c.opening),o=G(c=>c.dirty),{setReadOnly:a,run:i,stop:l,save:s}=G.getState();return(0,_.jsxs)("header",{className:"xray-sql-toolbar",children:[(0,_.jsx)("span",{className:"xray-sql-brand",children:"XRAY SQL"}),(0,_.jsx)(Z2,{disabled:!!n||r}),(0,_.jsxs)("label",{className:"xray-sql-field xray-sql-check",children:[(0,_.jsx)("input",{type:"checkbox",checked:e,disabled:!!n||r,onChange:c=>{a(c.target.checked)}}),(0,_.jsx)("span",{children:"Read-only"})]}),t&&(0,_.jsxs)("span",{className:"xray-sql-connection",title:t.name,children:[(0,_.jsx)("span",{className:"xray-sql-connection-name",children:t.name}),(0,_.jsxs)("span",{className:"xray-sql-connection-meta",children:[g3(t.size),o?" \xB7 unsaved changes":""]})]}),(0,_.jsx)("span",{className:"xray-spacer"}),(0,_.jsx)(y3,{}),(0,_.jsxs)("button",{className:"xray-btn primary",disabled:!t||!!n||r,onClick:()=>{i("current")},title:"Run the selection or the statement at the cursor (Ctrl+Enter). Ctrl+Shift+Enter runs all.",children:[(0,_.jsx)(Dh,{...Pd}),"Run"]}),(0,_.jsxs)("button",{className:"xray-btn",disabled:!n,onClick:l,children:[(0,_.jsx)(Mh,{...Pd}),"Stop"]}),(0,_.jsxs)("button",{className:"xray-btn",disabled:!t||!o||!!n,onClick:()=>{s()},children:[(0,_.jsx)(Th,{...Pd}),"Save"]})]})}function I3(){let t=G(i=>i.tabs),e=G(i=>i.activeTabId),n=G(i=>i.running?.tabId),{setActiveTab:r,addTab:o,closeTab:a}=G.getState();return(0,_.jsxs)("div",{className:"xray-sql-editor-tabs",role:"tablist","aria-label":"Queries",children:[t.map(i=>(0,_.jsxs)("div",{className:`xray-sql-editor-tab${i.id===e?" active":""}`,children:[(0,_.jsx)("button",{role:"tab","aria-selected":i.id===e,className:"xray-sql-editor-tab-name",onClick:()=>r(i.id),title:i.title,children:i.title}),(0,_.jsx)("button",{className:"xray-sql-editor-tab-close","aria-label":`Close ${i.title}`,disabled:n===i.id,onClick:()=>a(i.id),children:(0,_.jsx)(Ko,{size:12,stroke:2})})]},i.id)),(0,_.jsx)("button",{className:"xray-icon-btn xray-sql-add-tab","aria-label":"New query tab",title:"New query tab",onClick:o,children:(0,_.jsx)(Rh,{...Pd})})]})}function v3(t){return t==="could not parse"?"Run a statement that could not be parsed?":`Run ${t}?`}function w3(){let t=G(l=>l.pendingConfirm),e=G(l=>l.pendingPrompt),{confirmPending:n,cancelPending:r,confirmPrompt:o,cancelPrompt:a}=G.getState(),i=(0,Ta.useRef)(null);return t?(0,_.jsx)(Hy,{title:v3(t.reason),icon:(0,_.jsx)(nu,{size:17,stroke:1.8}),className:"xray-confirm-modal",initialFocusRef:i,onClose:r,footer:(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)("span",{className:"xray-spacer"}),(0,_.jsx)("button",{ref:i,className:"xray-btn",onClick:r,children:"Cancel"}),(0,_.jsx)("button",{className:"xray-btn danger",onClick:()=>{n()},children:"Run anyway"})]}),children:(0,_.jsx)("div",{className:"xray-modal-body",children:(0,_.jsx)("pre",{className:"xray-sql-confirm-sql",children:t.sql})})}):e?(0,_.jsx)(Hy,{title:e.title,icon:(0,_.jsx)(nu,{size:17,stroke:1.8}),className:"xray-confirm-modal",initialFocusRef:i,onClose:a,footer:(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)("span",{className:"xray-spacer"}),(0,_.jsx)("button",{ref:i,className:"xray-btn",onClick:a,children:"Cancel"}),(0,_.jsx)("button",{className:"xray-btn danger",onClick:()=>{o()},children:e.confirmLabel})]}),children:(0,_.jsx)("div",{className:"xray-modal-body",children:(0,_.jsx)("p",{className:"xray-confirm-message",children:e.message})})}):null}function HT({settings:t}){let e=G(o=>o.dirty);(0,Ta.useEffect)(()=>{if(!e)return;let o=a=>a.preventDefault();return window.addEventListener("beforeunload",o),()=>window.removeEventListener("beforeunload",o)},[e]);let n=P2(t),r={...n?{"--xray-accent":n}:{},"--xray-font":z2[t.font],"--xray-radius":`${t.radius}px`,...t.theme==="custom"?L2(t.customTheme):{}};return(0,_.jsxs)("div",{className:`xray-theme-scope xray-theme-${t.theme} xray-font-${t.font}`,style:r,children:[(0,_.jsxs)("div",{className:"xray-sql-app",children:[(0,_.jsx)(b3,{}),(0,_.jsxs)("div",{className:"xray-sql-body",children:[(0,_.jsx)(K2,{}),(0,_.jsxs)("main",{className:"xray-sql-main","aria-label":"SQL workspace",children:[(0,_.jsx)(I3,{}),(0,_.jsx)(qT,{}),(0,_.jsx)(GA,{})]})]})]}),(0,_.jsx)(w3,{})]})}var Ta,_,Pd,UT=F(()=>{"use strict";Ta=$(ct());Yo();Ia();Sd();Ey();vo();X2();Y2();$2();WA();zT();_=$(Ne()),Pd={size:16,stroke:1.8}});function k3(t){return Array.isArray(t)?t.filter(n=>n&&typeof n.id=="string"&&typeof n.code=="string").slice(0,30).map(n=>({id:n.id,title:n.title,code:n.code})):void 0}function VT(t){let e=k3(t.snippets);return{...t.activeTab&&S3.includes(t.activeTab)?{activeTab:t.activeTab}:{},...t.detailView?{detailView:t.detailView}:{},...t.detailTab?{detailTab:t.detailTab}:{},...t.consoleMiniTab?{consoleMiniTab:t.consoleMiniTab}:{},...t.networkFilter?{networkFilter:t.networkFilter}:{},...typeof t.apiSearchQuery=="string"?{apiSearchQuery:t.apiSearchQuery}:{},...t.apiQuickFilter?{apiQuickFilter:t.apiQuickFilter}:{},...t.apiGroupingMode?{apiGroupingMode:t.apiGroupingMode}:{},...typeof t.apiDetailOpen=="boolean"?{apiDetailOpen:t.apiDetailOpen}:{},...t.apiDrawerPlacement?{apiDrawerPlacement:t.apiDrawerPlacement}:{},...Array.isArray(t.methodFilters)?{methodFilters:new Set(t.methodFilters)}:{},...Array.isArray(t.statusFilters)?{statusFilters:new Set(t.statusFilters)}:{},...Array.isArray(t.typeFilters)?{typeFilters:new Set(t.typeFilters)}:{},...Array.isArray(t.expandedGroups)?{expandedGroups:new Set(t.expandedGroups)}:{},...Array.isArray(t.collapsedSections)?{collapsedSections:new Set(t.collapsedSections)}:{},...t.sortField?{sortField:t.sortField}:{},...t.sortOrder?{sortOrder:t.sortOrder}:{},...typeof t.recording=="boolean"?{recording:t.recording}:{},...Array.isArray(t.pinnedIds)?{pinnedIds:new Set(t.pinnedIds)}:{},...e?{snippets:e}:{},...t.settings?{settings:H2(t.settings)}:{}}}var jT,S3,GT=F(()=>{"use strict";Sd();jT="react_panel_preferences",S3=["console","api","logs","rules","insights","sql"]});var WT,XT=F(()=>{WT=`:host,
.xray-app-root {
  /* Fallback contract for anything rendered outside a theme class (the first paint of
     the HUD and window before mount): the XRAY Dark default's palette, value for value
     (test/theming-tokens.test.js pins it to the .xray-theme-xray-dark block). Preset
     classes and custom inline variables override these values inside the panel scope. */
  --xray-bg: #141517;
  --xray-surface: #1b1c1f;
  --xray-surface2: #25272a;
  --xray-surface3: #303235;
  /* RGB triples so translucent surfaces (rgba(var(--\u2026-rgb), a)) adapt per theme */
  --xray-bg-rgb: 20, 21, 23;
  --xray-surface-rgb: 27, 28, 31;
  --xray-surface2-rgb: 37, 39, 42;
  --xray-text-rgb: 238, 239, 241;
  /* corner-radius scale \u2014 base is set inline per-panel from settings.radius */
  --xray-radius: 10px;
  --xray-radius-sm: calc(var(--xray-radius) * 0.6);
  --xray-radius-lg: calc(var(--xray-radius) * 1.4);
  /* motion system \u2014 one easing/duration language across the UI */
  --xray-ease: cubic-bezier(0.22, 0.8, 0.28, 1);
  --xray-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --xray-dur-fast: 120ms;
  --xray-dur: 180ms;
  --xray-text: #eeeff1;
  --xray-subtext: #bcbfc5;
  --xray-hint: #90949b;
  --xray-border: #34363a;
  --xray-border-control: #71757b;
  --xray-focus: var(--xray-accent);
  --xray-selection: color-mix(in srgb, var(--xray-accent) 11.5%, var(--xray-bg));
  --xray-hover: #25272a;
  --xray-active: color-mix(in srgb, var(--xray-accent) 28%, var(--xray-bg));
  --xray-disabled: #5a5e63;
  --xray-accent: #3dc8f5;
  --xray-accent-soft: var(--xray-selection);
  --xray-green: #65d68a;
  --xray-blue: #96b2fb;
  --xray-yellow: #f6c65b;
  --xray-red: #f8767a;
  --xray-mauve: #c6a0f2;
  --xray-teal: #5cd5c7;
  --xray-peach: #f5a166;
  --xray-pending: #f6c65b;
  --xray-neutral: #90949b;
  --xray-shadow: rgba(0, 0, 0, .40);
  --xray-overlay: rgba(20, 21, 23, .74);
  --xray-font: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  /* Spec S2: chrome (tabs, buttons, menus, Settings, modals, toasts) uses the platform UI sans;
     --xray-font above (the Font stack setting) stays the monospace data font. No web fonts. */
  --xray-font-ui: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
`});var QT,KT=F(()=>{QT=`* {
  box-sizing: border-box;
}

.xray-app-root {
  all: initial;
  color: var(--xray-text);
  font-family: var(--xray-font-ui);
}

/* Spec S2, two type roles: chrome reads in --xray-font-ui, data in --xray-font (the Font stack
   setting, monospace). Form controls don't inherit a font, so they get the UI stack here; code-ish
   elements get the data stack. Zero specificity: any component rule (a console input, a JSON
   editor, a rule body) still picks its own role. */
:where(.xray-app-root) :where(button, input, select, textarea) {
  font-family: var(--xray-font-ui);
}

:where(.xray-app-root) :where(pre, code, kbd, samp) {
  font-family: var(--xray-font);
}

.xray-app-root *,
.xray-hud * {
  scrollbar-color: var(--xray-scroll-thumb, color-mix(in srgb, var(--xray-hint) 62%, transparent)) rgba(var(--xray-bg-rgb), .44);
  scrollbar-width: thin;
  /* Absorb overscroll inside the panel so scrolling a list/detail to its edge
     never chains through to the website behind an injected side panel or HUD. */
  overscroll-behavior: contain;
}

/* ...but anything nested inside a scroll region hands its overscroll up to that
   region, which still contains it. Otherwise an inner element that is a scroll
   container in name only (e.g. a tree with overflow-x:auto, whose overflow-y then
   computes to auto) latches the wheel and nothing scrolls at all. */
:is(.xray-console-stream, .xray-result-body, .xray-inspector-body, .xray-cell-stack-body,
  .xray-virtual-list, .xray-detail, .xray-detail-panel, .xray-detail-content,
  .xray-api-table-scroll, .xray-request-context-content, .xray-modal-body,
  .xray-settings-content, .xray-export-rail, .xray-log-detail-body, .xray-logs-detail-body,
  .xray-frames-list, .xray-command-list, .xray-gsearch-list) * {
  overscroll-behavior: auto;
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
  background: var(--xray-scroll-thumb, color-mix(in srgb, var(--xray-hint) 72%, transparent));
}

.xray-app-root *::-webkit-scrollbar-thumb:hover,
.xray-hud *::-webkit-scrollbar-thumb:hover {
  /* Neutral, a step stronger than the resting thumb (not the status blue; --xray-hover would
     vanish against the track). */
  background: color-mix(in srgb, var(--xray-hint) 92%, transparent);
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
  border-left: 1px solid var(--xray-border);
  box-shadow: -20px 0 80px var(--xray-shadow);
  font: 12px/1.45 var(--xray-font-ui);
  overflow: hidden;
}

/* Left-dock mirror of the base (right-docked) side panel. Only added in the docked
   side panel; the floating HUD's hud.css neutralizes it, and devtools/window modes
   never get the dock class. */
.xray-panel.xray-dock-left {
  right: auto;
  left: 0;
  border-left: 0;
  border-right: 1px solid var(--xray-border);
  box-shadow: 20px 0 80px var(--xray-shadow);
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

/* A drag affordance is neutral (spec A1); keyboard focus marks it with the focus colour. */
.xray-resize-handle:hover,
.xray-resize-handle.dragging {
  background: rgba(var(--xray-text-rgb), .08);
}

.xray-resize-handle:focus-visible {
  background: color-mix(in srgb, var(--xray-focus) 22%, transparent);
  outline: none;
}

.xray-resize-handle:hover::after,
.xray-resize-handle.dragging::after {
  opacity: 1;
}

.xray-resize-handle:focus-visible::after {
  opacity: 1;
  background: var(--xray-focus);
}

/* Dock / close cluster, separated from the mode switcher by a hairline. */
.xray-dock-controls {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: 2px;
  padding-left: 6px;
  border-left: 1px solid var(--xray-border);
}

.xray-close-btn:hover {
  color: var(--xray-red);
  background: color-mix(in srgb, var(--xray-red) 10%, transparent);
}

/* The theme scope carries color tokens to the panel AND its sibling modals via
   inheritance; display:contents means it adds no layout box. */
.xray-theme-scope {
  display: contents;
}

/* Theme token blocks key off the theme class alone (present on both .xray-theme-scope
   and .xray-panel), so popups rendered outside .xray-panel inherit the active theme. */
.xray-theme-midnight {
  /* High Contrast \u2014 compatibility \`midnight\` ID. The accent is a cyan at 7:1, apart from the gold
     warning colour and the blue, teal and green; the selection tints are a third and two fifths of it. */
  --xray-bg: #000000;
  --xray-surface: #101010;
  --xray-surface2: #1d1d1d;
  --xray-surface3: #2b2b2b;
  --xray-bg-rgb: 0, 0, 0;
  --xray-surface-rgb: 16, 16, 16;
  --xray-surface2-rgb: 29, 29, 29;
  --xray-text-rgb: 255, 255, 255;
  --xray-text: #ffffff;
  --xray-subtext: #eeeeee;
  --xray-hint: #c8c8c8;
  --xray-border: #ffffff;
  --xray-border-control: #ffffff;
  --xray-focus: var(--xray-accent);
  --xray-selection: color-mix(in srgb, var(--xray-accent) 13.5%, var(--xray-bg));
  --xray-hover: #2a2a2a;
  --xray-active: color-mix(in srgb, var(--xray-accent) 40%, var(--xray-bg));
  --xray-disabled: #a0a0a0;
  --xray-accent: #00e5ff;
  --xray-accent-soft: var(--xray-selection);
  --xray-blue: #70c7ff;
  --xray-mauve: #d4a8ff;
  --xray-green: #75e6a8;
  --xray-yellow: #ffd166;
  --xray-red: #ff9da3;
  --xray-teal: #6de0d0;
  --xray-peach: #ffd166;
  --xray-pending: #ffd166;
  --xray-neutral: #c8c8c8;
  --xray-shadow: rgba(0, 0, 0, .7);
  --xray-overlay: rgba(0, 0, 0, .86);
  --xray-operator-grid: color-mix(in srgb, var(--xray-accent) 8%, transparent);
}

/* Preset lineup (Settings \u2192 Appearance, in picker order; High Contrast is .xray-theme-midnight
   above). Each block owns its accent; a picked accent swatch is set inline over it. Values:
   docs/superpowers/specs/assets/2026-10-14-theme-lineup.css, moved in OKLCH lightness only where
   test/unit/themeContrast.test.mjs (every preset \xD7 every accent swatch) or the distinct-meanings
   test (test/unit/themePresets.test.mjs) required it.
   --xray-focus is var(--xray-accent): the inline accent sits on the same elements as the theme
   class, so focus rings follow the effective accent (the block's own or a picked swatch). The
   accent-derived state tints follow it the same way: --xray-selection (the selected row, spec S5;
   --xray-accent-soft, the active tab's fill, is the same tint), --xray-active (pressed controls)
   and --xray-operator-grid (the Glow grid) are color-mix()es of var(--xray-accent) whose
   percentages reproduce the lineup's values for the block's own accent.
   Light presets set --xray-sink: #ffffff; dark ones keep the black fallback. */

/* XRAY Dark: neutral graphite, one cyan accent that no status colour shares. */
.xray-theme-xray-dark {
  --xray-bg: #141517;
  --xray-surface: #1b1c1f;
  --xray-surface2: #25272a;
  --xray-surface3: #303235;
  --xray-bg-rgb: 20, 21, 23;
  --xray-surface-rgb: 27, 28, 31;
  --xray-surface2-rgb: 37, 39, 42;
  --xray-text-rgb: 238, 239, 241;
  --xray-text: #eeeff1;
  --xray-subtext: #bcbfc5;
  --xray-hint: #90949b;
  --xray-border: #34363a;
  --xray-border-control: #71757b;
  --xray-focus: var(--xray-accent);
  --xray-selection: color-mix(in srgb, var(--xray-accent) 11.5%, var(--xray-bg));
  --xray-hover: #25272a;
  --xray-active: color-mix(in srgb, var(--xray-accent) 28%, var(--xray-bg));
  --xray-disabled: #5a5e63;
  --xray-accent: #3dc8f5;
  --xray-accent-soft: var(--xray-selection);
  --xray-blue: #96b2fb;
  --xray-mauve: #c6a0f2;
  --xray-green: #65d68a;
  --xray-yellow: #f6c65b;
  --xray-red: #f8767a;
  --xray-teal: #5cd5c7;
  --xray-peach: #f5a166;
  --xray-pending: #f6c65b;
  --xray-neutral: #90949b;
  --xray-shadow: rgba(0, 0, 0, .40);
  --xray-overlay: rgba(20, 21, 23, .74);
  --xray-operator-grid: color-mix(in srgb, var(--xray-accent) 3.5%, transparent);
}

/* XRAY Light: cool white panes, same accent hue as XRAY Dark. */
.xray-theme-xray-light {
  --xray-bg: #f3f4f6;
  --xray-surface: #ffffff;
  --xray-surface2: #eaecef;
  --xray-surface3: #dde0e4;
  --xray-bg-rgb: 243, 244, 246;
  --xray-surface-rgb: 255, 255, 255;
  --xray-surface2-rgb: 234, 236, 239;
  --xray-text-rgb: 22, 23, 26;
  --xray-text: #16171a;
  --xray-subtext: #4b4f55;
  --xray-hint: #646971;
  --xray-border: #d7d9dd;
  --xray-border-control: #83878f;
  --xray-focus: var(--xray-accent);
  --xray-selection: color-mix(in srgb, var(--xray-accent) 9.5%, var(--xray-bg));
  --xray-hover: #dddfe2;
  --xray-active: color-mix(in srgb, var(--xray-accent) 21.5%, var(--xray-bg));
  --xray-disabled: #a1a5ab;
  --xray-accent: #00698f;
  --xray-accent-soft: var(--xray-selection);
  --xray-blue: #3d5abe;
  --xray-mauve: #793fad;
  --xray-green: #007138;
  --xray-yellow: #7d5300;
  --xray-red: #b01e27;
  --xray-teal: #006d69;
  --xray-peach: #9c3e00;
  --xray-pending: #7d5300;
  --xray-neutral: #646971;
  --xray-shadow: rgba(22, 23, 26, .16);
  --xray-overlay: rgba(243, 244, 246, .86);
  --xray-operator-grid: color-mix(in srgb, var(--xray-accent) 4%, transparent);
  --xray-sink: #ffffff;
  --xray-scroll-thumb: color-mix(in srgb, var(--xray-hint) 74%, transparent);
}

/* GitHub Dark: Primer dark. */
.xray-theme-github-dark {
  --xray-bg: #0d1117;
  --xray-surface: #161b22;
  --xray-surface2: #21262d;
  --xray-surface3: #30363d;
  --xray-bg-rgb: 13, 17, 23;
  --xray-surface-rgb: 22, 27, 34;
  --xray-surface2-rgb: 33, 38, 45;
  --xray-text-rgb: 230, 237, 243;
  --xray-text: #e6edf3;
  --xray-subtext: #c9d1d9;
  --xray-hint: #8a939d;
  --xray-border: #30363d;
  --xray-border-control: #6e7681;
  --xray-focus: var(--xray-accent);
  --xray-selection: color-mix(in srgb, var(--xray-accent) 10.5%, var(--xray-bg));
  --xray-hover: #21262d;
  --xray-active: color-mix(in srgb, var(--xray-accent) 27%, var(--xray-bg));
  --xray-disabled: #484f58;
  --xray-accent: #5297ff;
  --xray-accent-soft: var(--xray-selection);
  --xray-blue: #79c0ff;
  --xray-mauve: #ad7fff;
  --xray-green: #3fb950;
  --xray-yellow: #d29922;
  --xray-red: #ff6056;
  --xray-teal: #39c5cf;
  --xray-peach: #e77835;
  --xray-pending: #d29922;
  --xray-neutral: #8a939d;
  --xray-shadow: rgba(0, 0, 0, .40);
  --xray-overlay: rgba(13, 17, 23, .74);
  --xray-operator-grid: color-mix(in srgb, var(--xray-accent) 3.5%, transparent);
}

/* GitHub Light: Primer light (fg roles). */
.xray-theme-github-light {
  --xray-bg: #f6f8fa;
  --xray-surface: #ffffff;
  --xray-surface2: #eaeef2;
  --xray-surface3: #d0d7de;
  --xray-bg-rgb: 246, 248, 250;
  --xray-surface-rgb: 255, 255, 255;
  --xray-surface2-rgb: 234, 238, 242;
  --xray-text-rgb: 31, 35, 40;
  --xray-text: #1f2328;
  --xray-subtext: #424a53;
  --xray-hint: #646c75;
  --xray-border: #d0d7de;
  --xray-border-control: #6e7781;
  --xray-focus: var(--xray-accent);
  --xray-selection: color-mix(in srgb, var(--xray-accent) 8%, var(--xray-bg));
  --xray-hover: #dadee1;
  --xray-active: color-mix(in srgb, var(--xray-accent) 21.5%, var(--xray-bg));
  --xray-disabled: #8c959f;
  --xray-accent: #005eca;
  --xray-accent-soft: var(--xray-selection);
  --xray-blue: #004498;
  --xray-mauve: #723cca;
  --xray-green: #00722b;
  --xray-yellow: #815500;
  --xray-red: #b9001f;
  --xray-teal: #006d74;
  --xray-peach: #a03f00;
  --xray-pending: #815500;
  --xray-neutral: #646c75;
  --xray-shadow: rgba(31, 35, 40, .16);
  --xray-overlay: rgba(246, 248, 250, .86);
  --xray-operator-grid: color-mix(in srgb, var(--xray-accent) 4%, transparent);
  --xray-sink: #ffffff;
  --xray-scroll-thumb: color-mix(in srgb, var(--xray-hint) 74%, transparent);
}

/* Tokyo Night: navy + periwinkle. */
.xray-theme-tokyo-night {
  --xray-bg: #16161e;
  --xray-surface: #1a1b26;
  --xray-surface2: #292e42;
  --xray-surface3: #3b4261;
  --xray-bg-rgb: 22, 22, 30;
  --xray-surface-rgb: 26, 27, 38;
  --xray-surface2-rgb: 41, 46, 66;
  --xray-text-rgb: 192, 202, 245;
  --xray-text: #c0caf5;
  --xray-subtext: #a9b1d6;
  --xray-hint: #9094b2;
  --xray-border: #101014;
  --xray-border-control: #6d769a;
  --xray-focus: var(--xray-accent);
  --xray-selection: color-mix(in srgb, var(--xray-accent) 12.5%, var(--xray-bg));
  --xray-hover: #2f3449;
  --xray-active: color-mix(in srgb, var(--xray-accent) 27.5%, var(--xray-bg));
  --xray-disabled: #545c7e;
  --xray-accent: #7ba4f9;
  --xray-accent-soft: var(--xray-selection);
  --xray-blue: #7dcfff;
  --xray-mauve: #bb9af7;
  --xray-green: #9ece6a;
  --xray-yellow: #e0af68;
  --xray-red: #fa7990;
  --xray-teal: #73daca;
  --xray-peach: #ff9e64;
  --xray-pending: #e0af68;
  --xray-neutral: #9094b2;
  --xray-shadow: rgba(0, 0, 0, .40);
  --xray-overlay: rgba(22, 22, 30, .74);
  --xray-operator-grid: color-mix(in srgb, var(--xray-accent) 3.5%, transparent);
}

/* Catppuccin Mocha: mauve + pastels. */
.xray-theme-catppuccin-mocha {
  --xray-bg: #181825;
  --xray-surface: #1e1e2e;
  --xray-surface2: #313244;
  --xray-surface3: #45475a;
  --xray-bg-rgb: 24, 24, 37;
  --xray-surface-rgb: 30, 30, 46;
  --xray-surface2-rgb: 49, 50, 68;
  --xray-text-rgb: 205, 214, 244;
  --xray-text: #cdd6f4;
  --xray-subtext: #a6adc8;
  --xray-hint: #959ab3;
  --xray-border: #45475a;
  --xray-border-control: #777b92;
  --xray-focus: var(--xray-accent);
  --xray-selection: color-mix(in srgb, var(--xray-accent) 14%, var(--xray-bg));
  --xray-hover: #313244;
  --xray-active: color-mix(in srgb, var(--xray-accent) 28%, var(--xray-bg));
  --xray-disabled: #6c7086;
  --xray-accent: #cba6f7;
  --xray-accent-soft: var(--xray-selection);
  --xray-blue: #89b4fa;
  /* Data mauve is the palette's pink: Catppuccin's mauve is this preset's accent (\u0394E2000 \u2265 10). */
  --xray-mauve: #f5c2e7;
  --xray-green: #a6e3a1;
  --xray-yellow: #f9e2af;
  --xray-red: #f38ba8;
  --xray-teal: #94e2d5;
  --xray-peach: #fab387;
  --xray-pending: #f9e2af;
  --xray-neutral: #959ab3;
  --xray-shadow: rgba(0, 0, 0, .40);
  --xray-overlay: rgba(24, 24, 37, .74);
  --xray-operator-grid: color-mix(in srgb, var(--xray-accent) 3.5%, transparent);
}

/* Dracula: purple accent, neon status hues. Blue is the palette's cyan; teal is that cyan, darkened
   until the two read apart (Dracula has no second blue). */
.xray-theme-dracula {
  --xray-bg: #21222c;
  --xray-surface: #282a36;
  --xray-surface2: #343746;
  --xray-surface3: #44475a;
  --xray-bg-rgb: 33, 34, 44;
  --xray-surface-rgb: 40, 42, 54;
  --xray-surface2-rgb: 52, 55, 70;
  --xray-text-rgb: 248, 248, 242;
  --xray-text: #f8f8f2;
  --xray-subtext: #adb5cb;
  --xray-hint: #8d9fd4;
  --xray-border: #424450;
  --xray-border-control: #6f80b2;
  --xray-focus: var(--xray-accent);
  --xray-selection: color-mix(in srgb, var(--xray-accent) 11.5%, var(--xray-bg));
  --xray-hover: #343746;
  --xray-active: color-mix(in srgb, var(--xray-accent) 27%, var(--xray-bg));
  --xray-disabled: #6272a4;
  --xray-accent: #c59dff;
  --xray-accent-soft: var(--xray-selection);
  --xray-blue: #8be9fd;
  --xray-mauve: #ff86ca;
  --xray-green: #50fa7b;
  --xray-yellow: #f1fa8c;
  --xray-red: #ff8f88;
  --xray-teal: #62c0d4;
  --xray-peach: #ffb86c;
  --xray-pending: #f1fa8c;
  --xray-neutral: #8d9fd4;
  --xray-shadow: rgba(0, 0, 0, .40);
  --xray-overlay: rgba(33, 34, 44, .74);
  --xray-operator-grid: color-mix(in srgb, var(--xray-accent) 3.5%, transparent);
}

/* Gruvbox Dark: warm brown-grey with the palette's aqua as the accent, apart from error red, warning
   yellow and peach (orange). Teal is the palette's neutral blue, lightened to read and to stay clear of
   the accent and --xray-blue. */
.xray-theme-gruvbox-dark {
  --xray-bg: #1d2021;
  --xray-surface: #282828;
  --xray-surface2: #3c3836;
  --xray-surface3: #504945;
  --xray-bg-rgb: 29, 32, 33;
  --xray-surface-rgb: 40, 40, 40;
  --xray-surface2-rgb: 60, 56, 54;
  --xray-text-rgb: 235, 219, 178;
  --xray-text: #ebdbb2;
  --xray-subtext: #bdae93;
  --xray-hint: #afa08b;
  --xray-border: #504945;
  --xray-border-control: #8e8075;
  --xray-focus: var(--xray-accent);
  --xray-selection: color-mix(in srgb, var(--xray-accent) 13.5%, var(--xray-bg));
  --xray-hover: #44403e;
  --xray-active: color-mix(in srgb, var(--xray-accent) 28%, var(--xray-bg));
  --xray-disabled: #7c6f64;
  --xray-accent: #8ec07c;
  --xray-accent-soft: var(--xray-selection);
  --xray-blue: #96b9ab;
  --xray-mauve: #ea9bb0;
  --xray-green: #b8bb26;
  --xray-yellow: #fabd2f;
  --xray-red: #ff9380;
  --xray-teal: #8ecfd2;
  --xray-peach: #ff9651;
  --xray-pending: #fabd2f;
  --xray-neutral: #afa08b;
  --xray-shadow: rgba(0, 0, 0, .40);
  --xray-overlay: rgba(29, 32, 33, .74);
  --xray-operator-grid: color-mix(in srgb, var(--xray-accent) 3.5%, transparent);
}

/* Semantic interaction roles keep keyboard and pointer states consistent across
   presets, custom themes, sibling modals, and the HUD. */
.xray-app-root :is(button, input, textarea, select, [tabindex]):focus-visible,
.xray-hud :is(button, input, textarea, select, [tabindex]):focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: 2px;
}

.xray-panel {
  box-shadow: -20px 0 80px var(--xray-shadow);
}

.xray-panel .xray-input,
.xray-panel .xray-prompt input,
.xray-panel .xray-prompt textarea,
.xray-panel .xray-select {
  border-color: var(--xray-border-control);
}

.xray-panel .xray-input:focus,
.xray-panel .xray-prompt input:focus,
.xray-panel .xray-prompt textarea:focus,
.xray-panel .xray-select:focus {
  border-color: var(--xray-focus);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--xray-focus) 38%, transparent);
}

/* Calm accent (spec A1): the active top tab sits on the accent-soft fill. Active chips, selected
   rows and primary buttons paint their own fills below (neutral, or the primary's flat accent). */
.xray-panel .xray-tab.active {
  background: var(--xray-accent-soft);
}


.xray-panel .xray-modal-backdrop,
.xray-panel + .xray-modal-backdrop {
  background: var(--xray-overlay);
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
}

/* Surfaces are flat token colours (spec A3): the background grid is part of the opt-in Glow
   effect, and nothing washes the panel with the accent or mauve. */
.xray-panel.xray-glow::before {
  background:
    linear-gradient(90deg, var(--xray-operator-grid, transparent) 1px, transparent 1px),
    linear-gradient(180deg, var(--xray-operator-grid, transparent) 1px, transparent 1px);
  background-size: 28px 28px;
  opacity: .8;
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
  /* max-width beats width, and the base rule caps the DOCKED panel at 96vw so it can
     never fully cover a small page. Without this reset the fullscreen surfaces
     inherited that cap and leaked a 4vw strip of raw document background. */
  max-width: 100vw;
  height: 100vh;
  border: 0;
  box-shadow: none;
}

.xray-panel.xray-mode-window {
  position: fixed;
  inset: 0;
  width: 100vw;
  max-width: 100vw;
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
  background: var(--xray-surface);
  border-bottom: 1px solid var(--xray-border);
  flex-shrink: 0;
}

.xray-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
  font-weight: 700;
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
  /* Neutral (spec A1, A2): the brand is not a state, so it carries neither the accent nor mauve. */
  color: var(--xray-text);
  background: var(--xray-surface3);
  border-radius: var(--xray-radius);
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
.xray-filter-chips {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* The tablist claims its content width first and absorbs any deficit by scrolling.
   It used to have no shrink priority of its own, so the flex deficit was paid by the
   trailing icon buttons instead: they collapsed from a declared 28px to 18px at the
   DEFAULT 960px panel width, under the 24px floor a pointer target needs. */
.xray-tabs {
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
  /* Room for the focus ring. Turning this into a scroll container makes it clip on
     BOTH axes, and the ring is drawn 2px outside the tab, so without the padding a
     keyboard user sees it sliced into two vertical fragments. */
  padding: 3px 0;
}

.xray-topbar > .xray-icon-btn,
.xray-topbar .xray-mode-switcher,
.xray-topbar .xray-dock-controls,
.xray-topbar .xray-theme-switcher {
  flex: 0 0 auto;
}

.xray-tab,
.xray-btn,
.xray-chip,
.xray-icon-btn {
  border: 1px solid transparent;
  color: var(--xray-subtext);
  background: transparent;
  font: 700 12px/1 var(--xray-font-ui);
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
  letter-spacing: 0;
  font-size: calc(12px * var(--xray-density-scale, 1));
}

.xray-tab:hover,
.xray-btn:hover,
.xray-chip:hover,
.xray-icon-btn:hover {
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .06);
}

/* Calm accent (spec A1): the active top tab is one of the few things the accent paints (its fill,
   --xray-accent-soft, comes from the semantic rule above; ::after draws its indicator). */
.xray-tab.active {
  color: var(--xray-text);
  border-color: color-mix(in srgb, var(--xray-accent) 64%, transparent);
}

/* Glow is opt-in (spec A3): a halo on the active tab. */
.xray-glow .xray-tab.active {
  box-shadow: 0 0 22px color-mix(in srgb, var(--xray-accent) 12%, transparent);
}

/* Every other active or pressed control is neutral: text on --xray-surface3, outlined with the
   control border, which reads at 3:1 without the accent. */
.xray-chip.active {
  color: var(--xray-text);
  border-color: var(--xray-border-control);
  background: var(--xray-surface3);
}

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

/* Pushes the trailing cluster right without an extra flex child. The header used to
   use a .xray-spacer for this, which claimed the same leftover space as the tablist
   beside it and took half of whatever survived. */
.xray-topbar > .xray-summary {
  margin-left: auto;
}

.xray-summary {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--xray-subtext);
  font-size: calc(11px * var(--xray-density-scale, 1));
  letter-spacing: .02em;
}

.xray-mode-switcher {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.xray-mode-switcher .xray-icon-btn.active {
  color: var(--xray-text);
  border-color: var(--xray-border-control);
  background: var(--xray-surface3);
}

.xray-body {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--xray-bg);
}

.xray-console-head {
  display: flex;
  align-items: center;
  min-height: 44px;
  border-bottom: 1px solid var(--xray-border);
  background: var(--xray-surface);
}

.xray-console-title {
  min-width: 0;
  padding: 0 12px;
  color: var(--xray-text);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .02em;
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
  border-color: var(--xray-border);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-surface-rgb), .74);
  color: var(--xray-text);
}

/* The primary action's flat accent tint (spec A2) has one source: the theme-scope rule in the
   operator override layer, which also reaches modals (siblings of .xray-panel). */

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
  grid-template-columns: minmax(180px, 1fr) minmax(0, auto);
  gap: 8px;
  padding: 12px;
  background: var(--xray-surface);
  border-bottom: 1px solid var(--xray-border);
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
  border: 1px solid var(--xray-border-control);
  border-radius: var(--xray-radius);
  outline: none;
  padding: 0 12px 0 38px;
  color: var(--xray-text);
  background: rgba(var(--xray-surface2-rgb), .5);
  font: 700 13px/1 var(--xray-font-ui);
}

.xray-input:focus,
.xray-prompt input:focus,
.xray-prompt textarea:focus {
  border-color: var(--xray-focus);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--xray-focus) 48%, transparent);
}

/* Chips wrap onto multiple rows rather than overflowing/clipping \u2014 a narrow
   panel must never hide filters behind an invisible horizontal scroll. */
.xray-filter-chips {
  flex-wrap: wrap;
  row-gap: 5px;
}

.xray-console-workspace .xray-filter-chips {
  min-width: 0;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: thin;
  white-space: nowrap;
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
  border-color: var(--xray-border);
  border-radius: var(--xray-radius);
  white-space: nowrap;
}

.xray-filter-chips.compact .xray-chip {
  height: 28px;
  padding: 0 10px;
  font-size: 10px;
}

.xray-virtual-list {
  position: relative;
  overflow: auto;
  flex: 1 1 auto;
  min-height: 0;
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

/* In flight: no response yet (spec S5). */
.xray-status.pending {
  color: var(--xray-pending);
}

.xray-path {
  min-width: 0;
  /* Inside the panel this is overridden by \`.xray-panel .xray-path\` below, which
     is why the Catppuccin lavender that used to sit here was invisible in an
     audit of the rendered UI \u2014 it only ever painted outside a .xray-panel
     ancestor. Same value as that rule so the two cannot drift apart: plain
     text, not tinted toward the accent (spec A1). */
  color: var(--xray-text);
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

/* Blockified so width/height apply at all. As a plain inline span this measured
   0x0 in every theme, so the Insights status-mix chart never drew and all twenty
   duration bars in the API list were invisible. The track above is a grid item, so
   it was blockified implicitly and looked fine \u2014 which is why this went unnoticed. */
.xray-bar {
  display: block;
  min-width: 3px;
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
  min-height: 28px;
  flex: 1 1 28px;
  display: flex;
}

.xray-console-workspace {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* The inspector docks by the Console's own width (spec C7), not the panel's. */
  container: xray-console / inline-size;
}

/* \u2500\u2500 Console inspector (spec C6\u2013C7) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   Below 900 px of Console width the inspector is a full-height overlay with
   Back; at \u2265 900 px it docks right of the stream, resizable by PaneDivider.
   ConsoleWorkspace reads --xray-console-docked back, so the semantics (dialog
   vs complementary) always match what this query paints. */
.xray-console-layout {
  --xray-console-docked: 0;
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
}

.xray-console-column {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.xray-inspector-pane {
  position: absolute;
  inset: 0;
  z-index: 6;
  display: flex;
  min-width: 0;
  min-height: 0;
}

.xray-inspector-pane > .xray-pane-divider {
  left: -5px;
  right: auto;
}

@container xray-console (min-width: 900px) {
  .xray-console-layout {
    --xray-console-docked: 1;
  }

  .xray-inspector-pane {
    position: relative;
    inset: auto;
    z-index: auto;
    flex: 0 0 clamp(320px, 38%, 640px);
    border-left: 1px solid var(--xray-border);
  }

  .xray-console-layout[data-split] > .xray-console-column {
    flex: 0 0 var(--xray-console-split);
  }

  .xray-console-layout[data-split] > .xray-inspector-pane {
    flex: 1 1 0;
    min-width: 320px;
  }
}

.xray-inspector {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  color: var(--xray-text);
  background: var(--xray-bg);
}

.xray-inspector:focus-visible {
  outline: none;
}

.xray-inspector-head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 8px 10px;
  border-bottom: 1px solid var(--xray-border);
}

.xray-inspector-back {
  flex: 0 0 auto;
}

.xray-inspector-title {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
}

.xray-inspector-kicker {
  color: var(--xray-subtext);
  font: 700 10px/1.3 var(--xray-font-ui);
  letter-spacing: .06em;
  text-transform: uppercase;
}

.xray-inspector-label {
  overflow: hidden;
  font: 700 12px/1.4 var(--xray-font);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.xray-inspector-close {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
}

/* The inspected value's stated cap, on its own line under the header (spec J8). */
.xray-inspector-notice {
  margin: 0;
  padding: 6px 10px 0;
}

.xray-inspector-tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
}

.xray-inspector-filter {
  flex: 1 1 160px;
  min-width: 0;
}

.xray-inspector-filter .xray-input {
  height: 30px;
  font-size: 12px;
}

.xray-inspector-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0 10px 8px;
}

.xray-inspector-body .xray-result-json {
  margin: 0;
}

.xray-inspector-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
  min-width: 0;
  padding: 8px 10px;
  border-top: 1px solid var(--xray-border);
  background: rgba(var(--xray-surface2-rgb), .5);
}

.xray-inspector-path {
  flex: 1 1 160px;
  min-width: 0;
  overflow: hidden;
  color: var(--xray-text);
  font: 700 12px/1.5 var(--xray-font);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.xray-inspector-path.is-empty {
  color: var(--xray-subtext);
  font-weight: 600;
}

.xray-inspector-actions {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 6px;
  margin-left: auto;
}

.xray-inspector-actions .xray-btn:disabled {
  opacity: .5;
  cursor: default;
}

/* C6: a big result in its cell \u2014 summary line and Open in inspector. */
.xray-result-big {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius-sm);
  background: var(--xray-surface2);
}

.xray-result-summary {
  flex: 1 1 220px;
  min-width: 0;
  overflow: hidden;
  color: var(--xray-text);
  font: 600 11.5px/1.5 var(--xray-font);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.xray-result-inspect {
  flex: 0 0 auto;
}

.xray-console-inspect {
  flex: 0 0 auto;
  width: 24px;
  height: 22px;
}

/* overflow: hidden here made the stream wheel-unscrollable \u2014 the virtualizer
   could move it programmatically but the user could not. */
.xray-console-stream {
  min-height: 28px;
  flex: 1;
  background: var(--xray-bg);
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
  border: 1px solid var(--xray-border);
  border-radius: 999px;
  color: var(--xray-text);
  background: rgba(var(--xray-surface2-rgb), .95);
  box-shadow: 0 6px 18px var(--xray-shadow);
  cursor: pointer;
  font: 700 11px/1 var(--xray-font-ui);
  /* "N new messages \xB7 Jump to latest" stays one line, even at 420 px. */
  white-space: nowrap;
  max-width: calc(100% - 24px);
}

.xray-newmsg-pill:hover {
  /* Opaque: the pill floats over stream text. */
  background: color-mix(in srgb, var(--xray-text) 8%, rgb(var(--xray-surface2-rgb)));
}

.xray-newmsg-pill:focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: 2px;
}

.xray-newmsg-sep {
  opacity: .6;
}

.xray-repeat-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 1px 7px;
  border-radius: 999px;
  border: 0;
  background: rgba(var(--xray-text-rgb), .06);
  color: var(--xray-text);
  font-size: 10px;
  font-weight: 600;
}

.xray-truncated-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 1px 7px;
  border-radius: 999px;
  border: 0;
  background: color-mix(in srgb, var(--xray-yellow) 10%, transparent);
  color: var(--xray-yellow);
  font-size: 10px;
  font-weight: 600;
}

.xray-error-stack {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--xray-red);
  font: 600 11px/1.5 var(--xray-font);
}

/* Filter counts are quiet data (spec A1): subtext, never the accent. */
.xray-chip-count {
  margin-left: 5px;
  padding: 0 6px;
  border-radius: 999px;
  color: var(--xray-subtext);
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
  border-bottom: 1px solid var(--xray-border);
}

/* Glyph + message: the row's expand toggle, a sibling of the aside's controls. */
.xray-console-toggle {
  display: grid;
  grid-column: 1 / 3;
  grid-template-columns: 22px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
  min-width: 0;
  border-radius: var(--xray-radius-sm);
}

.xray-console-toggle[role="button"] {
  cursor: pointer;
}

.xray-console-toggle:focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: 1px;
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

/* The REPL input/output stands apart from page-log noise by its full text colour (page logs are
   softened below) and its glyphs, not by a tint: mauve and the accent are not chrome colours
   (spec A2). */
.xray-console-row.command {
  color: var(--xray-text);
}

.xray-console-row.result {
  border-left: 2px solid var(--xray-border);
}

/* Leading gutter marker: quiet by default, colored only where it carries a status
   (error, warning); input and output read from their chevrons' shape, in the hint
   colour. Centered on the first text line. */
.xray-console-glyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  color: var(--xray-hint);
}

.xray-console-row.error .xray-console-glyph { color: var(--xray-red); }
.xray-console-row.warn .xray-console-glyph { color: var(--xray-yellow); }

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
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: var(--xray-surface2);
}

/* \u2500\u2500 Command cells (spec C1\u2013C5): a command and its result as one card. \u2500\u2500
   A neutral card (spec A2: mauve is a data colour, not a second accent): its leading edge is
   the card's own outline, wider; an error (red) or a cancelled run (--xray-neutral, \u2265 3:1 on the card)
   gives it a colour of its own. */
.xray-command-cell {
  margin: 6px 10px;
  border: 1px solid var(--xray-border);
  border-left-width: 2px;
  border-radius: var(--xray-radius);
  background: var(--xray-surface);
  font-variant-numeric: tabular-nums;
}

.xray-command-cell.is-error {
  border-left-color: var(--xray-red);
}

.xray-command-cell.is-cancelled {
  border-left-color: var(--xray-neutral);
}

.xray-cell-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  min-width: 0;
  min-height: 34px;
  padding: 4px 6px 4px 8px;
}

.xray-cell-glyph {
  display: inline-flex;
  flex: 0 0 auto;
  color: var(--xray-hint);
}

.xray-cell-command {
  flex: 1 1 120px;
  min-width: 0;
  overflow: hidden;
  color: var(--xray-text);
  font: 700 12px/1.5 var(--xray-font);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.xray-command-cell.is-scalar .xray-cell-command {
  flex: 0 1 auto;
}

.xray-cell-lines {
  flex: 0 0 auto;
  padding: 1px 7px;
  border-radius: 999px;
  color: var(--xray-subtext);
  background: color-mix(in srgb, var(--xray-hint) 18%, transparent);
  font-size: 10px;
  font-weight: 700;
}

.xray-cell-tail {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.xray-cell-time {
  color: var(--xray-subtext);
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.xray-cell-actions,
.xray-result-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.xray-result-actions {
  margin-left: auto;
}

.xray-cell-action,
.xray-result-action {
  width: 26px;
  height: 24px;
  flex: 0 0 auto;
}

.xray-cell-action:disabled,
.xray-result-action:disabled {
  opacity: .45;
  cursor: default;
}

.xray-cell-menu-wrap {
  position: relative;
  display: inline-flex;
}

.xray-cell-menu {
  position: absolute;
  top: calc(100% + 4px);
  inset-inline-end: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 170px;
  padding: 4px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: var(--xray-surface);
  box-shadow: 0 12px 28px rgba(var(--xray-bg-rgb), .28);
}

.xray-cell-menu.is-up {
  top: auto;
  bottom: calc(100% + 4px);
}

.xray-cell-menu .xray-menu-item:disabled {
  opacity: .5;
  cursor: default;
}

/* Each virtual row is its own stacking context (transform); lift the one whose
   menu is open so the menu paints over its neighbours. */
.xray-console-stream [data-index]:has(.xray-cell-menu) {
  z-index: 5;
}

.xray-cell-status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 2px 10px 8px 30px;
  color: var(--xray-subtext);
  font-size: 12px;
  font-weight: 700;
}

.xray-cell-error {
  display: grid;
  gap: 6px;
  padding: 2px 10px 10px 30px;
}

.xray-cell-error-line,
.xray-cell-hint {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 0;
  min-width: 0;
}

.xray-cell-error-line {
  color: var(--xray-red);
  font: 700 12px/1.5 var(--xray-font);
}

.xray-cell-error-line > svg,
.xray-cell-hint > svg {
  flex: 0 0 auto;
  margin-top: 2px;
}

.xray-cell-error-message {
  min-width: 0;
  color: var(--xray-text);
  white-space: pre-wrap;
  word-break: break-word;
}

.xray-cell-hint {
  color: var(--xray-subtext);
  font-size: 12px;
}

.xray-cell-hint > svg {
  color: var(--xray-yellow);
}

.xray-cell-stack {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  justify-self: start;
  padding: 2px 6px;
  border: 0;
  border-radius: var(--xray-radius-sm);
  color: var(--xray-subtext);
  background: transparent;
  font: 700 11px/1.4 var(--xray-font);
  cursor: pointer;
}

.xray-cell-stack:hover,
.xray-cell-stack:focus-visible {
  color: var(--xray-text);
  background: color-mix(in srgb, var(--xray-hint) 16%, transparent);
}

.xray-cell-stack-body {
  max-height: 240px;
  overflow: auto;
}

.xray-cell-variable {
  padding: 1px 8px;
  border: 1px solid var(--xray-border);
  border-radius: 999px;
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .06);
  font: 700 11px/1.5 var(--xray-font);
}

/* Scalar results: one compact line inside the cell header. */
.xray-result-inline {
  display: inline-flex;
  flex: 1 1 140px;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.xray-result-arrow {
  color: var(--xray-subtext);
}

.xray-result-scalar {
  min-width: 0;
  overflow: hidden;
  font: 700 12px/1.5 var(--xray-font);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.xray-result-badge {
  flex: 0 0 auto;
  color: var(--xray-subtext);
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

/* A console cap, stated beside the badge ("Showing 1,000 of 5,000 items", spec J8). */
.xray-result-notice {
  min-width: 0;
  color: var(--xray-subtext);
  font-size: 11px;
  font-weight: 700;
}

.xray-result {
  display: grid;
  gap: 6px;
  min-width: 0;
  padding: 0 10px 10px 30px;
}

.xray-result-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
  min-width: 0;
}

.xray-result-views {
  display: inline-flex;
  padding: 2px;
  border: 1px solid var(--xray-border);
  border-radius: 999px;
}

.xray-result-view-btn {
  min-height: 22px;
  padding: 0 10px;
  border: 0;
  border-radius: 999px;
  color: var(--xray-subtext);
  background: transparent;
  font: 700 11px/1 var(--xray-font-ui);
  cursor: pointer;
  transition: background var(--xray-dur-fast) var(--xray-ease), color var(--xray-dur-fast) var(--xray-ease);
}

.xray-result-view-btn:hover {
  color: var(--xray-text);
}

.xray-result-view-btn[aria-pressed="true"] {
  color: var(--xray-text);
  background: var(--xray-surface3);
}

.xray-result-body {
  min-width: 0;
  max-height: 360px;
  overflow: auto;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius-sm);
  background: var(--xray-surface2);
}

.xray-result-table-wrap {
  min-width: 0;
}

.xray-table.xray-result-table {
  width: auto;
  min-width: min(100%, 320px);
}

.xray-result-table th {
  position: sticky;
  top: 0;
}

.xray-result-table td {
  max-width: 280px;
  overflow: hidden;
  color: var(--xray-text);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.xray-result-more {
  margin: 0;
  padding: 6px 8px;
  color: var(--xray-subtext);
  font-size: 11px;
  font-weight: 700;
}

.xray-result-text,
.xray-result-json {
  margin: 0;
  padding: 8px 10px;
  white-space: pre-wrap;
  word-break: break-word;
  font: 600 11px/1.5 var(--xray-font);
}

.xray-result-body .xray-json-tree {
  padding: 4px 0;
}

/* The result body already draws the frame; drop the JSON skin's second border. */
.xray-panel .xray-result-body .xray-json {
  min-height: 100%;
  border: 0;
  border-radius: 0;
}

@media (prefers-reduced-motion: reduce) {
  .xray-result-view-btn { transition: none; }
}

.xray-prompt {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: stretch;
  padding: 8px 10px;
  border-top: 1px solid var(--xray-border);
  background: var(--xray-surface);
  flex-shrink: 0;
}

.xray-prompt-command-row,
.xray-prompt-context-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.xray-prompt-command-row > svg {
  flex: 0 0 auto;
}

.xray-prompt-command-row textarea {
  flex: 1 1 auto;
}

.xray-prompt-context-row {
  overflow: hidden;
}

.xray-prompt input,
.xray-prompt textarea {
  min-height: 34px;
  border: 1px solid var(--xray-border-control);
  border-radius: var(--xray-radius);
  outline: none;
  padding: 9px 10px;
  color: var(--xray-text);
  background: var(--xray-surface2);
  font: 700 12px/1.3 var(--xray-font);
  resize: none;
  overflow-y: auto;
  max-height: 110px;
}

.xray-statusbar {
  min-height: 24px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 10px;
  color: var(--xray-subtext);
  background: var(--xray-surface);
  border-top: 1px solid var(--xray-border);
  font-size: 10px;
  font-weight: 500;
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
  /* S24: nothing open -> the list takes the full width. */
  grid-template-columns: minmax(0, 1fr);
}

.xray-split.detail-open {
  grid-template-columns: minmax(240px, var(--xray-logs-split, 42%)) minmax(300px, 1fr);
}

.xray-list-panel {
  position: relative;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--xray-border);
  overflow: hidden;
}

.xray-list-panel > .xray-virtual-list {
  flex: 1;
  min-height: 0;
  height: auto;
}

.xray-api-summary {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr)) minmax(180px, 1.4fr);
  gap: 6px;
  padding: 10px;
  border-bottom: 1px solid var(--xray-border);
  background: var(--xray-bg);
}

.xray-api-top-endpoint {
  min-width: 0;
  min-height: 44px;
  display: grid;
  align-content: center;
  gap: 2px;
  padding: 7px 9px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-surface-rgb), .64);
}

.xray-api-top-endpoint {
  min-height: 36px;
}

.xray-api-top-endpoint span {
  min-width: 0;
  color: var(--xray-hint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .07em;
}

.xray-api-top-endpoint strong {
  min-width: 0;
  color: var(--xray-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

.xray-api-workspace {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--xray-bg);
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

/* Neutral like the panel's resize handle (spec A1); keyboard focus uses the focus colour. */
.xray-pane-divider:hover,
.xray-pane-divider.dragging {
  background: rgba(var(--xray-text-rgb), .08);
}

.xray-pane-divider:focus-visible {
  background: color-mix(in srgb, var(--xray-focus) 20%, transparent);
  outline: none;
}

.xray-pane-divider:hover::after,
.xray-pane-divider.dragging::after {
  opacity: 1;
}

.xray-pane-divider:focus-visible::after {
  opacity: 1;
  background: var(--xray-focus);
}

.xray-api-collection-pane {
  border-right: 1px solid var(--xray-border);
  background: rgba(var(--xray-bg-rgb), .42);
}

/* S16: one summary line ("10 requests \xB7 1 error \xB7 2 slow \xB7 avg 499ms \xB7 27.6kb")
   replaces the summary cards; error/slow counts are filter shortcuts. */
.xray-api-summary-line {
  flex-shrink: 0;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 2px 6px;
  overflow: hidden;
  padding: 5px 10px;
  border-bottom: 1px solid var(--xray-border);
  color: var(--xray-subtext);
  background: rgba(var(--xray-surface-rgb), .88);
  font: 600 12px/18px var(--xray-font-ui);
  white-space: nowrap;
}

.xray-api-summary-line > * {
  flex: 0 0 auto;
}

.xray-api-summary-line .xray-api-request-count {
  color: var(--xray-text);
  font-weight: 700;
}

.xray-api-summary-sep {
  color: var(--xray-hint);
}

.xray-api-summary-muted {
  color: var(--xray-subtext);
}

/* Low-priority stats give way first in a narrow list pane. */
.xray-api-summary-stat {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.xray-api-summary-link {
  padding: 0 4px;
  border: 1px solid transparent;
  border-radius: var(--xray-radius-sm);
  background: transparent;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  text-decoration: underline dotted;
  text-underline-offset: 3px;
}

.xray-api-summary-link.errors {
  color: var(--xray-red);
}

.xray-api-summary-link.slow {
  color: var(--xray-yellow);
}

.xray-api-summary-link:hover,
.xray-api-summary-link.active {
  border-color: color-mix(in srgb, currentColor 40%, transparent);
  background: color-mix(in srgb, currentColor 12%, transparent);
}

.xray-pane-kicker {
  color: var(--xray-subtext);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
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

/* S17: one toolbar row. The search grows; the filter group (quick chips, active
   filters, Clear filters, the Filters & Sort toggle) sits beside it and drops
   under it as a unit when the list pane is narrow. The secondary panel always
   takes its own full-width line. */
.xray-api-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--xray-border);
  background: rgba(var(--xray-surface-rgb), .72);
}

.xray-api-search {
  flex: 1 1 220px;
  min-width: 0;
  height: 32px;
}

.xray-api-search .xray-input {
  height: 32px;
  font-size: 12px;
}

.xray-api-filter-row {
  flex: 0 1 auto;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.xray-api-primary-filters,
.xray-api-active-filters {
  justify-content: flex-start;
  min-width: 0;
  flex-wrap: wrap;
  gap: 4px;
  overflow: visible;
}

.xray-api-filters-collapsible {
  display: flex;
  min-width: 0;
}

.xray-api-filters-toggle,
.xray-api-clear-filters {
  width: 30px;
  height: 30px;
}

.xray-api-secondary-panel {
  flex: 1 1 100%;
  min-width: 0;
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
  font-weight: 700;
  text-transform: uppercase;
}

/* S18 single-line rows: method | path \xB7 flags \xB7 meta | status | bar + ms | actions. */
.xray-api-table-head,
.xray-api-row {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) 40px 84px auto;
  align-items: center;
  gap: 8px;
}

.xray-api-table-head {
  position: sticky;
  top: 0;
  z-index: 2;
  height: 30px;
  padding: 0 10px;
  border-bottom: 1px solid var(--xray-border);
  color: var(--xray-hint);
  background: var(--xray-bg);
  font: 600 10px/1 var(--xray-font-ui);
  letter-spacing: 0;
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
  min-height: 44px;
  padding: 0 10px;
  border-bottom: 1px solid var(--xray-border);
  color: var(--xray-text);
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: 700 11px/1.28 var(--xray-font);
  outline: none;
  transition: background .15s ease, box-shadow .15s ease, border-color .15s ease;
}

/* Hover, keyboard focus and selection fills live in the operator override layer (spec S5: one
   source each, --xray-hover and --xray-selection); the accent bar is drawn by the selection rule. */

.xray-api-row.has-error {
  box-shadow: inset 2px 0 0 color-mix(in srgb, var(--xray-red) 82%, transparent);
}

.xray-api-row.has-slow:not(.has-error) {
  box-shadow: inset 2px 0 0 color-mix(in srgb, var(--xray-yellow) 72%, transparent);
}

/* The selection bar takes the place of the error/slow edge. */
.xray-api-row.selected.has-error,
.xray-api-row.selected.has-slow {
  box-shadow: inset 3px 0 0 var(--xray-accent);
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
  height: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  align-content: flex-start;
  gap: 8px 8px;
  overflow: hidden;
  white-space: nowrap;
}

/* One visible line, by priority: the path always stays on it (shrinking with an
   ellipsis only when it alone is too long); flags and then the dimmed meta
   (host \xB7 source \xB7 size \xB7 time) join it only when they fit, otherwise they wrap
   to the clipped second line instead of showing as unreadable stubs. Errors and
   slow calls still read from the status colour, the bar and the row edge. */
.xray-api-path-cell > .xray-path,
.xray-api-path-cell > .xray-entry-meta {
  line-height: 20px;
}

.xray-api-path-cell > .xray-path {
  flex: 0 1 auto;
}

.xray-api-path-cell > .xray-api-flags {
  flex: 0 0 auto;
  flex-wrap: nowrap;
}

.xray-api-path-cell > .xray-entry-meta {
  flex: 1 1 14ch;
  min-width: 14ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
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
  border: 0;
  border-radius: 999px;
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .06);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 9px;
  font-weight: 700;
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
  background: color-mix(in srgb, var(--xray-red) 10%, transparent);
}

.xray-api-flag.slow,
.xray-api-flag.repeated,
.xray-api-flag.large {
  color: var(--xray-yellow);
  background: color-mix(in srgb, var(--xray-yellow) 10%, transparent);
}

.xray-api-flag.empty {
  color: var(--xray-peach);
  background: color-mix(in srgb, var(--xray-peach) 10%, transparent);
}

/* Categorical chrome is a neutral chip (spec S1, A2 \u2014 mauve is a data colour): text on a soft text tint, no outline. */
.xray-api-flag.pinned {
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .06);
}

.xray-api-row-actions {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
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
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  color: var(--xray-subtext);
  background: rgba(var(--xray-surface-rgb), .72);
  cursor: pointer;
}

/* Hover and pressed icon buttons are neutral (spec A1); focus draws the shared focus ring. */
.xray-icon-btn:hover,
.xray-icon-btn:focus-visible {
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .07);
}

.xray-icon-btn.active {
  color: var(--xray-text);
  border-color: var(--xray-border-control);
  background: var(--xray-surface3);
}

.xray-request-context-pane {
  border-right: 1px solid var(--xray-border);
  background: rgba(var(--xray-surface-rgb), .78);
}

.xray-request-context-pane.empty {
  justify-content: center;
}

.xray-request-context-head {
  flex-shrink: 0;
  display: grid;
  gap: 10px;
  padding: 12px;
  border-bottom: 1px solid var(--xray-border);
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
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  color: var(--xray-text);
  background: rgba(var(--xray-bg-rgb), .76);
  text-overflow: ellipsis;
  white-space: nowrap;
  font: 700 11px/1 var(--xray-font);
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
  border: 1px solid var(--xray-border);
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
  border-top: 1px solid var(--xray-border);
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
  border-bottom: 1px solid var(--xray-border);
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
  grid-template-columns: 52px 76px minmax(0, 1fr) 28px;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border: 0;
  border-bottom: 1px solid var(--xray-border);
  color: var(--xray-text);
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: 700 11px/1.35 var(--xray-font);
}

.xray-entry-row.child {
  padding-left: 24px;
  background: rgba(var(--xray-surface-rgb), .45);
}

.xray-entry-row.pinned {
  background-image: linear-gradient(90deg, color-mix(in srgb, var(--xray-yellow) 8%, transparent), transparent 45%);
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

.xray-pin {
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border: 1px solid var(--xray-border);
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
  cursor: pointer;
  transition: color var(--xray-dur-fast, .12s) var(--xray-ease, ease),
              border-color var(--xray-dur-fast, .12s) var(--xray-ease, ease),
              background-color var(--xray-dur-fast, .12s) var(--xray-ease, ease);
}

.xray-pin:hover {
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .07);
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
  background: var(--xray-bg);
}

.xray-request-detail {
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--xray-bg);
}

.xray-detail-hero {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-shrink: 0;
  margin: 0;
  padding: 10px 12px;
  border-bottom: 1px solid var(--xray-border);
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
  border: 0;
  border-radius: var(--xray-radius);
  color: var(--xray-subtext);
  background: rgba(var(--xray-bg-rgb), .68);
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.xray-response-chip.ok {
  color: var(--xray-green);
  background: color-mix(in srgb, var(--xray-green) 10%, transparent);
}

.xray-response-chip.warn {
  color: var(--xray-yellow);
  background: color-mix(in srgb, var(--xray-yellow) 10%, transparent);
}

.xray-response-chip.error {
  color: var(--xray-red);
  background: color-mix(in srgb, var(--xray-red) 10%, transparent);
}

.xray-detail-nav {
  flex-shrink: 0;
  display: grid;
  gap: 0;
  border-bottom: 1px solid var(--xray-border);
  background: var(--xray-surface);
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
  font: 700 11px/1 var(--xray-font-ui);
  text-transform: capitalize;
}

/* A secondary tab: neutral when active (spec A1, A2 \u2014 mauve is not a chrome colour). */
.xray-detail-tab:hover,
.xray-detail-tab.active {
  color: var(--xray-text);
  border-bottom-color: var(--xray-border-control);
}

.xray-detail-views {
  padding: 7px 12px;
  border-top: 1px solid var(--xray-border);
}

.xray-detail-content {
  min-width: 0;
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 12px;
  background: var(--xray-bg);
}

.xray-detail-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-top: 1px solid var(--xray-border);
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
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  color: var(--xray-subtext);
  background: transparent;
  cursor: pointer;
  font: 700 11px/1 var(--xray-font-ui);
}

.xray-action-btn:hover,
.xray-action-btn:focus-visible {
  color: var(--xray-text);
  border-color: var(--xray-border-control);
  background: var(--xray-hover);
}

.xray-operation-groups {
  flex-shrink: 0;
  display: grid;
  gap: 6px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--xray-border);
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
  font-weight: 700;
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

.xray-api-drawer-body .xray-filter-chips {
  flex-wrap: wrap;
  overflow: visible;
}

.xray-card,
.xray-modal {
  border: 1px solid var(--xray-border);
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
  border: 1px solid var(--xray-border-control);
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

/* Inside the JSON well (--xray-surface2, spec S6) --xray-hover would match the well itself, so a
   hovered line takes a neutral text tint instead (no status blue). */
.xray-json-line:hover {
  background: rgba(var(--xray-text-rgb), .06);
}

.xray-json-line-no {
  padding: 0 10px 0 0;
  color: var(--xray-hint);
  text-align: right;
  user-select: none;
  border-right: 1px solid var(--xray-border);
}

.xray-json-line-text {
  min-width: 0;
  padding: 0 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

.xray-json-key {
  color: var(--xray-blue);
}

.xray-json-string {
  color: var(--xray-green);
}

.xray-json-number {
  color: var(--xray-peach);
}

/* Spec A2: booleans are the data mauve, in the panel and every modal alike (one source). */
.xray-json-bool {
  color: var(--xray-mauve);
}

.xray-json-null {
  color: var(--xray-neutral);
}

.xray-json-punct {
  color: var(--xray-subtext);
}

/* Typed log values (spec J7): functions, Symbols, Dates, DOM nodes and container labels
   (Map(3), TypeError) read as values rather than strings; notes (\u2026 3 more, [Circular])
   recede. */
.xray-json-typed {
  color: var(--xray-teal);
  font-style: italic;
}

.xray-json-muted {
  color: var(--xray-hint);
  font-style: italic;
}

.xray-table {
  width: 100%;
  border-collapse: collapse;
  font: 700 11px/1.4 var(--xray-font);
}

.xray-table th,
.xray-table td {
  padding: 6px 8px;
  border: 1px solid var(--xray-border);
  text-align: left;
  vertical-align: top;
}

/* Column headers are quiet labels (spec A1, A2): hint, not mauve or the accent. */
.xray-table th {
  color: var(--xray-hint);
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

/* Receipts are App siblings of modal backdrops, and must remain actionable while
   a modal is open without displacing the permanently mounted live region. */
.xray-toast-region {
  position: fixed;
  inset: 0;
  z-index: 2147483648;
  pointer-events: none;
}

.xray-toast-region .xray-toast {
  pointer-events: auto;
}

/* The theme-refresh notice (spec V2) has its own slot, so a toast never replaces it; it stays
   until dismissed. A strip inside the panel between the header and the body, like
   .xray-save-notice (final review I-4): it pushes the body down instead of floating over the
   console prompt or, from a HUD, the host page. Its own class: .xray-notice is the shared
   in-flow callout (Notice.tsx). */
.xray-notice-region {
  flex: 0 0 auto;
}

.xray-theme-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px 6px 12px;
  border-bottom: 1px solid var(--xray-border);
  color: var(--xray-text);
  background: var(--xray-surface);
  font: 600 11px/1.4 var(--xray-font-ui);
}

.xray-theme-notice > span {
  flex: 1 1 auto;
  min-width: 0;
}

.xray-notice-dismiss {
  flex: 0 0 auto;
  min-height: 26px;
  padding: 0 10px;
  border: 1px solid var(--xray-border-control);
  border-radius: var(--xray-radius-sm);
  background: var(--xray-surface2);
  color: var(--xray-text);
  font: inherit;
  cursor: pointer;
}

/* Spec J9: "Couldn't save the session \u2014 <reason>", once per failure streak (store.ts). A strip
   between the header and the body: it pushes the body down rather than covering any of it, like
   .xray-theme-notice above. */
.xray-save-notice {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px 6px 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-yellow) 40%, var(--xray-border));
  background: color-mix(in srgb, var(--xray-yellow) 12%, var(--xray-surface));
  color: var(--xray-text);
  font: 600 11px/1.4 var(--xray-font-ui);
}

.xray-save-notice-icon {
  flex: 0 0 auto;
  color: var(--xray-yellow);
}

.xray-save-notice-text {
  flex: 1 1 auto;
  min-width: 0;
}

.xray-modal {
  width: min(820px, 92vw);
  max-height: min(82vh, 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.xray-modal {
  /* One body size (12px) and one hint size (11px) for every modal; headers stay 13px. */
  color: var(--xray-text);
  font-family: var(--xray-font-ui);
  font-size: 12px;
  line-height: 1.5;
}

.xray-modal h3 {
  margin: 0;
  color: var(--xray-text);
  font-size: 13px;
}

.xray-modal-hint {
  margin: 0;
  color: var(--xray-subtext);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.xray-modal-eyebrow {
  color: var(--xray-subtext);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .4px;
  text-transform: uppercase;
}

.xray-modal-head > div {
  min-width: 0;
}

.xray-modal-head h3,
.xray-modal-head .xray-modal-subtitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* The title block gives way, never the icon or the close button. */
.xray-modal-title-icon,
.xray-modal-head > .xray-icon-btn {
  flex: 0 0 auto;
}

/* Modal form fields: the global .xray-input reserves 38px for a leading icon, which
   only .xray-search wrappers draw. */
.xray-modal .xray-input {
  padding-left: 12px;
}

.xray-modal .xray-search .xray-input {
  padding-left: 38px;
}

.xray-modal textarea.xray-input {
  height: auto;
  padding-top: 8px;
  padding-bottom: 8px;
  line-height: 1.5;
}

.xray-modal-title-icon {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* A label, not a state: neutral (spec A1). */
  color: var(--xray-subtext);
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-text-rgb), .04);
}

.xray-export-modal {
  width: min(980px, 94vw);
  /* Definite height so the preview can fill the body instead of collapsing. */
  height: min(82vh, 760px);
  /* The modal is its own size container: the narrow layout follows the modal's width
     (L5), not the window's. Its children query it by name; the panel's own
     container is a sibling of the modal and never applies here. */
  container-type: inline-size;
  container-name: xray-export;
  --xray-export-control-h: 26px;
}

.xray-compare-modal {
  width: min(1100px, 100%);
}

.xray-compare-body {
  flex: 1;
  min-width: 0;
}

.xray-compare-selectors,
.xray-compare-values {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.xray-compare-selectors label,
.xray-compare-values > div {
  min-width: 0;
}

.xray-compare-selectors label {
  display: grid;
  gap: 6px;
  color: var(--xray-subtext);
}

.xray-compare-selectors select {
  width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-compare-result {
  font-weight: 700;
}

.xray-compare-result.changed {
  /* Raw --xray-yellow is ~3.6:1 on custom light themes; mixing toward text keeps >=4.5:1 everywhere. */
  color: color-mix(in srgb, var(--xray-yellow) 50%, var(--xray-text));
}

.xray-compare-result.equal {
  color: var(--xray-subtext);
  font-weight: 400;
}

.xray-compare-result.unavailable {
  color: var(--xray-subtext);
  font-style: italic;
  font-weight: 400;
}

.xray-compare-equal-toggle {
  margin-top: 6px;
  padding: 2px 0;
  border: 0;
  background: transparent;
  color: var(--xray-accent);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.xray-compare-equal-toggle:hover {
  text-decoration: underline;
}

.xray-compare-section {
  margin-top: 20px;
}

.xray-compare-section h4 {
  margin: 0 0 8px;
}

.xray-compare-notice {
  padding: 10px 12px;
  border-left: 2px solid var(--xray-yellow);
  color: var(--xray-subtext);
  background: color-mix(in srgb, var(--xray-yellow) 7%, transparent);
  overflow-wrap: anywhere;
}

ul.xray-compare-notice {
  padding-left: 28px;
}

.xray-compare-table {
  table-layout: fixed;
}

.xray-compare-table th,
.xray-compare-table td {
  overflow-wrap: anywhere;
  min-width: 0;
}

.xray-compare-table small {
  display: block;
  color: var(--xray-subtext);
}

.xray-compare-text {
  margin: 0;
  font: inherit;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.xray-compare-modal .xray-json {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  min-width: 0;
}

.xray-compare-captured {
  margin-top: 10px;
}

.xray-compare-captured summary {
  cursor: pointer;
  color: var(--xray-subtext);
}

.xray-detail-comparison {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 6px 12px;
}

@media (max-width: 560px) {
  .xray-compare-selectors,
  .xray-compare-values {
    grid-template-columns: minmax(0, 1fr);
  }

  .xray-compare-table th,
  .xray-compare-table td {
    padding: 5px 4px;
  }
}

.xray-modal-head,
.xray-modal-foot {
  display: flex;
  /* Never the thing that gets squeezed: the footer carries the primary action, and
     on a short viewport flex shrinking used to push it outside the modal's own
     overflow: hidden box, where no scrollbar could reach it. */
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid var(--xray-border);
}

.xray-modal-foot {
  border-top: 1px solid var(--xray-border);
  border-bottom: 0;
}

.xray-modal-body {
  min-height: 0;
  flex: 1 1 auto;
  overflow: auto;
  padding: 12px;
}

/* Footer: [meta/status] \xB7\xB7\xB7 [secondary \u2026 primary]. Buttons never wrap their label. */
.xray-modal-foot .xray-btn {
  flex: 0 0 auto;
  white-space: nowrap;
}

.xray-modal-foot-meta {
  min-width: 0;
  color: var(--xray-subtext);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
}

.xray-toggle-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.xray-toggle-field {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.xray-toggle-field.disabled {
  cursor: not-allowed;
  color: var(--xray-disabled);
}

/* Settings toggle look on a real checkbox. */
.xray-switch {
  appearance: none;
  -webkit-appearance: none;
  width: 36px;
  height: 20px;
  flex: 0 0 auto;
  position: relative;
  margin: 0;
  border: 0;
  border-radius: 999px;
  background: var(--xray-surface2);
  cursor: inherit;
}

.xray-switch::after {
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

.xray-switch:checked {
  background: var(--xray-accent, var(--xray-blue));
}

.xray-switch:checked::after {
  transform: translateX(16px);
  background: var(--xray-bg);
}

.xray-switch:disabled {
  opacity: .5;
}

.xray-switch:focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .xray-switch::after { transition: none; }
}

.xray-btn.xray-btn-sm {
  height: 26px;
  padding: 0 9px;
  font-size: 11px;
}

/* AI destination + model, one compact line at the top of AI modals. */
.xray-ai-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 2px 10px;
  padding: 8px 10px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-text-rgb), .04);
  font-size: 11px;
}

.xray-ai-banner strong {
  color: var(--xray-text);
}

.xray-ai-banner span {
  min-width: 0;
  color: var(--xray-subtext);
  overflow-wrap: anywhere;
}

.xray-prompt-preview {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.xray-prompt-preview-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.xray-prompt-preview-code {
  max-height: 260px;
  margin: 0;
  padding: 10px 12px;
  overflow: auto;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-surface2-rgb), .5);
  color: var(--xray-text);
  font: 600 11px/1.55 var(--xray-font);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.xray-prompt-preview-code:focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: 1px;
}

.xray-finding-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.xray-finding-list ul {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.xray-finding-list li {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.xray-finding-list-title {
  font-weight: 700;
  overflow-wrap: anywhere;
}

.xray-modal-subtitle,
.xray-export-subtitle {
  max-width: 520px;
  margin-top: 2px;
  color: var(--xray-subtext);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
  font-weight: 700;
}

.xray-modal-version {
  color: var(--xray-hint);
  font-size: 10px;
  font-weight: 700;
}

.xray-export-body {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.xray-export-rail {
  flex: 0 0 auto;
  max-height: 46%;
  overflow: auto;
  padding: 10px 12px;
  border-bottom: 1px solid var(--xray-border);
  background: rgba(var(--xray-surface-rgb), .55);
}

.xray-export-mode {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

/* The scope switch uses the same control height as the format chips (L6). */
.xray-export-mode .xray-chip {
  height: var(--xray-export-control-h);
  padding: 0 12px;
  font-size: 11px;
}

.xray-export-select {
  display: none;
  width: 100%;
  margin-bottom: 6px;
}

.xray-export-group {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  align-items: start;
  gap: 8px;
  margin-bottom: 6px;
}

.xray-export-group-label {
  padding-top: 5px;
  color: var(--xray-hint);
  font-size: 11px;
  font-weight: 600;
}

.xray-export-group-items {
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.xray-export-format {
  height: var(--xray-export-control-h);
  flex: 0 0 auto;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  padding: 0 8px;
  color: var(--xray-subtext);
  background: transparent;
  cursor: pointer;
  font: 600 11px/1.2 var(--xray-font-ui);
  text-align: left;
}

.xray-export-format:hover {
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .06);
}

/* The picked format is a neutral pressed state (spec A1), like the active chips. */
.xray-export-format.active {
  color: var(--xray-text);
  border-color: var(--xray-border-control);
  background: var(--xray-surface3);
}

.xray-export-format:disabled {
  opacity: .42;
  cursor: not-allowed;
}

.xray-export-format small {
  color: var(--xray-hint);
  font-size: 10px;
}

/* On the neutral pressed fill (--xray-surface3) the description reads in the text colour. */
.xray-export-format.active small {
  color: var(--xray-text);
}

.xray-export-import {
  border-style: dashed;
}

.xray-export-preview {
  flex: 1 1 0;
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
  border-bottom: 1px solid var(--xray-border);
}

.xray-export-preview-head h3 {
  margin: 0;
  color: var(--xray-text);
  font-size: 12px;
}

.xray-export-preview-head p {
  margin: 3px 0 0;
  color: var(--xray-hint);
  font-size: 11px;
}

.xray-export-preview-head .xray-export-privacy {
  color: var(--xray-subtext);
}

/* L5: below 640px of modal width the format rail becomes one grouped select above a
   full-height preview. Import stays reachable as the only chip left in the rail. */
@container xray-export (max-width: 639px) {
  .xray-export-select {
    display: block;
  }

  .xray-export-rail {
    max-height: none;
    overflow: visible;
  }

  .xray-export-group-label,
  .xray-export-format:not(.xray-export-import) {
    display: none;
  }

  .xray-export-group {
    display: block;
    margin-bottom: 0;
  }

  .xray-export-group:not(:has(.xray-export-import)) {
    display: none;
  }

  .xray-export-preview {
    min-height: 0;
  }
}

.xray-export-code {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
  background: rgba(var(--xray-bg-rgb), .54);
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
  box-shadow: 0 12px 38px var(--xray-shadow);
  font: 700 11px/1.35 var(--xray-font-ui);
  cursor: pointer;
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
  border-bottom: 1px solid var(--xray-border);
  padding: 7px 0;
  color: var(--xray-text);
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: 700 11px/1.35 var(--xray-font);
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
  font: 700 11px/1.35 var(--xray-font);
}

.xray-settings-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.xray-settings-modal {
  width: min(780px, 94vw);
  /* L1: a fixed height, so switching sections never resizes the dialog; the
     content pane scrolls instead. */
  height: min(640px, 90vh);
  max-height: none;
}

.xray-settings-modal-body {
  /* Let the modal's fixed head and foot determine the available pane height. The
     nav and content panes own their overflow instead of escaping this clipped grid. */
  min-height: 0;
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  overflow: hidden;
}

.xray-settings-nav {
  min-height: 0;
  overflow: auto;
  padding: 8px 0;
  border-right: 1px solid var(--xray-border);
  background: rgba(var(--xray-surface-rgb), .72);
}

.xray-settings-nav-group-title {
  padding: 8px 14px 4px;
  color: var(--xray-hint);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
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
  font: 700 11px/1 var(--xray-font-ui);
}

.xray-settings-nav-item:hover {
  color: var(--xray-subtext);
  background: rgba(var(--xray-surface2-rgb), .55);
}

.xray-settings-nav-item span {
  white-space: nowrap;
}

/* The active Settings item is one of the states the accent marks (spec A1). */
.xray-settings-nav-item.active {
  color: var(--xray-text);
  border-left-color: var(--xray-accent);
  background: color-mix(in srgb, var(--xray-accent) 8%, transparent);
}

.xray-settings-content {
  min-height: 0;
  overflow: auto;
  padding: 16px;
  /* The theme grid follows the content pane's own width. */
  container-type: inline-size;
  container-name: xray-settings-content;
}

.xray-settings-section-title {
  margin: 0 0 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--xray-border);
  color: var(--xray-hint);
  font-size: 10px;
  font-weight: 600;
}

.xray-settings-row {
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 8px 0;
  border-bottom: 1px solid var(--xray-border);
  color: var(--xray-text);
  font: 700 11px/1.35 var(--xray-font-ui);
}

.xray-settings-row.read-only {
  align-items: flex-start;
}

.xray-settings-diagnostics {
  border-bottom: 1px solid var(--xray-border);
}

.xray-settings-diagnostics > summary {
  min-height: 44px;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--xray-text);
  font: 700 11px/1.35 var(--xray-font-ui);
}

.xray-settings-diagnostics > summary:focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: 2px;
}

/* display:flex drops the native ::marker, so draw the disclosure chevron. */
.xray-settings-diagnostics > summary::-webkit-details-marker {
  display: none;
}

.xray-settings-diagnostics > summary::before {
  content: "";
  flex: 0 0 auto;
  width: 6px;
  height: 6px;
  margin: 0 10px 0 2px;
  border-right: 2px solid var(--xray-hint);
  border-bottom: 2px solid var(--xray-hint);
  transform: rotate(-45deg);
  transition: transform .15s ease;
}

.xray-settings-diagnostics[open] > summary::before {
  transform: rotate(45deg);
}

@media (prefers-reduced-motion: reduce) {
  .xray-settings-diagnostics > summary::before {
    transition: none;
  }
}

.xray-settings-row strong,
.xray-settings-row small {
  display: block;
}

.xray-settings-row small {
  margin-top: 2px;
  color: var(--xray-hint);
  font-size: 10px;
  font-weight: 700;
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
  border: 1px solid var(--xray-border-control);
  border-radius: var(--xray-radius-sm);
  color: var(--xray-text);
  background: var(--xray-surface2);
  font: 700 11px/1 var(--xray-font-ui);
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

/* A select in a settings row keeps its full selected label; the description wraps instead. */
.xray-settings-row > .xray-select {
  flex: 0 0 auto;
  max-width: 70%;
}

.xray-settings-row > span {
  min-width: 0;
}

.xray-color-row {
  display: flex;
  flex-wrap: nowrap;
  flex: 0 0 auto;
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

/* "Use theme accent" (spec P2): pressed while the preset's own accent applies. Like the swatches,
   only the pressed state draws a border (High Contrast's --xray-border is as bright as its text). */
.xray-color-theme {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 23px;
  padding: 0 8px 0 5px;
  border: 2px solid transparent;
  border-radius: var(--xray-radius-sm);
  background: var(--xray-surface2);
  color: var(--xray-subtext);
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.xray-color-theme.active {
  border-color: var(--xray-text);
  color: var(--xray-text);
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
  font-weight: 600;
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
  font: 700 11px/1 var(--xray-font-ui);
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
  font: 600 12px/1.55 var(--xray-font-ui);
}

.xray-compact-rows .xray-api-row {
  min-height: 32px;
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
  border-bottom: 1px solid var(--xray-border);
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
  font: 700 12px/1.25 var(--xray-font-ui);
}

.xray-command-row:hover {
  border-color: var(--xray-border);
  background: var(--xray-hover);
}

.xray-command-row small {
  color: var(--xray-hint);
  font-size: 10px;
}

@container xray (max-width: 1700px) {
  .xray-api-body {
    /* Single-line rows use extra width well: the list takes ~38% (440-640px). */
    grid-template-columns: minmax(260px, var(--xray-api-split, clamp(440px, 38%, 640px))) minmax(340px, 1fr);
  }

  .xray-request-context-pane {
    display: none;
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
  }

  .xray-settings-modal-body {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .xray-settings-nav {
    display: flex;
    align-items: flex-start;
    min-height: 140px;
    overflow-x: auto;
    overflow-y: hidden;
    border-right: 0;
    border-bottom: 1px solid var(--xray-border);
  }

  .xray-settings-nav-group {
    flex: 0 0 auto;
  }

  .xray-settings-nav-item {
    flex: 0 0 auto;
    width: auto;
    border-left: 0;
    border-bottom: 2px solid transparent;
  }

  .xray-settings-nav-item span {
    white-space: nowrap;
  }

  .xray-settings-nav-item.active {
    border-bottom-color: var(--xray-accent);
  }

  .xray-settings-grid {
    grid-template-columns: 1fr;
  }
}

/* Narrow: every modal is a full-height sheet. This is deliberately a viewport
   @media query, not a container query: modals are position: fixed viewport overlays
   that render outside the .xray container, so no container query can apply.
   Header and footer stay pinned (flex: 0 0 auto); the body is the only scroller. */
@media (max-width: 600px) {
  .xray-modal-backdrop {
    align-items: stretch;
    padding: 0;
  }

  .xray-modal-backdrop > .xray-modal {
    width: 100%;
    max-width: none;
    height: 100%;
    max-height: none;
    border-radius: 0;
    border-width: 0;
  }

  .xray-gsearch-list {
    flex: 1 1 auto;
    max-height: none;
  }

  /* The format picker may take most of a phone-height sheet so every format and
     Import stay reachable; the preview keeps a minimum and scrolls itself. */
  .xray-export-rail {
    max-height: 64%;
  }

  .xray-export-group {
    grid-template-columns: 60px minmax(0, 1fr);
    gap: 6px;
  }

  .xray-export-preview {
    min-height: 120px;
  }

  .xray-modal-foot {
    flex-wrap: wrap;
  }

  .xray-modal-foot .xray-muted,
  .xray-modal-foot .xray-modal-version,
  .xray-modal-foot-meta {
    flex: 1 1 100%;
  }

  .xray-modal-foot .xray-spacer {
    display: none;
  }

  .xray-modal-foot .xray-btn {
    flex: 1 1 auto;
  }

  /* Fieldless confirmations are content-height bottom sheets, not full screen. */
  .xray-modal-backdrop > .xray-modal.xray-confirm-modal {
    height: auto;
    max-height: 100%;
    align-self: flex-end;
  }

  /* Extra .xray-replay-body keeps these above the base .xray-replay-line rules below. */
  .xray-replay-body .xray-replay-line .xray-select {
    flex: 0 0 100%;
  }

  .xray-replay-body .xray-replay-line .xray-input {
    flex: 1 1 100%;
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
    min-width: 0;
  }

  .xray-brand-ver {
    display: none;
  }

  .xray-tabs::-webkit-scrollbar,
  .xray-filter-chips::-webkit-scrollbar {
    display: none;
  }

  .xray-tab {
    flex: 0 0 auto;
    padding: 0 10px;
  }

  .xray-toolbar {
    flex: 0 0 auto;
  }

  .xray-toolbar {
    padding-right: 8px;
  }

  .xray-filterbar {
    grid-template-columns: 1fr;
  }

  .xray-filter-chips {
    padding-bottom: 2px;
  }

  /* API workspace narrow layouts (stacked split / full-height detail) live in
     the "S20" section near the end of this file. */

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

  .xray-list-panel > .xray-virtual-list {
    min-height: 168px;
  }

  .xray-entry-duration {
    display: none;
  }

  .xray-insight-columns {
    grid-template-columns: 1fr;
  }

  .xray-page-head {
    display: grid;
  }
}

/* The tablist is the only flex item left that can shrink, so anything the header
   cannot fit is taken out of the TABS unless something else gives way first. Two
   tiers do the giving way, in the order that costs the user least.

   First the session summary, which is the cheapest thing on the bar: two of its three
   numbers already appear as tab badges, and it is not interactive. It used to survive
   down to 760px and cost two tabs on the way. */
@container xray (max-width: 1120px) {
  .xray-topbar > .xray-summary {
    display: none;
  }
}

/* Header give-way tiers, widest first. Each gives way only when the tablist would
   otherwise be squeezed (measured: tabs need ~460-500px with labels, ~160px as icons).

   1. Below 880px the three surface buttons step aside. They are redundant there: the
      command palette carries "Open in separate window", "Float over page (HUD)" and
      "Open in DevTools" (CommandPalette.tsx, group Actions). An earlier revision hid
      them while that was NOT true, which left the pop-out and the HUD with no entry
      point; test/responsive-motion-css.test.js guards the palette entries. Above 880px
      they fit alongside labelled tabs, so they stay.
   2. Below 680px the tab labels go (measured: tight labelled tabs need ~440px, which the
      header only has from ~680px; spec target was ~600px), leaving the five icons (each tab carries an
      aria-label, so the accessible name survives). Labels stay visible down to here.
   3. Below 420px even icons can overflow, so the strip scrolls -- and gets its
      scrollbar back. Suppressing the scrollbar on a strip that overflows is what made
      clipped tabs unreachable by mouse in the first place. Keyboard users have arrow
      keys, and the active tab is scrolled into view whenever it changes. */
@container xray (max-width: 880px) {
  .xray-mode-switcher {
    display: none;
  }
}

/* Tight labelled tabs: the 680-700px band keeps labels, so reclaim padding and the
   brand's reserved width instead of letting the strip scroll. */
@container xray (max-width: 700px) {
  .xray-tab {
    padding: 0 8px;
  }

  .xray-brand {
    min-width: 0;
  }
}

@container xray (max-width: 680px) {
  .xray-tab span {
    display: none;
  }

  .xray-tab {
    padding: 0 8px;
  }
}

@container xray (max-width: 420px) {
  .xray-tabs {
    scrollbar-width: thin;
    padding-bottom: 0;
  }

  .xray-tabs::-webkit-scrollbar {
    display: block;
    height: 4px;
  }

  .xray-tabs::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: color-mix(in srgb, var(--xray-hint) 60%, transparent);
  }
}

/* Six icon-only tabs (SQL joined the strip) fit a 420px HUD: 28px targets, 2px apart. */
@container xray (max-width: 420px) {
  .xray-tabs {
    gap: 2px;
  }

  .xray-tab {
    padding: 0 5px;
  }
}

@container xray (max-width: 420px) {
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

  .xray-operation-group {
    grid-template-columns: 1fr;
  }
}

/* \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   XRAY Operator UI override layer
   Configurable developer cockpit skin applied across existing tabs.
   Calm accent (spec A1\u2013A3): surfaces are flat token colours; the accent marks
   only the active tab, the primary action, focus, the selection bar, links and
   on/off controls; mauve is a data colour.
   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.xray-panel .xray-api-workspace,
.xray-panel .xray-console-workspace,
.xray-panel .xray-insights,
.xray-panel .xray-settings-page,
.xray-panel .xray-logs-workspace {
  background: var(--xray-bg);
}

/* Pane layering (spec S6): panel chrome (top bar, toolbars, detail hero and nav, prompt,
   statusbar) is --xray-surface; content panes (lists, the detail pane, the console stream) are
   --xray-bg; wells and inputs (JSON, fields) are --xray-surface2; raised menus and modals stay
   --xray-surface, lifted by --xray-border and --xray-shadow (surface3 would fail hint/subtext
   contrast on most presets \u2014 see the Task 6 report). These layers are the flat tokens; a few
   secondary strips (summary line, request context, Settings nav, export rail, insight strip)
   keep a translucent fill over their layer's token. */
.xray-panel .xray-api-collection-pane,
.xray-panel .xray-api-detail-pane {
  border-color: var(--xray-border);
  background: var(--xray-bg);
}

.xray-panel .xray-card,
.xray-panel .xray-settings-card,
.xray-panel .xray-modal-card {
  border-color: var(--xray-border);
  background: var(--xray-surface);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--xray-text) 3.5%, transparent), 0 18px 50px var(--xray-shadow);
}

.xray-panel .xray-api-row,
.xray-panel .xray-entry-row,
.xray-panel .xray-console-row,
.xray-panel .xray-log-row {
  min-height: var(--xray-row-h, 52px);
  border-color: color-mix(in srgb, var(--xray-border) 72%, transparent);
  background: transparent;
  transition: background .12s ease, border-color .12s ease, transform .12s ease, box-shadow .12s ease;
}

/* Row states (spec S5): hover and keyboard focus are --xray-hover; the selection is
   --xray-selection (a tint of the effective accent, so it follows a picked swatch) marked by the
   accent bar (A1). Selected comes last: same specificity, so a hovered selected row stays selected. */
.xray-panel :is(.xray-api-row, .xray-entry-row, .xray-console-row, .xray-log-row):is(:hover, :focus-visible) {
  background: var(--xray-hover);
  border-color: var(--xray-border);
}

.xray-panel :is(.xray-api-row, .xray-entry-row, .xray-console-row, .xray-log-row).selected {
  background: var(--xray-selection);
  border-color: var(--xray-border);
}

/* Pressed (spec S5): a control under the pointer fills with --xray-active, a tint of the effective
   accent, for the moment it is held. Persistent active states (filter chips, detail tabs, menu
   toggles) stay neutral (A1); the primary button keeps its own accent fill. */
.xray-theme-scope :is(.xray-btn, .xray-icon-btn, .xray-chip, .xray-action-btn, .xray-menu-item):not(.primary):not(:disabled):active {
  background: var(--xray-active);
}

.xray-glow .xray-api-row.selected,
.xray-glow .xray-entry-row.selected,
.xray-glow .xray-console-row.selected,
.xray-glow .xray-log-row.selected {
  box-shadow: inset 3px 0 0 var(--xray-accent), 0 0 28px color-mix(in srgb, var(--xray-accent) 12%, transparent);
}

/* Unboxed tokens (spec S1): method and status are coloured text, response chips, flags and badges
   a soft tint with no outline, all at 600. Filter chips are actions (toggle buttons), so they keep
   the neutral line colour (spec A1). */
.xray-theme-scope .xray-method,
.xray-theme-scope .xray-status,
.xray-theme-scope .xray-response-chip,
.xray-theme-scope .xray-api-flag,
.xray-theme-scope .xray-badge {
  border: 0;
  font-weight: 600;
  letter-spacing: .02em;
}

.xray-panel .xray-chip {
  border: 1px solid var(--xray-border);
  font-weight: 600;
  letter-spacing: .02em;
}

/* No text weight above 700 (spec S3): <b>/<strong> default to \`bolder\`, which is 900 inside a
   600\u2013700 parent. Zero specificity, so any class rule that sets a weight still wins. */
:where(.xray-theme-scope) :where(b, strong) {
  font-weight: 700;
}

/* Icon(-only) buttons \u2014 .xray-icon-btn, the request-detail actions, the console prompt's expand
   and help \u2014 are outlined only while hovered or keyboard-focused (spec S1), with no resting fill
   so they never read as boxes (e.g. on the selected row). Pressed, expanded and primary ones keep
   their state outline and fill. Hover keeps each button's own hover fill. */
.xray-theme-scope :is(.xray-icon-btn, .xray-detail-action, .xray-editor-expand, .xray-prompt-help):not(.active):not(.primary):not([aria-pressed="true"]):not([aria-expanded="true"]):not(:hover):not(:focus-visible) {
  border-color: transparent;
  background: transparent;
}

.xray-theme-scope :is(.xray-icon-btn, .xray-detail-action, .xray-editor-expand, .xray-prompt-help):not(.active):not(.primary):not([aria-pressed="true"]):not([aria-expanded="true"]):not(:disabled):hover,
.xray-theme-scope :is(.xray-icon-btn, .xray-detail-action, .xray-editor-expand, .xray-prompt-help):not(.active):not(.primary):not([aria-pressed="true"]):not([aria-expanded="true"]):focus-visible {
  border-color: var(--xray-border);
}

/* The active chip keeps its control outline (.xray-chip.active), so its state reads at 3:1. */
.xray-panel .xray-chip.active {
  border-color: var(--xray-border-control);
}

/* Counts are quiet data (spec A1), never the accent. */
.xray-panel .xray-badge {
  color: var(--xray-subtext);
  background: rgba(var(--xray-text-rgb), .06);
}

/* In the active tab the count reads in the text colour, like the tab's label. */
.xray-panel .xray-tab.active .xray-badge {
  color: var(--xray-text);
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
  background: var(--xray-surface2);
  border-color: var(--xray-border-control);
  color: var(--xray-text);
}

/* Placeholders follow the theme's faint text (the console editor keeps its own rule). */
.xray-panel :is(.xray-input, input, textarea)::placeholder {
  color: var(--xray-hint);
  opacity: 1;
}

.xray-panel .xray-input:focus,
.xray-panel .xray-select:focus,
.xray-panel textarea:focus,
.xray-panel input:focus,
.xray-panel select:focus {
  outline: none;
  border-color: var(--xray-focus);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--xray-focus) 18%, transparent);
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
  background: var(--xray-surface2);
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
}

.xray-panel .xray-json-line-no {
  color: color-mix(in srgb, var(--xray-hint) 82%, transparent);
  border-right: 1px solid color-mix(in srgb, var(--xray-border) 72%, transparent);
}

.xray-panel .xray-detail-hero,
.xray-panel .xray-console-head,
.xray-panel .xray-api-toolbar,
.xray-panel .xray-api-command-bar,
.xray-panel .xray-detail-nav {
  background: var(--xray-surface);
  border-color: var(--xray-border);
}

.xray-panel .xray-detail-tabs button,
.xray-panel .xray-view-btn,
.xray-panel .xray-action-btn,
.xray-panel .xray-btn,
.xray-panel .xray-icon-btn {
  border-radius: var(--xray-radius);
}

/* The primary action: accent text and border on a flat 10 % accent fill (spec A2 \u2014 no
   accent\u2192mauve gradient). The one source for every primary button, in the panel and in modals. */
.xray-theme-scope .xray-action-btn.primary,
.xray-theme-scope .xray-btn.primary {
  color: var(--xray-accent);
  border-color: color-mix(in srgb, var(--xray-accent) 48%, transparent);
  background: color-mix(in srgb, var(--xray-accent) 10%, transparent);
}

.xray-glow .xray-action-btn.primary:hover,
.xray-glow .xray-btn.primary:hover {
  box-shadow: 0 0 24px color-mix(in srgb, var(--xray-accent) 18%, transparent);
}

/* Titles are plain text and section labels hint: neither is tinted toward the accent (spec A1).
   Section titles read in real case at 600 (spec S3): uppercase is kept only for the small
   Settings nav group labels. */
.xray-panel .xray-settings-section-title,
.xray-panel .xray-danger-title,
.xray-panel h4 {
  color: var(--xray-hint);
}

.xray-theme-scope .xray-settings-section-title,
.xray-theme-scope .xray-danger-title,
.xray-theme-scope h4 {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
}

/* h3 carries real titles (detail and finding titles, page heads): real case. */
.xray-panel h3 {
  letter-spacing: 0;
  color: var(--xray-text);
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
  border-bottom: 1px solid var(--xray-border);
  background: var(--xray-surface);
}

.xray-panel .xray-search {
  min-height: 38px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: var(--xray-surface2);
}

/* Column headers are quiet labels (spec A1): hint, not the accent. */
.xray-panel .xray-api-table-head {
  min-height: 32px;
  color: var(--xray-hint);
  background: var(--xray-bg);
  border-bottom: 1px solid var(--xray-border);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
}

.xray-panel .xray-api-row {
  font-variant-numeric: tabular-nums;
}

.xray-panel .xray-path,
.xray-panel .xray-api-path,
.xray-panel .xray-response-heading h3 {
  color: var(--xray-text);
  font-weight: 700;
}

.xray-panel .xray-bar-track {
  background: color-mix(in srgb, var(--xray-surface3, var(--xray-surface2)) 78%, var(--xray-sink, black) 22%);
  border: 1px solid color-mix(in srgb, var(--xray-border) 70%, transparent);
  overflow: hidden;
}

/* A neutral timing bar; slow and failed calls keep their status colours. */
.xray-panel .xray-bar {
  background: color-mix(in srgb, var(--xray-hint) 70%, transparent);
}

.xray-panel .xray-bar.slow { background: linear-gradient(90deg, var(--xray-yellow), var(--xray-peach)); }
.xray-panel .xray-bar.error { background: linear-gradient(90deg, var(--xray-red), color-mix(in srgb, var(--xray-red) 62%, var(--xray-peach))); }

.xray-panel .xray-request-detail {
  background: var(--xray-bg);
}

.xray-panel .xray-detail-hero {
  padding: calc(14px * var(--xray-density-scale, 1));
}

.xray-panel .xray-detail-tab,
.xray-panel .xray-detail-views .xray-chip {
  height: 30px;
  border: 1px solid transparent;
  color: var(--xray-subtext);
  background: transparent;
  font: 700 11px/1 var(--xray-font-ui);
  letter-spacing: 0;
}

/* Facet tabs and body views are secondary choices: neutral when active (spec A1). */
.xray-panel .xray-detail-tab.active,
.xray-panel .xray-detail-views .xray-chip.active {
  color: var(--xray-text);
  border-color: var(--xray-border-control);
  background: var(--xray-surface3);
}

.xray-panel .xray-operation-groups {
  padding: 10px 12px;
  background: var(--xray-surface);
  border-bottom: 1px solid var(--xray-border);
}

.xray-panel .xray-operation-group-label {
  color: var(--xray-hint);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
}

.xray-panel .xray-console-head {
  min-height: var(--xray-chrome-h, 44px);
}

.xray-panel .xray-console-row {
  font-variant-numeric: tabular-nums;
  /* Message stream scans best dense \u2014 override the shared 52px operator row
     height (that height is tuned for the API/log tables, not a log stream). */
  min-height: 28px;
}

.xray-panel .xray-statusbar {
  min-height: 28px;
  padding: 0 12px;
  color: var(--xray-subtext);
  background: var(--xray-surface);
  border-top: 1px solid var(--xray-border);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: .08em;
  text-transform: lowercase;
}

.xray-panel .xray-page-head {
  border-bottom: 1px solid var(--xray-border);
  background: var(--xray-surface);
}

.xray-panel .xray-page-head h3 {
  margin: 0;
  font-size: 14px;
}

.xray-panel .xray-page-head p {
  color: var(--xray-subtext);
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
  border-color: var(--xray-border);
  background: var(--xray-surface2);
}

/* Console controls are two explicit rows so a resized panel never asks the
   command editor, context picker, and actions to share one grid track. */
.xray-panel .xray-prompt {
  padding: 10px 14px;
  border-top-color: color-mix(in srgb, var(--xray-border) 78%, transparent);
  background: var(--xray-surface);
}

.xray-panel .xray-prompt-command-row > svg { color: var(--xray-subtext); }

.xray-panel .xray-prompt input,
.xray-panel .xray-prompt textarea {
  min-width: 0;
  min-height: 38px;
  padding: 10px 13px;
  border-radius: var(--xray-radius-lg);
  font: inherit;
}

@container xray (max-width: 620px) {
  .xray-console-action > span,
  .xray-prompt-help > span,
  .xray-console-run > span,
  .xray-console-cancel > span,
  .xray-prompt-context-row .xray-console-action > span,
  .xray-context-inspect > span,
  .xray-snippet-trigger > .xray-chip-count {
    display: none;
  }

  .xray-console-action,
  .xray-prompt-help,
  .xray-console-run,
  .xray-console-cancel {
    width: 34px;
    justify-content: center;
    padding: 0;
  }

  .xray-prompt-context-row {
    gap: 6px;
  }

}

@container xray (max-width: 420px) {
  .xray-console-head {
    min-height: 40px;
  }

  .xray-console-title {
    padding-inline: 8px;
  }

  .xray-toolbar {
    gap: 4px;
    padding-right: 6px;
  }

  .xray-filterbar {
    gap: 6px;
    padding: 8px;
  }

  .xray-prompt {
    padding: 6px 8px;
  }

  .xray-prompt-command-row,
  .xray-prompt-context-row {
    gap: 5px;
  }

  .xray-prompt textarea {
    max-height: 50px;
  }
}


/* \u2500\u2500 God-tier feature styling: flags, drift, actions, waterfall, frames, tokens, rules, replay, AI \u2500\u2500 */

/* Categorical chrome is a neutral chip (spec S1, A2 \u2014 mauve is a data colour): text on a soft text tint, no outline. */
.xray-api-flag.drift,
.xray-api-flag.graphql {
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .06);
}

.xray-api-flag.ws {
  color: var(--xray-teal);
  background: color-mix(in srgb, var(--xray-teal) 10%, transparent);
}

.xray-api-flag.mocked,
.xray-api-flag.replayed {
  color: var(--xray-blue);
  background: color-mix(in srgb, var(--xray-blue) 10%, transparent);
}

.xray-drift-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 12px 0;
  padding: 8px 12px;
  border: 0;
  border-radius: var(--xray-radius);
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .06);
  font-size: 11px;
}

.xray-drift-banner span {
  flex: 1;
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
.xray-waterfall-dot.total { background: var(--xray-subtext); }

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
  font-weight: 700;
  text-transform: uppercase;
  color: var(--xray-subtext);
  background: color-mix(in srgb, var(--xray-hint) 20%, transparent);
}

.xray-ws-state.open { color: var(--xray-green); background: color-mix(in srgb, var(--xray-green) 10%, transparent); }
.xray-ws-state.closed { color: var(--xray-subtext); }
.xray-ws-state.error { color: var(--xray-red); background: color-mix(in srgb, var(--xray-red) 10%, transparent); }

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
  font-weight: 700;
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
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 999px;
}

.xray-token-exp.valid { color: var(--xray-green); background: color-mix(in srgb, var(--xray-green) 10%, transparent); }
.xray-token-exp.expired { color: var(--xray-red); background: color-mix(in srgb, var(--xray-red) 10%, transparent); }

.xray-token-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.xray-token-label {
  display: block;
  margin-bottom: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--xray-hint);
}

/* Controlled experiments live alongside the existing Rules workspace. */
.xray-experiments { min-width: 0; margin-bottom: 24px; }
.xray-experiment-list { display: grid; gap: 12px; min-width: 0; }
.xray-experiment-card { min-width: 0; overflow-wrap: anywhere; }
.xray-experiment-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.xray-experiment-head h4 { margin: 0; }
.xray-experiment-status { border: 1px solid var(--xray-border); border-radius: var(--xray-radius-sm); padding: 3px 7px; text-transform: capitalize; }
.xray-experiment-status.running, .xray-experiment-status.armed { color: var(--xray-text); }
.xray-experiment-status.failed { color: var(--xray-red); }
.xray-experiment-status.observed { color: var(--xray-green); }
.xray-experiment-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.xray-experiment-url { grid-column: span 2; }
.xray-experiment-grid .xray-field, .xray-experiment-grid input, .xray-experiment-grid select { min-width: 0; width: 100%; }
.xray-experiment-options { display: grid; gap: 8px; margin: 12px 0; }
.xray-experiment-options label { display: flex; align-items: flex-start; gap: 6px; }
.xray-experiment-card details { margin: 12px 0; }
.xray-experiment-card pre { max-height: 180px; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; }
.xray-experiment-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 12px; }
.xray-experiment-results ul { padding-left: 20px; }
/* Rules tab */
.xray-subtabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  overflow-x: auto;
  scrollbar-width: none;
}

.xray-subtabs::-webkit-scrollbar {
  display: none;
}

.xray-subtab {
  flex: 0 1 auto;
  min-width: 0;
  padding-inline: 8px;
  white-space: nowrap;
}

.xray-subpanel[hidden] {
  display: none;
}

.xray-section-hint {
  margin: 0;
  min-width: 0;
  color: var(--xray-subtext);
  font-size: 11px;
}

.xray-investigations-bar {
  display: flex;
  align-items: center;
  gap: 8px 12px;
  flex-wrap: wrap;
}

.xray-investigations-bar .xray-section-hint {
  flex: 1 1 200px;
}

.xray-rules-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-border) 70%, transparent);
}

.xray-rules-hint {
  flex: 1 1 320px;
  min-width: 0;
  margin: 0;
  color: var(--xray-subtext);
  font-size: 11px;
}

.xray-rules-toolbar > .xray-spacer {
  display: none;
}

/* When the hint takes its own row, the actions stay right-aligned. */
.xray-rules-toolbar > .xray-toolbar-menu:first-of-type {
  margin-inline-start: auto;
}

.xray-toolbar-menu {
  position: relative;
  flex: 0 0 auto;
}

.xray-toolbar-menu-list {
  position: absolute;
  inset-inline-end: 0;
  top: calc(100% + 4px);
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 180px;
  max-width: calc(100cqw - 24px);
  max-height: min(320px, 60vh);
  overflow-y: auto;
  padding: 4px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: var(--xray-surface);
  box-shadow: 0 12px 28px rgba(var(--xray-bg-rgb), .28);
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
  font-weight: 700;
  color: var(--xray-subtext);
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
}

.xray-replay-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.xray-replay-body > .xray-field {
  flex: 0 0 auto;
  min-width: 0;
}

/* The body is the free-form field: it takes the spare height. */
.xray-replay-body > .xray-field:has(.xray-replay-bodyfield) {
  flex: 1 1 auto;
}

.xray-replay-bodyfield {
  flex: 1 1 auto;
}

.xray-replay-line .xray-select {
  flex: 0 0 110px;
}

.xray-replay-line .xray-input {
  flex: 1 1 200px;
  min-width: 0;
  width: auto;
}

/* AI Explain modal */
.xray-explain-body {
  min-height: 160px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.xray-explain-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--xray-subtext);
  padding: 12px 0;
}

.xray-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--xray-border);
  border-top-color: var(--xray-subtext);
  border-radius: 50%;
  animation: xray-spin .7s linear infinite;
}

@keyframes xray-spin {
  to { transform: rotate(360deg); }
}

.xray-explain-error {
  display: flex;
  gap: 10px;
  margin: 0;
  color: var(--xray-red);
  padding: 4px 0;
}

.xray-explain-error .xray-btn {
  margin-top: 8px;
}

.xray-explain-result {
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--xray-text);
  font-size: 12px;
  overflow-wrap: anywhere;
}

/* \u2500\u2500 Console snippet bar (folded-in Notebook) \u2500\u2500 */
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
  color: var(--xray-text);
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
  font-size: 11px;
  font-weight: 700;
  color: var(--xray-subtext);
  background: color-mix(in srgb, var(--xray-hint) 18%, transparent);
}

.xray-log-level.error { color: var(--xray-red); background: color-mix(in srgb, var(--xray-red) 10%, transparent); }
.xray-log-level.warn { color: var(--xray-yellow); background: color-mix(in srgb, var(--xray-yellow) 10%, transparent); }
.xray-log-level.info { color: var(--xray-blue); background: color-mix(in srgb, var(--xray-blue) 10%, transparent); }

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
  background: var(--xray-subtext);
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
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.xray-theme-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

/* Two columns hold down to 560px of content width; below that one column keeps names whole. */
@container xray-settings-content (max-width: 559px) {
  .xray-theme-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.xray-theme-swatch {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid var(--xray-border);
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
  border-color: var(--xray-accent);
  box-shadow: 0 0 0 1px var(--xray-accent, var(--xray-blue)), 0 6px 18px var(--xray-shadow);
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
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  outline: 2px solid var(--xray-focus);
  outline-offset: 1px;
}

.xray-chip,
.xray-icon-btn,
.xray-btn,
.xray-api-row,
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
.xray-console-row .xray-icon-btn:hover,
.xray-log-row .xray-icon-btn:hover {
  transform: none;
}

/* Disabled controls read as disabled everywhere in the theme scope \u2014 the panel, its sibling modals
   and action buttons (final review M-5). After the primary rule, so a disabled primary is disabled. */
.xray-theme-scope :is(.xray-btn, .xray-action-btn, .xray-icon-btn, .xray-chip, .xray-input, .xray-select):disabled {
  color: var(--xray-disabled);
  border-color: color-mix(in srgb, var(--xray-disabled) 48%, transparent);
  cursor: not-allowed;
}

/* A host page in quirks mode resets colour and font size on tables (final review M-3). Zero
   specificity beyond the element: it beats only that UA quirk, never an authored table rule. */
:where(.xray-app-root, .xray-hud) table {
  color: inherit;
  font: inherit;
}

/* The request list and the Logs listbox: their rows are aria-activedescendant options, so the
   list's own ring is the only keyboard focus indicator. Full-strength --xray-focus at 2px (\u2265 3:1,
   High Contrast \u2265 7:1 on --xray-bg; test/unit/themeContrast.test.mjs), drawn inside the list so
   the scroller cannot clip it. [tabindex] lifts it over the generic focus rule's offset. */
.xray-panel :is(.xray-api-table-scroll, .xray-logs-list)[tabindex]:focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: -2px;
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
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius-lg);
  background: rgba(var(--xray-surface-rgb), .5);
}

.xray-custom-presets {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--xray-border);
}

.xray-custom-presets-label {
  font-size: 10px;
  font-weight: 700;
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
  border: 1px solid var(--xray-border);
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
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: var(--xray-bg);
  color: var(--xray-text);
  overflow: hidden;
  font-size: 11px;
  box-shadow: 0 8px 30px var(--xray-shadow);
}

.xray-tp-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  background: var(--xray-surface);
  border-bottom: 1px solid var(--xray-border);
}

.xray-tp-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  /* The preview's brand mark: neutral, like the panel's (spec A1). */
  background: var(--xray-subtext);
}

.xray-tp-brand {
  font-weight: 700;
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
  background: color-mix(in srgb, var(--xray-accent) 10%, transparent);
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
  border-bottom: 1px solid color-mix(in srgb, var(--xray-border) 55%, transparent);
}

.xray-tp-row.selected {
  background: var(--xray-selection);
  box-shadow: inset 2px 0 0 var(--xray-accent);
}

.xray-tp-method {
  font-weight: 700;
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
  font-weight: 700;
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
  font-weight: 700;
  letter-spacing: .3px;
  text-transform: uppercase;
}

.xray-tp-badge.green { color: var(--xray-green); background: color-mix(in srgb, var(--xray-green) 10%, transparent); }
.xray-tp-badge.yellow { color: var(--xray-yellow); background: color-mix(in srgb, var(--xray-yellow) 10%, transparent); }
.xray-tp-badge.red { color: var(--xray-red); background: color-mix(in srgb, var(--xray-red) 10%, transparent); }
.xray-tp-badge.blue { color: var(--xray-blue); background: color-mix(in srgb, var(--xray-blue) 10%, transparent); }
.xray-tp-badge.mauve { color: var(--xray-mauve); background: color-mix(in srgb, var(--xray-mauve) 10%, transparent); }

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
  font-weight: 700;
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
  border: 1px solid color-mix(in srgb, var(--xray-border) 60%, transparent);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-surface-rgb), .45);
  transition: border-color var(--xray-dur-fast) var(--xray-ease), background var(--xray-dur-fast) var(--xray-ease);
}

/* A pinned token is a neutral pressed state (spec A1): the control outline and a stronger pill. */
.xray-token-field.pinned {
  border-color: var(--xray-border-control);
  background: rgba(var(--xray-text-rgb), .04);
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
  font-weight: 700;
  letter-spacing: .5px;
  text-transform: uppercase;
  padding: 1px 4px;
  border-radius: 999px;
  color: var(--xray-hint);
  background: color-mix(in srgb, var(--xray-surface2) 70%, transparent);
}

.xray-token-field.pinned .xray-token-state {
  color: var(--xray-text);
  background: var(--xray-surface3);
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
  /* Not --xray-hint: that measures 2.89:1 on --xray-surface, under the 3:1 floor for
     a control glyph, and this is the only interactive element in the component. */
  color: var(--xray-subtext);
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
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .07);
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
  border-top: 1px solid var(--xray-border);
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
  border-bottom: 1px solid var(--xray-border);
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
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius, 8px);
  background: rgba(var(--xray-bg-rgb), .4);
}

.xray-contrast-title {
  font-size: 9px;
  font-weight: 700;
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
  font-weight: 700;
  text-transform: uppercase;
}

.xray-contrast-grade.ok {
  color: var(--xray-green);
  background: color-mix(in srgb, var(--xray-green) 10%, transparent);
}

.xray-contrast-grade.warn {
  color: var(--xray-yellow);
  background: color-mix(in srgb, var(--xray-yellow) 10%, transparent);
}

.xray-contrast-grade.fail {
  color: var(--xray-red);
  background: color-mix(in srgb, var(--xray-red) 10%, transparent);
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   Frontend elevation \u2014 command center, empty states, motion, micro-interactions
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */

/* \u2500\u2500 Command center \u2500\u2500 */
.xray-command-modal {
  width: min(620px, 94vw);
}

.xray-command-search {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 14px 16px;
  border-bottom: 1px solid var(--xray-border);
  border-radius: 0;
  background: transparent;
}

/* The shared .xray-search icon is absolutely positioned and the input's left padding
   used to be zeroed here, so the icon sat on top of the placeholder. Lay it out inline. */
.xray-command-search svg {
  position: static;
  transform: none;
  flex: 0 0 auto;
}

.xray-modal .xray-command-search .xray-input {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 14px;
  border: none;
  background: transparent;
  padding: 0;
  text-overflow: ellipsis;
}

.xray-command-search .xray-input:focus {
  box-shadow: none;
  outline: none;
}

.xray-command-list {
  grid-template-columns: minmax(0, 1fr);
  max-height: min(56vh, 460px);
  overflow-y: auto;
  padding: 6px;
  scroll-padding: 40px 0;
}

.xray-command-group {
  min-width: 0;
}

.xray-command-group + .xray-command-group {
  margin-top: 2px;
}

.xray-command-group-label.request {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-transform: none;
  letter-spacing: 0;
  font-size: 11px;
}

.xray-command-group-label {
  padding: 8px 10px 4px;
  font-size: 9px;
  font-weight: 700;
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

.xray-command-row {
  min-width: 0;
  max-width: 100%;
}

/* The keyboard-active row: a neutral fill and the accent indicator bar (spec A1). */
.xray-command-row.active {
  background: var(--xray-surface2);
  box-shadow: inset 2px 0 0 var(--xray-accent);
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
  color: var(--xray-text);
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
  color: var(--xray-text);
  font-weight: 700;
}

.xray-cmd-method {
  min-width: 34px;
  padding: 2px 5px;
  border-radius: var(--xray-radius-sm);
  background: color-mix(in srgb, var(--xray-surface2) 60%, transparent);
  font-size: 9px;
  font-weight: 700;
  text-align: center;
  color: currentColor;
}

.xray-command-hint {
  max-width: 45%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--xray-hint);
}

.xray-command-enter {
  color: var(--xray-text);
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
  border-top: 1px solid var(--xray-border);
  font-size: 10px;
  color: var(--xray-hint);
}

.xray-command-foot kbd {
  display: inline-block;
  min-width: 16px;
  margin-right: 2px;
  padding: 1px 5px;
  border: 1px solid var(--xray-border);
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
  padding: 12px;
  border-bottom: 1px solid var(--xray-border);
}

.xray-gsearch-input {
  flex: 1;
  margin: 0;
}

/* The limits sentence wraps in full; it is never an ellipsised or clipped line. */
.xray-gsearch-limits {
  display: block;
  padding-top: 8px;
  padding-bottom: 8px;
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
  background: var(--xray-surface2);
  box-shadow: inset 2px 0 0 var(--xray-accent);
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
  font-weight: 700;
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

/* A find highlight, not a state: the marker yellow (spec A1 keeps the accent off it). */
.xray-gsearch-snippet mark {
  background: color-mix(in srgb, var(--xray-yellow) 24%, transparent);
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
  /* An illustration, not a state: neutral (spec A1). */
  color: var(--xray-subtext);
  background: rgba(var(--xray-text-rgb), .04);
  box-shadow: 0 0 0 1px var(--xray-border);
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

/* \u2500\u2500 First-run introduction (replaces the API empty state until dismissed) \u2500\u2500 */
/* Denser than .xray-empty on purpose: this is an operator console, so the first
   screen should look like the product rather than like an onboarding splash. */
.xray-firstrun {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: auto;
  padding: 20px;
  max-width: 620px;
  border-radius: var(--xray-radius);
  border: 1px solid var(--xray-border);
  background: var(--xray-surface);
  animation: xray-empty-in 320ms var(--xray-ease-out);
}

.xray-firstrun-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.xray-firstrun-title {
  margin: 0 0 5px;
  font-size: 13px;
  font-weight: 700;
  color: var(--xray-text);
}

.xray-firstrun-lede {
  margin: 0;
  max-width: 46ch;
  font-size: 11px;
  line-height: 1.55;
  color: var(--xray-subtext);
}

.xray-firstrun-dismiss {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 1px solid transparent;
  border-radius: var(--xray-radius-sm);
  background: transparent;
  color: var(--xray-hint);
  cursor: pointer;
  transition: color var(--xray-dur-fast) var(--xray-ease),
              background-color var(--xray-dur-fast) var(--xray-ease);
}

.xray-firstrun-dismiss:hover {
  color: var(--xray-text);
  background: color-mix(in srgb, var(--xray-text) 8%, transparent);
}

.xray-firstrun-dismiss:focus-visible {
  outline: none;
  border-color: var(--xray-focus);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--xray-focus) 45%, transparent);
}

.xray-firstrun-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  border-radius: var(--xray-radius-sm);
  overflow: hidden;
  background: color-mix(in srgb, var(--xray-text) 10%, transparent);
}

.xray-firstrun-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: var(--xray-bg);
}

.xray-firstrun-cell-head {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.xray-firstrun-cell-icon {
  display: inline-flex;
  color: var(--xray-subtext);
}

.xray-firstrun-cell-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--xray-text);
}

.xray-firstrun-cell-body {
  margin: 0;
  font-size: 10.5px;
  line-height: 1.5;
  color: var(--xray-subtext);
}

.xray-firstrun-foot {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  font-size: 10.5px;
  /* --xray-hint is 2.89:1 here, under AA for 10.5px body text. */
  color: var(--xray-subtext);
}

.xray-firstrun-plus {
  color: var(--xray-subtext);
}

/* These forms live inside the size-contained panel; keep the rules after their
   default declarations so the narrow layout wins the cascade on wide monitors. */
@container xray (max-width: 600px) {
  .xray-experiment-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .xray-experiment-url {
    grid-column: auto;
  }

  .xray-experiment-actions .xray-spacer {
    display: none;
  }
}

@container xray (max-width: 560px) {
  .xray-firstrun-grid {
    grid-template-columns: minmax(0, 1fr);
  }
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
/* The selected row's indicator bar: one of the few things the accent paints (spec A1). */
.xray-api-row.selected,
.xray-entry-row.selected {
  box-shadow: inset 3px 0 0 var(--xray-accent);
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
  .xray-firstrun,
  .xray-modal,
  .xray-modal-backdrop,
  .xray-spinner,
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
  border: 1px solid var(--xray-border);
  background: rgba(var(--xray-surface2-rgb), .5);
  color: var(--xray-hint);
  font-size: 9px;
  font-weight: 700;
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
  color: var(--xray-subtext, var(--xray-text));
}

.xray-headers-grid {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  overflow: hidden;
}

.xray-header-row {
  display: grid;
  grid-template-columns: minmax(120px, 220px) minmax(0, 1fr) 26px;
  gap: 8px;
  align-items: center;
  padding: 5px 10px;
  border-bottom: 1px solid var(--xray-border);
  font-size: 11px;
}

.xray-header-row:last-child {
  border-bottom: none;
}

.xray-header-row:hover {
  background: var(--xray-hover);
}

.xray-header-name {
  color: var(--xray-subtext);
  font-weight: 700;
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
  border: 1px solid var(--xray-border);
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
  border-bottom: 1px solid var(--xray-border);
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
  font-weight: 700;
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
  font-weight: 700;
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

/* S18: ~44px single-line request rows. Comes after the operator layer, whose
   \`.xray-panel .xray-api-row { min-height: var(--xray-row-h) }\` would otherwise
   win; density still scales it, and the compact-rows setting goes denser. */
.xray-panel .xray-api-workspace .xray-api-row {
  min-height: calc(44px * var(--xray-density-scale, 1));
}

.xray-panel.xray-compact-rows .xray-api-workspace .xray-api-row {
  min-height: 32px;
}

.xray-api-row-actions .xray-icon-btn {
  width: 26px;
  height: 26px;
}

/* \u2500\u2500 S20: narrow API layouts \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   > 900px   list | detail side by side (draggable column divider).
   600\u2013900   list on top, detail below; a row divider resizes the list (40\u201375%).
   < 600     the detail replaces the list at full height; "Requests" goes back.
   Selectors carry the workspace class so they outrank the closed-drawer grid
   rules above (which only apply side by side). */
.xray-api-detail-back {
  display: none;
}

.xray-pane-divider.xray-pane-divider-rows {
  display: none;
  top: auto;
  right: 0;
  bottom: -4px;
  left: 0;
  width: auto;
  height: 9px;
  cursor: ns-resize;
}

.xray-pane-divider.xray-pane-divider-rows::after {
  width: 46px;
  height: 3px;
}

@container xray (max-width: 900px) {
  .xray-api-workspace .xray-api-body,
  .xray-api-workspace:not(.detail-open) .xray-api-body {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
  }

  .xray-api-workspace.detail-open .xray-api-body {
    grid-template-rows: minmax(0, var(--xray-api-vlist, 50fr)) minmax(0, var(--xray-api-vrest, 50fr));
  }

  .xray-api-workspace .xray-pane-divider:not(.xray-pane-divider-rows) {
    display: none;
  }

  .xray-api-workspace .xray-api-collection-pane {
    border-right: 0;
  }

  .xray-api-workspace .xray-api-detail-drawer {
    border-top: 1px solid var(--xray-border);
  }

  .xray-api-workspace .xray-api-detail-drawer.empty {
    display: none;
  }

  /* Short stacked detail: let the whole drawer scroll so the response keeps a
     usable height under the header and facet row instead of being squeezed. */
  .xray-api-workspace .xray-api-drawer-body {
    overflow: auto;
  }

  .xray-api-workspace .xray-request-detail {
    height: auto;
    min-height: 100%;
  }

  .xray-api-workspace .xray-detail-content {
    flex: 1 0 200px;
  }

  /* The base \u2264760px rule hides \`.xray-entry-duration\` for Logs; API rows keep it. */
  .xray-api-workspace .xray-api-row > .xray-entry-duration {
    display: grid;
  }
}

@container xray (600px <= width <= 900px) {
  .xray-api-workspace.detail-open .xray-pane-divider.xray-pane-divider-rows {
    display: block;
  }
}

@container xray (width < 600px) {
  .xray-api-workspace.detail-open .xray-api-body {
    grid-template-rows: minmax(0, 1fr);
  }

  .xray-api-workspace.detail-open .xray-api-collection-pane {
    display: none;
  }

  .xray-api-workspace .xray-api-detail-drawer {
    border-top: 0;
  }

  .xray-api-workspace.detail-open .xray-api-detail-back {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    padding: 6px 10px;
    border-bottom: 1px solid var(--xray-border);
    background: var(--xray-surface);
  }

  .xray-api-back-btn {
    height: 30px;
    gap: 6px;
    padding: 0 10px;
  }

  /* "Requests" is the way back here; the header close would duplicate it. */
  .xray-api-workspace .xray-detail-close {
    display: none;
  }

  .xray-api-table-head,
  .xray-api-row {
    grid-template-columns: 44px minmax(0, 1fr) 34px 54px auto;
    gap: 6px;
    padding-left: 8px;
    padding-right: 8px;
  }

  .xray-api-row .xray-bar-track {
    display: none;
  }

  .xray-api-row > .xray-entry-duration {
    grid-template-columns: auto;
    justify-content: end;
  }
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
  font: 700 10px/1 var(--xray-font-ui);
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

/* Insight cards use the collapsible header in place of the old <h3>. Keep the
   card's inner padding but let the header title read like the old heading. */
.xray-card.xray-collapsible {
  padding: 12px;
}

.xray-card.xray-collapsible > .xray-collapsible-header {
  padding: 0 0 8px;
  font-size: 12px;
}

/* Density toggle in the API table header (last column, right-aligned). */
.xray-api-table-tools {
  display: flex;
  justify-content: flex-end;
}

/* Phase 2 response-first workspace: keep the response readable, then disclose
   metadata and secondary operations without changing the token contract. */
.xray-request-detail:not(.compact) {
  container-type: inline-size;
  container-name: xray-detail;
}

/* S19 header: request line, status chips and the request actions (Copy, Export,
   Console, More actions) share one row; the bottom action bar is gone. Nothing
   here may clip overflow: the More menu is positioned against .xray-detail-more. */
.xray-request-detail:not(.compact) .xray-detail-hero {
  flex-wrap: nowrap;
  gap: 6px;
  padding: 8px 10px 8px 12px;
}

.xray-request-detail:not(.compact) .xray-response-heading {
  flex: 1 1 auto;
  min-width: 0;
}

.xray-request-detail:not(.compact) .xray-response-chips {
  flex: 0 0 auto;
  gap: 4px;
}

.xray-request-detail:not(.compact) .xray-response-chip {
  height: 24px;
  padding: 0 7px;
  font-size: 11px;
}

.xray-detail-actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 4px;
}

.xray-request-detail:not(.compact) .xray-detail-action {
  flex: 0 0 auto;
  height: 30px;
  gap: 5px;
  padding: 0 9px;
  font: 700 12px/1 var(--xray-font-ui);
  white-space: nowrap;
}

.xray-request-detail:not(.compact) .xray-detail-action[aria-expanded="true"] {
  color: var(--xray-text);
  border-color: var(--xray-border-control);
}

.xray-request-detail:not(.compact) .xray-detail-close {
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
}

/* One facet row (Response \xB7 Request \xB7 Headers \xB7 Timing \u2026) with the lens as a
   compact segmented control on the right. When both do not fit, the lens drops
   to its own line; the facet row scrolls (visible thin scrollbar) rather than
   wrapping or clipping. */
.xray-request-detail:not(.compact) .xray-detail-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 10px;
  padding: 4px 10px 4px 12px;
}

.xray-request-detail:not(.compact) .xray-detail-tabs {
  flex: 1 1 auto;
  min-width: 0;
  flex-wrap: nowrap;
  gap: 2px;
  padding: 0;
  overflow-x: auto;
  scrollbar-width: thin;
}

.xray-request-detail:not(.compact) .xray-detail-tabs::-webkit-scrollbar {
  display: block;
  height: 4px;
}

.xray-request-detail:not(.compact) .xray-detail-tabs::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: color-mix(in srgb, var(--xray-hint) 60%, transparent);
}

.xray-request-detail:not(.compact) .xray-detail-tab {
  flex: 0 0 auto;
  height: 30px;
  padding: 0 8px;
  color: var(--xray-subtext);
  font-size: 12px;
  white-space: nowrap;
}

.xray-request-detail:not(.compact) .xray-detail-tab.active {
  color: var(--xray-text);
}

.xray-request-detail:not(.compact) .xray-detail-views {
  flex: 0 0 auto;
  flex-wrap: nowrap;
  gap: 0;
  margin-left: auto;
  padding: 2px;
  overflow: visible;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-bg-rgb), .5);
}

.xray-request-detail:not(.compact) .xray-detail-views .xray-chip {
  min-width: 0;
  height: 24px;
  justify-content: center;
  padding: 0 6px;
  border: 1px solid transparent;
  border-radius: var(--xray-radius-sm);
  font: 600 11px/1 var(--xray-font-ui);
  white-space: nowrap;
}

.xray-request-detail:not(.compact) .xray-detail-views .xray-chip.active {
  color: var(--xray-text);
  border-color: var(--xray-border-control);
  background: var(--xray-surface3);
}

.xray-detail-more {
  position: relative;
  min-width: 0;
}

.xray-detail-action-list {
  position: absolute;
  inset-inline-end: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 232px;
  max-width: calc(100vw - 24px);
  max-height: min(420px, 60vh);
  overflow-y: auto;
  padding: 4px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: var(--xray-surface);
  box-shadow: 0 12px 28px rgba(var(--xray-bg-rgb), .28);
  bottom: calc(100% + 4px);
}

.xray-detail-action-list[data-placement="down"] {
  bottom: auto;
  top: calc(100% + 4px);
}

.xray-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 28px;
  padding: 0 8px;
  border: 0;
  border-radius: var(--xray-radius-sm);
  background: transparent;
  color: var(--xray-text);
  font: inherit;
  font-size: 12px;
  text-align: start;
  white-space: nowrap;
  cursor: pointer;
}

.xray-menu-item svg {
  flex: 0 0 auto;
  color: var(--xray-subtext);
}

.xray-menu-item:hover,
.xray-menu-item:focus-visible {
  background: var(--xray-surface2);
}

/* A pressed menu toggle is a neutral pressed state (spec A1). */
.xray-menu-item[aria-pressed="true"] {
  color: var(--xray-text);
  background: var(--xray-surface3);
}

.xray-menu-sep {
  flex: 0 0 auto;
  height: 1px;
  margin: 3px 4px;
  background: var(--xray-border);
}

.xray-detail-metadata,
.xray-detail-recommendations {
  min-width: 0;
  padding: 6px 12px;
}

.xray-detail-metadata {
  display: grid;
  gap: 6px;
}

.xray-detail-metadata label {
  display: grid;
  gap: 6px;
  color: var(--xray-subtext);
  font-size: 12px;
}

.xray-detail-metadata .xray-input {
  width: 100%;
  min-width: 0;
}

.xray-detail-recommendations {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.xray-api-toolbar .xray-filter-chips,
.xray-api-active-filters,
.xray-api-filters-collapsible {
  min-width: 0;
}

.xray-api-toolbar .xray-filter-chips {
  flex-wrap: wrap;
  overflow: visible;
}

.xray-api-filter-remove {
  min-width: 0;
  max-width: 100%;
}

.xray-api-filter-remove > svg {
  flex: 0 0 auto;
}

.xray-api-toolbar .xray-chip {
  min-height: 30px;
  height: auto;
  padding: 4px 9px;
  font-size: 12px;
}

.xray-panel .xray-api-toolbar .xray-api-search {
  min-height: 32px;
}

.xray-api-toolbar .xray-filter-label,
.xray-api-toolbar .xray-chip-count {
  font-size: 12px;
}

.xray-request-detail:not(.compact) :is(button, input):focus-visible,
.xray-api-toolbar :is(button, input):focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: 2px;
}

/* Narrower detail: the action labels collapse to icons (the label text stays in
   the accessibility tree, so names and \`title\`s are unchanged). */
@container xray-detail (max-width: 940px) {
  .xray-request-detail:not(.compact) .xray-detail-action {
    width: 30px;
    padding: 0;
  }

  .xray-request-detail:not(.compact) .xray-detail-action-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}

/* Phone-width detail: the request line takes its own row; chips and actions
   share the second. The lens spans the width as one equal-segment row. */
@container xray-detail (max-width: 560px) {
  .xray-request-detail:not(.compact) .xray-detail-hero {
    flex-wrap: wrap;
  }

  .xray-request-detail:not(.compact) .xray-response-heading {
    flex: 1 0 100%;
  }

  .xray-request-detail:not(.compact) .xray-response-chips {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
  }

  .xray-request-detail:not(.compact) .xray-detail-views {
    flex: 1 1 100%;
    margin-left: 0;
  }

  .xray-request-detail:not(.compact) .xray-detail-views .xray-chip {
    flex: 1 1 0;
    padding: 0 2px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
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
  border: 1px solid var(--xray-border);
  border-radius: 999px;
  background: rgba(var(--xray-surface2-rgb), .6);
  color: var(--xray-subtext, var(--xray-text));
  cursor: pointer;
  font: 700 10px/1 var(--xray-font-ui);
  letter-spacing: .02em;
}

.xray-json-tree-btn:hover {
  color: var(--xray-text);
  border-color: var(--xray-border-control);
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

/* S21: a long value never shreds its key. Keys, separators and brackets keep
   their width on one line; only the value wraps, inside its own box. A key
   wider than the pane scrolls with the tree body instead of breaking. */
.xray-json-row > .xray-json-key,
.xray-json-row > .xray-json-punct,
.xray-json-row > .xray-json-label {
  flex: 0 0 auto;
  white-space: pre;
}

.xray-json-row > .xray-json-value {
  flex: 1 1 auto;
  min-width: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.xray-json-branch {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
}

.xray-json-branch:hover {
  background: rgba(var(--xray-text-rgb), .06);
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
  font-weight: 700;
}

.xray-json-scalar {
  margin: 0;
}

/* Selectable tree (Console inspector): flat rows, one roving tab stop; the
   chevron toggles on click, the row selects. */
.xray-json-flatrow {
  border-radius: var(--xray-radius-sm);
  cursor: pointer;
}

.xray-json-flatrow:hover {
  background: rgba(var(--xray-text-rgb), .06);
}

.xray-json-flatrow:focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: -2px;
}

/* A selected node: the selection fill and the accent indicator bar, like a selected request. */
.xray-json-flatrow[aria-selected="true"] {
  background: var(--xray-selection);
  box-shadow: inset 2px 0 0 var(--xray-accent);
}

.xray-json-toggle {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: var(--xray-radius-sm);
  cursor: pointer;
}

.xray-json-toggle:hover {
  background: rgba(var(--xray-surface2-rgb), .7);
}

.xray-json-toggle .xray-json-chevron {
  margin-top: 0;
}

.xray-json-more {
  margin: 2px 0;
}

.xray-json-empty {
  margin: 8px 0;
  color: var(--xray-subtext);
  font: 600 12px/1.5 var(--xray-font-ui);
}

@media (prefers-reduced-motion: reduce) {
  .xray-json-chevron {
    transition: none;
  }
}

/* \u2500\u2500 API detail body views: Raw and Tree from the captured text (JSON fidelity J2, J3, J13) \u2500\u2500
   The Tree and Raw fill the detail content and window their rows inside their own scroller, so
   the content is a column: notices take their height, the view takes the rest (never less than a
   usable minimum, even where the content area has no fixed height). */
.xray-detail-content.has-pane {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.xray-detail-content.has-pane > .xray-body-pane,
.xray-detail-content.has-pane > .xray-raw,
.xray-detail-content.has-pane > .xray-body-scroll {
  flex: 1 1 0;
  min-height: 280px;
}

.xray-body-pane {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.xray-body-pane > .xray-json-tree.is-virtual,
.xray-body-pane > .xray-raw {
  flex: 1 1 0;
  min-height: 0;
}

.xray-body-scroll {
  min-width: 0;
  overflow: auto;
}

.xray-json-tree.is-virtual {
  padding: 8px 0 0;
}

.xray-json-tree.is-virtual > .xray-json-tree-toolbar {
  flex-wrap: wrap;
  align-items: center;
  padding: 0 8px 6px;
}

.xray-json-vscroll {
  flex: 1 1 0;
  min-height: 0;
  overflow: auto;
}

.xray-json-vlist {
  position: relative;
  width: 100%;
}

.xray-json-vrow {
  position: absolute;
  top: 0;
  left: 0;
}

.xray-json-budget-row {
  flex-wrap: wrap;
  gap: 8px;
}

/* A repeated key (after the key) and a number JavaScript cannot hold (after the number). */
.xray-json-tag {
  flex: 0 0 auto;
  align-self: center;
  margin: 0 6px 0 0;
  padding: 0 6px;
  border: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--xray-tag-color, var(--xray-yellow)) 10%, transparent);
  color: var(--xray-text);
  font-size: 10px;
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
}

.xray-json-tag.inexact {
  --xray-tag-color: var(--xray-peach);
  margin: 0 0 0 6px;
}

.xray-json-row.has-hint > .xray-json-value {
  flex: 0 1 auto;
}

.xray-json-note {
  color: var(--xray-subtext);
  font: 700 10px/1.4 var(--xray-font-ui);
}

.xray-json-depth {
  flex: 0 0 auto;
  margin-right: 4px;
  padding: 0 4px;
  border-radius: var(--xray-radius-sm);
  background: rgba(var(--xray-surface2-rgb), .7);
  color: var(--xray-hint);
  font-size: 10px;
}

/* A bidi control shown as its escape: set apart from the text around it. */
.xray-bidi {
  padding: 0 1px;
  border-radius: var(--xray-radius-sm);
  background: color-mix(in srgb, var(--xray-red) 16%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--xray-red) 42%, transparent);
  color: var(--xray-text);
  font-style: normal;
}

.xray-raw-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
}

.xray-raw-toolbar .xray-json-tree-btn[aria-pressed="true"] {
  border-color: var(--xray-border-control);
  color: var(--xray-text);
  background: var(--xray-surface3);
}

.xray-raw-toolbar .xray-json-tree-btn:disabled {
  cursor: default;
  opacity: .55;
}

.xray-raw-error {
  color: var(--xray-red);
  font: 700 11px/1.4 var(--xray-font-ui);
}

.xray-raw {
  position: relative;
  min-width: 0;
  overflow: auto;
  padding: 8px 0;
}

.xray-raw:focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: -2px;
}

.xray-raw-list {
  position: relative;
  width: 100%;
}

.xray-raw-block {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.xray-raw.no-gutter .xray-json-line {
  grid-template-columns: minmax(0, 1fr);
}

.xray-json-line.has-mark {
  background: color-mix(in srgb, var(--xray-red) 9%, transparent);
}

.xray-raw-mark {
  border-radius: var(--xray-radius-sm);
  background: color-mix(in srgb, var(--xray-red) 34%, transparent);
  box-shadow: 0 0 0 1px var(--xray-red);
  color: var(--xray-text);
}

.xray-raw-mark.gap {
  display: inline-block;
  min-width: .6em;
}

.xray-body-notices {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.xray-body-notice {
  margin: 0;
  padding: 6px 10px;
  /* The notice's tone: info (blue) unless a modifier sets another. Defined here so the border
     (which reads it with no fallback) is never invalid. */
  --xray-body-notice: var(--xray-blue);
  border: 1px solid color-mix(in srgb, var(--xray-body-notice) 36%, transparent);
  border-radius: var(--xray-radius);
  background: color-mix(in srgb, var(--xray-body-notice) 10%, transparent);
  color: var(--xray-text);
  font: 600 12px/1.4 var(--xray-font-ui);
}

.xray-body-notice.warning {
  --xray-body-notice: var(--xray-yellow);
}

/* Table view: the "Showing R of N rows \xB7 C of K columns" notice sits above the table. */
.xray-table-view {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.xray-link-btn {
  padding: 0;
  border: 0;
  background: none;
  color: var(--xray-accent);
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}

.xray-body-status {
  margin: 8px 0;
  color: var(--xray-subtext);
  font: 600 12px/1.5 var(--xray-font-ui);
}

.xray-binary-body h3 {
  margin: 0 0 6px;
}

.xray-binary-prefix {
  display: block;
  margin-top: 6px;
  overflow-wrap: anywhere;
  color: var(--xray-text);
}

/* \u2500\u2500 Console: rendered errors (ErrorBlock) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.xray-error-name {
  color: var(--xray-red);
  font-weight: 700;
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

/* Keep the console chrome within the short viewport after the operator skin's
   later rules have set its comfortable defaults. */
@media (max-height: 400px) {
  .xray-panel .xray-console-head { min-height: 36px; }
  .xray-panel .xray-filterbar { padding-block: 5px; }
  .xray-panel .xray-filterbar .xray-input { height: 32px; }
  .xray-panel .xray-filter-chips .xray-chip { height: 28px; padding-inline: 8px; }
  .xray-panel .xray-prompt { gap: 4px; padding-block: 4px; }
  .xray-panel .xray-prompt textarea { min-height: 30px; max-height: 40px; padding-block: 6px; }
  .xray-panel .xray-prompt .xray-btn { height: 28px; }
  .xray-panel .xray-statusbar { min-height: 22px; height: 22px; font-size: 9px; }
}

.xray-error-fn {
  color: var(--xray-text);
  font-weight: 700;
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

/* \u2500\u2500 Record control (header runtime-diagnostics button) \u2500\u2500
   Recording is a red dot, not an accent ring. The ring is reserved for :focus-visible,
   which the shared focus rules draw. Specificity (not source order) keeps these ahead
   of the generic .xray-icon-btn hover/active rules. */
.xray-topbar .xray-icon-btn.xray-record-btn:not(:focus-visible) {
  color: var(--xray-subtext);
  background: rgba(var(--xray-surface-rgb), .72);
  outline: none;
}

.xray-topbar .xray-icon-btn.xray-record-btn:not(:focus-visible):hover {
  background: rgba(var(--xray-text-rgb), .06);
}

.xray-topbar .xray-record-btn.recording .xray-live-dot {
  background: var(--xray-red);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--xray-red) 20%, transparent);
  animation: none;
}

/* \u2500\u2500 Shared notice / callout \u2500\u2500 */
.xray-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  padding: 7px 10px;
  border: 1px solid color-mix(in srgb, var(--xray-notice-color) 36%, transparent);
  border-radius: var(--xray-radius);
  background: color-mix(in srgb, var(--xray-notice-color) 10%, transparent);
  color: var(--xray-text);
  font-size: 12px;
  line-height: 1.4;
  --xray-notice-color: var(--xray-blue);
}

.xray-notice.warning { --xray-notice-color: var(--xray-yellow); }
.xray-notice.error { --xray-notice-color: var(--xray-red); }

.xray-notice-icon {
  flex: 0 0 auto;
  margin-top: 1px;
  color: var(--xray-notice-color);
}

.xray-notice-text {
  flex: 1 1 auto;
  min-width: 0;
}

.xray-notice-action {
  flex: 0 0 auto;
}

/* \u2500\u2500 J12: a view that failed to render (ErrorBoundary) \u2500\u2500
   Same tinted callout as the error notice, in place of the view that failed. */
.xray-render-fallback {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
  margin: 8px;
  padding: 8px 10px;
  border: 1px solid color-mix(in srgb, var(--xray-red) 36%, transparent);
  border-radius: var(--xray-radius);
  background: color-mix(in srgb, var(--xray-red) 10%, transparent);
  color: var(--xray-text);
  font-size: 12px;
  line-height: 1.4;
}

.xray-render-fallback-icon {
  flex: 0 0 auto;
  color: var(--xray-red);
}

.xray-render-fallback-text {
  flex: 1 1 12em;
  min-width: 0;
}

.xray-render-fallback-actions {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* The root boundary's fallback (RootErrorBoundary): inside the panel's own frame, so it sits where
   the panel does on every surface. */
.xray-root-fallback {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  margin: 16px;
  padding: 16px;
  border: 1px solid color-mix(in srgb, var(--xray-red) 36%, transparent);
  border-radius: var(--xray-radius);
  background: color-mix(in srgb, var(--xray-red) 10%, var(--xray-surface));
  color: var(--xray-text);
  font-size: 12px;
  line-height: 1.45;
}

.xray-root-fallback-icon {
  color: var(--xray-red);
}

.xray-root-fallback-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.xray-root-fallback-text {
  margin: 0;
  max-width: 60ch;
}

.xray-root-fallback-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}


/* \u2500\u2500 S22\u2013S24: Logs tab \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   Same visual language as the API tab: one toolbar row, 32px single-line rows,
   and the detail beside the list only once a log is open.
   > 900px   list | detail side by side (draggable column divider).
   600\u2013900   list on top, detail below; a row divider resizes the list (40\u201375%).
   < 600     the detail replaces the list at full height; "Logs" goes back. */
.xray-logs-workspace .xray-list-panel,
.xray-logs-workspace .xray-detail-panel {
  background: var(--xray-bg);
}

.xray-logs-workspace:not(.detail-open) .xray-pane-divider,
.xray-logs-workspace:not(.detail-open) .xray-logs-detail {
  display: none;
}

.xray-logs-workspace:not(.detail-open) .xray-list-panel {
  border-right: 0;
}

.xray-logs-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--xray-border);
  background: var(--xray-surface);
}

.xray-logs-search {
  flex: 1 1 180px;
  min-width: 0;
  height: 32px;
}

.xray-logs-search .xray-input {
  height: 32px;
  font-size: 12px;
}

.xray-logs-levels {
  flex: 0 1 auto;
  min-width: 0;
  gap: 4px;
}

.xray-logs-levels .xray-chip {
  min-height: 30px;
  height: auto;
  padding: 4px 9px;
  font-size: 12px;
}

.xray-logs-levels .xray-chip-count {
  font-size: 12px;
}

.xray-logs-toolbar :is(button, input):focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: 2px;
}

.xray-panel .xray-logs-list .xray-entry-row {
  min-height: calc(32px * var(--xray-density-scale, 1));
  height: calc(32px * var(--xray-density-scale, 1));
  font-weight: 600;
}

.xray-logs-list .xray-entry-main,
.xray-logs-list .xray-path {
  min-width: 0;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-log-row-level,
.xray-log-row-time {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
}

.xray-log-row-level {
  color: var(--xray-subtext);
  font-weight: 700;
}

.xray-log-row-level.error { color: var(--xray-red); }
.xray-log-row-level.warn { color: var(--xray-yellow); }
.xray-log-row-level.info { color: var(--xray-blue); }

.xray-log-row-time {
  color: var(--xray-subtext);
  font-variant-numeric: tabular-nums;
}

.xray-logs-workspace .xray-logs-detail {
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.xray-logs-detail-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}

.xray-logs-detail-back {
  display: none;
}

.xray-log-close.solo {
  margin-left: auto;
}

@container xray (max-width: 900px) {
  .xray-logs-workspace.detail-open {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, var(--xray-logs-vlist, 50fr)) minmax(0, var(--xray-logs-vrest, 50fr));
  }

  .xray-logs-workspace .xray-pane-divider:not(.xray-pane-divider-rows) {
    display: none;
  }

  .xray-logs-workspace .xray-list-panel {
    border-right: 0;
  }

  .xray-logs-workspace .xray-logs-detail {
    border-top: 1px solid var(--xray-border);
  }
}

@container xray (600px <= width <= 900px) {
  .xray-logs-workspace.detail-open .xray-pane-divider.xray-pane-divider-rows {
    display: block;
  }
}

@container xray (width < 600px) {
  .xray-logs-workspace.detail-open {
    grid-template-rows: minmax(0, 1fr);
  }

  .xray-logs-workspace.detail-open .xray-list-panel {
    display: none;
  }

  .xray-logs-workspace .xray-logs-detail {
    border-top: 0;
  }

  .xray-logs-workspace.detail-open .xray-logs-detail-back {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    padding: 6px 10px;
    border-bottom: 1px solid var(--xray-border);
    background: var(--xray-surface);
  }

  /* "Logs" is the way back here; the header close would duplicate it. */
  .xray-logs-workspace .xray-log-close {
    display: none;
  }

  .xray-logs-list .xray-entry-row {
    grid-template-columns: 44px 70px minmax(0, 1fr) 28px;
    gap: 6px;
    padding-left: 8px;
    padding-right: 8px;
  }
}


/* \u2500\u2500 Console tab layout refresh (S25-S29) \u2500\u2500 */

/* S26: search + level chips share one compact row (matches the Logs toolbar).
   The chips never wrap; when they do not fit they scroll with an edge fade. */
.xray-panel .xray-console-workspace .xray-filterbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  padding: 6px 10px;
}

.xray-console-workspace .xray-filterbar .xray-search {
  /* Wide enough to read "Filter console messages\u2026"; with the five S2 chips this
     puts the chips on their own row below ~800 px instead of squeezing the field. */
  flex: 1 1 240px;
  min-width: 0;
  min-height: 32px;
  height: 32px;
}

.xray-console-workspace .xray-filterbar .xray-input {
  height: 32px;
  font-size: 12px;
}

.xray-console-workspace .xray-console-levels {
  flex: 0 1 auto;
  max-width: 100%;
  min-width: 0;
  gap: 4px;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
}

.xray-console-workspace .xray-console-levels::-webkit-scrollbar {
  display: none;
}

.xray-console-workspace .xray-console-levels .xray-chip {
  flex: 0 0 auto;
  min-height: 30px;
  height: 30px;
  padding: 0 9px;
  font-size: 12px;
}

.xray-console-workspace .xray-console-levels[data-overflow="end"] {
  -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent);
  mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent);
}

.xray-console-workspace .xray-console-levels[data-overflow="start"] {
  -webkit-mask-image: linear-gradient(to left, #000 calc(100% - 28px), transparent);
  mask-image: linear-gradient(to left, #000 calc(100% - 28px), transparent);
}

.xray-console-workspace .xray-console-levels[data-overflow="both"] {
  -webkit-mask-image: linear-gradient(to right, transparent, #000 28px, #000 calc(100% - 28px), transparent);
  mask-image: linear-gradient(to right, transparent, #000 28px, #000 calc(100% - 28px), transparent);
}

/* S25 / P1: request context is one line above the prompt:
   res = GET /path \xB7 200 \xB7 14 kb  [a \xD7] [b \xD7]  Change \u25BE  [inspect].
   The picker menu is a sibling of the line (the line clips its overflow). */
.xray-context-wrap {
  position: relative;
  min-width: 0;
}

.xray-prompt .xray-context-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  min-width: 0;
  min-height: 32px;
  padding: 2px 4px 2px 10px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-surface2-rgb), .5);
  overflow: hidden;
}

.xray-context-line:focus-within {
  border-color: var(--xray-focus);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--xray-focus) 48%, transparent);
}

.xray-context-summary {
  /* A small basis keeps the picker on the first row; pins wrap below when crowded. */
  flex: 1 1 160px;
  min-width: 0;
  display: flex;
  align-items: baseline;
  overflow: hidden;
  white-space: nowrap;
  color: var(--xray-text);
  font: 700 12px/26px var(--xray-font);
}

.xray-context-prefix {
  flex: 0 0 auto;
  color: var(--xray-subtext);
  font: 700 12px/1 var(--xray-font);
  white-space: pre;
}

.xray-context-request {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.xray-context-meta {
  flex: 0 0 auto;
  color: var(--xray-subtext);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: pre;
}

.xray-context-age {
  /* Collapses first when the line is tight (large shrink weight), then the path. */
  flex: 0 100 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--xray-hint);
  font-weight: 600;
  white-space: pre;
}

.xray-context-summary.xray-context-none {
  display: block;
  text-overflow: ellipsis;
  color: var(--xray-subtext);
  font-family: var(--xray-font-ui);
  font-weight: 600;
}

.xray-pin-chips {
  flex: 0 1 auto;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.xray-pin-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  max-width: 150px;
  height: 22px;
  padding: 0 2px 0 7px;
  border: 0;
  border-radius: var(--xray-radius-sm);
  background: rgba(var(--xray-text-rgb), .06);
  color: var(--xray-text);
  font: 600 11px/1 var(--xray-font);
}

.xray-pin-chip-name {
  flex: 0 0 auto;
  color: var(--xray-text);
  font-weight: 700;
}

.xray-pin-chip-path {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--xray-subtext);
}

.xray-pin-chip-remove {
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  display: inline-grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: var(--xray-radius-sm);
  background: transparent;
  color: var(--xray-subtext);
  cursor: pointer;
}

.xray-pin-chip-remove:hover {
  color: var(--xray-text);
  background: color-mix(in srgb, var(--xray-text) 10%, transparent);
}

.xray-pin-chip-remove:focus-visible,
.xray-context-change:focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: 1px;
}

/* Change \u25BE and Inspect wrap together, never leaving an orphan icon on its own row. */
.xray-context-actions {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-inline-start: auto;
}

.xray-context-change {
  flex: 0 0 auto;
  height: 26px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  border: 0;
  border-radius: var(--xray-radius-sm);
  background: transparent;
  color: var(--xray-accent, var(--xray-blue));
  font: 700 11px/1 var(--xray-font-ui);
  cursor: pointer;
}

.xray-context-change:hover,
.xray-context-change[aria-expanded="true"] {
  background: rgba(var(--xray-text-rgb), .07);
}

.xray-context-change[aria-expanded="true"] svg {
  transform: rotate(180deg);
}

.xray-context-menu {
  position: absolute;
  inset-inline-end: 0;
  bottom: calc(100% + 6px);
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 440px;
  max-width: calc(100cqw - 20px);
  max-height: min(360px, 60vh);
  padding: 6px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: var(--xray-surface);
  box-shadow: 0 12px 28px rgba(var(--xray-bg-rgb), .28);
}

.xray-prompt .xray-context-menu .xray-context-filter {
  flex: 0 0 auto;
  min-height: 0;
  height: 30px;
  max-height: none;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 600;
}

.xray-context-options {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow-y: auto;
}

.xray-context-option {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  min-height: 28px;
  padding: 0 8px;
  border: 0;
  border-radius: var(--xray-radius-sm);
  background: transparent;
  color: var(--xray-text);
  font: 600 12px/1 var(--xray-font);
  text-align: start;
  cursor: pointer;
}

.xray-context-option:hover,
.xray-context-option:focus-visible {
  background: color-mix(in srgb, var(--xray-text) 8%, transparent);
  outline: none;
}

.xray-context-option:focus-visible {
  box-shadow: inset 0 0 0 2px var(--xray-text);
}

.xray-context-option[aria-current="true"] {
  background: var(--xray-surface2);
  box-shadow: inset 2px 0 0 var(--xray-accent);
}

.xray-context-option-method {
  flex: 0 0 42px;
  color: var(--xray-subtext);
  font-weight: 700;
  font-size: 11px;
}

.xray-context-option-path {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-context-option-meta {
  flex: 0 0 auto;
  color: var(--xray-subtext);
  font-variant-numeric: tabular-nums;
}

.xray-context-option-pin {
  flex: 0 0 auto;
  padding: 2px 5px;
  border-radius: var(--xray-radius-sm);
  background: rgba(var(--xray-text-rgb), .06);
  color: var(--xray-text);
  font-weight: 700;
}

.xray-context-empty {
  margin: 6px 8px;
  font-size: 12px;
}

.xray-context-menu .xray-context-pin:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.xray-context-inspect {
  flex: 0 0 auto;
  width: 28px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: var(--xray-radius-sm);
  background: transparent;
  color: var(--xray-subtext);
  font: 700 11px/1 var(--xray-font-ui);
  cursor: pointer;
}

.xray-context-inspect:hover {
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .07);
}

.xray-context-inspect:focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: 1px;
}

@container xray (max-width: 760px) {
  .xray-pin-chip-path {
    display: none;
  }
}

/* Narrow: Change \u25BE becomes its chevron (it keeps its accessible name), leaving the
   request path room. "Pick request" stays spelled out. */
@container xray (max-width: 460px) {
  .xray-context-change:not(.pick) > .xray-context-change-text {
    display: none;
  }

  .xray-context-change:not(.pick) {
    width: 28px;
    justify-content: center;
    padding: 0;
  }
}

/* S27: Snippets menu beside Run. */
.xray-snippet-menu-wrap {
  position: relative;
  flex: 0 0 auto;
}

.xray-snippet-menu {
  position: absolute;
  inset-inline-end: 0;
  bottom: calc(100% + 6px);
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 280px;
  max-width: calc(100cqw - 20px);
  max-height: min(320px, 60vh);
  overflow-y: auto;
  padding: 4px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: var(--xray-surface);
  box-shadow: 0 12px 28px rgba(var(--xray-bg-rgb), .28);
}

.xray-snippet-menu .xray-snippet-save:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.xray-snippet-naming {
  display: flex;
  align-items: center;
  gap: 6px;
}

.xray-snippet-menu .xray-snippet-rename {
  flex: 1 1 auto;
  min-width: 0;
  height: 28px;
  padding: 0 8px;
  font-size: 12px;
}

.xray-snippet-empty {
  margin: 4px 8px;
  font-size: 12px;
}

.xray-snippet-item {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
  border-radius: var(--xray-radius-sm);
}

.xray-snippet-item:hover {
  background: rgba(var(--xray-text-rgb), .07);
}

.xray-snippet-menu .xray-snippet-load {
  flex: 1 1 auto;
  min-width: 0;
  max-width: none;
  min-height: 28px;
  padding: 0 8px;
  text-align: start;
  color: var(--xray-text);
  font-size: 12px;
}

.xray-snippet-action {
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: var(--xray-radius-sm);
  background: transparent;
  color: var(--xray-hint);
  cursor: pointer;
}

.xray-snippet-action:hover {
  color: var(--xray-text);
}

.xray-snippet-action.xray-snippet-remove:hover {
  color: var(--xray-red);
}

.xray-snippet-menu :is(button, input):focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: 1px;
}

.xray-snippet-undo {
  align-self: flex-start;
  margin: 2px 4px;
}

/* S28: example commands in the empty stream. */
.xray-console-examples {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}

.xray-console-example {
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
}

.xray-console-example code {
  font: 700 12px/1 var(--xray-font);
}

/* S29: the status bar is always a single line; low-priority items drop first. */
.xray-panel .xray-statusbar {
  flex-wrap: nowrap;
  gap: 12px;
  overflow: hidden;
  white-space: nowrap;
}

.xray-statusbar > .xray-status-item {
  flex: 0 0 auto;
}

.xray-statusbar > .xray-status-total {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

@container xray (max-width: 620px) {
  .xray-statusbar .xray-status-avg {
    display: none;
  }
}

@container xray (max-width: 420px) {
  .xray-statusbar .xray-status-slow {
    display: none;
  }
}

/* S33: Insights overview is one strip of label/value pairs (same register as the
   API tab's summary line); Findings follow, breakdown cards after. */
.xray-insight-strip {
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 2px 16px;
  margin-bottom: 12px;
  padding: 6px 10px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-surface-rgb), .88);
  font: 600 12px/18px var(--xray-font-ui);
}

.xray-insight-stat {
  min-width: 0;
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  white-space: nowrap;
}

.xray-insight-stat-label {
  color: var(--xray-subtext);
}

.xray-insight-stat strong {
  color: var(--xray-text);
  font-weight: 700;
}

.xray-insight-stat.warn strong { color: var(--xray-yellow); }
.xray-insight-stat.error strong { color: var(--xray-red); }

/* S34: compact finding rows grouped under their request. */
.xray-findings {
  margin-bottom: 12px;
  padding: 10px 12px;
}

.xray-findings-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  margin-bottom: 6px;
}

.xray-findings-toolbar h4 {
  margin: 0 4px 0 0;
}

.xray-findings-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.xray-findings .xray-chip {
  height: 28px;
  padding: 0 10px;
  font-size: 11px;
}

.xray-finding-group {
  margin-top: 8px;
  border-top: 1px solid var(--xray-border);
}

.xray-finding-request {
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 6px 0 2px;
  font: 700 12px/1.35 var(--xray-font);
}

.xray-finding-path {
  min-width: 0;
  flex: 0 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-finding-request-meta {
  flex: 0 0 auto;
  white-space: nowrap;
}

.xray-finding-row {
  min-width: 0;
  padding: 1px 0 1px 12px;
}

.xray-finding-line {
  min-width: 0;
  min-height: 28px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.xray-finding-line input[type='checkbox'] {
  flex: 0 0 auto;
  margin: 0;
}

.xray-finding-severity {
  flex: 0 0 auto;
  display: inline-flex;
  color: var(--xray-blue);
}

.xray-finding-severity.warning { color: var(--xray-yellow); }
.xray-finding-severity.error { color: var(--xray-red); }

.xray-finding-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 700;
}

.xray-finding-row.dismissed .xray-finding-title {
  color: var(--xray-subtext);
}

.xray-finding-tags {
  flex: 0 0 auto;
  font-size: 11px;
  white-space: nowrap;
}

.xray-finding-action {
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
}

.xray-finding-chevron {
  transition: transform .15s ease;
}

.xray-finding-chevron.open {
  transform: rotate(180deg);
}

@media (prefers-reduced-motion: reduce) {
  .xray-finding-chevron { transition: none; }
}

.xray-finding-details {
  padding: 2px 0 6px 52px;
  color: var(--xray-subtext);
  font-size: 11px;
}

.xray-finding-details[hidden] {
  display: none;
}

.xray-finding-details p {
  margin: 0 0 4px;
}

.xray-finding-evidence {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 4px;
  overflow-wrap: anywhere;
}

@container xray (max-width: 420px) {
  .xray-finding-request-meta { display: none; }
  .xray-finding-details { padding-left: 12px; }
}

/* \u2500\u2500 Console prompt editor (spec P3\u2013P7, P9) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   The textarea is the real input (transparent text, native caret/selection/IME);
   the aria-hidden overlay behind it paints the token colours. Both share one box
   model so every glyph lines up. Grows to 8 lines (8 \xD7 18px + 2 \xD7 8px), then
   scrolls. */
.xray-editor {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.xray-panel .xray-prompt .xray-editor .xray-prompt-command-row {
  align-items: flex-start;
}

.xray-panel .xray-prompt .xray-editor .xray-prompt-command-row > svg {
  margin-top: 10px;
}

.xray-editor-field {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  border: 1px solid var(--xray-border-control);
  border-radius: var(--xray-radius-lg, var(--xray-radius));
  background: var(--xray-surface2);
}

.xray-editor-field:focus-within {
  border-color: var(--xray-focus);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--xray-focus) 38%, transparent);
}

.xray-panel .xray-prompt .xray-editor-input,
.xray-panel .xray-prompt .xray-editor-highlight {
  box-sizing: border-box;
  margin: 0;
  border: 0;
  padding: 8px 10px;
  font: 500 12px/18px var(--xray-font);
  font-variant-ligatures: none;
  letter-spacing: normal;
  tab-size: 2;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: normal;
  scrollbar-gutter: stable;
}

.xray-panel .xray-prompt .xray-editor-input {
  position: relative;
  z-index: 1;
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  min-height: 0;
  max-height: 160px;
  border-radius: inherit;
  background: transparent;
  color: transparent;
  caret-color: var(--xray-text);
  box-shadow: none;
  outline: none;
  resize: none;
  overflow-x: hidden;
  overflow-y: auto;
}

.xray-panel .xray-prompt .xray-editor-input:focus {
  border: 0;
  box-shadow: none;
}

.xray-panel .xray-prompt .xray-editor-input::placeholder {
  color: var(--xray-hint);
  opacity: 1;
}

.xray-panel .xray-prompt .xray-editor-input::selection {
  background: color-mix(in srgb, var(--xray-text) 24%, transparent);
  color: transparent;
}

.xray-panel .xray-prompt .xray-editor-highlight {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  color: var(--xray-text);
  background: transparent;
}

.xray-tok-keyword { color: var(--xray-mauve); }
.xray-tok-string { color: var(--xray-green); }
.xray-tok-number { color: var(--xray-peach); }
.xray-tok-comment { color: var(--xray-hint); font-style: italic; }
.xray-tok-punct { color: var(--xray-subtext); }
.xray-tok-plain { color: var(--xray-text); }

/* P5: suggestions open above the field (the prompt sits at the bottom). */
.xray-editor-suggestions {
  position: absolute;
  left: 0;
  bottom: calc(100% + 4px);
  z-index: 30;
  width: min(420px, 100%);
  max-height: 232px;
  margin: 0;
  padding: 4px;
  overflow-y: auto;
  list-style: none;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: var(--xray-surface);
  box-shadow: 0 10px 28px var(--xray-shadow);
}

/* Expanded (P10): the field is the tall pane, and at full height it starts at the top
   of the Console, so "above the field" is off-screen. The list opens inside the field,
   next to the caret's line (ConsoleEditor sets top/max-height: below the line, or above
   it when there is more room there), and never outgrows the field. */
.xray-editor.is-expanded .xray-editor-suggestions {
  top: 4px;
  bottom: auto;
  left: 4px;
  width: min(420px, calc(100% - 8px));
  max-height: min(232px, calc(100% - 8px));
}

.xray-editor-group {
  list-style: none;
}

.xray-editor-group-options {
  margin: 0;
  padding: 0;
  list-style: none;
}

.xray-editor-group-label {
  padding: 6px 8px 2px;
  color: var(--xray-hint);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  pointer-events: none;
}

.xray-editor-option {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
  padding: 5px 8px;
  border-radius: var(--xray-radius-sm);
  color: var(--xray-text);
  font: 500 12px/16px var(--xray-font);
  cursor: pointer;
}

.xray-editor-option:hover {
  background: color-mix(in srgb, var(--xray-text) 7%, transparent);
}

.xray-editor-option.active {
  background: var(--xray-surface2);
  box-shadow: inset 2px 0 0 var(--xray-accent);
}

.xray-editor-option-label {
  flex: 0 0 auto;
  font-weight: 700;
}

.xray-editor-option-detail {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  color: var(--xray-subtext);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* P6/P7: one muted line under the editor \u2014 a helper signature or a live preview. */
.xray-editor-hint {
  min-width: 0;
  padding-left: 24px;
  overflow: hidden;
  color: var(--xray-subtext);
  font: 500 11px/16px var(--xray-font);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-editor-hint.signature .xray-editor-hint-main { color: var(--xray-text); font-weight: 700; }
.xray-editor-hint.signature .xray-editor-hint-main .xray-editor-hint-param {
  color: var(--xray-text);
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: currentColor;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}
.xray-editor-hint-note { color: var(--xray-hint); }

/* Manual open (Ctrl+Space) with nothing to offer: a visible, non-interactive row. */
.xray-editor-suggestions-empty {
  padding: 8px 12px;
  overflow: visible;
  color: var(--xray-hint);
  font: 500 12px/16px var(--xray-font-ui);
  pointer-events: none;
}

/* P9: chips insert at the caret. They wrap rather than scroll out of reach. */
.xray-editor-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;
  padding-left: 24px;
}

.xray-editor-chip {
  height: 22px;
  padding: 0 7px;
  border: 1px solid color-mix(in srgb, var(--xray-border) 90%, transparent);
  border-radius: var(--xray-radius-sm);
  background: transparent;
  color: var(--xray-subtext);
  font: 600 11px/1 var(--xray-font);
  cursor: pointer;
  transition: color var(--xray-dur-fast) var(--xray-ease), border-color var(--xray-dur-fast) var(--xray-ease), background var(--xray-dur-fast) var(--xray-ease);
}

.xray-editor-chip:hover {
  border-color: var(--xray-border-control);
  background: rgba(var(--xray-text-rgb), .07);
  color: var(--xray-text);
}

@media (prefers-reduced-motion: reduce) {
  .xray-editor-chip { transition: none; }
}

@container xray (max-width: 420px) {
  .xray-editor-hint,
  .xray-editor-chips { padding-left: 0; }
}

/* Short viewports keep the stream usable: the editor stops growing at 3 lines. */
@media (max-height: 400px) {
  .xray-panel .xray-prompt .xray-editor-input { max-height: 70px; padding-block: 8px; }
  .xray-editor-chip { height: 20px; }
}

/* \u2500\u2500 Smart starters (spec P8) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   Chips generated from the selected response. In the empty stream they replace the
   fixed examples; above the editor they show while the draft is empty. */
.xray-starter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
}

.xray-console-examples.xray-starter-chips { justify-content: center; }

.xray-starter-row { padding-left: 24px; gap: 4px; }

.xray-panel .xray-starter-chip {
  height: 28px;
  padding: 0 10px;
  color: var(--xray-text);
  font: 600 12px/1 var(--xray-font);
  cursor: pointer;
}

.xray-panel .xray-starter-row .xray-starter-chip {
  height: 24px;
  padding: 0 8px;
  border-style: dashed;
  color: var(--xray-subtext);
  font-size: 11px;
}

.xray-panel .xray-starter-chip:hover {
  border-color: var(--xray-border-control);
  background: rgba(var(--xray-text-rgb), .07);
  color: var(--xray-text);
}

@container xray (max-width: 420px) {
  .xray-starter-row { padding-left: 0; }
}

/* \u2500\u2500 Expanded editor (spec P10) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   The prompt grows to ~70% of the Console column (the field itself \u2248 60%); on a
   narrow Console (< 600 px wide) or a short viewport it takes the whole column and
   the stream steps aside. Lines never wrap, so the gutter's numbers stay on their
   lines; the overlay and gutter follow the textarea's scroll. ConsolePrompt reads
   --xray-editor-full back to know when the stream is covered. */
.xray-editor-code {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  border-radius: inherit;
}

.xray-editor-actions { display: contents; }

.xray-panel .xray-prompt.is-expanded {
  flex: 0 0 70%;
  min-height: 0;
}

.xray-prompt.is-expanded .xray-editor {
  flex: 1 1 0;
  min-height: 0;
}

.xray-panel .xray-prompt .xray-editor.is-expanded .xray-prompt-command-row {
  flex: 1 1 0;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 6px 8px;
  align-items: center;
}

.xray-editor.is-expanded .xray-prompt-command-row > svg { display: none; }

.xray-editor.is-expanded .xray-editor-tools {
  grid-row: 1;
  grid-column: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
}

.xray-editor-tools-hint {
  min-width: 0;
  overflow: hidden;
  color: var(--xray-hint);
  font: 500 11px/16px var(--xray-font-ui);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-editor.is-expanded .xray-editor-actions {
  grid-row: 1;
  grid-column: 2;
  display: flex;
  align-items: center;
  gap: 8px;
}

.xray-editor.is-expanded .xray-editor-field {
  grid-row: 2;
  grid-column: 1 / -1;
  align-self: stretch;
  min-height: 0;
}

.xray-panel .xray-prompt .xray-editor.is-expanded .xray-editor-input {
  align-self: stretch;
  height: auto;
  max-height: none;
  white-space: pre;
  overflow-wrap: normal;
  overflow-x: auto;
}

.xray-panel .xray-prompt .xray-editor.is-expanded .xray-editor-highlight {
  white-space: pre;
  overflow-wrap: normal;
  /* A longer scroll range than the textarea's (its scrollbars take room the
     overlay does not have), so the overlay can always follow it. */
  padding-right: 40px;
  padding-bottom: 40px;
}

.xray-editor-gutter {
  flex: 0 0 auto;
  min-width: 3.5ch;
  padding: 8px 8px 48px 10px;
  overflow: hidden;
  border-right: 1px solid color-mix(in srgb, var(--xray-border) 80%, transparent);
  color: var(--xray-hint);
  font: 500 12px/18px var(--xray-font);
  font-variant-numeric: tabular-nums;
  text-align: right;
  pointer-events: none;
  user-select: none;
}

.xray-editor-gutter > span { display: block; }

.xray-editor-expand {
  width: 34px;
  justify-content: center;
  padding: 0;
}

.xray-editor-expand[aria-pressed="true"] {
  border-color: var(--xray-border-control);
  color: var(--xray-text);
}

@container xray-console (max-width: 599px) {
  .xray-panel .xray-prompt.is-expanded {
    --xray-editor-full: 1;
    flex: 1 1 0;
  }

  .xray-console-column:has(> .xray-prompt.is-expanded) > .xray-filterbar,
  .xray-console-column:has(> .xray-prompt.is-expanded) > .xray-console-stream-wrap {
    display: none;
  }

  .xray-editor-tools-hint { display: none; }
}

@media (max-height: 600px) {
  .xray-panel .xray-prompt.is-expanded {
    --xray-editor-full: 1;
    flex: 1 1 0;
  }

  .xray-console-column:has(> .xray-prompt.is-expanded) > .xray-filterbar,
  .xray-console-column:has(> .xray-prompt.is-expanded) > .xray-console-stream-wrap {
    display: none;
  }
}

/* An empty editor stays one line: the placeholder is clipped with an ellipsis
   instead of wrapping the field to two or three lines in a narrow prompt (the
   full text is in the field's title). Wrapping resumes with the first character. */
.xray-panel .xray-prompt .xray-editor-input:placeholder-shown {
  white-space: nowrap;
  text-overflow: ellipsis;
}

.xray-panel .xray-prompt .xray-editor-input::placeholder {
  white-space: nowrap;
  text-overflow: ellipsis;
}

.xray-editor-tools .xray-btn { flex: 0 0 auto; white-space: nowrap; }

/* Below ~720 px the tool labels give way to icons (names stay in aria-label/title). */
@container xray (max-width: 720px) {
  .xray-editor-tools .xray-btn > span { display: none; }
  .xray-editor-tools .xray-btn { width: 34px; justify-content: center; padding: 0; }
}

/* The shortcut hint only shows where it fits whole (the tooltips carry it too). */
@container xray (max-width: 900px) {
  .xray-editor-tools-hint { display: none; }
}

/* Spec S2, two type roles \u2014 data opt-ins. The panel's chrome reads in --xray-font-ui; these are
   data and keep the mono Font stack (--xray-font): the request heading's method, path, status,
   timing and size; header names and values; URL entry fields (.xray-input-data); timings and sizes
   wherever they appear (.xray-num, .xray-status-num); chart and frame values; diffs, initiators and
   tokens; console lines, log messages, their times and run times.
   Labels inside data (flags, JSON tags, console badges) stay chrome. Prefixed with the root so
   they win over single-class rules that set a whole \`font\`. */
.xray-app-root .xray-response-heading .xray-method,
.xray-app-root .xray-response-heading h3,
.xray-app-root .xray-response-chip,
.xray-app-root .xray-input-data,
.xray-app-root .xray-num,
.xray-app-root .xray-log-message,
.xray-app-root .xray-header-name,
.xray-app-root .xray-header-value,
.xray-app-root .xray-waterfall-legend strong,
.xray-app-root .xray-viz-value,
.xray-app-root .xray-frame-row,
.xray-app-root .xray-diff-path,
.xray-app-root .xray-diff-lines,
.xray-app-root .xray-initiator-list,
.xray-app-root .xray-token-body,
.xray-app-root .xray-console-row,
.xray-app-root .xray-console-time,
.xray-app-root .xray-cell-time,
.xray-app-root .xray-status-num {
  font-family: var(--xray-font);
}

.xray-app-root .xray-api-flag,
.xray-app-root .xray-json-tag,
.xray-app-root .xray-repeat-badge,
.xray-app-root .xray-truncated-badge,
.xray-app-root .xray-editor-hint-note {
  font-family: var(--xray-font-ui);
}

/* SQL tab: the extension's sql.html framed in the DevTools panel and pop-out window. */
.xray-sql-frame {
  display: block;
  flex: 1;
  width: 100%;
  min-height: 0;
  border: 0;
  background: var(--xray-bg);
}
`});var YT,JT=F(()=>{YT=`/* SQL page (sql.html). The theme scope is display:contents, so the app sizes itself to the
   viewport. Colours come only from --xray-* tokens. */

.xray-sql-app {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--xray-bg);
  color: var(--xray-text);
  font: 13px/1.4 var(--xray-font-ui);
}

.xray-sql-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 48px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--xray-border);
  background: var(--xray-surface);
}

.xray-sql-brand {
  font-weight: 800;
  letter-spacing: .04em;
  color: var(--xray-accent);
  margin-right: 4px;
}

.xray-sql-field {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--xray-subtext);
  font-size: 12px;
  font-weight: 600;
}

.xray-sql-check input {
  accent-color: var(--xray-accent);
  width: 14px;
  height: 14px;
  margin: 0;
}

.xray-sql-max-rows {
  width: 88px;
  height: 32px;
  padding: 0 8px;
}

.xray-sql-connection {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
  max-width: 320px;
  padding: 0 8px;
  border-left: 1px solid var(--xray-border);
}

.xray-sql-connection-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--xray-font);
  color: var(--xray-text);
}

.xray-sql-connection-meta,
.xray-sql-muted {
  color: var(--xray-hint);
  font-size: 12px;
  font-weight: 500;
}

.xray-sql-toolbar .xray-btn:disabled {
  opacity: .5;
  cursor: default;
}

.xray-sql-body {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  min-height: 0;
}

/* Schema rail */
.xray-sql-rail {
  min-height: 0;
  overflow: auto;
  padding: 8px 6px;
  border-right: 1px solid var(--xray-border);
  background: var(--xray-surface);
}

.xray-sql-rail-schema,
.xray-sql-rail-heading {
  padding: 8px 8px 4px;
  color: var(--xray-hint);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
}

.xray-sql-rail-count {
  margin-left: 4px;
  font-weight: 500;
}

.xray-sql-rail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 8px;
  border-radius: var(--xray-radius-sm);
  color: var(--xray-subtext);
  font-family: var(--xray-font);
  font-size: 12px;
  cursor: pointer;
}

.xray-sql-rail-item:hover,
.xray-sql-rail-item:focus-visible {
  background: var(--xray-hover);
  color: var(--xray-text);
}

.xray-sql-rail-item[aria-disabled="true"] {
  cursor: progress;
}

.xray-sql-rail-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-sql-empty {
  margin: 0;
  padding: 12px;
  color: var(--xray-hint);
  font-size: 12px;
}

/* Editor column */
.xray-sql-main {
  display: grid;
  grid-template-rows: auto minmax(96px, 2fr) minmax(160px, 3fr);
  min-width: 0;
  min-height: 0;
}

.xray-sql-editor-tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
  padding: 4px 8px 0;
  overflow-x: auto;
  border-bottom: 1px solid var(--xray-border);
  background: var(--xray-surface);
}

.xray-sql-editor-tab {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  max-width: 220px;
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: var(--xray-radius-sm) var(--xray-radius-sm) 0 0;
  color: var(--xray-subtext);
}

.xray-sql-editor-tab.active {
  border-color: var(--xray-border);
  background: var(--xray-bg);
  color: var(--xray-text);
}

.xray-sql-editor-tab-name,
.xray-sql-editor-tab-close {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.xray-sql-editor-tab-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 6px 4px 6px 10px;
  font: 600 12px/1 var(--xray-font-ui);
}

.xray-sql-editor-tab-close {
  display: inline-flex;
  padding: 4px 6px;
  opacity: .7;
}

.xray-sql-editor-tab-close:hover {
  opacity: 1;
}

.xray-sql-add-tab {
  width: 26px;
  height: 26px;
  margin-left: 4px;
}

.xray-sql-editor {
  min-height: 0;
  overflow: hidden;
  background: var(--xray-bg);
}

/* Bottom pane */
.xray-sql-bottom {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-height: 0;
  border-top: 1px solid var(--xray-border);
}

.xray-sql-bottom-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 40px;
  padding: 0 8px;
  background: var(--xray-surface);
  border-bottom: 1px solid var(--xray-border);
}

.xray-sql-bottom-tabs .xray-tab {
  height: 28px;
}

.xray-sql-running {
  color: var(--xray-pending);
  font-size: 12px;
  font-weight: 600;
}

.xray-sql-bottom-panel {
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.xray-sql-results {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.xray-sql-results-head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--xray-border);
}

.xray-sql-results-summary {
  color: var(--xray-subtext);
  font-size: 12px;
  font-weight: 600;
}

.xray-sql-toast {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  color: var(--xray-green);
  font-size: 12px;
}

.xray-sql-copy {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.xray-sql-copy .xray-btn {
  height: 26px;
  padding: 0 8px;
}

.xray-sql-results-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  flex: 1;
  min-height: 0;
}

/* Grid */
.xray-sql-grid {
  position: relative;
  min-height: 0;
  overflow: auto;
  font-family: var(--xray-font);
  font-size: 12px;
}

.xray-sql-grid-head {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--xray-surface2);
  border-bottom: 1px solid var(--xray-border);
}

.xray-sql-grid-th,
.xray-sql-grid-cell {
  position: absolute;
  top: 0;
  overflow: hidden;
  padding: 0 8px;
  white-space: pre;
  text-overflow: ellipsis;
  border-right: 1px solid var(--xray-border);
}

.xray-sql-grid-th {
  display: flex;
  align-items: center;
  color: var(--xray-text);
  font-weight: 700;
}

.xray-sql-grid-row {
  position: absolute;
  left: 0;
  border-bottom: 1px solid rgba(var(--xray-text-rgb), .05);
}

.xray-sql-grid-row:hover {
  background: rgba(var(--xray-text-rgb), .03);
}

.xray-sql-grid-cell {
  line-height: 26px;
  color: var(--xray-text);
  cursor: default;
}

.xray-sql-grid-cell.selected {
  background: var(--xray-selection);
  outline: 1px solid var(--xray-accent);
  outline-offset: -1px;
}

.xray-sql-grid-cell.kind-null {
  color: var(--xray-hint);
  font-style: italic;
}

.xray-sql-grid-cell.kind-number {
  color: var(--xray-peach);
  text-align: right;
}

.xray-sql-grid-cell.kind-blob {
  color: var(--xray-mauve);
}

.xray-sql-grid-cell.kind-json {
  color: var(--xray-teal);
}

.xray-sql-grid-index {
  position: sticky;
  left: 0;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 8px;
  color: var(--xray-hint);
  background: var(--xray-surface);
  border-right: 1px solid var(--xray-border);
}

/* Cell inspector */
.xray-sql-inspector {
  display: flex;
  flex-direction: column;
  width: min(380px, 40vw);
  min-height: 0;
  border-left: 1px solid var(--xray-border);
  background: var(--xray-surface);
}

.xray-sql-inspector-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px 4px 10px;
  border-bottom: 1px solid var(--xray-border);
}

.xray-sql-inspector-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 700;
}

.xray-sql-inspector-head .xray-icon-btn {
  width: 26px;
  height: 26px;
}

.xray-sql-inspector-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 8px 10px;
}

.xray-sql-inspector-text,
.xray-sql-confirm-sql {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font: 12px/1.5 var(--xray-font);
  color: var(--xray-text);
}

.xray-sql-confirm-sql {
  max-height: 240px;
  overflow: auto;
  padding: 8px 10px;
  border-radius: var(--xray-radius-sm);
  background: var(--xray-bg);
  border: 1px solid var(--xray-border);
}

/* Messages and History */
.xray-sql-messages,
.xray-sql-history {
  flex: 1;
  min-height: 0;
  overflow: auto;
  margin: 0;
  padding: 6px 0;
  list-style: none;
}

.xray-sql-message {
  padding: 3px 12px;
  font: 12px/1.5 var(--xray-font);
  color: var(--xray-subtext);
  white-space: pre-wrap;
}

.xray-sql-message.error {
  color: var(--xray-red);
}

.xray-sql-history-item {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 2px;
  width: 100%;
  padding: 6px 12px;
  border: 0;
  border-bottom: 1px solid rgba(var(--xray-text-rgb), .05);
  background: transparent;
  color: var(--xray-text);
  text-align: left;
  cursor: pointer;
}

.xray-sql-history-item:hover {
  background: var(--xray-hover);
}

.xray-sql-history-sql {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font: 12px/1.4 var(--xray-font);
}

.xray-sql-history-meta {
  color: var(--xray-hint);
  font-size: 11px;
}

.xray-sql-history-meta.error {
  color: var(--xray-red);
}

@media (max-width: 720px) {
  .xray-sql-body {
    grid-template-columns: 160px minmax(0, 1fr);
  }
}
`});var A3=In(()=>{var ZT=$(J1());UT();Ia();by();GT();Sd();XT();KT();JT();var $T=$(Ne()),lb=document.getElementById("xray-sql-root");async function C3(){try{let t=await uf(jT,{});return VT(t??{}).settings??Je}catch{return Je}}lb&&(async()=>{let t=document.createElement("style");t.setAttribute("data-xray-sql-ui","1"),t.textContent=`${WT.replace(/:host/g,"#xray-sql-root")}
${QT}
${YT}`,document.head.appendChild(t),lb.className="xray-app-root";let[e]=await Promise.all([C3(),Ty()]);window.addEventListener("pagehide",Oy),(0,ZT.createRoot)(lb).render((0,$T.jsx)(HT,{settings:e}))})()});return A3();})();
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
@tabler/icons-react/dist/esm/icons/IconAlertTriangle.mjs:
@tabler/icons-react/dist/esm/icons/IconChevronDown.mjs:
@tabler/icons-react/dist/esm/icons/IconDeviceFloppy.mjs:
@tabler/icons-react/dist/esm/icons/IconEye.mjs:
@tabler/icons-react/dist/esm/icons/IconFoldDown.mjs:
@tabler/icons-react/dist/esm/icons/IconFold.mjs:
@tabler/icons-react/dist/esm/icons/IconFolderOpen.mjs:
@tabler/icons-react/dist/esm/icons/IconPlayerPlay.mjs:
@tabler/icons-react/dist/esm/icons/IconPlayerStop.mjs:
@tabler/icons-react/dist/esm/icons/IconPlus.mjs:
@tabler/icons-react/dist/esm/icons/IconTable.mjs:
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
