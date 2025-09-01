<script>
  import { authStore } from '../../stores/authStore';

  let username = '';
  let password = '';
  let password2 = '';

  async function handleLogin(event) {
    event.preventDefault();
    await authStore.login(username, password);
  }

  async function handleRegister(event) {
    event.preventDefault();
    await authStore.register(username, password, password2);
  }

  function handleLogout() {
    authStore.logout();
  }
</script>

<main class="login">
  <div class="container">
    {#if $authStore.username}
      <div class="box">
        <h2>Logged in as {$authStore.username}</h2>
        <button on:click={handleLogout}>LOG OUT</button>
      </div>
    {:else}
      <div class="box">
        <h2>LOG IN</h2>
        <form on:submit={handleLogin}>
          <input type="text" placeholder="Username" required bind:value={username}>
          {#if $authStore.messages.loginUsername}
            <p class="error">{$authStore.messages.loginUsername[0]}</p>
          {/if}
          <input type="password" placeholder="Password" required bind:value={password}>
          {#if $authStore.messages.loginPassword}
            <p class="error">{$authStore.messages.loginPassword[0]}</p>
          {/if}
          <button type="submit">LOG IN</button>
        </form>
        {#if $authStore.messages.loginOther}
          <p class="error">{$authStore.messages.loginOther[0]}</p>
        {/if}
      </div>

      <div class="box">
        <h2>REGISTER</h2>
        <form on:submit={handleRegister}>
          <input type="text" placeholder="Username" required bind:value={username}>
          {#if $authStore.messages.registerUsername}
            <p class="error">{$authStore.messages.registerUsername[0]}</p>
          {/if}
          <input type="password" placeholder="Password" required bind:value={password}>
          {#if $authStore.messages.registerPassword}
            <p class="error">{$authStore.messages.registerPassword[0]}</p>
          {/if}
          <input type="password" placeholder="Repeat Password" required bind:value={password2}>
          {#if $authStore.messages.registerPasswordRepeat}
            <p class="error">{$authStore.messages.registerPasswordRepeat[0]}</p>
          {/if}
          <button type="submit">REGISTER</button>
        </form>
        {#if $authStore.messages.registerOther}
          <p class="error">{$authStore.messages.registerOther[0]}</p>
        {/if}
      </div>
    {/if}
  </div>
</main>

<style>
  .login {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }

  .container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 30px;
  }

  .box {
    background-color: rgba(255, 255, 255, 0.05);
    padding: 0 1em 1em;
    width: 300px;
  }

  .login h2 {
    color: var(--cyan);
    margin-bottom: 1em;
    text-align: center;
  }

  .login p {
    color: var(--white);
  }

  .login form {
    display: flex;
    flex-direction: column;
    gap: 1em;
  }

  .login input {
    padding: 0.5em;
    border: none;
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--white);
  }

  .login button {
    padding: 0.5em;
    border: none;
    background-color: var(--cyan);
    color: var(--black);
    font-weight: bold;
    cursor: pointer;
    width: 100%;
  }

  .login button:hover {
    background-color: var(--magenta);
  }

  .login .error {
    color: red;
    margin-bottom: 0.5em;
  }
</style>