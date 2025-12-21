declare module 'osm-pbf-parser' {
  import { Transform } from 'stream';

  function parseOSM(): Transform;
  export = parseOSM;
}
