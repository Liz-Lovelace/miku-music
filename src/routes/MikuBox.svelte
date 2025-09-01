<div>
  <div id="lasers"></div>
  <div class="mikubox">
    <img src="/miku1.gif" alt="animation of hatsune miku dancing"/>
    <img src="/miku2.gif" alt="animation of hatsune miku dancing"/>
    <img src="/miku3.gif" alt="animation of hatsune miku dancing"/>
    <img src="/miku4.gif" alt="animation of hatsune miku dancing"/>
    <img src="/miku5.gif" alt="animation of hatsune miku dancing"/>
  </div>
</div>

<style>
  #lasers {
    background-image: url("bg_eb.png");
    background-size: cover;
    width: 100vw;
    height: 100vh;
    position: fixed;
    z-index: -1005;
    image-rendering: pixelated;
  }

  .mikubox {
    display: flex;
    justify-content: center;
  }

  .mikubox img {
    height: 15vw;
    object-fit: cover;
    margin: 4vh -2vw 0;
  }
</style>