var fs = require('fs');
var path = require('path');
var util = require('./util');
var dive = require('diveSync');

var packageObj = {};

var filter = function( fpath, dir) {

    if(dir) return true;
    
    if ( path.extname(fpath) == '.js') {
        return true;
    }

    return false;
}

var addDir = function(dir,root_dir) {

    var options = {
        filter: filter,
    };

    dive(dir,options,function(err,file){

        if( err ) throw err;

        var relpath = path.relative(root_dir,file);
        packageObj[relpath] = fs.readFileSync(file).toString();
    });

}

addEntry = function(entry_path,root_dir){

    var entry = path.join(root_dir,entry_path);
    var rentry = path.relative(root_dir,entry);

    packageObj[rentry] = fs.readFileSync(entry).toString();
}

exports.generate = function(root_dir,entry_point,extra){

    var node_modules = path.join(root_dir,'node_modules');

    addDir(node_modules,root_dir);

    var stat;

    extra.forEach(function(entry){
        stat = fs.stat(entry);

        if( !stat ) {
            util.log('Extra entry does not exist ( '+entry+' )','warn');
        } else {
            if(stat.isDirectory()){
                addDir(entry,root_dir);
            } else {
                addEntry(entry,root_dir);
            }
        }
        
    })

    addEntry(entry_point,root_dir);
    
    return packageObj;
}