"""Regenerate independent numerical references; optional dependency: SciPy."""
from pathlib import Path
from scipy.stats import nct, t, chi
from scipy.special import ndtr
from scipy.integrate import quad
import json, math, scipy

ROOT=Path(__file__).resolve().parent.parent
def power(n,dz,alpha):
    df=n-1;c=t.ppf(1-alpha/2,df);lam=dz*math.sqrt(n)
    p=nct.sf(c,df,lam)+nct.cdf(-c,df,lam)
    if not math.isfinite(p):
        p=quad(lambda q:chi.pdf(q,df)*(ndtr(lam-c*q/math.sqrt(df))+ndtr(-lam-c*q/math.sqrt(df))),max(0,math.sqrt(df)-12),math.sqrt(df)+12,epsabs=1e-11)[0]
    return float(p)
def required_n(dz,target,alpha):
    if power(10000,dz,alpha)<target:return None
    lo,hi=5,10000
    while lo<hi:
        mid=(lo+hi)//2
        if power(mid,dz,alpha)>=target:hi=mid
        else:lo=mid+1
    return lo

cases=[(n,d,a) for n in [5,17,34,128,500,2000] for d in [0,.125,.25,.55,.75,1.2] for a in [.05,.01,.05/6]]
cases += [(n,d,a) for n in [5,17,500,5000] for d in [0,.05,.2,1.5,9.6] for a in [.025,.05/3,.05/15]]
power_rows=[dict(n=n,dz=d,alpha=a,expected=power(n,d,a)) for n,d,a in cases]
study=json.loads((ROOT/'src/cases/attarieh-2026.json').read_text())
planning=[]
for o in study['outcomes']:
    sd_pre=math.sqrt((o['sdE']**2+o['sdA']**2)/2)
    raw=(o['postE']-o['preE'])-(o['postA']-o['preA'])
    for mode in ['baseline','absolute','published']:
        delta={'baseline':.2*sd_pre,'absolute':.5,'published':abs(raw)}[mode]
        for sd in [2,4]:
            for alpha in [.05,.05/3,.05/15]:
                for target in [.8,.9]:
                    config=dict(mode=mode,absolute=.5,fraction=.2,sd=sd,alpha=alpha,target=target,loss=.2,n=17)
                    dz=delta/sd;n=required_n(dz,target,alpha)
                    planning.append(dict(outcome=o['id'],config=config,expected=dict(delta=delta,dz=dz,needed=n,recruit=None if n is None else math.ceil(n/.8),power=power(17,dz,alpha))))
references=dict(reference='SciPy '+scipy.__version__+' noncentral t; adaptive normal/chi quadrature for non-finite extreme tails',power=power_rows,planning=planning)
(ROOT/'tests/reference.json').write_text(json.dumps(references,ensure_ascii=False,indent=2)+'\n')
print('Referências:',len(power_rows),'casos de poder e',len(planning),'cenários de planejamento')
