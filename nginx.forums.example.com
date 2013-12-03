# nginx config a nodebb running on
# forums.example.com
# from here: https://github.com/designcreateplay/NodeBB/wiki/Configuring-nginx-as-a-proxy-to-NodeBB

upstream nodebb {
    server 127.0.0.1:4567;
}

server {
	listen   80;
	root /home/admin/code/NodeBB;
	server_name forums.example.com;

        access_log /var/log/nginx/access.forums.example.com.log;
        error_log /var/log/nginx/error.forums.example.com.log crit;

	location / {
       	 	proxy_set_header X-Real-IP $remote_addr;
        	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        	proxy_set_header Host $http_host;
        	proxy_set_header X-NginX-Proxy true;

        	proxy_pass http://nodebb/;
       	 	proxy_redirect off;

        	# Socket.IO Support
        	proxy_http_version 1.1;
        	proxy_set_header Upgrade $http_upgrade;
        	proxy_set_header Connection "upgrade";
    	}
}