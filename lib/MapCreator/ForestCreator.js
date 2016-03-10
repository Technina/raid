var Direction = require('../GameObjects/Direction');
var Map = require('../Map');
var MapLocation = require('../GameObjects/MapLocation');
var MapUtils = require('../Utils/MapUtils');
var MapOptions = require('./MapOptions');
var OpenSpaceFinder = require('./OpenSpaceFinder');
var TerrainType = require('../GameObjects/TerrainType');


function forest(height, width, mapOptions) {
    var start, exit, map, i, j, x, y;
    var primaryEnemy = mapOptions[MapOptions.PRIMARY_ENEMY];
    var secondaryEnemy = mapOptions[MapOptions.SECONDARY_ENEMY];
    var swarmEnemy = mapOptions[MapOptions.SWARM_ENEMY];
    var rareEnemy = mapOptions[MapOptions.RARE_ENEMY];
    var boss = mapOptions[MapOptions.BOSS_ENEMY];
    var fill = mapOptions[MapOptions.TERRAIN_FILL] || 1;
    var roundLimit = mapOptions[MapOptions.ROUND_LIMIT] || 1000;
    var terrainDensity = mapOptions[MapOptions.TERRAIN_DENSITY] || .5;

    exit = new MapLocation(0, 0);
    start = new MapLocation(width - 1, height - 1);

    // how dense the forest is [0,1]
    map = new Map(height, width, start, exit, roundLimit, TerrainType.GRASS);


    var centers = MapUtils.createSpacedOutLocations(width, height, fill, 49, start, exit);

    // grow forest randomly around centers
    for (i = 2; i < centers.length; i++) {
        var center = centers[i];
        map.createTile(center, TerrainType.TREE);
        for (x = -1; x<=1; x++) {
            for (y = -1; y<=1; y++) {
                if (x === 0 && y=== 0) {
                    continue;
                }
                loc = new MapLocation(center.x + x, center.y + y);
                if (Math.random() < .9 * terrainDensity) {
                    map.createTile(loc, TerrainType.TREE);
                } else if (rareEnemy && Math.random() < .1 && !map.getUnitAtLoc(loc)) {
                    map.clearLoc(loc, TerrainType.GRASS);
                    map.addToSpawnList(rareEnemy, loc);
                }
            }
        }

        for (x = -2; x<=2; x++) {
            for (y = -2; y<=2; y++) {
                if (Math.abs(x) !== 2 && Math.abs(y) !== 2) {
                    continue;
                }
                loc = new MapLocation(center.x + x, center.y + y);
                if (Math.random() < .4 * terrainDensity) {
                    map.createTile(loc, TerrainType.TREE);
                } else if (Math.random() < .25 && !map.getUnitAtLoc(loc)) {
                    map.clearLoc(loc, TerrainType.GRASS);
                    map.addToSpawnList(primaryEnemy, new MapLocation(center.x + x, center.y + y));
                }
            }
        }

        for (x = -3; x<=3; x++) {
            for (y = -3; y<=3; y++) {
                if (Math.abs(x) !== 3 && Math.abs(y) !== 3) {
                    continue;
                }
                loc = new MapLocation(center.x + x, center.y + y);
                if (Math.random() < .3 * terrainDensity) {
                    map.createTile(loc, TerrainType.TREE);
                } else if(secondaryEnemy && Math.random() < .1 && !map.getUnitAtLoc(loc)) {
                    map.clearLoc(loc, TerrainType.GRASS);
                    map.addToSpawnList(secondaryEnemy, loc);
                }
            }
        }

        for (x = -4; x<=4; x++) {
            for (y = -4; y<=4; y++) {
                if (Math.abs(x) !== 4 && Math.abs(y) !== 4) {
                    continue;
                }
                loc = new MapLocation(center.x + x, center.y + y);
                if (Math.random() < .2 * terrainDensity) {
                    map.createTile(loc, TerrainType.TREE);
                }
            }
        }
    }

    // spawn the boss at the exit
    if (boss) {
        map.addToSpawnList(boss, exit.add(Direction.SOUTH_EAST));
    }


    if (swarmEnemy) {
        var openSpaces = OpenSpaceFinder.findOpenSpaces(map);
        for (i = 0; i < Math.min(2, openSpaces.length); i++) {
            center = openSpaces[i].center;
            radius = openSpaces[i].radius;
            radius = Math.min(radius, 1);
            for (x = -radius; x <= radius; x++) {
                for (y = -radius; y <= radius; y++) {
                    loc = new MapLocation(center.x + x, center.y + y);
                    if (loc.distanceSquaredTo(center) > radius * radius) {
                        continue;
                    }
                    if (map.isOnMap(loc) && map.isPassable(loc) && !map.spawnListContains(loc)) {
                        map.addToSpawnList(swarmEnemy, loc);
                    }
                }
            }
        }

    }


    return map;
}


module.exports = {
    "create": forest
};