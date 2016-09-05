var RayTracer = function(lightpos, camerapos, diffusedlight) {
    this.INF = 9999999;
    //this.width=w;
    //this.height=h;
    this.objects = [];
    this.maxTraceDepth = 5;
    //this.lightLocation = lightpos;
    this.cameraLocation = camerapos|| new Vector3();
    this.diffusedLight = diffusedlight||new Vector3(20, 20, 20);

    this.raytrace = function(rayorigin, raydir, objects, lightLocation) {
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

        // else return the pixel intensity
        // TODO: add recursion
        
        // we might be inside the sphere, so dot of normal and raydir may be aligned
        var inside = false;
        if (nearestnorm.dot(raydir)>0){ inside=true; nearestnorm.scale(-1);}

        // now raydir is direction from intersection point to light source
        rayorigin = nearestpoint;
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
    };
};
