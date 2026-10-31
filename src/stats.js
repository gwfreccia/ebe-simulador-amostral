/* Numerical paired-t design analysis. No observed-power reconstruction.
   Power = integral over Q~chi(df) of
   Phi(lambda-c*Q/sqrt(df)) + Phi(-lambda-c*Q/sqrt(df)),
   lambda=dz*sqrt(n), c=t_(1-alpha/2,df). */
(function(root){
'use strict';
const lc=[676.5203681218851,-1259.1392167224028,771.3234287776531,-176.6150291621406,12.507343278686905,-0.13857109526572012,9.984369578019572e-6,1.5056327351493116e-7];
function logGamma(z){if(z<.5)return Math.log(Math.PI)-Math.log(Math.sin(Math.PI*z))-logGamma(1-z);z-=1;let x=.9999999999998099;for(let i=0;i<lc.length;i++)x+=lc[i]/(z+i+1);let t=z+7.5;return .9189385332046727+(z+.5)*Math.log(t)-t+Math.log(x);}
function betaCF(a,b,x){let qab=a+b,qap=a+1,qam=a-1,c=1,d=1-qab*x/qap;if(Math.abs(d)<1e-300)d=1e-300;d=1/d;let h=d;for(let m=1;m<=300;m++){let m2=2*m,aa=m*(b-m)*x/((qam+m2)*(a+m2));d=1+aa*d;if(Math.abs(d)<1e-300)d=1e-300;c=1+aa/c;if(Math.abs(c)<1e-300)c=1e-300;d=1/d;h*=d*c;aa=-(a+m)*(qab+m)*x/((a+m2)*(qap+m2));d=1+aa*d;if(Math.abs(d)<1e-300)d=1e-300;c=1+aa/c;if(Math.abs(c)<1e-300)c=1e-300;d=1/d;let del=d*c;h*=del;if(Math.abs(del-1)<3e-14)break;}return h;}
function betaI(x,a,b){if(x<=0)return 0;if(x>=1)return 1;const bt=Math.exp(logGamma(a+b)-logGamma(a)-logGamma(b)+a*Math.log(x)+b*Math.log1p(-x));return x<(a+1)/(a+b+2)?bt*betaCF(a,b,x)/a:1-bt*betaCF(b,a,1-x)/b;}
function tCDF(t,df){const q=.5*betaI(df/(df+t*t),df/2,.5);return t>=0?1-q:q;}
const critCache=new Map();
function criticalT(n,alpha=.05){const key=n+':'+alpha;if(critCache.has(key))return critCache.get(key);let lo=0,hi=32;for(let i=0;i<52;i++){let m=(lo+hi)/2;if(tCDF(m,n-1)<1-alpha/2)lo=m;else hi=m;}let v=(lo+hi)/2;critCache.set(key,v);return v;}
function normalCDF(x){const z=Math.abs(x)/Math.SQRT2,t=1/(1+.5*z);const tau=t*Math.exp(-z*z-1.26551223+t*(1.00002368+t*(.37409196+t*(.09678418+t*(-.18628806+t*(.27886807+t*(-1.13520398+t*(1.48851587+t*(-.82215223+t*.17087277)))))))));return x>=0?1-.5*tau:.5*tau;}
function power(n,dz,alpha=.05){n=Math.round(n);if(n<5||!Number.isFinite(dz)||dz<0||alpha<=0||alpha>=1)throw Error('Invalid paired-t design');const df=n-1,c=criticalT(n,alpha),lambda=dz*Math.sqrt(n),upper=Math.sqrt(df)+12;let steps=Math.ceil(upper/.04);if(steps%2)steps++;const h=upper/steps,logC=(1-df/2)*Math.LN2-logGamma(df/2);let sum=0;for(let i=1;i<steps;i++){const q=i*h,density=Math.exp(logC+(df-1)*Math.log(q)-q*q/2),cut=c*q/Math.sqrt(df);sum+=(i%2?4:2)*density*(normalCDF(lambda-cut)+normalCDF(-lambda-cut));}return Math.max(0,Math.min(1,sum*h/3));}
function requiredN(dz,target=.8,alpha=.05,limit=10000){if(dz<=0)return null;if(power(limit,dz,alpha)<target)return null;let lo=5,hi=limit;while(lo<hi){const mid=Math.floor((lo+hi)/2);if(power(mid,dz,alpha)>=target)hi=mid;else lo=mid+1;}return lo;}
function detectableD(n,target=.8,alpha=.05){let lo=0,hi=5;for(let i=0;i<40;i++){const mid=(lo+hi)/2;if(power(n,mid,alpha)>=target)hi=mid;else lo=mid;}return (lo+hi)/2;}
function pairedSD(sdChange,rho,sem){return Math.sqrt(2*sdChange*sdChange*(1-rho)+4*sem*sem);}
const api={logGamma,tCDF,criticalT,normalCDF,power,requiredN,detectableD,pairedSD};
if(typeof module!=='undefined'&&module.exports)module.exports=api;root.EBEStats=api;
})(typeof globalThis!=='undefined'?globalThis:this);
