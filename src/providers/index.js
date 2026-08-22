const PROVIDERS = {
  openai:{ prefix:'/v1/', env:'OPENAI_API_KEY', auth:(key,h)=>{h.set('authorization',`Bearer ${key}`)} },
  anthropic:{ prefix:'/anthropic/v1/', env:'ANTHROPIC_API_KEY', auth:(key,h)=>{h.set('x-api-key',key);if(!h.has('anthropic-version'))h.set('anthropic-version','2023-06-01')} }
};
export function resolve(path, cfg) {
  const provider=path.startsWith('/anthropic/')?'anthropic':'openai';
  const p=PROVIDERS[provider];
  if (!path.startsWith(p.prefix)) return null;
  const upstreamPath=provider==='anthropic'?path.slice('/anthropic'.length):path;
  const base=provider==='anthropic'?cfg.anthropicUrl:cfg.openaiUrl;
  const url=new URL(upstreamPath,base);
  if (!['https:','http:'].includes(url.protocol)) throw new Error('Invalid provider URL protocol');
  return {provider,url,definition:p};
}
export function safeHeaders(incoming, definition) {
  const h=new Headers();
  const blocked=['host','content-length','authorization','proxy-authorization','x-api-key','cookie','set-cookie','connection','keep-alive','proxy-authenticate','te','trailer','transfer-encoding','upgrade','x-modelgate-app','x-modelgate-user','x-modelgate-feature','x-modelgate-tags'];
  for(const [k,v] of Object.entries(incoming)) if(v && !blocked.includes(k.toLowerCase())) h.set(k,Array.isArray(v)?v.join(','):v);
  const key=process.env[definition.env];
  if(key) definition.auth(key,h);
  return h;
}
export function usage(provider, json) {
  const u=json?.usage||json?.response?.usage||{};
  const input=u.prompt_tokens??u.input_tokens??0, output=u.completion_tokens??u.output_tokens??0;
  return {input,output,total:u.total_tokens??input+output};
}
