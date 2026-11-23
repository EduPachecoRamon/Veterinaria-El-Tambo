import {defineConfig,loadEnv} from 'vite';

export default defineConfig(({mode})=>{
  const env=loadEnv(mode,process.cwd(),'VITE_');
  const verification=(env.VITE_GSC_VERIFICATION||'').trim();
  return {
    base:'/',
    plugins:[{
      name:'verification-meta',
      transformIndexHtml(html){
        if(!verification)return html;
        const value=verification.replace(/[^a-zA-Z0-9_-]/g,'');
        if(!value)return html;
        return html.replace('</head>',`  <meta name="google-site-verification" content="${value}">\n</head>`);
      }
    }]
  };
});
