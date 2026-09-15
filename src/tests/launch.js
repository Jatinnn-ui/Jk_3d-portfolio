const params=new URLSearchParams(location.search);params.set('selftest','1');location.replace(`index.html?${params}`);
