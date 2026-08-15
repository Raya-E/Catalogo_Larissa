const supabaseClient = window.supabaseClient;

const galeria = document.getElementById("galeria");
const status = document.getElementById("status");
const filtrosCategorias = document.getElementById("filtrosCategorias");

const abrirLoginAdmin = document.getElementById("abrirLoginAdmin");
const modalLoginAdmin = document.getElementById("modalLoginAdmin");
const fecharLoginAdmin = document.getElementById("fecharLoginAdmin");
const entrarAdmin = document.getElementById("entrarAdmin");
const emailAdmin = document.getElementById("emailAdmin");
const senhaAdmin = document.getElementById("senhaAdmin");
const statusLoginAdmin = document.getElementById("statusLoginAdmin");
const alternarSenhaAdmin = document.getElementById("alternarSenhaAdmin");

let fotos = [];
let categorias = [];
let categoriaFiltroAtual = "todos";
let mostrarSomenteFavoritos = false;
let favoritos = JSON.parse(localStorage.getItem("favoritosPiercings")) || [];

async function carregarCategorias() {
  try {
    const { data, error } = await supabaseClient
      .from("categorias")
      .select("*")
      .order("nome_categoria", { ascending: true });

    if (error) {
      categorias = [];
      filtrosCategorias.style.display = "none";
      return;
    }

    categorias = data || [];
    renderizarFiltrosCategorias();
  } catch (error) {
    categorias = [];
    filtrosCategorias.style.display = "none";
  }
}

function renderizarFiltrosCategorias() {
  filtrosCategorias.innerHTML = "";
  filtrosCategorias.style.display = "flex";

  const botaoTodos = document.createElement("button");
  botaoTodos.className =
    !mostrarSomenteFavoritos && categoriaFiltroAtual === "todos"
      ? "chip ativo"
      : "chip";

  botaoTodos.textContent = "Todos";
  botaoTodos.type = "button";

  botaoTodos.addEventListener("click", () => {
    mostrarSomenteFavoritos = false;
    categoriaFiltroAtual = "todos";
    renderizarFotos();
    renderizarFiltrosCategorias();
  });

  filtrosCategorias.appendChild(botaoTodos);

  categorias.forEach((categoria) => {
    const chip = document.createElement("button");

    chip.className =
      !mostrarSomenteFavoritos &&
      String(categoriaFiltroAtual) === String(categoria.id)
        ? "chip ativo"
        : "chip";

    chip.textContent = categoria.nome_categoria;
    chip.type = "button";

    chip.addEventListener("click", () => {
      mostrarSomenteFavoritos = false;
      categoriaFiltroAtual = categoria.id;
      renderizarFotos();
      renderizarFiltrosCategorias();
    });

    filtrosCategorias.appendChild(chip);
  });

  const botaoFavoritos = document.createElement("button");

  botaoFavoritos.className = mostrarSomenteFavoritos
    ? "chip ativo"
    : "chip";

  botaoFavoritos.type = "button";
  botaoFavoritos.textContent = `♥ Favoritos (${favoritos.length})`;

  botaoFavoritos.addEventListener("click", () => {
    mostrarSomenteFavoritos = true;
    categoriaFiltroAtual = "todos";
    renderizarFotos();
    renderizarFiltrosCategorias();
  });

  filtrosCategorias.appendChild(botaoFavoritos);
}

alternarSenhaAdmin.addEventListener("click", () => {
  const senhaVisivel = senhaAdmin.type === "text";

  senhaAdmin.type = senhaVisivel ? "password" : "text";

  alternarSenhaAdmin.classList.toggle(
    "visivel",
    !senhaVisivel
  );

  alternarSenhaAdmin.setAttribute(
    "aria-label",
    senhaVisivel
      ? "Mostrar senha"
      : "Ocultar senha"
  );
});
function nomeCategoriaPorId(id) {
  const categoria = categorias.find(
    (item) => String(item.id) === String(id)
  );

  return categoria ? categoria.nome_categoria : "";
}

function categoriasDaFoto(foto) {
  if (
    Array.isArray(foto.categorias_ids) &&
    foto.categorias_ids.length > 0
  ) {
    return foto.categorias_ids.map((id) => String(id));
  }

  if (foto.categoria_id) {
    return [String(foto.categoria_id)];
  }

  return [];
}

function tagsCategoriasHtml(foto) {
  const nomes = categoriasDaFoto(foto)
    .map((id) => nomeCategoriaPorId(id))
    .filter(Boolean);

  if (nomes.length === 0) {
    return "";
  }

  return `
    <div class="lista-tags-categorias">
      ${nomes
        .map((nome) => `<span class="categoria-tag">${nome}</span>`)
        .join("")}
    </div>
  `;
}

async function carregarFotos() {
  try {
    const { data, error } = await supabaseClient
      .from("fotos")
      .select("*")
      .not("url_fotos", "is", null)
      .order("date_saved", { ascending: false });

    if (error) {
      throw error;
    }

    fotos = data || [];
    renderizarFotos();
  } catch (error) {
    console.error("Erro ao carregar fotos:", error);

    status.style.display = "block";
    status.className = "erro";
    status.textContent =
      "Não foi possível carregar os produtos. Verifique as permissões da tabela fotos.";
  }
}

function formatarPreco(valor) {
  let preco = String(valor || "").trim();

  if (!preco) {
    return "";
  }

  preco = preco.replace(/r\$/gi, "").trim();
  preco = preco.replace(/[^\d,.-]/g, "");

  if (!preco) {
    return "";
  }

  if (preco.includes(".") && !preco.includes(",")) {
    preco = preco.replace(".", ",");
  }

  return `R$ ${preco}`;
}

function agruparFotosPorProduto(listaFotos) {
  const grupos = {};

  listaFotos.forEach((foto) => {
    if (!foto.url_fotos) {
      return;
    }

    const chaveGrupo =
      foto.grupo_produto || `foto-unica-${foto.id_fotos}`;

    if (!grupos[chaveGrupo]) {
      grupos[chaveGrupo] = {
        id: chaveGrupo,
        principal: foto,
        titulo_fotos: foto.titulo_fotos,
        preco_fotos: foto.preco_fotos,
        descricao_fotos: foto.descricao_fotos,
        categoria_id: foto.categoria_id,
        categorias_ids: foto.categorias_ids,
        date_saved: foto.date_saved,
        imagens: []
      };
    }

    grupos[chaveGrupo].imagens.push(foto.url_fotos);
  });

  return Object.values(grupos);
}

function produtoEhFavorito(produto) {
  return favoritos.includes(String(produto.id));
}

function alternarFavorito(idProduto) {
  const id = String(idProduto);

  if (favoritos.includes(id)) {
    favoritos = favoritos.filter((item) => item !== id);
  } else {
    favoritos.push(id);
  }

  localStorage.setItem(
    "favoritosPiercings",
    JSON.stringify(favoritos)
  );

  renderizarFotos();
  renderizarFiltrosCategorias();
}

window.alternarFavorito = alternarFavorito;

function renderizarFotos() {
  galeria.innerHTML = "";

  const fotosFiltradas = fotos.filter((foto) => {
    if (!foto.url_fotos) {
      return false;
    }

    if (categoriaFiltroAtual === "todos") {
      return true;
    }

    return categoriasDaFoto(foto).includes(
      String(categoriaFiltroAtual)
    );
  });

  let produtos = agruparFotosPorProduto(fotosFiltradas);

  if (mostrarSomenteFavoritos) {
    produtos = produtos.filter((produto) =>
      produtoEhFavorito(produto)
    );
  }

  if (produtos.length === 0) {
    status.style.display = "block";
    status.className = "vazio";

    if (mostrarSomenteFavoritos) {
      status.textContent =
        "Você ainda não adicionou nenhum produto aos favoritos.";
    } else {
      status.textContent =
        categoriaFiltroAtual === "todos"
          ? "Nenhum produto cadastrado ainda."
          : "Nenhum produto cadastrado nessa categoria.";
    }

    return;
  }

  status.style.display = "none";

  produtos.forEach((produto, index) => {
    const card = document.createElement("article");
    card.className = "card";

    const titulo =
      produto.titulo_fotos || `Produto ${index + 1}`;

    const preco = formatarPreco(produto.preco_fotos);

    const descricao =
      produto.descricao_fotos ||
      "Entre em contato para mais informações.";

    const slides = produto.imagens
      .map((url, indiceImagem) => {
        const imagem = `${url}?v=${Date.now()}`;

        return `
          <div class="slide-card">
            <img
              src="${imagem}"
              alt="${titulo} - foto ${indiceImagem + 1}"
            >

            ${
              produto.imagens.length > 1
                ? `
                  <span class="indicador-fotos">
                    ${indiceImagem + 1}/${produto.imagens.length}
                  </span>
                `
                : ""
            }
          </div>
        `;
      })
      .join("");

    const favoritado = produtoEhFavorito(produto);

    card.innerHTML = `
      <div class="carrossel-card">
        ${slides}

        <button
          class="btn-favorito ${favoritado ? "favoritado" : ""}"
          type="button"
          onclick="alternarFavorito('${produto.id}')"
          aria-label="${
            favoritado
              ? "Remover dos favoritos"
              : "Adicionar aos favoritos"
          }"
        >
          <svg
            class="empty"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="32"
            height="32"
          >
            <path
              fill="none"
              d="M0 0H24V24H0z"
            ></path>

            <path
              d="M16.5 3C19.538 3 22 5.5 22 9c0 7-7.5 11-10 12.5C9.5 20 2 16 2 9c0-3.5 2.5-6 5.5-6C9.36 3 11 4 12 5c1-1 2.64-2 4.5-2zm-3.566 15.604c.881-.556 1.676-1.109 2.42-1.701C18.335 14.533 20 11.943 20 9c0-2.36-1.537-4-3.5-4-1.076 0-2.24.57-3.086 1.414L12 7.828l-1.414-1.414C9.74 5.57 8.576 5 7.5 5 5.56 5 4 6.656 4 9c0 2.944 1.666 5.533 4.645 7.903.745.592 1.54 1.145 2.421 1.7.299.189.595.37.934.572.339-.202.635-.383.934-.571z"
            ></path>
          </svg>

          <svg
            class="filled"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="32"
            height="32"
          >
            <path
              fill="none"
              d="M0 0H24V24H0z"
            ></path>

            <path
              d="M16.5 3C19.538 3 22 5.5 22 9c0 7-7.5 11-10 12.5C9.5 20 2 16 2 9c0-3.5 2.5-6 5.5-6C9.36 3 11 4 12 5c1-1 2.64-2 4.5-2z"
            ></path>
          </svg>
        </button>
      </div>

      <div class="card-info">
        ${tagsCategoriasHtml(produto.principal)}

        <h2>${titulo}</h2>

        ${
          preco
            ? `<div class="preco">${preco}</div>`
            : ""
        }

        <div class="descricao">
          ${descricao}
        </div>
      </div>
    `;

    galeria.appendChild(card);
  });
}

function abrirModalLoginAdmin() {
  modalLoginAdmin.classList.add("aberto");

  statusLoginAdmin.textContent = "";
  statusLoginAdmin.className = "status-login";

  setTimeout(() => {
    emailAdmin.focus();
  }, 100);
}

function fecharModalLoginAdmin() {
  modalLoginAdmin.classList.remove("aberto");

  emailAdmin.value = "";
  senhaAdmin.value = "";

  statusLoginAdmin.textContent = "";
  statusLoginAdmin.className = "status-login";
}

async function abrirAreaAdmin() {
  const { data } = await supabaseClient.auth.getSession();

  if (data.session) {
    window.location.href = "admin.html";
    return;
  }

  abrirModalLoginAdmin();
}

abrirLoginAdmin.addEventListener(
  "click",
  abrirAreaAdmin
);

fecharLoginAdmin.addEventListener(
  "click",
  fecharModalLoginAdmin
);

modalLoginAdmin.addEventListener("click", (event) => {
  if (event.target === modalLoginAdmin) {
    fecharModalLoginAdmin();
  }
});

senhaAdmin.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    entrarAdmin.click();
  }
});

emailAdmin.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    senhaAdmin.focus();
  }
});

entrarAdmin.addEventListener("click", async () => {
  const email = emailAdmin.value.trim();
  const senha = senhaAdmin.value.trim();

  if (!email || !senha) {
    statusLoginAdmin.textContent =
      "Preencha o email e a senha.";

    statusLoginAdmin.className =
      "status-login erro-login";

    return;
  }

  try {
    entrarAdmin.disabled = true;
    entrarAdmin.textContent = "Entrando...";

    statusLoginAdmin.textContent = "";
    statusLoginAdmin.className = "status-login";

    const { error } =
      await supabaseClient.auth.signInWithPassword({
        email: email,
        password: senha
      });

    if (error) {
      throw error;
    }

    window.location.href = "admin.html";
  } catch (error) {
    console.error("Erro no login:", error);

    statusLoginAdmin.textContent =
      "Email ou senha incorretos.";

    statusLoginAdmin.className =
      "status-login erro-login";
  } finally {
    entrarAdmin.disabled = false;
    entrarAdmin.textContent = "Entrar";
  }
});

async function iniciarCatalogo() {
  await carregarCategorias();
  await carregarFotos();
}

iniciarCatalogo();