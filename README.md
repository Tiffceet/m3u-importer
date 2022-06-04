# m3u-importer
Simple CLI to import .m3u playlist into [Music Player by Mobile_V5](https://play.google.com/store/apps/details?id=media.music.musicplayer&hl=en&gl=US)

## Install
```
npm install -g .
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