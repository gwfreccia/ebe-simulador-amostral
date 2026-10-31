const {test}=require('node:test');
const assert=require('node:assert/strict');
const stats=require('../src/stats.js'),planning=require('../src/planning.js');
const reference=require('./reference.json');
reference.power.forEach((r,i)=>test(`power reference ${i+1}: n=${r.n}, dz=${r.dz}, alpha=${r.alpha}`,()=>{
 assert.ok(Math.abs(stats.power(r.n,r.dz,r.alpha)-r.expected)<3e-6);
}));
reference.planning.forEach((r,i)=>test(`planning reference ${i+1}: ${r.outcome} ${r.config.mode}`,()=>{
 const actual=planning.scenario(planning.outcomes.find(o=>o.id===r.outcome),r.config);
 for(const key of ['delta','dz','power'])assert.ok(Math.abs(actual[key]-r.expected[key])<3e-6,key);
 assert.equal(actual.needed,r.expected.needed);assert.equal(actual.recruit,r.expected.recruit);
}));
// Source checks are anchored to the published marginal table, not the calculator.
const source=[['gmax',7.164146843832837,1.7],['gmed',8.981369606023348,-.9],['prox',5.103920062069938,-1.6],['mid',7.805767098754613,1.9],['dist',10.470195795685962,4.8]];
source.forEach(([id,sd,raw])=>test(`published source: ${id}`,()=>{
 const o=planning.outcomes.find(o=>o.id===id);
 assert.ok(Math.abs(planning.baselineSD(o)-sd)<1e-12);
 assert.ok(Math.abs(planning.rawDifference(o)-raw)<1e-12);
}));
test('the build is self contained and case data retain numeric p labels',()=>{
 const fs=require('node:fs'),html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
 assert.ok(!html.includes('/Users/'));assert.ok(!/__[A-Z0-9_]+__/.test(html));assert.ok(!/<script[^>]*src=/.test(html));
 const data=JSON.parse(html.match(/<script id="case-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
 assert.equal(data.outcomes[0].p,'<0,001');
});
