<?php
return ['paths'=>['api/*'],'allowed_methods'=>['GET','POST','PUT','DELETE','OPTIONS'],'allowed_origins'=>array_filter(array_map('trim',explode(',',env('ALLOWED_ORIGINS','http://127.0.0.1:5173,http://localhost:5173')))),'allowed_origins_patterns'=>[],'allowed_headers'=>['Accept','Authorization','Content-Type'],'exposed_headers'=>[],'max_age'=>3600,'supports_credentials'=>false];
