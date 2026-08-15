
const supabaseClient = window.supabaseClient;

    const galeria = document.getElementById("galeria");
    const status = document.getElementById("status");
    const filtrosCategorias = document.getElementById("filtrosCategorias");
    const botaoVoltarIndex = document.getElementById("botaoVoltarIndex");

    const abrirPainelAdmin = document.getElementById("abrirPainelAdmin");
    const fecharPainelAdmin = document.getElementById("fecharPainelAdmin");
    const modalPainelAdmin = document.getElementById("modalPainelAdmin");
    const abrirAdmin = document.getElementById("abrirAdmin");
    const fecharAdmin = document.getElementById("fecharAdmin");
    const modalAdmin = document.getElementById("modalAdmin");
    const abrirCategorias = document.getElementById("abrirCategorias");
    const modalCategorias = document.getElementById("modalCategorias");
    const fecharCategorias = document.getElementById("fecharCategorias");

    const inputCamera = document.getElementById("fotoCamera");
    const inputGaleria = document.getElementById("fotoGaleria");
    const botaoEnviar = document.getElementById("botaoEnviar");
    const preview = document.getElementById("preview");
    const imagemPreview = document.getElementById("imagemPreview");
    const nomeArquivo = document.getElementById("nomeArquivo");
    const statusUpload = document.getElementById("statusUpload");
    const tituloUpload = document.getElementById("tituloUpload");
    const precoUpload = document.getElementById("precoUpload");
    const descricaoUpload = document.getElementById("descricaoUpload");
    const categoriaUpload = document.getElementById("categoriaUpload");

    const modalEditar = document.getElementById("modalEditar");
    const fecharEditar = document.getElementById("fecharEditar");
    const salvarEdicao = document.getElementById("salvarEdicao");
    const tituloEditar = document.getElementById("tituloEditar");
    const precoEditar = document.getElementById("precoEditar");
    const descricaoEditar = document.getElementById("descricaoEditar");
    const categoriaEditar = document.getElementById("categoriaEditar");
    const statusEditar = document.getElementById("statusEditar");

    const inputImagensExtras = document.getElementById("imagensExtrasEditar");
    const botaoAdicionarImagens = document.getElementById("botaoAdicionarImagens");
    const nomeImagensExtras = document.getElementById("nomeImagensExtras");
    const statusImagensExtras = document.getElementById("statusImagensExtras");
    const abrirCorteUpload = document.getElementById("abrirCorteUpload");
    const abrirCorteExtras = document.getElementById("abrirCorteExtras");
    const modalCorteImagem = document.getElementById("modalCorteImagem");
    const canvasCorte = document.getElementById("canvasCorte");
    const ctxCorte = canvasCorte.getContext("2d");
    const zoomCorte = document.getElementById("zoomCorte");
    const infoCorte = document.getElementById("infoCorte");
    const salvarCorte = document.getElementById("salvarCorte");
    const usarOriginalCorte = document.getElementById("usarOriginalCorte");
    const fecharCorte = document.getElementById("fecharCorte");
    const corteAnterior = document.getElementById("corteAnterior");
    const corteProxima = document.getElementById("corteProxima");

    const novaCategoria = document.getElementById("novaCategoria");
    const criarCategoria = document.getElementById("criarCategoria");
    const listaCategorias = document.getElementById("listaCategorias");
    const statusCategorias = document.getElementById("statusCategorias");

    let arquivosSelecionados = [];
    let imagensExtrasSelecionadas = [];
    let modoCorteAtual = null;
    let listaCorteAtual = [];
    let indiceCorteAtual = 0;
    let imagemCorteAtual = null;
    let arquivoOriginalCorteAtual = null;
    let estadoCorte = {
      zoom: 1,
      baseScale: 1,
      offsetX: 0,
      offsetY: 0,
      dragging: false,
      startX: 0,
      startY: 0,
      startOffsetX: 0,
      startOffsetY: 0
    };
    let fotos = [];
    let categorias = [];
    let categoriaFiltroAtual = "todos";
    let fotoEditando = null;

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

function removerPrefixoPreco(valor) {
  return String(valor || "")
    .replace(/r\$/gi, "")
    .trim();
}

    async function verificarAcessoAdmin() {
      const { data, error } = await supabaseClient.auth.getSession();

      if (error || !data.session) {
        window.location.href = "index.html";
        return false;
      }

      return true;
    }

    function limparSessaoAdminLocal() {
      try {
        Object.keys(localStorage).forEach((chave) => {
          if (
            chave.includes("supabase") ||
            chave.includes("gwmitwjrvdfpyyajiojn") ||
            (chave.startsWith("sb-") && chave.includes("auth-token"))
          ) {
            localStorage.removeItem(chave);
          }
        });

        Object.keys(sessionStorage).forEach((chave) => {
          if (
            chave.includes("supabase") ||
            chave.includes("gwmitwjrvdfpyyajiojn") ||
            (chave.startsWith("sb-") && chave.includes("auth-token"))
          ) {
            sessionStorage.removeItem(chave);
          }
        });
      } catch (error) {
        console.warn("Não foi possível limpar a sessão local:", error);
      }
    }

    async function sairDaAreaAdmin() {
      try {
        if (supabaseClient) {
          await supabaseClient.auth.signOut();
        }
      } catch (error) {
        console.warn("Erro ao encerrar sessão:", error);
      } finally {
        limparSessaoAdminLocal();
        window.location.href = "index.html";
      }
    }


    function abrirModal(modal) { modal.classList.add("aberto"); }
    function fecharModal(modal) { modal.classList.remove("aberto"); }

    botaoVoltarIndex.addEventListener("click", sairDaAreaAdmin);

    abrirPainelAdmin.addEventListener("click", () => abrirModal(modalPainelAdmin));
    fecharPainelAdmin.addEventListener("click", () => fecharModal(modalPainelAdmin));

    abrirAdmin.addEventListener("click", () => { fecharModal(modalPainelAdmin); abrirModal(modalAdmin); });
    fecharAdmin.addEventListener("click", () => { fecharModal(modalAdmin); limparFormularioUpload(); });
    abrirCategorias.addEventListener("click", async () => { fecharModal(modalPainelAdmin); await carregarCategorias(); renderizarGerenciadorCategorias(); abrirModal(modalCategorias); });
    fecharCategorias.addEventListener("click", () => fecharModal(modalCategorias));
    fecharEditar.addEventListener("click", () => fecharModal(modalEditar));

    [modalPainelAdmin, modalAdmin, modalEditar, modalCategorias].forEach((modal) => {
      modal.addEventListener("click", (event) => {
        if (event.target === modal) fecharModal(modal);
      });
    });

    inputCamera.addEventListener("change", () => selecionarArquivos(inputCamera.files));
    inputGaleria.addEventListener("change", () => selecionarArquivos(inputGaleria.files));
    inputImagensExtras.addEventListener("change", () => selecionarImagensExtras(inputImagensExtras.files));
    abrirCorteUpload.addEventListener("click", () => abrirEditorCorte("upload"));
    abrirCorteExtras.addEventListener("click", () => abrirEditorCorte("extras"));
    fecharCorte.addEventListener("click", () => fecharModal(modalCorteImagem));
    salvarCorte.addEventListener("click", salvarCorteAtual);
    usarOriginalCorte.addEventListener("click", irParaProximaImagemCorte);
    corteAnterior.addEventListener("click", () => mudarImagemCorte(-1));
    corteProxima.addEventListener("click", () => mudarImagemCorte(1));
    zoomCorte.addEventListener("input", () => {
      estadoCorte.zoom = Number(zoomCorte.value || 1);
      limitarOffsetCorte();
      desenharCorte();
    });

    canvasCorte.addEventListener("pointerdown", iniciarArrasteCorte);
    canvasCorte.addEventListener("pointermove", moverArrasteCorte);
    canvasCorte.addEventListener("pointerup", finalizarArrasteCorte);
    canvasCorte.addEventListener("pointercancel", finalizarArrasteCorte);
    canvasCorte.addEventListener("pointerleave", finalizarArrasteCorte);


    function selecionarArquivos(fileList) {
      const arquivos = Array.from(fileList || []);
      if (arquivos.length === 0) return;
      arquivosSelecionados = arquivos;
      const primeiraImagem = arquivosSelecionados[0];
      imagemPreview.src = URL.createObjectURL(primeiraImagem);
      preview.style.display = "block";
      nomeArquivo.textContent = arquivosSelecionados.length === 1
        ? primeiraImagem.name
        : `${arquivosSelecionados.length} imagens selecionadas`;
      botaoEnviar.disabled = false;
      abrirCorteUpload.disabled = false;
      botaoEnviar.textContent = arquivosSelecionados.length === 1
        ? "Enviar para o catálogo"
        : `Enviar ${arquivosSelecionados.length} fotos para o catálogo`;
      statusUpload.textContent = "";
      statusUpload.className = "status-upload";
    }

    function selecionarImagensExtras(fileList) {
      const arquivos = Array.from(fileList || []);
      if (arquivos.length === 0) return;

      imagensExtrasSelecionadas = arquivos;
      nomeImagensExtras.textContent = arquivos.length === 1
        ? arquivos[0].name
        : `${arquivos.length} imagens selecionadas`;

      botaoAdicionarImagens.disabled = false;
      abrirCorteExtras.disabled = false;
      botaoAdicionarImagens.textContent = arquivos.length === 1
        ? "Adicionar imagem ao card"
        : `Adicionar ${arquivos.length} imagens ao card`;

      statusImagensExtras.textContent = "";
      statusImagensExtras.className = "status-upload";
    }


    function atualizarTextoArquivosSelecionados() {
      if (arquivosSelecionados.length === 0) return;

      const primeiraImagem = arquivosSelecionados[0];
      imagemPreview.src = URL.createObjectURL(primeiraImagem);
      preview.style.display = "block";
      nomeArquivo.textContent = arquivosSelecionados.length === 1
        ? primeiraImagem.name
        : `${arquivosSelecionados.length} imagens selecionadas`;
    }

    function atualizarTextoImagensExtras() {
      if (imagensExtrasSelecionadas.length === 0) return;

      nomeImagensExtras.textContent = imagensExtrasSelecionadas.length === 1
        ? imagensExtrasSelecionadas[0].name
        : `${imagensExtrasSelecionadas.length} imagens selecionadas`;
    }

    function abrirEditorCorte(modo) {
      modoCorteAtual = modo;
      listaCorteAtual = modo === "upload" ? arquivosSelecionados : imagensExtrasSelecionadas;

      if (!listaCorteAtual || listaCorteAtual.length === 0) {
        alert("Escolha uma imagem primeiro.");
        return;
      }

      indiceCorteAtual = 0;
      abrirModal(modalCorteImagem);
      carregarImagemNoCorte();
    }

    function carregarImagemNoCorte() {
      arquivoOriginalCorteAtual = listaCorteAtual[indiceCorteAtual];
      if (!arquivoOriginalCorteAtual) return;

      const urlTemporaria = URL.createObjectURL(arquivoOriginalCorteAtual);
      imagemCorteAtual = new Image();

      imagemCorteAtual.onload = () => {
        URL.revokeObjectURL(urlTemporaria);
        prepararEstadoInicialCorte();
        desenharCorte();
        atualizarInfoCorte();
      };

      imagemCorteAtual.onerror = () => {
        URL.revokeObjectURL(urlTemporaria);
        alert("Não foi possível carregar essa imagem para corte.");
      };

      imagemCorteAtual.src = urlTemporaria;
    }

    function prepararEstadoInicialCorte() {
      const tamanhoCanvas = canvasCorte.width;
      const escalaBase = Math.max(
        tamanhoCanvas / imagemCorteAtual.width,
        tamanhoCanvas / imagemCorteAtual.height
      );

      estadoCorte.baseScale = escalaBase;
      estadoCorte.zoom = 1;
      zoomCorte.value = 1;

      const larguraDesenho = imagemCorteAtual.width * escalaBase;
      const alturaDesenho = imagemCorteAtual.height * escalaBase;

      estadoCorte.offsetX = (tamanhoCanvas - larguraDesenho) / 2;
      estadoCorte.offsetY = (tamanhoCanvas - alturaDesenho) / 2;
    }

    function desenharCorte() {
      if (!imagemCorteAtual) return;

      const tamanhoCanvas = canvasCorte.width;
      const escala = estadoCorte.baseScale * estadoCorte.zoom;
      const larguraDesenho = imagemCorteAtual.width * escala;
      const alturaDesenho = imagemCorteAtual.height * escala;

      ctxCorte.clearRect(0, 0, tamanhoCanvas, tamanhoCanvas);
      ctxCorte.fillStyle = "#f5edf9";
      ctxCorte.fillRect(0, 0, tamanhoCanvas, tamanhoCanvas);

      ctxCorte.drawImage(
        imagemCorteAtual,
        estadoCorte.offsetX,
        estadoCorte.offsetY,
        larguraDesenho,
        alturaDesenho
      );

      ctxCorte.strokeStyle = "rgba(255, 255, 255, 0.92)";
      ctxCorte.lineWidth = 6;
      ctxCorte.strokeRect(3, 3, tamanhoCanvas - 6, tamanhoCanvas - 6);

      ctxCorte.strokeStyle = "rgba(126, 82, 145, 0.55)";
      ctxCorte.lineWidth = 2;
      ctxCorte.setLineDash([14, 12]);
      ctxCorte.beginPath();
      ctxCorte.moveTo(tamanhoCanvas / 3, 0);
      ctxCorte.lineTo(tamanhoCanvas / 3, tamanhoCanvas);
      ctxCorte.moveTo((tamanhoCanvas / 3) * 2, 0);
      ctxCorte.lineTo((tamanhoCanvas / 3) * 2, tamanhoCanvas);
      ctxCorte.moveTo(0, tamanhoCanvas / 3);
      ctxCorte.lineTo(tamanhoCanvas, tamanhoCanvas / 3);
      ctxCorte.moveTo(0, (tamanhoCanvas / 3) * 2);
      ctxCorte.lineTo(tamanhoCanvas, (tamanhoCanvas / 3) * 2);
      ctxCorte.stroke();
      ctxCorte.setLineDash([]);
    }

    function limitarOffsetCorte() {
      if (!imagemCorteAtual) return;

      const tamanhoCanvas = canvasCorte.width;
      const escala = estadoCorte.baseScale * estadoCorte.zoom;
      const larguraDesenho = imagemCorteAtual.width * escala;
      const alturaDesenho = imagemCorteAtual.height * escala;

      if (larguraDesenho <= tamanhoCanvas) {
        estadoCorte.offsetX = (tamanhoCanvas - larguraDesenho) / 2;
      } else {
        estadoCorte.offsetX = Math.min(0, Math.max(tamanhoCanvas - larguraDesenho, estadoCorte.offsetX));
      }

      if (alturaDesenho <= tamanhoCanvas) {
        estadoCorte.offsetY = (tamanhoCanvas - alturaDesenho) / 2;
      } else {
        estadoCorte.offsetY = Math.min(0, Math.max(tamanhoCanvas - alturaDesenho, estadoCorte.offsetY));
      }
    }

    function posicaoCanvas(event) {
      const rect = canvasCorte.getBoundingClientRect();
      const fatorX = canvasCorte.width / rect.width;
      const fatorY = canvasCorte.height / rect.height;

      return {
        x: (event.clientX - rect.left) * fatorX,
        y: (event.clientY - rect.top) * fatorY
      };
    }

    function iniciarArrasteCorte(event) {
      if (!imagemCorteAtual) return;

      estadoCorte.dragging = true;
      const pos = posicaoCanvas(event);
      estadoCorte.startX = pos.x;
      estadoCorte.startY = pos.y;
      estadoCorte.startOffsetX = estadoCorte.offsetX;
      estadoCorte.startOffsetY = estadoCorte.offsetY;
      canvasCorte.setPointerCapture(event.pointerId);
    }

    function moverArrasteCorte(event) {
      if (!estadoCorte.dragging) return;

      const pos = posicaoCanvas(event);
      estadoCorte.offsetX = estadoCorte.startOffsetX + (pos.x - estadoCorte.startX);
      estadoCorte.offsetY = estadoCorte.startOffsetY + (pos.y - estadoCorte.startY);
      limitarOffsetCorte();
      desenharCorte();
    }

    function finalizarArrasteCorte(event) {
      estadoCorte.dragging = false;
      try {
        if (event && event.pointerId !== undefined) {
          canvasCorte.releasePointerCapture(event.pointerId);
        }
      } catch (error) {}
    }

    function atualizarInfoCorte() {
      const total = listaCorteAtual.length;
      const nome = arquivoOriginalCorteAtual ? arquivoOriginalCorteAtual.name : "imagem";
      infoCorte.textContent = `Imagem ${indiceCorteAtual + 1} de ${total}: ${nome}`;
      corteAnterior.disabled = indiceCorteAtual === 0;
      corteProxima.disabled = indiceCorteAtual === total - 1;
    }

    function mudarImagemCorte(direcao) {
      const novoIndice = indiceCorteAtual + direcao;

      if (novoIndice < 0 || novoIndice >= listaCorteAtual.length) return;

      indiceCorteAtual = novoIndice;
      carregarImagemNoCorte();
    }

    function irParaProximaImagemCorte() {
      if (indiceCorteAtual < listaCorteAtual.length - 1) {
        indiceCorteAtual++;
        carregarImagemNoCorte();
      } else {
        fecharModal(modalCorteImagem);
      }
    }

    function salvarCorteAtual() {
      if (!imagemCorteAtual || !arquivoOriginalCorteAtual) return;

      const tamanhoFinal = 1200;
      const canvasFinal = document.createElement("canvas");
      canvasFinal.width = tamanhoFinal;
      canvasFinal.height = tamanhoFinal;
      const ctxFinal = canvasFinal.getContext("2d");

      const fator = tamanhoFinal / canvasCorte.width;
      const escala = estadoCorte.baseScale * estadoCorte.zoom;

      ctxFinal.fillStyle = "#ffffff";
      ctxFinal.fillRect(0, 0, tamanhoFinal, tamanhoFinal);

      ctxFinal.drawImage(
        imagemCorteAtual,
        estadoCorte.offsetX * fator,
        estadoCorte.offsetY * fator,
        imagemCorteAtual.width * escala * fator,
        imagemCorteAtual.height * escala * fator
      );

      canvasFinal.toBlob((blob) => {
        if (!blob) {
          alert("Erro ao salvar corte.");
          return;
        }

        const nomeBase = arquivoOriginalCorteAtual.name
          .replace(/\.[^/.]+$/, "")
          .replace(/\s+/g, "-")
          .replace(/[^a-zA-Z0-9-_]/g, "")
          .toLowerCase() || "foto";

        const arquivoCortado = new File(
          [blob],
          `${nomeBase}-cortado.webp`,
          { type: "image/webp" }
        );

        if (modoCorteAtual === "upload") {
          arquivosSelecionados[indiceCorteAtual] = arquivoCortado;
          atualizarTextoArquivosSelecionados();
        } else if (modoCorteAtual === "extras") {
          imagensExtrasSelecionadas[indiceCorteAtual] = arquivoCortado;
          atualizarTextoImagensExtras();
        }

        irParaProximaImagemCorte();
      }, "image/webp", 0.9);
    }

async function iniciarSupabase() {
  if (!supabaseClient) {
    status.className = "erro";
    status.textContent = "Erro ao carregar conexão com o Supabase.";
    return;
  }

  const acessoLiberado = await verificarAcessoAdmin();

  if (!acessoLiberado) {
    return;
  }

  iniciarCatalogo();
}
    async function iniciarCatalogo() {
      await carregarCategorias();
      await carregarFotos();
    }

    async function carregarCategorias() {
      const { data, error } = await supabaseClient
        .from("categorias")
        .select("*")
        .order("nome_categoria", { ascending: true });
      if (error) {
        console.error("Erro categorias:", error);
        categorias = [];
      } else {
        categorias = data || [];
      }
      renderizarSelectCategorias(categoriaUpload);
      renderizarSelectCategorias(categoriaEditar);
      renderizarFiltrosCategorias();
    }

    function renderizarSelectCategorias(select) {
      select.innerHTML = "";
      categorias.forEach((categoria) => {
        const option = document.createElement("option");
        option.value = categoria.id;
        option.textContent = categoria.nome_categoria;
        select.appendChild(option);
      });
    }

    function getCategoriasSelecionadas(select) {
      return Array.from(select.selectedOptions).map((option) => option.value);
    }

    function selecionarCategoriasNoSelect(select, ids) {
      const listaIds = (ids || []).map((id) => String(id));

      Array.from(select.options).forEach((option) => {
        option.selected = listaIds.includes(String(option.value));
      });
    }

    function categoriasDaFoto(foto) {
      if (Array.isArray(foto.categorias_ids) && foto.categorias_ids.length > 0) {
        return foto.categorias_ids.map((id) => String(id));
      }

      if (foto.categoria_id) {
        return [String(foto.categoria_id)];
      }

      return [];
    }

    function renderizarFiltrosCategorias() {
      filtrosCategorias.innerHTML = "";

      const botaoTodos = document.createElement("button");
      botaoTodos.className = categoriaFiltroAtual === "todos" ? "chip ativo" : "chip";
      botaoTodos.textContent = "Todos";
      botaoTodos.type = "button";
      botaoTodos.addEventListener("click", () => {
        categoriaFiltroAtual = "todos";
        renderizarFotos();
        renderizarFiltrosCategorias();
      });
      filtrosCategorias.appendChild(botaoTodos);

      categorias.forEach((categoria) => {
        const chip = document.createElement("button");
        chip.className = categoriaFiltroAtual === categoria.id ? "chip ativo" : "chip";
        chip.textContent = categoria.nome_categoria;
        chip.type = "button";
        chip.addEventListener("click", () => {
          categoriaFiltroAtual = categoria.id;
          renderizarFotos();
          renderizarFiltrosCategorias();
        });
        filtrosCategorias.appendChild(chip);
      });
    }

    function agruparFotosPorProduto(listaFotos) {
      const mapa = new Map();

      listaFotos.forEach((foto) => {
        if (!foto.url_fotos) return;

        const chaveGrupo = foto.grupo_produto || `sem-grupo-${foto.id_fotos}`;

        if (!mapa.has(chaveGrupo)) {
          mapa.set(chaveGrupo, {
            grupo_produto: chaveGrupo,
            fotos: [],
            principal: foto
          });
        }

        mapa.get(chaveGrupo).fotos.push(foto);
      });

      return Array.from(mapa.values());
    }

    async function carregarFotos() {
      try {
        const { data, error } = await supabaseClient
          .from("fotos")
          .select("*")
          .order("date_saved", { ascending: false });

        if (error) throw error;

        fotos = data || [];
        status.style.display = "none";
        renderizarFotos();

      } catch (error) {
        console.error(error);
        status.className = "erro";
        status.textContent = "Não foi possível carregar os produtos.";
      }
    }

    function nomeCategoriaPorId(id) {
      const categoria = categorias.find((item) => String(item.id) === String(id));
      return categoria ? categoria.nome_categoria : "";
    }

    function tagsCategoriasHtml(foto) {
      const nomes = categoriasDaFoto(foto)
        .map((id) => nomeCategoriaPorId(id))
        .filter(Boolean);

      if (nomes.length === 0) {
        return `<span class="categoria-tag">Sem categoria</span>`;
      }

      return `<div class="lista-tags-categorias">${nomes
        .map((nome) => `<span class="categoria-tag">${nome}</span>`)
        .join("")}</div>`;
    }

    function renderizarFotos() {
      galeria.innerHTML = "";

      const fotosFiltradas = fotos.filter((foto) => {
        if (!foto.url_fotos) return false;
        if (categoriaFiltroAtual === "todos") return true;
        return categoriasDaFoto(foto).includes(String(categoriaFiltroAtual));
      });

      const produtosAgrupados = agruparFotosPorProduto(fotosFiltradas);

      if (produtosAgrupados.length === 0) {
        status.style.display = "block";
        status.className = "vazio";
        status.textContent = "Nenhum produto cadastrado nessa categoria.";
        return;
      }

      status.style.display = "none";

      produtosAgrupados.forEach((produto, index) => {
        const fotoPrincipal = produto.principal;
        const card = document.createElement("article");
        card.className = "card";

        const titulo = fotoPrincipal.titulo_fotos || `Produto ${index + 1}`;
        const preco = formatarPreco(fotoPrincipal.preco_fotos);
        const descricao = fotoPrincipal.descricao_fotos || "Entre em contato para mais informações.";
        const categoriasHtml = tagsCategoriasHtml(fotoPrincipal);

        const slides = produto.fotos.map((foto, indiceFoto) => `
          <div class="slide-card">
            <img src="${foto.url_fotos}" alt="${titulo} - foto ${indiceFoto + 1}">
            ${produto.fotos.length > 1 ? `<span class="indicador-fotos">${indiceFoto + 1}/${produto.fotos.length}</span>` : ""}
          </div>
        `).join("");

        card.innerHTML = `
          <div class="carrossel-card">
            ${slides}
          </div>

          <div class="card-info">
            ${categoriasHtml}
            <h2>${titulo}</h2>
            ${preco ? `<div class="preco">${preco}</div>` : ""}
            <div class="descricao">${descricao}</div>
            <div class="acoes-card">
              <button class="btn-card" type="button" onclick="abrirEdicao('${fotoPrincipal.id_fotos}')">Editar</button>
              <button class="btn-card btn-apagar" type="button" onclick="apagarFoto('${fotoPrincipal.id_fotos}')">Apagar</button>
            </div>
          </div>
        `;

        galeria.appendChild(card);
      });
    }


    function comprimirImagem(arquivo, larguraMaxima = 1200, qualidade = 0.75) {
      return new Promise((resolve, reject) => {
        const imagem = new Image();
        const leitor = new FileReader();

        leitor.onload = (evento) => {
          imagem.src = evento.target.result;
        };

        imagem.onload = () => {
          let largura = imagem.width;
          let altura = imagem.height;

          if (largura > larguraMaxima) {
            altura = Math.round((altura * larguraMaxima) / largura);
            largura = larguraMaxima;
          }

          const canvas = document.createElement("canvas");
          canvas.width = largura;
          canvas.height = altura;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(imagem, 0, 0, largura, altura);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Erro ao comprimir imagem."));
                return;
              }

              const nomeArquivo = arquivo.name
                .replace(/\.[^/.]+$/, "")
                .replace(/\s+/g, "-")
                .replace(/[^a-zA-Z0-9-_]/g, "")
                .toLowerCase() || "foto";

              const arquivoComprimido = new File(
                [blob],
                `${nomeArquivo}.webp`,
                { type: "image/webp" }
              );

              resolve(arquivoComprimido);
            },
            "image/webp",
            qualidade
          );
        };

        imagem.onerror = () => reject(new Error("Erro ao carregar imagem."));
        leitor.onerror = () => reject(new Error("Erro ao ler arquivo."));
        leitor.readAsDataURL(arquivo);
      });
    }

    function formatarTamanho(bytes) {
      if (!bytes) return "0 KB";
      if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    botaoEnviar.addEventListener("click", async () => {
      if (arquivosSelecionados.length === 0) {
        statusUpload.textContent = "Escolha uma imagem primeiro.";
        statusUpload.className = "status-upload erro-upload";
        return;
      }
      try {
        botaoEnviar.disabled = true;
        statusUpload.className = "status-upload";
        const total = arquivosSelecionados.length;

        const grupoProduto = `produto-${Date.now()}`;

for (let i = 0; i < total; i++) {
  const arquivoOriginal = arquivosSelecionados[i];

  statusUpload.textContent = `Comprimindo imagem ${i + 1} de ${total}...`;

  const arquivoComprimido = await comprimirImagem(
    arquivoOriginal,
    1200,
    0.75
  );

  statusUpload.textContent = `Enviando ${i + 1} de ${total}... (${formatarTamanho(arquivoOriginal.size)} → ${formatarTamanho(arquivoComprimido.size)})`;

  const nomeUnico = `foto-${Date.now()}-${i}.webp`;

  const { error: uploadError } = await supabaseClient.storage
    .from("catalogo")
    .upload(nomeUnico, arquivoComprimido, {
      contentType: "image/webp"
    });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabaseClient.storage
    .from("catalogo")
    .getPublicUrl(nomeUnico);

  const urlPublica = publicUrlData.publicUrl;

  const { error: insertError } = await supabaseClient.from("fotos").insert([{ 
    url_fotos: urlPublica,
    titulo_fotos: tituloUpload.value.trim(),
    preco_fotos: removerPrefixoPreco(precoUpload.value),
    descricao_fotos: descricaoUpload.value.trim(),
    categoria_id: getCategoriasSelecionadas(categoriaUpload)[0] || null,
    categorias_ids: getCategoriasSelecionadas(categoriaUpload),
    grupo_produto: grupoProduto
  }]);

  if (insertError) throw insertError;
}
        statusUpload.textContent = total === 1 ? "Foto enviada com sucesso!" : "Fotos enviadas com sucesso!";
        statusUpload.className = "status-upload sucesso";
        limparFormularioUpload();
        await carregarFotos();
      } catch (error) {
        console.error(error);
        statusUpload.textContent = "Erro ao enviar. Verifique as permissões do Supabase.";
        statusUpload.className = "status-upload erro-upload";
        botaoEnviar.disabled = false;
      }
    });

    window.abrirEdicao = function(idFoto) {
      fotoEditando = fotos.find((foto) => String(foto.id_fotos) === String(idFoto));
      if (!fotoEditando) return;
      tituloEditar.value = fotoEditando.titulo_fotos || "";
      precoEditar.value = removerPrefixoPreco(fotoEditando.preco_fotos);
      descricaoEditar.value = fotoEditando.descricao_fotos || "";
      selecionarCategoriasNoSelect(categoriaEditar, categoriasDaFoto(fotoEditando));
      limparImagensExtras();
      statusEditar.textContent = "";
      abrirModal(modalEditar);
    };

    salvarEdicao.addEventListener("click", async () => {
      if (!fotoEditando) return;

      try {
        salvarEdicao.disabled = true;
        statusEditar.textContent = "Salvando...";
        statusEditar.className = "status-upload";

        const novosDados = {
          titulo_fotos: tituloEditar.value.trim(),
          preco_fotos: removerPrefixoPreco(precoEditar.value),
          descricao_fotos: descricaoEditar.value.trim(),
          categoria_id: getCategoriasSelecionadas(categoriaEditar)[0] || null,
          categorias_ids: getCategoriasSelecionadas(categoriaEditar)
        };

        let query = supabaseClient
          .from("fotos")
          .update(novosDados);

        if (fotoEditando.grupo_produto) {
          query = query.eq("grupo_produto", fotoEditando.grupo_produto);
        } else {
          query = query.eq("id_fotos", fotoEditando.id_fotos);
        }

        const { error } = await query;

        if (error) throw error;

        statusEditar.textContent = "Informações salvas!";
        statusEditar.className = "status-upload sucesso";
        salvarEdicao.disabled = false;

        await carregarFotos();
      } catch (error) {
        console.error(error);
        statusEditar.textContent = "Erro ao salvar.";
        statusEditar.className = "status-upload erro-upload";
        salvarEdicao.disabled = false;
      }
    });

    botaoAdicionarImagens.addEventListener("click", async () => {
      if (!fotoEditando) return;

      if (imagensExtrasSelecionadas.length === 0) {
        statusImagensExtras.textContent = "Escolha uma imagem primeiro.";
        statusImagensExtras.className = "status-upload erro-upload";
        return;
      }

      try {
        botaoAdicionarImagens.disabled = true;
        statusImagensExtras.className = "status-upload";

        const total = imagensExtrasSelecionadas.length;
        const grupoProduto = fotoEditando.grupo_produto || `produto-${Date.now()}`;

        if (!fotoEditando.grupo_produto) {
          await supabaseClient
            .from("fotos")
            .update({ grupo_produto: grupoProduto })
            .eq("id_fotos", fotoEditando.id_fotos);

          fotoEditando.grupo_produto = grupoProduto;
        }

        const categoriasProduto = categoriasDaFoto(fotoEditando);

        for (let i = 0; i < total; i++) {
          const arquivoOriginal = imagensExtrasSelecionadas[i];

          statusImagensExtras.textContent = `Comprimindo imagem ${i + 1} de ${total}...`;

          const arquivoComprimido = await comprimirImagem(arquivoOriginal, 1200, 0.75);

          statusImagensExtras.textContent = `Enviando ${i + 1} de ${total}... (${formatarTamanho(arquivoOriginal.size)} → ${formatarTamanho(arquivoComprimido.size)})`;

          const nomeUnico = `foto-${Date.now()}-extra-${i}.webp`;

          const { error: uploadError } = await supabaseClient.storage
            .from("catalogo")
            .upload(nomeUnico, arquivoComprimido, {
              contentType: "image/webp"
            });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabaseClient.storage
            .from("catalogo")
            .getPublicUrl(nomeUnico);

          const urlPublica = publicUrlData.publicUrl;

          const { error: insertError } = await supabaseClient.from("fotos").insert([{
            url_fotos: urlPublica,
            titulo_fotos: fotoEditando.titulo_fotos || tituloEditar.value.trim(),
            preco_fotos: removerPrefixoPreco(fotoEditando.preco_fotos || precoEditar.value),
            descricao_fotos: fotoEditando.descricao_fotos || descricaoEditar.value.trim(),
            categoria_id: categoriasProduto[0] || null,
            categorias_ids: categoriasProduto,
            grupo_produto: grupoProduto
          }]);

          if (insertError) throw insertError;
        }

        statusImagensExtras.textContent = total === 1
          ? "Imagem adicionada ao card!"
          : "Imagens adicionadas ao card!";
        statusImagensExtras.className = "status-upload sucesso";

        limparImagensExtras();
        await carregarFotos();
      } catch (error) {
        console.error(error);
        statusImagensExtras.textContent = "Erro ao adicionar imagens. Verifique as permissões do Supabase.";
        statusImagensExtras.className = "status-upload erro-upload";
        botaoAdicionarImagens.disabled = false;
      }
    });

    window.apagarFoto = async function(idFoto) {
      const fotoPrincipal = fotos.find((item) => String(item.id_fotos) === String(idFoto));
      if (!fotoPrincipal) return;

      const grupo = fotoPrincipal.grupo_produto;
      const fotosDoProduto = grupo
        ? fotos.filter((item) => item.grupo_produto === grupo)
        : [fotoPrincipal];

      const mensagem = fotosDoProduto.length > 1
        ? `Tem certeza que deseja apagar esse produto com ${fotosDoProduto.length} fotos?`
        : "Tem certeza que deseja apagar essa foto?";

      if (!confirm(mensagem)) return;

      try {
        const caminhos = fotosDoProduto
          .map((foto) => pegarCaminhoStorage(foto.url_fotos))
          .filter(Boolean);

        if (caminhos.length > 0) {
          await supabaseClient.storage.from("catalogo").remove(caminhos);
        }

        let query = supabaseClient.from("fotos").delete();

        if (grupo) {
          query = query.eq("grupo_produto", grupo);
        } else {
          query = query.eq("id_fotos", fotoPrincipal.id_fotos);
        }

        const { error } = await query;

        if (error) throw error;

        await carregarFotos();
      } catch (error) {
        console.error(error);
        alert("Erro ao apagar. Verifique as permissões do Supabase.");
      }
    };

    function pegarCaminhoStorage(url) {
      const marcador = "/catalogo/";
      const index = url.indexOf(marcador);
      if (index === -1) return null;
      return decodeURIComponent(url.substring(index + marcador.length).split("?")[0]);
    }

    criarCategoria.addEventListener("click", async () => {
      const nome = novaCategoria.value.trim();
      if (!nome) {
        statusCategorias.textContent = "Digite o nome da categoria.";
        statusCategorias.className = "status-upload erro-upload";
        return;
      }
      try {
        const { error } = await supabaseClient.from("categorias").insert([{ nome_categoria: nome }]);
        if (error) throw error;
        novaCategoria.value = "";
        statusCategorias.textContent = "Categoria criada!";
        statusCategorias.className = "status-upload sucesso";
        await carregarCategorias();
        renderizarGerenciadorCategorias();
      } catch (error) {
        console.error(error);
        statusCategorias.textContent = "Erro ao criar categoria.";
        statusCategorias.className = "status-upload erro-upload";
      }
    });

    function renderizarGerenciadorCategorias() {
      listaCategorias.innerHTML = "";
      if (categorias.length === 0) {
        listaCategorias.innerHTML = `<div class="vazio">Nenhuma categoria criada ainda.</div>`;
        return;
      }
      categorias.forEach((categoria) => {
        const item = document.createElement("div");
        item.className = "categoria-item";
        item.innerHTML = `
          <input type="text" value="${categoria.nome_categoria}" data-id="${categoria.id}" class="input-categoria">
          <div class="categoria-acoes">
            <button class="btn-pequeno" type="button" onclick="renomearCategoria('${categoria.id}')">Salvar nome</button>
            <button class="btn-pequeno btn-perigo" type="button" onclick="apagarCategoria('${categoria.id}')">Apagar</button>
          </div>`;
        listaCategorias.appendChild(item);
      });
    }

    window.renomearCategoria = async function(idCategoria) {
      const input = document.querySelector(`.input-categoria[data-id="${idCategoria}"]`);
      const nome = input.value.trim();
      if (!nome) return;
      try {
        const { error } = await supabaseClient.from("categorias").update({ nome_categoria: nome }).eq("id", idCategoria);
        if (error) throw error;
        statusCategorias.textContent = "Categoria atualizada!";
        statusCategorias.className = "status-upload sucesso";
        await carregarCategorias();
        await carregarFotos();
        renderizarGerenciadorCategorias();
      } catch (error) {
        console.error(error);
        statusCategorias.textContent = "Erro ao atualizar categoria.";
        statusCategorias.className = "status-upload erro-upload";
      }
    };

    window.apagarCategoria = async function(idCategoria) {
      if (!confirm("Apagar essa categoria? As fotos dessa categoria ficarão sem categoria.")) return;
      try {
        await supabaseClient.from("fotos").update({ categoria_id: null }).eq("categoria_id", idCategoria);
        const { error } = await supabaseClient.from("categorias").delete().eq("id", idCategoria);
        if (error) throw error;
        if (categoriaFiltroAtual === idCategoria) categoriaFiltroAtual = "todos";
        statusCategorias.textContent = "Categoria apagada!";
        statusCategorias.className = "status-upload sucesso";
        await carregarCategorias();
        await carregarFotos();
        renderizarGerenciadorCategorias();
      } catch (error) {
        console.error(error);
        statusCategorias.textContent = "Erro ao apagar categoria.";
        statusCategorias.className = "status-upload erro-upload";
      }
    };

    function limparFormularioUpload() {
      inputCamera.value = "";
      inputGaleria.value = "";
      arquivosSelecionados = [];
      preview.style.display = "none";
      imagemPreview.src = "";
      nomeArquivo.textContent = "";
      botaoEnviar.textContent = "Enviar para o catálogo";
      botaoEnviar.disabled = true;
      abrirCorteUpload.disabled = true;
    }

    function limparImagensExtras() {
      inputImagensExtras.value = "";
      imagensExtrasSelecionadas = [];
      nomeImagensExtras.textContent = "";
      statusImagensExtras.textContent = "";
      statusImagensExtras.className = "status-upload";
      botaoAdicionarImagens.textContent = "Adicionar imagens ao card";
      botaoAdicionarImagens.disabled = true;
      abrirCorteExtras.disabled = true;
    }

    window.addEventListener("pagehide", () => {
      limparSessaoAdminLocal();
    });

    iniciarSupabase();
