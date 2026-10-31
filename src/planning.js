/* Published marginal summaries are source data. Paired variability is an
   explicit design assumption: it is not recovered from ANCOVA F/t values. */
(function(root){
'use strict';
const stats=typeof module!=='undefined'&&module.exports?require('./stats.js'):root.EBEStats;
const study=typeof module!=='undefined'&&module.exports?require('./cases/attarieh-2026.json'):JSON.parse(document.getElementById('case-data').textContent);
const outcomes=study.outcomes.map(Object.freeze);
function baselineSD(o){return Math.sqrt((o.sdE**2+o.sdA**2)/2);}
function rawDifference(o){return (o.postE-o.preE)-(o.postA-o.preA);}
function targetDelta(o,mode,absolute,fraction){
 if(mode==='baseline')return fraction*baselineSD(o);
 if(mode==='published')return Math.abs(rawDifference(o));
 return absolute;
}
function scenario(o,{mode,absolute,fraction,sd,alpha,target,loss,n}){
 const delta=targetDelta(o,mode,absolute,fraction),dz=delta/sd;
 const needed=stats.requiredN(dz,target,alpha);
 return {id:o.id,delta,dz,needed,recruit:needed===null?null:Math.ceil(needed/(1-loss)),power:stats.power(n,dz,alpha),baselineSD:baselineSD(o)};
}
const api={study,outcomes,baselineSD,rawDifference,targetDelta,scenario};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.EBEPlanning=api;
})(typeof globalThis!=='undefined'?globalThis:this);
