# Cindie's Canon List — GitHub package

This package moves the **Canon List data and rendered HTML out of the JCink post**. The current directory was converted from the working Canon List and contains:

- **80 families**
- **160 family-tree branches**
- **800 character cards**

## Files

- `canon-loader.js` — the only GitHub script the JCink post needs to load.
- `canon-data.js` — all family, character, portrait, affiliation, group, and played-by data.
- `canon-list.js` — builds the A–Z tabs, family trees, cards, legend, and footer.
- `canon-list.css` — current group-color variables plus a loader error style.
- `jcink-post.txt` — the tiny replacement code for the JCink post.
- `ADD-A-BRANCH-EXAMPLE.js` — a small example showing the new data format.

## Important: keep your current Canon List layout CSS for now

Your existing JCink stylesheet already contains the layout/design rules for classes such as `.canonDirectory`, `.canonCard`, `.canonFamily`, `.canonTreeBranch`, etc. **Do not remove those layout rules yet.**

The included `canon-list.css` centralizes the group colors and is safe to load alongside the existing layout CSS. If you want, the layout CSS can be moved into this file later too.

## Upload to GitHub

1. In the GitHub repository you want to use, create a folder named `canon-list`.
2. Upload these files into that folder.
3. Make sure GitHub Pages is enabled for the repository.
4. Open `jcink-post.txt` and replace `YOUR-REPOSITORY` with the actual repository name.
5. Replace the contents of the Canon List JCink post with the code from `jcink-post.txt`.

The resulting post should look like this:

```html
[dohtml]
<div id="canon-directory"></div>
<script src="https://greenberryhair.github.io/YOUR-REPOSITORY/canon-list/canon-loader.js?v=1"></script>
[/dohtml]
```

## Updating the Canon List

Most future changes only require editing `canon-data.js`.

Each character card looks like this:

```js
{
  "classes": ["group-none"],
  "portrait": "https://i.imgur.com/MQw9YSE.gif",
  "name": "Kane Peltier",
  "info": "PB: Josh Brolin Age: ",
  "affiliations": ["SAMROCK"],
  "footer": "PLAYED BY OPEN"
}
```

A deceased card retains `canonDeceased` in its classes and stores its deceased label/footer automatically through the same card data.

## JCink user links

The old post contains JCink tags such as `[user=1,4]Angie[/user]`. Those tags cannot be parsed by JCink after JavaScript inserts the directory, so `canon-list.js` converts them into normal JCink profile links (`index.php?showuser=...`) automatically.

## Cache-busting after updates

The `?v=1` at the end of the loader URL is a version number. Normally GitHub Pages updates will appear without you changing it. If the browser keeps showing an old version after a GitHub update, change it in the JCink post to `?v=2`, then `?v=3`, and so on. The loader passes that same version to the CSS, data, and renderer files.

## Adding SAMROCK

SAMROCK is already included in the affiliation map using:

`https://i.imgur.com/GrK9K55.png`

and the group color is already included as `#7F3036`.
