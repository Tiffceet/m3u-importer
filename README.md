# m3u-importer
Simple CLI to import .m3u playlist into [Music Player by Mobile_V5](https://play.google.com/store/apps/details?id=media.music.musicplayer&hl=en&gl=US)

## Dependency
```
node ^16.15.0
```

## Install locally
```
npm install
npm pack .
npm install -g m3u-importer
```

## Usage
```
> pli --help
Usage: pli <command>

Commands:
  pli generate  Generate blank db file with preset template
  pli list      list playlists in db
  pli migrate   migrate .m3u playlist into db
  pli remove    remove all playlist from db

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```