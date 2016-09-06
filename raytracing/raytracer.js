var RayTracer = function(lightpos, camerapos, diffusedlight) {
    this.INF = 9999999;
    //this.width=w;
    //this.height=h;
    this.objects = [];
    this.maxTraceDepth = 5;
    //this.lightLocation = lightpos;
    this.cameraLocation = camerapos|| new Vector3();
    this.diffusedLight = diffusedlight||new Vector3(0.1, 0.1, 0.1);

    this.mix = function(a,b,m) {
        return b*m+a*(1-m);
    };

    this.raytrace = function(rayorigin, raydir, objects, lightLocation, depth) {
        var nearestdist = this.INF;
        var nearestnorm;
        var nearestobj=null;
        var nearestpoint;
        for(var x in objects) {
            var intersect = objects[x].intersect(rayorigin, raydir);
            if(intersect.intersect) {
                if (intersect.dist<nearestdist) {
                    nearestdist = intersect.dist;
                    nearestnorm = intersect.normal;
                    nearestpoint= intersect.point;
                    nearestobj = objects[x];
                }
            }
        }
        // now we have nearest point/object
        // if it is null, return black
        if(nearestobj==null){
            return new Vector3(0,0,0);
        }

        // next origin point
        rayorigin = nearestpoint;

        var surfaceColor = new Vector3(this.diffusedLight.x, this.diffusedLight.y, this.diffusedLight.z);

        
        // we might be inside the sphere, so dot of normal and raydir may be aligned
        var inside = false;
        if (nearestnorm.dot(raydir)>0){ inside=true; nearestnorm = nearestnorm.scale(-1);}
        if((nearestobj.transparency > 0 || nearestobj.reflection > 0) && depth < this.maxTraceDepth) {
            var facingratio = - raydir.dot(nearestnorm);
            // change mix to tweak effect
            var fresneleffect = this.mix(Math.pow(1-facingratio,3), 1, 0.1);
            // compute reflection direction
            var normalizednorm = nearestnorm.normalize();
            var refldir = raydir.diff(normalizednorm.scale(2*raydir.dot(normalizednorm)));
            refldir = refldir.normalize();

            var reflection = this.raytrace(rayorigin, refldir, objects, lightLocation, depth+1);

            var refraction = new Vector3(0,0,0);
            // if the sphere is also transparent compute refraction ray
            if (nearestobj.transparency) {
                var ior = 1.1, eta = (inside) ? ior: 1/ior; // inside or outside
                var cosi = -nearestnorm.dot(raydir);
                var k = 1-eta*eta*(1-cosi*cosi);
                var refrdir = raydir.scale(eta).add(nearestnorm.scale(eta*cosi - Math.sqrt(k)));
                refrdir = refrdir.normalize();
                refraction = this.raytrace(rayorigin, refrdir, objects, lightLocation, depth+1);
            }
            // the result is a mix of reflection and refraction(if transparent)
            /*
            surfaceColor = surfaceColor.
                            add((reflection.scale(fresneleffect).
                                add(refraction.
                                    scale((1-fresneleffect)*nearestobj.transparency)).
                                multiply(nearestobj.surfaceColor)));
            */
            var surfaceillum = nearestobj.surfaceColor.scale(0.8*Math.max(0,- nearestnorm.dot(raydir)));
            //surfaceColor = surfaceColor.add(reflection.scale(fresneleffect)).add(surfaceillum);
            surfaceColor = surfaceColor.add(surfaceillum).add(reflection.scale(fresneleffect)).add(refraction.scale((1-fresneleffect)*nearestobj.transparency));
        }
        else {
            // it's a diffuse object, no need to raytrace any further
            // now raydir is direction from intersection point to light source
            raydir = lightLocation.diff(rayorigin);
            raydir = raydir.normalize();

            // now check if any spheres cast shadow on this nearest object
            var shadowed = false;
            for (var x in objects) {
                var intersect = objects[x].intersect(rayorigin, raydir);
                if (intersect.intersect) { 
                    shadowed = true;
                    break;
                }
            }
            if (!shadowed) {
                // return diffusedlight + emissionlight*normal.dot(raydir)
                var temp = nearestobj.surfaceColor.scale(0.8*Math.max(0,nearestnorm.dot(raydir)));
                surfaceColor = surfaceColor.add(temp);
            }

        }

            return surfaceColor;
        /*
        // now raydir is direction from intersection point to light source
        raydir = lightLocation.diff(rayorigin).normalize();

        // now check if any spheres cast shadow on this nearest object
        var shadowed = false;
        for (var x in objects) {
            var intersect = objects[x].intersect(rayorigin, raydir);
            if (intersect.intersect){
                shadowed = true;
                break;
            }
        }
        if(shadowed) {
            // return diffusedlight
            return this.diffusedLight;
        }
        else {
            // return diffusedlight + emissionlight*normal.dot(raydir)
            var temp = nearestobj.emissioncolor.scale(nearestnorm.dot(raydir));
            var light = this.diffusedLight.add(temp);
            return new Vector3(Math.min(light.x, 255), Math.min(light.y,255), Math.min(light.z, 255));
        }
        */
    };
};
