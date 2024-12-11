# ExcaliSync

> A work in progress. Until this banner is removed, assume it is not functional. YET!

## WTF is this

[Excalidraw](https://github.com/excalidraw) is a really amazing sketching diagrams and prototyping product. But there is a lack of syncing functionality in the official release, for example, syncing with Github.

ExcaliSync is developed as a Chrome extension to facilitate this missing sync functionality. For the time being, MVP is focused on Github sync using Personal Authentication Token (PAT).

## How it works

1. Upstream direction: Excalidraw canvas data is stored in the browser's local storage. Upon user's interaction (click the sync button), ExcaliSync extracts those key-value's and uses Github API, authenticated with the supplied PAT, to create an excalisync-data repository and commit the data content to it.
2. Downstream direction: Upon user's click, ExcaliSync retrieves the file content and **attempts** to update the local storage. However this is currently NOT WORKING, because Excalidraw (the web app) keeps resetting it.

> I'm currently wrecking my brains out to resolve this issue. If you know how, feel free to send in a PR 🥲
