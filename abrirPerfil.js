/*
// Olá, pessoal!
// 
// Estou enfrentando um problema com uma função assíncrona que utiliza await page.evaluate. 
// Ela funciona em alguns sites, mas não em outros. O nome da função é passwordDisplayNone(). 
// Se alguém puder dar uma olhada e sugerir melhorias, ficarei muito grato!
// 
*/




const fs = require("fs");
const { pool } = require("./pool");
const { v4: uuidv4 } = require("uuid");
const puppeteer = require("puppeteer-extra");
const { chromePath, chromePath2 } = require("./config");
const path = require("node:path");
const { Cookie, CookieJar } = require("tough-cookie");
const { dbConfig } = require("./pool");
const { app } = require("./app");


const copyDirectory = (src, dest) => {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, {
        recursive: true,
      });
    }
  
    const entries = fs.readdirSync(src, {
      withFileTypes: true,
    });
  
    for (let entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
  
      if (entry.isDirectory()) {
        copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  
  // Adicione essa função para verificar e bloquear URLs específicas
  //const bloquearUrl = async (url, page, browser) => {
  //  const urlsBloqueadas = [
  //    'https://app.toolzbuy.com/member'
  //  ];//
  
  //  if (urlsBloqueadas.some(bloqueada => url.includes(bloqueada))) {
  //    console.log(`URL bloqueada acessada: ${url}`);
  //    try {
  //      await page.close(); // Fecha a página
  //      console.log(`Página fechada: ${url}`);
  //    } catch (error) {
  //      console.error('Erro ao fechar a página:', error);
  //    }
  //    // Opcionalmente, você pode fechar o navegador se preferir
  //    // try {
  //    //   await browser.close();
  //    //   console.log('Navegador fechado.');
  //    // } catch (error) {
  //    //   console.error('Erro ao fechar o navegador:', error);
  //    // }
  //  }
  //};//
  
  //// Adapte a função de interceptação de solicitações
  //const handleRequest = async (request, page, browser) => {
  //  const url = request.url();
  //  await bloquearUrl(url, page, browser);
  //  request.continue(); // Continue com a solicitação
  //};
  
  let browserInstances = {};
  
  const abrirPerfil = (perfilId, cdTp, callback) => {
    console.log("Iniciando abertura de perfil!");
  
    pool.getConnection(async (err, connection) => {
      if (err) {
        console.error("Erro ao obter conexão do pool:", err);
        return callback(err);
      }
  
      try {
        connection.query(
          "SELECT * FROM perfis WHERE id = ?",
          [perfilId],
          async (err, result) => {
            if (err) {
              console.error("Erro ao buscar o perfil no banco de dados:", err);
              connection.release();
              return callback(err);
            }
  
            const perfil = result[0];
            console.log("Dados do perfil:", perfil);
  
            if (!perfil) {
              console.error("Perfil não encontrado para o ID:", perfilId);
              connection.release();
              return callback(new Error("Perfil não encontrado"));
            }
  
            const userDataDir = path.join(chromePath2, "xp.pak/u.d");
            const extensionsSrc = path.join(__dirname, "./extensions");
            const extensionsDest = path.join(chromePath2, "xp.pak/e.t/");
  
            const removeUserDataDir = () => {
              if (fs.existsSync(userDataDir)) {
                fs.rmSync(userDataDir, {
                  recursive: true,
                  force: true,
                });
                console.log("Pasta user_data removida:", userDataDir);
              }
            };
  
            let browser;
  
            try {
              copyDirectory(extensionsSrc, extensionsDest);
              console.log("Extensões copiadas para:", extensionsDest);
  
              console.log("Caminho do Chrome:", chromePath);
  
              const extensions = [
                path.join(
                  extensionsDest,
                  "adm/dnacggjlcbpfcfchkkogedlkenpnlfbi/0.1.0_0"
                ), //Session Share
                //path.join(extensionsDest, 'adm/ebgdhmgjmhiafcmpchhokcililaenfnl/Toolzbuy_Secure_Extension/'),
                path.join(
                  extensionsDest,
                  "adm/jhfdopioefedmmoggcdffmeanlmhdmfn/"
                ), //Ferramentas de seo
                path.join(
                  extensionsDest,
                  "adm/mjackmipnhegkhekpebhmnkhkaojdldn/0.28.1_0"
                ), //BkReviews
                path.join(
                  extensionsDest,
                  "adm/mpbjkejclgfgadiemmefgebjfooflfhl/3.1.0_0/"
                ), //Recaptch Booster
                path.join(
                  extensionsDest,
                  "adm/neaplmfkghagebokkhpjpoebhdledlfi/1.13.0_0/"
                ), //Cookies Editor
                //path.join(extensionsDest, 'adm/hdokiejnpimakedhajhdlcegeplioahd/4.132.0_0'),//LastPass
                //path.join(extensionsDest, 'adm/pnlccmojcmeohlpggmfnbbiapkmbliob/9.6.5.0_0') //Robo de formularios
                //path.join(extensionsDest, 'adm/caljgklbbfbcjjanaijlacgncafpegll/2.21.0.4923_0')//Avira Password
              ];
  
              const extensionsCli = [
                //path.join(extensionsDest, 'cli/fcalmfadpleifkccddppehlifkhbolcp/BlackHat_Performance_v2/'),//BlackHat Perfomance
                //path.join(extensionsDest, 'cli/ebgdhmgjmhiafcmpchhokcililaenfnl/Toolzbuy_Secure_Extension/'),
                path.join(
                  extensionsDest,
                  "cli/mjackmipnhegkhekpebhmnkhkaojdldn/0.28.1_0/"
                ), //BkReviews
                path.join(
                  extensionsDest,
                  "cli/mpbjkejclgfgadiemmefgebjfooflfhl/3.1.0_0/"
                ), //Recaptch Booster
                //path.join(extensionsDest, 'cli/hdokiejnpimakedhajhdlcegeplioahd/4.132.0_0'),//LastPass
                //path.join(extensionsDest, 'cli/pnlccmojcmeohlpggmfnbbiapkmbliob/9.6.5.0_0') //Robo de formularios
                //path.join(extensionsDest, 'cli/caljgklbbfbcjjanaijlacgncafpegll/2.21.0.4923_0')//Avira Password
              ];
  
              console.log(extensions);
              console.log("Path do user_data:", userDataDir);
  
              const proxyServer = perfil.host;
              const proxyUsername = perfil.userproxy;
              const proxyPassword = perfil.passproxy;
  
              const argsAdm = [
                `--load-extension=${extensions}`,
                `--proxy-server=${proxyServer}`,
              ];
              const args = [
                `--proxy-server=${proxyServer}`,
                "--devtools-flags=disable",
                "--no-sandbox",
                "--disable-infobars",
                "--no-zygote",
                "--no-first-run",
                "--window-position=0,0",
                "--ignore-certificate-errors",
                "--disable-extensions",
                "--disable-blink-features=AutomationControlled",
                `--disable-extensions-except=${extensionsCli}`,
                `--load-extension=${extensionsCli}`,
                "--disable-features=LookalikeUrlNavigationSuggestionsUI",
                "--auth-server-whitelist=*",
                "--disable-features=SameSiteByDefaultCookies",
                "--disable-features=CookiesWithoutSameSiteMustBeSecure",
                "--disable-features=IsolateOrigins",
                "--disable-features=site-per-process",
                "--disable-features=NetworkService",
                "--disable-features=NetworkServiceInProcess",
                "--disable-web-security",
                "--disable-popup-blocking",
                "--disable-site-isolation-trials",
                "--disable-sync",
                "--disable-background-networking",
                "--disable-features=CookieDeprecationMessages",
                "--allow-running-insecure-content",
                "--disable-background-timer-throttling",
                "--disable-backgrounding-occluded-windows",
                "--disable-breakpad",
                "--disable-client-side-phishing-detection",
                "--disable-component-update",
                "--disable-domain-reliability",
                "--disable-features=site-isolation-trials",
                "--disable-print-preview",
                "--disable-prompt-on-repost",
                "--disable-renderer-backgrounding",
                "--disable-background-networking",
                "--disable-default-apps",
                "--metrics-recording-only",
                "--no-default-browser-check",
                "--no-experiments",
                "--no-pings",
                "--prerender-from-omnibox=disabled",
                "--password-store=basic",
                "--use-mock-keychain",
                `--host-rules=MAP chrome://extensions http://localhost/404, MAP chrome-extension:// http://localhost/404, MAP chrome://settings http://localhost/404, MAP https://app.toolzbuy.com/member http://localhost/404`,
              ];
  
              if (cdTp && parseInt(cdTp) === 22) {
                browser = await puppeteer.launch({
                  executablePath: chromePath,
                  headless: false,
                  userDataDir: userDataDir + `/profile_${perfilId}`,
                  args: argsAdm,
                });
              } else {
                browser = await puppeteer.launch({
                  executablePath: chromePath,
                  headless: false,
                  devtools: false,
                  userDataDir: userDataDir + `/profile_${perfilId}`,
                  args: args,
                });
              }
  
              browserInstances[perfilId] = browser;
  
              const pages = await browser.pages();
              const page = pages[0];
              await page.authenticate({
                username: proxyUsername,
                password: proxyPassword,
              });
  
              await page.setRequestInterception(true);
              //page.on('request', (request) => handleRequest(request, page, browser));
              page.on("request", async (request) => {
                const url = request.url();
                if (
                  (url.startsWith("chrome://") ||
                    url.startsWith("chrome://flags/") ||
                    url.startsWith("chrome://version/") ||
                    url.startsWith("chrome://urls/")) &&
                  parseInt(cdTp) !== 22
                ) {
                  await browser.close();
                  removeUserDataDir();
                } else {
                  request.continue();
                }
              });
  
              // Função para importar cookies e localStorage
              const importarCookies = async () => {
                if (perfil.cookie && perfil.cookie.trim() !== "") {
                  let cookies;
                  try {
                    cookies = JSON.parse(perfil.cookie);
                    if (Array.isArray(cookies) && cookies.length > 0) {
                      for (const cookie of cookies) {
                        if (cookie.name && cookie.value) {
                          if (
                            cookie.sameSite &&
                            !["Strict", "Lax", "None"].includes(cookie.sameSite)
                          ) {
                            console.warn(
                              `Valor sameSite inválido para o cookie ${cookie.name}. Ignorando o campo.`
                            );
                            delete cookie.sameSite;
                          }
                          const validCookie = {
                            name: cookie.name,
                            value: cookie.value,
                            domain: cookie.domain || "",
                            path: cookie.path || "/",
                            expires: cookie.expires || -1,
                            httpOnly: cookie.httpOnly || false,
                            secure: cookie.secure || false,
                            sameSite: cookie.sameSite || "None",
                          };
                          console.log("Tentando incluir cookie:", validCookie);
                          try {
                            await page.setCookie(validCookie);
                            console.log(
                              `Cookie ${validCookie.name} incluído com sucesso.`
                            );
                          } catch (err) {
                            console.error(
                              `Erro ao definir o cookie ${validCookie.name}:`,
                              err
                            );
                          }
                        } else {
                          console.log(
                            "Cookie inválido (falta name ou value), pulando."
                          );
                        }
                      }
                    }
                  } catch (error) {
                    console.error("Erro ao deserializar cookies:", error);
                  }
                }
  
                if (perfil.netscape && perfil.netscape.trim() !== "") {
                  try {
                    const netscapeCookies = perfil.netscape
                      .split("\n")
                      .filter((line) => !line.startsWith("#"))
                      .map((line) => Cookie.parse(line))
                      .filter((cookie) => cookie !== null);
  
                    if (netscapeCookies.length > 0) {
                      console.log(
                        "Tentando incluir cookies Netscape:",
                        netscapeCookies
                      );
                      await page.setCookie(
                        ...netscapeCookies.map((cookie) => ({
                          name: cookie.key,
                          value: cookie.value,
                          domain: cookie.domain,
                          path: cookie.path,
                          expires:
                            cookie.expires instanceof Date
                              ? cookie.expires.getTime() / 1000
                              : cookie.expires,
                          httpOnly: cookie.httpOnly,
                          secure: cookie.secure,
                          sameSite: cookie.sameSite || "Lax",
                        }))
                      );
                      console.log("Cookies Netscape incluídos com sucesso.");
                    }
                  } catch (error) {
                    console.error("Erro ao importar cookies Netscape:", error);
                  }
                }
  
                //if (perfil.localStorage && perfil.localStorage.trim() !== "") {
                //  try {
                //    const localStorageData = JSON.parse(perfil.localStorage);
                //    await page.evaluate((data) => {
                //      for (let key in data) {
                //        localStorage.setItem(key, data[key]);
                //      }
                //    }, localStorageData);
                //    console.log("LocalStorage importado com sucesso.");
                //  } catch (error) {
                //    console.error("Erro ao importar localStorage:", error);
                //  }
                //}
              };
  
              await importarCookies();
  
              await page.setUserAgent(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
              );
  
              await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, "webdriver", {
                  get: () => false,
                });
                Object.defineProperty(navigator, "platform", {
                  get: () => "Win32",
                });
                Object.defineProperty(navigator, "userAgent", {
                  get: () =>
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
                });
              });
  
              try {
                await page.goto(perfil.url, {
                  waitUntil: "networkidle2",
                  timeout: 60000,
                });
                await importarCookies();
              } catch (navigationError) {
                if (
                  navigationError.message.includes(
                    "Navigating frame was detached"
                  )
                ) {
                  console.warn(
                    "Navegação interrompida: frame foi destacado. Possível fechamento do navegador."
                  );
                } else {
                  console.error(
                    "Erro durante a navegação para a URL:",
                    navigationError
                  );
                }
                await browser.close();
                removeUserDataDir();
                connection.release();
                return callback(navigationError);
              }
  
              const removeLogoutButtons = async () => {
                await page.evaluate(() => {
                  const buttons = document.querySelectorAll("button, a");
                  buttons.forEach((button) => {
                    const buttonText = button.innerText
                      .toLowerCase()
                      .replace(/\s+/g, "");
                    if (
                      buttonText.includes("logout") ||
                      buttonText.includes("sair") ||
                      buttonText.includes("deslogar") ||
                      buttonText.includes("quit") ||
                      buttonText.includes("logoff") ||
                      buttonText.includes("signout") ||
                      buttonText.includes("logout") ||
                      buttonText.includes("signout") ||
                      buttonText.includes("signoff") ||
                      buttonText.includes("goodbye")
                    ) {
                      button.remove();
                    }
                  });
                });
              };
  
              page.on("framenavigated", removeLogoutButtons);
              await removeLogoutButtons();
  
              // Função para salvar cookies e localStorage
              const salvarCookiesELocalStorage = async () => {
                const cookies = await page.cookies();
                const serializedCookies = JSON.stringify(cookies);
  
                //const localStorageData = await page.evaluate(() => {
                //  let localStorageObj = {};
                //  for (let i = 0; i < localStorage.length; i++) {
                //    let key = localStorage.key(i);
                //    localStorageObj[key] = localStorage.getItem(key);
                //  }
                //  return localStorageObj;
                //});
                //const serializedLocalStorage = JSON.stringify(localStorageData);
                const serializedLocalStorage = JSON.stringify("");
  
                connection.query(
                  "UPDATE perfis SET cookie = ?, localStorage = ? WHERE id = ?",
                  [serializedCookies, serializedLocalStorage, perfilId],
                  (err, result) => {
                    if (err) {
                      console.error(
                        "Erro ao salvar os cookies e localStorage no banco de dados:",
                        err
                      );
                    } else {
                      console.log(
                        "Cookies e localStorage salvos no banco de dados."
                      );
                    }
                  }
                );
              };
  
              page.on("framenavigated", async () => {
                if (cdTp && parseInt(cdTp) == 22) {
                  await salvarCookiesELocalStorage();
                }
              });
  
              // Função de Blacklist
              (async () => {
                // Lista de URLs a serem monitoradas para fechar o navegador
                const blockedUrlsBrowser = [
                  "chrome://extensions/",
                  "chrome://settings/",
                  "https://chromewebstore.google.com/",
                  "chrome://history/",
                  "chrome://password-manager/passwords",
                  "chrome://password-manager/",
                ];
  
                // Lista de URLs a serem monitoradas para fechar apenas a aba
                const blockedUrlsTab = [
                  "https://passwords.avira.com/onboarding?extension-context=ftu",
                  "https://ninjabr.digital",
                  "chrome://extensions/",
                  "chrome://settings/",
                  "https://chromewebstore.google.com/",
                  "chrome://password-manager/passwords",
                  "chrome://history/",
                  "https://passwords.avira.com/",
                  "https://passwords.avira.com/mydata/passwords",
                  "https://app.toolzbuy.com/member",
                ];
  
                let browserClosed = false;
  
                // Função para verificar a URL e fechar o navegador se necessário
                const checkUrlAndCloseBrowser = async (url) => {
                  if (
                    !browserClosed &&
                    cdTp &&
                    parseInt(cdTp) === 21 &&
                    blockedUrlsBrowser.some((blockedUrl) =>
                      url.includes(blockedUrl)
                    )
                  ) {
                    console.log(`Blocked URL accessed: ${url}`);
                    browserClosed = true;
                    try {
                      await browser.close();
                    } catch (error) {
                      console.error("Error closing the browser:", error);
                    }
                  }
                };
  
                // Função para verificar a URL e fechar a aba se necessário
                const checkUrlAndCloseTab = async (page, url) => {
                  if (
                    blockedUrlsTab.some((blockedUrl) => url.includes(blockedUrl))
                  ) {
                    console.log(`Blocked URL accessed: ${url}`);
                    try {
                      const targetId = page.target()._targetId;
                      const targets = await page.browser().targets();
                      const targetExists = targets.some(
                        (target) => target._targetId === targetId
                      );
  
                      if (targetExists) {
                        await page.close();
                        console.log(`Page closed: ${url}`);
                      } else {
                        console.warn(
                          `Target with id ${targetId} not found, skipping close`
                        );
                      }
                    } catch (error) {
                      console.error("Error closing the page:", error);
                    }
                  }
                };
  
                const handlePage = async (page) => {
                  page.on("framenavigated", async (frame) => {
                    const url = frame.url();
                    if (!browserClosed) {
                      await checkUrlAndCloseBrowser(url);
                    }
                    await checkUrlAndCloseTab(page, url);
                  });
  
                  page.on("request", async (request) => {
                    const url = request.url();
                    if (!browserClosed) {
                      await checkUrlAndCloseBrowser(url);
                    }
                    await checkUrlAndCloseTab(page, url);
                  });
                };
  
                await handlePage(page);
  
                // Evento para monitorar todas as novas páginas abertas
                browser.on("targetcreated", async (target) => {
                  if (target.type() === "page") {
                    try {
                      const newPage = await target.page();
                      await handlePage(newPage);
                    } catch (error) {
                      if (!browserClosed) {
                        console.error("Error during targetcreated:", error);
                      }
                    }
                  }
                });
  
                // Evento para monitorar alterações de target no navegador
                browser.on("targetchanged", async (target) => {
                  if (target.type() === "page") {
                    try {
                      const page = await target.page();
                      if (page) {
                        const url = page.url();
                        if (!browserClosed) {
                          await checkUrlAndCloseBrowser(url);
                        }
                        await checkUrlAndCloseTab(page, url);
                      }
                    } catch (error) {
                      if (!browserClosed) {
                        console.error("Error during targetchanged:", error);
                      }
                    }
                  }
                });
  
                // Mantenha o script rodando para monitoramento contínuo
                process.stdin.resume();
              })();
  
              await importarCookies();
              await page.reload();
  
              let qtLogin = 0;
  
              // Função para definir o estilo display: none para todos os inputs do tipo password
              // Definindo a função passwordDisplayNone fora do contexto da função query
              const passwordDisplayNone = async () => {
                await page.evaluate(({ usertool, passtool }) => {
                    console.log("Selecionando todos os campos de senhas");
                    const passwordInputs = document.querySelectorAll('input[type="password"]');
                    passwordInputs.forEach((input) => {
                      console.log("Ocultando todos os campos de senhas");
                      input.style.display = "none";
                    });
  
                    const password = Array.from(document.querySelectorAll("input")).filter((input) => {
                      const inputType = input.type.toLowerCase();
                      const inputName = input.name.toLowerCase();
                      const inputPlaceholder = input.placeholder.toLowerCase();
                      // inputName.includes("login") ||
                      // inputPlaceholder.includes("login")
                      return (
                        inputType === "email" ||
                        inputType === "text" ||
                        inputName.includes("email") ||
                        inputName.includes("user") ||
                        inputName.includes("username") ||
                        inputName.includes("emailuser") ||
                        inputName.includes("useremail") ||
                        inputPlaceholder.includes("email") ||
                        inputPlaceholder.includes("usuário")
                      );
                    });
  
                    const userInputs = Array.from(document.querySelectorAll("input")).filter((input) => {
                      const inputType = input.type.toLowerCase();
                      const inputName = input.name.toLowerCase();
                      const inputPlaceholder = input.placeholder.toLowerCase();
                      // inputName.includes("login") ||
                      // inputPlaceholder.includes("login")
                      return (
                        inputType === "email" ||
                        inputType === "text" ||
                        inputName.includes("email") ||
                        inputName.includes("user") ||
                        inputName.includes("username") ||
                        inputName.includes("emailuser") ||
                        inputName.includes("useremail") ||
                        inputPlaceholder.includes("email") ||
                        inputPlaceholder.includes("usuário")
                      );
                    });
  
                    userInputs.forEach((input) => {
                      input.value = usertool;
                      console.log("Populou o usuário...");
                    });
  
                    passwordInputs.forEach((input) => {
                      input.value = passtool;
                      console.log("Populou a password...");
                    });
  
                    // Remover as partes que clicam nos botões ou enviam o formulário automaticamente
                    console.log("Aguardando ação do usuário para enviar o formulário...");
  
                    //const submitButtons = document.querySelectorAll(
                    //  'button[type="submit"], button[name*="submit"], button[name*="log"], button[name*="login"], button[name*="logon"], button[name*="entrar"], button[name*="signin"]'
                    //);
                    //if (submitButtons.length > 0) {
                    //  console.log("Clicando em todos os botões de login.");
                    //  setTimeout(() => {
                    //    submitButtons[0].click();
                    //    console.log("Submeteu o formulário...");
                    //  }, 20000); // 10000 milissegundos = 10 segundos
                    //} else {
                    //  console.log("Enviando todos os formularios de login.");
                    //  const form = document.querySelector("form");
                    //  if (form) {
                    //    setTimeout(() => {
                    //      form.submit();
                    //      console.log(
                    //        "Submeteu o formulário via form.submit()..."
                    //      );
                    //    }, 20000); // 10000 milissegundos = 10 segundos
                    //  }
                    //}
                  },{usertool: perfil.usertool,passtool: perfil.passtool});
  
                // Incrementar qtLogin fora do page.evaluate mas ainda dentro da função passwordDisplayNone
                qtLogin += 1;
                console.log("qtLogin incrementado:", qtLogin);
              };
  
              // Evento de navegação do frame
              if (cdTp && parseInt(cdTp) === 21 && qtLogin < 3) {
                page.on("framenavigated", async () => {
                  if (qtLogin < 3) {
                    await passwordDisplayNone();
                    console.log("qtLogin após passwordDisplayNone:", qtLogin);
                  } else {
                    console.log("qtLogin já foi incrementado, evitando loop.");
                  }
                });
              }
  
  
              connection.query(
                "UPDATE perfis SET dataUltimaAbertura = NOW() WHERE id = ?",
                [perfilId],
                (err, result) => {
                  if (err) {
                    console.error(
                      "Erro ao atualizar a data da última abertura:",
                      err
                    );
                    return callback(err);
                  }
                  console.log(
                    "Data da última abertura atualizada no banco de dados"
                  );
                  callback(null);
                }
              );
  
              process.on("beforeExit", () => {
                connection.release();
              });
  
              // Adicione a verificação de fechamento do navegador
              browser.on("disconnected", async () => {
                console.log(
                  `Navegador fechado. Chamando função pararPerfil para o perfil ID ${perfilId}.`
                );
                try {
                  // Chama a função pararPerfil diretamente
                  await pararPerfil(perfilId);
                } catch (err) {
                  console.error("Erro ao parar o perfil:", err);
                }
                delete browserInstances[perfilId]; // Remover a instância da memória
              });
            } catch (puppeteerError) {
              console.error("Erro ao lançar Puppeteer:", puppeteerError);
              if (browser) {
                await browser.close();
              }
              removeUserDataDir();
              connection.release();
              callback(puppeteerError);
            }
          }
        );
      } catch (generalError) {
        console.error("Erro geral:", generalError);
        connection.release();
        callback(generalError);
      }
    });
  };

  const pararPerfil = async (perfilId, callback) => {
    console.log("Iniciando parada de perfil!");
    const browser = browserInstances[perfilId];
    const userDataDir = path.join(
      chromePath2,
      "xp.pak/u.d",
      `profile_${perfilId}`
    );
    const removeUserDataDir = () => {
      if (fs.existsSync(userDataDir)) {
        fs.rmSync(userDataDir, {
          recursive: true,
          force: true,
        });
        console.log("Pasta user_data removida:", userDataDir);
      }
    };
    if (browser) {
      try {
        const pages = await browser.pages();
        if (pages.length > 0) {
          const page = pages[0];
  
          const client = await page.target().createCDPSession();
          await client.send("Network.clearBrowserCookies");
          console.log("Cookies excluídos.");
        }
  
        await browser.close();
        console.log("Navegador fechado com sucesso para o perfil ID:", perfilId);
        delete browserInstances[perfilId];
        removeUserDataDir();
      } catch (err) {
        console.error(
          "Erro ao fechar o navegador para o perfil ID:",
          perfilId,
          err
        );
        delete browserInstances[perfilId];
        removeUserDataDir();
        throw err;
      }
    } else {
      console.warn(
        "Nenhuma instância do navegador encontrada para o perfil ID:",
        perfilId
      );
      removeUserDataDir();
      throw new Error(
        "Nenhuma instância do navegador encontrada para o perfil ID: " + perfilId
      );
    }
  };
  
  const fecharTodasInstancias = async () => {
    console.log("Fechando todas as instâncias do navegador!");
    const closePromises = Object.keys(browserInstances).map((perfilId) => {
      return pararPerfil(perfilId);
    });
  
    try {
      await Promise.all(closePromises);
      console.log("Todas as instâncias do navegador foram fechadas.");
    } catch (err) {
      console.error("Erro ao fechar todas as instâncias do navegador:", err);
      throw err;
    }
  };
  
  module.exports = {
    adicionarPerfil,
    abrirPerfil,
    obterTodosPerfis,
    editarPerfil,
    obterPerfilPorId,
    excluirPerfil,
    pararPerfil,
    fecharTodasInstancias,
    listarProxies,
    adicionarProxy,
    excluirProxy,
    atribuirProxy,
  };
  
