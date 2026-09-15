import {
    database,
    ref,
    get,
    set,
    update,
    remove
} from "./firebase.js";


// ============================================================
// ESTADO
// ============================================================

let baterias = [];
let vendas = [];
let veiculos = [];
let despesas = [];
let compras = [];
let telaAtual = "inicio";


// ============================================================
// ELEMENTOS
// ============================================================

const pageTitle =
    document.getElementById("page-title");

const pageSubtitle =
    document.getElementById("page-subtitle");

const screenContent =
    document.getElementById("screen-content");


// ============================================================
// DINHEIRO
// ============================================================

function formatMoney(value) {
    return Number(value || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


// ============================================================
// AMPERAGEM
// ============================================================

function formatAmperage(amperagem) {

    if (!amperagem) {
        return "";
    }

    const texto = String(amperagem);

    if (/^\d+$/.test(texto)) {
        return `${texto} Ah`;
    }

    return texto;
}


// ============================================================
// ESCAPAR HTML
// ============================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// CARREGAR BATERIAS
// ============================================================

async function carregarBaterias() {

    try {

        const snapshot =
            await get(
                ref(database, "baterias")
            );

        if (!snapshot.exists()) {

            baterias = [];

            return;
        }

        const data =
            snapshot.val();

        baterias =
            Object.entries(data).map(
                ([id, bateria]) => ({
                    id,
                    ...bateria
                })
            );

    } catch (error) {

        console.error(
            "Erro ao carregar baterias:",
            error
        );
    }
}


// ============================================================
// CARREGAR VENDAS
// ============================================================

async function carregarVendas() {

    try {

        const snapshot =
            await get(
                ref(database, "vendas")
            );

        if (!snapshot.exists()) {

            vendas = [];

            return;
        }

        const data =
            snapshot.val();

        vendas =
            Object.entries(data).map(
                ([id, venda]) => ({
                    id,
                    ...venda
                })
            );

        vendas.sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );

    } catch (error) {

        console.error(
            "Erro ao carregar vendas:",
            error
        );
    }
}

// ============================================================
// CARREGAR DESPESAS
// ============================================================
 
async function carregarDespesas() {
 
    try {
 
        const snapshot =
            await get(
                ref(database, "despesas")
            );
 
        if (!snapshot.exists()) {
 
            despesas = [];
 
            return;
        }
 
        const data =
            snapshot.val();
 
        despesas =
            Object.entries(data).map(
                ([id, despesa]) => ({
                    id,
                    ...despesa
                })
            );
 
        despesas.sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );
 
    } catch (error) {
 
        console.error(
            "Erro ao carregar despesas:",
            error
        );
 
        despesas = [];
    }
}
 
 
// ============================================================
// CARREGAR COMPRAS
// ============================================================
 
async function carregarCompras() {
 
    try {
 
        const snapshot =
            await get(
                ref(database, "compras")
            );
 
        if (!snapshot.exists()) {
 
            compras = [];
 
            return;
        }
 
        const data =
            snapshot.val();
 
        compras =
            Object.entries(data).map(
                ([id, compra]) => ({
                    id,
                    ...compra
                })
            );
 
        compras.sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );
 
    } catch (error) {
 
        console.error(
            "Erro ao carregar compras:",
            error
        );
 
        compras = [];
    }
}

// ============================================================
// CARREGAR TUDO
// ============================================================

async function carregarDados() {

    await Promise.all([
        carregarBaterias(),
        carregarVendas(),
        carregarVeiculos(),
        carregarDespesas(),
        carregarCompras()
    ]);

    if (telaAtual === "inicio") {

        renderizarDashboard();

    } else if (telaAtual === "baterias") {

        renderizarTelaBaterias();

    } else if (telaAtual === "estoque") {

        renderizarTelaEstoque();

    } else if (telaAtual === "veiculos") {

        renderizarTelaVeiculos();

    } else if (telaAtual === "vendas") {

        abrirTelaVendas();

    } else if (telaAtual === "historico") {
 
        abrirTelaHistorico();
 
    } else if (telaAtual === "relatorios") {
 
        abrirTelaRelatorios();
 
    } else if (telaAtual === "financeiro") {
 
        abrirTelaFinanceiro();
    }
}

// ============================================================
// CARREGAR VEÍCULOS
// ============================================================

async function carregarVeiculos() {

    try {

        const snapshot =
            await get(
                ref(database, "veiculos")
            );

        if (!snapshot.exists()) {

            veiculos = [];

            return;
        }

        const data =
            snapshot.val();

        veiculos =
            Object.entries(data).map(
                ([id, veiculo]) => ({

                    id,

                    ...veiculo

                })
            );

    } catch (error) {

        console.error(
            "Erro ao carregar veículos:",
            error
        );

        veiculos = [];
    }
}


// ============================================================
// HOJE
// ============================================================

function ehHoje(data) {

    const hoje = new Date();

    const dataVenda =
        new Date(data);

    return (
        hoje.getFullYear() ===
            dataVenda.getFullYear() &&

        hoje.getMonth() ===
            dataVenda.getMonth() &&

        hoje.getDate() ===
            dataVenda.getDate()
    );
}


// ============================================================
// DASHBOARD
// ============================================================

function atualizarDashboard() {

    const vendasHoje =
        vendas.filter(
            venda =>
                ehHoje(venda.date)
        );


    const totalVendasHoje =
        vendasHoje.reduce(
            (total, venda) =>
                total +
                Number(venda.total || 0),
            0
        );


    const quantidadePedidos =
        vendasHoje.length;


    const estoqueTotal =
        baterias.reduce(
            (total, bateria) =>
                total +
                Number(bateria.stock || 0),
            0
        );


    const estoqueBaixo =
        baterias.filter(
            bateria =>
                Number(bateria.stock || 0) <= 2
        ).length;


    const ticketMedio =
        quantidadePedidos > 0
            ? totalVendasHoje /
              quantidadePedidos
            : 0;


    const salesToday =
        document.getElementById(
            "sales-today"
        );

    const ordersToday =
        document.getElementById(
            "orders-today"
        );

    const totalStock =
        document.getElementById(
            "total-stock"
        );

    const lowStock =
        document.getElementById(
            "low-stock"
        );

    const averageTicket =
        document.getElementById(
            "average-ticket"
        );


    if (salesToday) {

        salesToday.textContent =
            formatMoney(
                totalVendasHoje
            );
    }


    if (ordersToday) {

        ordersToday.textContent =
            quantidadePedidos;
    }


    if (totalStock) {

        totalStock.textContent =
            estoqueTotal;
    }


    if (lowStock) {

        lowStock.textContent =
            estoqueBaixo;
    }


    if (averageTicket) {

        averageTicket.textContent =
            formatMoney(
                ticketMedio
            );
    }


    atualizarMaisVendida();

    atualizarPagamentoFavorito();

    atualizarEstoqueBaixo();
}


// ============================================================
// MAIS VENDIDA
// ============================================================

function atualizarMaisVendida() {

    const elemento =
        document.getElementById(
            "best-selling"
        );


    if (!elemento) {
        return;
    }


    if (vendas.length === 0) {

        elemento.textContent =
            "Nenhuma venda registrada.";

        return;
    }


    const contagem = {};


    vendas.forEach(venda => {

        const nome =
            [
                venda.brand,
                venda.model
            ]
                .filter(Boolean)
                .join(" ")
            ||
            venda.code
            ||
            "Bateria";


        contagem[nome] =
            (contagem[nome] || 0) + 1;
    });


    const maisVendida =
        Object.entries(contagem)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )[0];


    elemento.innerHTML = `
        <strong>
            ${escapeHtml(maisVendida[0])}
        </strong>
        <br>
        <small>
            ${maisVendida[1]} venda(s)
        </small>
    `;
}


// ============================================================
// PAGAMENTO FAVORITO
// ============================================================

function atualizarPagamentoFavorito() {

    const elemento =
        document.getElementById(
            "favorite-payment"
        );


    if (!elemento) {
        return;
    }


    if (vendas.length === 0) {

        elemento.textContent =
            "Nenhuma venda registrada.";

        return;
    }


    const contagem = {};


    vendas.forEach(venda => {

        const metodo =
            venda.paymentMethod ||
            "Não informado";


        contagem[metodo] =
            (contagem[metodo] || 0) + 1;
    });


    const favorito =
        Object.entries(contagem)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )[0];


    const percentual =
        (favorito[1] /
            vendas.length) *
        100;


    elemento.innerHTML = `
        <strong>
            ${escapeHtml(favorito[0])}
        </strong>
        <br>
        <small>
            ${percentual.toFixed(0)}%
            das vendas
        </small>
    `;
}


// ============================================================
// ESTOQUE BAIXO — DASHBOARD
// ============================================================

function atualizarEstoqueBaixo() {

    const elemento =
        document.getElementById(
            "low-stock-list"
        );


    if (!elemento) {
        return;
    }


    const lista =
        baterias
            .filter(
                bateria =>
                    Number(
                        bateria.stock || 0
                    ) <= 2
            )
            .sort(
                (a, b) =>
                    Number(a.stock || 0) -
                    Number(b.stock || 0)
            )
            .slice(0, 6);


    if (lista.length === 0) {

        elemento.innerHTML = `
            <p class="empty-message">
                Nenhuma bateria com estoque baixo.
            </p>
        `;

        return;
    }


    elemento.innerHTML =
        lista
            .map(bateria => {

                const estoque =
                    Number(
                        bateria.stock || 0
                    );


                let status;


                if (estoque === 0) {

                    status = "Sem estoque";

                } else if (estoque === 1) {

                    status = "Crítico";

                } else {

                    status = "Baixo";
                }


                const nome =
                    [
                        bateria.brand,
                        bateria.model
                    ]
                        .filter(Boolean)
                        .join(" ")
                    ||
                    "Bateria";


                return `
                    <div class="stock-row">

                        <div>
                            <strong>
                                ${escapeHtml(nome)}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    formatAmperage(
                                        bateria.amperage
                                    )
                                )}
                            </small>
                        </div>

                        <span>
                            ${estoque}
                            un. ·
                            ${status}
                        </span>

                    </div>
                `;
            })
            .join("");
}


// ============================================================
// MENU
// ============================================================

document
    .querySelectorAll(
        ".menu-item[data-screen]"
    )
    .forEach(item => {

        item.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".menu-item"
                    )
                    .forEach(menuItem => {

                        menuItem.classList.remove(
                            "active"
                        );
                    });


                item.classList.add(
                    "active"
                );


                const screen =
                    item.dataset.screen;


                abrirTela(screen);
            }
        );
    });


// ============================================================
// ABRIR TELA
// ============================================================

function abrirTela(screen) {

    telaAtual = screen;


    const nomes = {

        inicio: {
            titulo: "Início",
            subtitulo:
                "Visão geral da sua loja"
        },

        baterias: {
            titulo: "Baterias",
            subtitulo:
                "Gerencie suas baterias"
        },

        estoque: {
            titulo: "Estoque",
            subtitulo:
                "Controle o estoque da loja"
        },

        veiculos: {
            titulo: "Veículos",
            subtitulo:
                "Gerencie os veículos cadastrados"
        },

        vendas: {
            titulo: "Vendas",
            subtitulo:
                "Registre e acompanhe suas vendas"
        },

        historico: {
            titulo:
                "Histórico de vendas",
            subtitulo:
                "Consulte as vendas realizadas"
        },

        relatorios: {
            titulo:
                "Relatórios",
            subtitulo:
                "Visualize os dados da loja"
        },

        financeiro: {
            titulo:
                "Financeiro",
            subtitulo:
                "Acompanhe o financeiro da loja"
        }
    };


    const info =
        nomes[screen];


    if (!info) {
        return;
    }


    pageTitle.textContent =
        info.titulo;


    pageSubtitle.textContent =
        info.subtitulo;


    if (screen === "inicio") {

        renderizarDashboard();

        return;
    }


    if (screen === "baterias") {

        abrirTelaBaterias();

        return;
    }


    if (screen === "estoque") {

        abrirTelaEstoque();

        return;
    }


    if (screen === "veiculos") {

        abrirTelaVeiculos();

        return;
    }


    if (screen === "vendas") {

        abrirTelaVendas();

        return;
    }


    if (screen === "historico") {
 
        abrirTelaHistorico();
 
        return;
    }
 
 
    if (screen === "relatorios") {
 
        abrirTelaRelatorios();
 
        return;
    }
 
 
    if (screen === "financeiro") {
 
        abrirTelaFinanceiro();
 
        return;
    }


    screenContent.innerHTML = `
        <div class="section-card">

            <h2>
                ${info.titulo}
            </h2>

            <p
                style="
                    margin-top: 10px;
                    color: #78847E;
                "
            >
                Esta tela será construída
                nas próximas etapas.
            </p>

        </div>
    `;
}


// ============================================================
// RENDERIZAR DASHBOARD
// ============================================================

function renderizarDashboard() {

    screenContent.innerHTML = `

        <div class="welcome-card">

            <div>

                <h2>
                    Casa das Baterias 👋
                </h2>

                <p>
                    Bem-vinda ao sistema de
                    gerenciamento da loja.
                </p>

            </div>

        </div>


        <div class="stats-grid">

            <div class="stat-card">

                <span class="stat-label">
                    Vendas hoje
                </span>

                <strong id="sales-today">
                    R$ 0,00
                </strong>

            </div>


            <div class="stat-card">

                <span class="stat-label">
                    Pedidos hoje
                </span>

                <strong id="orders-today">
                    0
                </strong>

            </div>


            <div class="stat-card">

                <span class="stat-label">
                    Estoque total
                </span>

                <strong id="total-stock">
                    0
                </strong>

            </div>


            <div class="stat-card">

                <span class="stat-label">
                    Estoque baixo
                </span>

                <strong id="low-stock">
                    0
                </strong>

            </div>


            <div class="stat-card">

                <span class="stat-label">
                    Ticket médio
                </span>

                <strong id="average-ticket">
                    R$ 0,00
                </strong>

            </div>

        </div>


        <div class="section-card">

            <div class="section-header">

                <div>

                    <h2>
                        Últimos 7 dias
                    </h2>

                    <p>
                        Resumo das vendas
                    </p>

                </div>

            </div>


            <div
                id="sales-chart"
                class="chart"
            >
                Resumo das vendas
            </div>

        </div>


        <div class="bottom-grid">

            <div class="section-card">

                <div class="section-header">

                    <div>

                        <h2>
                            Mais vendida
                        </h2>

                        <p>
                            Produto com mais vendas
                        </p>

                    </div>

                </div>


                <div id="best-selling">
                    Nenhuma venda registrada.
                </div>

            </div>


            <div class="section-card">

                <div class="section-header">

                    <div>

                        <h2>
                            Pagamento favorito
                        </h2>

                        <p>
                            Forma de pagamento mais utilizada
                        </p>

                    </div>

                </div>


                <div id="favorite-payment">
                    Nenhuma venda registrada.
                </div>

            </div>

        </div>


        <div class="section-card">

            <div class="section-header">

                <div>

                    <h2>
                        Estoque baixo
                    </h2>

                    <p>
                        Baterias que precisam de atenção
                    </p>

                </div>

            </div>


            <div id="low-stock-list">

                <p class="empty-message">
                    Nenhuma bateria com estoque baixo.
                </p>

            </div>

        </div>

    `;


    atualizarDashboard();
}


// ============================================================
// TELA DE BATERIAS
// ============================================================

function abrirTelaBaterias() {

    renderizarTelaBaterias();
}


// ============================================================
// RENDERIZAR BATERIAS
// ============================================================

function renderizarTelaBaterias(
    busca = "",
    amperagemSelecionada = "Todas"
) {

    const buscaNormalizada =
        busca
            .trim()
            .toLowerCase();


    const amperagens =
        [
            ...new Set(
                baterias
                    .map(
                        bateria =>
                            bateria.amperage
                    )
                    .filter(Boolean)
            )
        ]
        .sort(
            (a, b) =>
                String(a).localeCompare(
                    String(b),
                    "pt-BR",
                    {
                        numeric: true
                    }
                )
        );


        const bateriasFiltradas =
        baterias.filter(
            bateria => {

                const texto =
                    [
                        bateria.brand,
                        bateria.model,
                        bateria.code,
                        bateria.amperage
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                const correspondePesquisa =
                    buscaNormalizada === "" ||
                    texto.includes(
                        buscaNormalizada
                    );


                const correspondeAmperagem =
                    amperagemSelecionada ===
                        "Todas" ||
                    bateria.amperage ===
                        amperagemSelecionada;


                return (
                    correspondePesquisa &&
                    correspondeAmperagem
                );
            }
        );


    if (amperagemSelecionada !== "Todas") {

        bateriasFiltradas.sort(
            (a, b) => {

                const precoA =
                    a.price !== null && a.price !== undefined
                        ? Number(a.price)
                        : Infinity;

                const precoB =
                    b.price !== null && b.price !== undefined
                        ? Number(b.price)
                        : Infinity;

                return precoA - precoB;
            }
        );
    }
    


    screenContent.innerHTML = `

        <div class="batteries-screen">


            <div class="batteries-header">

                <div>

                    <h2>
                        Baterias
                    </h2>

                    <p>
                        Consulte preços,
                        características e
                        disponibilidade das baterias.
                    </p>

                </div>


                <button
                    id="nova-bateria-button"
                    class="primary-button"
                >

                    <span>
                        ＋
                    </span>

                    Nova bateria

                </button>

            </div>


            <div class="batteries-filters">

                <div class="search-box">

                    <span>
                        ⌕
                    </span>


                    <input
                        id="busca-bateria"
                        type="text"
                        placeholder="Pesquisar por marca, modelo, código ou amperagem..."
                        value="${escapeHtml(busca)}"
                    >


                    ${
                        busca
                            ? `
                                <button
                                    id="limpar-busca"
                                    class="clear-search"
                                >
                                    ×
                                </button>
                            `
                            : ""
                    }

                </div>


                <select
                    id="filtro-amperagem"
                    class="amperage-filter"
                >

                    <option value="Todas">
                        Amperagem
                    </option>


                    ${
                        amperagens
                            .map(
                                amperagem => `
                                    <option
                                        value="${escapeHtml(
                                            amperagem
                                        )}"
                                        ${
                                            amperagem ===
                                            amperagemSelecionada
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${formatAmperage(
                                            amperagem
                                        )}
                                    </option>
                                `
                            )
                            .join("")
                    }

                </select>

            </div>


            <div class="batteries-list">

                ${
                    bateriasFiltradas.length === 0

                        ? `
                            <div class="battery-empty">

                                <div
                                    class="battery-empty-icon"
                                >
                                    ⌕
                                </div>

                                <h3>
                                    Nenhuma bateria encontrada.
                                </h3>

                                <p>
                                    Tente pesquisar
                                    por outro termo.
                                </p>

                            </div>
                        `

                        : bateriasFiltradas
                            .map(
                                bateria =>
                                    criarCardBateria(
                                        bateria
                                    )
                            )
                            .join("")
                }

            </div>

        </div>

    `;


    const campoBusca =
        document.getElementById(
            "busca-bateria"
        );


    campoBusca.addEventListener(
        "input",
        evento => {

            const filtro =
                document.getElementById(
                    "filtro-amperagem"
                ).value;


            renderizarTelaBaterias(
                evento.target.value,
                filtro
            );
        }
    );


    document
        .getElementById(
            "filtro-amperagem"
        )
        .addEventListener(
            "change",
            evento => {

                const buscaAtual =
                    document.getElementById(
                        "busca-bateria"
                    ).value;


                renderizarTelaBaterias(
                    buscaAtual,
                    evento.target.value
                );
            }
        );


    const limparBusca =
        document.getElementById(
            "limpar-busca"
        );


    if (limparBusca) {

        limparBusca.addEventListener(
            "click",
            () => {

                renderizarTelaBaterias(
                    "",
                    document.getElementById(
                        "filtro-amperagem"
                    ).value
                );
            }
        );
    }


    document
        .getElementById(
            "nova-bateria-button"
        )
        .addEventListener(
            "click",
            () => {

                mostrarFormularioBateria();
            }
        );
}


// ============================================================
// CARD DA BATERIA
// ============================================================

function criarCardBateria(bateria) {

    const estoque =
        Number(
            bateria.stock || 0
        );


    const nome =
        [
            bateria.brand,
            bateria.model
        ]
            .filter(Boolean)
            .join(" ")
        ||
        "Sem marca";


    const amperagem =
        bateria.amperage || "";


    let disponibilidade;


    if (estoque === 0) {

        disponibilidade = `
            <span
                class="stock-status stock-danger"
            >
                ✕ Sem estoque
            </span>
        `;

    } else if (estoque <= 2) {

        disponibilidade = `
            <span
                class="stock-status stock-warning"
            >
                ⚠ ${estoque} disponíveis
            </span>
        `;

    } else {

        disponibilidade = `
            <span
                class="stock-status stock-ok"
            >
                ✓ ${estoque} disponíveis
            </span>
        `;
    }


    return `

        <div class="battery-card">

            <div class="battery-icon">
                🔋
            </div>


            <div class="battery-info">

                <h3>
                    ${escapeHtml(nome)}
                </h3>


                <p>

                    ${
                        amperagem
                            ? formatAmperage(
                                amperagem
                            )
                            : ""
                    }


                    ${
                        amperagem &&
                        bateria.code
                            ? " • "
                            : ""
                    }


                    ${
                        bateria.code
                            ? `Código:
                               ${escapeHtml(
                                   bateria.code
                               )}`
                            : ""
                    }

                </p>

            </div>


            <div class="battery-price">

                <strong>

                    ${
                        bateria.price !== null &&
                        bateria.price !== undefined &&
                        bateria.price !== ""
                            ? formatMoney(
                                bateria.price
                            )
                            : "Preço não informado"
                    }

                </strong>


                ${disponibilidade}

            </div>


            <button
                class="icon-button"
                title="Visualizar"
                data-action="view"
                data-id="${escapeHtml(
                    bateria.id
                )}"
            >
                ◉
            </button>


            <button
                class="icon-button"
                title="Mais opções"
                data-action="menu"
                data-id="${escapeHtml(
                    bateria.id
                )}"
            >
                ⋮
            </button>

        </div>

    `;
}


// ============================================================
// FORMULÁRIO DE BATERIA
// ============================================================

function mostrarFormularioBateria(
    bateriaEditar = null
) {

    const editando =
        bateriaEditar !== null;


    const precoInicial =
        editando &&
        bateriaEditar.price !== null &&
        bateriaEditar.price !== undefined
            ? String(
                bateriaEditar.price
            ).replace(".", ",")
            : "";


    screenContent.insertAdjacentHTML(
        "beforeend",
        `

        <div
            class="modal-overlay"
            id="bateria-modal"
        >

            <div class="battery-modal">

                <div class="modal-header">

                    <div>

                        <h2>
                            ${
                                editando
                                    ? "Editar bateria"
                                    : "Nova bateria"
                            }
                        </h2>

                        <p>
                            ${
                                editando
                                    ? "Altere os dados da bateria."
                                    : "Cadastre uma nova bateria."
                            }
                        </p>

                    </div>


                    <button
                        class="modal-close"
                        id="fechar-modal-bateria"
                    >
                        ×
                    </button>

                </div>


                <form id="form-bateria">

                    <div class="form-grid">


                        <div class="form-group">

                            <label>
                                Marca
                            </label>

                            <input
                                id="bateria-marca"
                                type="text"
                                value="${
                                    editando
                                        ? escapeHtml(
                                            bateriaEditar.brand
                                        )
                                        : ""
                                }"
                                placeholder="Ex.: Moura"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Modelo
                            </label>

                            <input
                                id="bateria-modelo"
                                type="text"
                                value="${
                                    editando
                                        ? escapeHtml(
                                            bateriaEditar.model
                                        )
                                        : ""
                                }"
                                placeholder="Ex.: M60GD"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Amperagem
                            </label>

                            <input
                                id="bateria-amperagem"
                                type="text"
                                value="${
                                    editando
                                        ? escapeHtml(
                                            bateriaEditar.amperage
                                        )
                                        : ""
                                }"
                                placeholder="Ex.: 60EFB"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Preço
                            </label>

                            <input
                                id="bateria-preco"
                                type="text"
                                inputmode="decimal"
                                value="${precoInicial}"
                                placeholder="Ex.: 450,00"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Garantia
                            </label>

                            <input
                                id="bateria-garantia"
                                type="text"
                                value="${
                                    editando
                                        ? escapeHtml(
                                            bateriaEditar.warranty
                                        )
                                        : ""
                                }"
                                placeholder="Ex.: 12 meses"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Código
                            </label>

                            <input
                                id="bateria-codigo"
                                type="text"
                                value="${
                                    editando
                                        ? escapeHtml(
                                            bateriaEditar.code
                                        )
                                        : ""
                                }"
                                placeholder="Código da bateria"
                            >

                        </div>


                        <div
                            class="form-group form-group-full"
                        >

                            <label>
                                Observações
                            </label>

                            <textarea
                                id="bateria-observacoes"
                                placeholder="Observações sobre a bateria..."
                            >${
                                editando
                                    ? escapeHtml(
                                        bateriaEditar.notes
                                    )
                                    : ""
                            }</textarea>

                        </div>

                    </div>


                    <div class="modal-actions">

                        <button
                            type="button"
                            class="secondary-button"
                            id="cancelar-bateria"
                        >
                            Cancelar
                        </button>


                        <button
                            type="submit"
                            class="primary-button"
                        >
                            ${
                                editando
                                    ? "Salvar alterações"
                                    : "Salvar bateria"
                            }
                        </button>

                    </div>

                </form>

            </div>

        </div>

        `
    );


    const modal =
        document.getElementById(
            "bateria-modal"
        );


    const fechar =
        () => modal.remove();


    document
        .getElementById(
            "fechar-modal-bateria"
        )
        .addEventListener(
            "click",
            fechar
        );


    document
        .getElementById(
            "cancelar-bateria"
        )
        .addEventListener(
            "click",
            fechar
        );


    document
        .getElementById(
            "form-bateria"
        )
        .addEventListener(
            "submit",
            async evento => {

                evento.preventDefault();


                const marca =
                    document
                        .getElementById(
                            "bateria-marca"
                        )
                        .value
                        .trim();


                const modelo =
                    document
                        .getElementById(
                            "bateria-modelo"
                        )
                        .value
                        .trim();


                const amperagem =
                    document
                        .getElementById(
                            "bateria-amperagem"
                        )
                        .value
                        .trim()
                        .toUpperCase();


                const precoTexto =
                    document
                        .getElementById(
                            "bateria-preco"
                        )
                        .value
                        .trim();


                const garantia =
                    document
                        .getElementById(
                            "bateria-garantia"
                        )
                        .value
                        .trim();


                const codigo =
                    document
                        .getElementById(
                            "bateria-codigo"
                        )
                        .value
                        .trim();


                const observacoes =
                    document
                        .getElementById(
                            "bateria-observacoes"
                        )
                        .value
                        .trim();


                let preco = null;


                if (precoTexto) {

                    preco =
                        Number(
                            precoTexto
                                .replace(/\./g, "")
                                .replace(",", ".")
                        );


                    if (Number.isNaN(preco)) {

                        alert(
                            "Digite um preço válido."
                        );

                        return;
                    }
                }


                if (
                    !marca ||
                    !amperagem ||
                    preco === null
                ) {

                    const continuar =
                        confirm(
                            "Marca, amperagem e preço não foram preenchidos.\n\n" +
                            "Deseja salvar a bateria mesmo assim?"
                        );


                    if (!continuar) {
                        return;
                    }
                }


                const dados = {

                    brand:
                        marca || null,

                    model:
                        modelo || null,

                    amperage:
                        amperagem || null,

                    price:
                        preco,

                    warranty:
                        garantia || null,

                    code:
                        codigo || null,

                    notes:
                        observacoes || null
                };


                try {

                    if (!editando) {

                        const id =
                            Date.now().toString();


                        const novaBateria = {

                            ...dados,

                            stock: 0
                        };


                        await set(
                            ref(
                                database,
                                `baterias/${id}`
                            ),
                            novaBateria
                        );


                        baterias.push({

                            id,

                            ...novaBateria
                        });


                    } else {

                        await update(
                            ref(
                                database,
                                `baterias/${bateriaEditar.id}`
                            ),
                            dados
                        );


                        const index =
                            baterias.findIndex(
                                bateria =>
                                    bateria.id ===
                                    bateriaEditar.id
                            );


                        if (index !== -1) {

                            baterias[index] = {

                                ...baterias[index],

                                ...dados
                            };
                        }
                    }


                    modal.remove();


                    if (
                        telaAtual ===
                        "estoque"
                    ) {

                        renderizarTelaEstoque();

                    } else {

                        renderizarTelaBaterias();
                    }


                } catch (error) {

                    console.error(
                        "Erro ao salvar bateria:",
                        error
                    );


                    alert(
                        "Não foi possível salvar a bateria."
                    );
                }
            }
        );
}


// ============================================================
// VISUALIZAR BATERIA
// ============================================================

function visualizarBateria(bateria) {

    const estoque =
        Number(
            bateria.stock || 0
        );


    const preco =
        bateria.price !== null &&
        bateria.price !== undefined
            ? formatMoney(
                bateria.price
            )
            : "Não informado";


    const nome =
        [
            bateria.brand,
            bateria.model
        ]
            .filter(Boolean)
            .join(" ")
        ||
        "Bateria";


    screenContent.insertAdjacentHTML(
        "beforeend",
        `

        <div
            class="modal-overlay"
            id="visualizar-bateria-modal"
        >

            <div class="battery-modal">

                <div class="modal-header">

                    <div>

                        <h2>
                            ${escapeHtml(nome)}
                        </h2>

                        <p>
                            Detalhes da bateria
                        </p>

                    </div>


                    <button
                        class="modal-close"
                        id="fechar-visualizacao"
                    >
                        ×
                    </button>

                </div>


                <div class="details-grid">

                    <div class="detail-item">

                        <span>
                            Marca
                        </span>

                        <strong>
                            ${
                                escapeHtml(
                                    bateria.brand
                                )
                                ||
                                "Não informado"
                            }
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Modelo
                        </span>

                        <strong>
                            ${
                                escapeHtml(
                                    bateria.model
                                )
                                ||
                                "Não informado"
                            }
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Amperagem
                        </span>

                        <strong>
                            ${
                                bateria.amperage
                                    ? formatAmperage(
                                        bateria.amperage
                                    )
                                    : "Não informado"
                            }
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Preço
                        </span>

                        <strong>
                            ${preco}
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Garantia
                        </span>

                        <strong>
                            ${
                                escapeHtml(
                                    bateria.warranty
                                )
                                ||
                                "Não informado"
                            }
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Código
                        </span>

                        <strong>
                            ${
                                escapeHtml(
                                    bateria.code
                                )
                                ||
                                "Não informado"
                            }
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Estoque
                        </span>

                        <strong>
                            ${estoque}
                            unidade(s)
                        </strong>

                    </div>


                    <div
                        class="detail-item detail-full"
                    >

                        <span>
                            Observações
                        </span>

                        <strong>
                            ${
                                escapeHtml(
                                    bateria.notes
                                )
                                ||
                                "Nenhuma observação."
                            }
                        </strong>

                    </div>

                </div>


                <div class="modal-actions">

                    <button
                        class="secondary-button"
                        id="fechar-detalhes"
                    >
                        Fechar
                    </button>

                </div>

            </div>

        </div>

        `
    );


    const modal =
        document.getElementById(
            "visualizar-bateria-modal"
        );


    document
        .getElementById(
            "fechar-visualizacao"
        )
        .addEventListener(
            "click",
            () => modal.remove()
        );


    document
        .getElementById(
            "fechar-detalhes"
        )
        .addEventListener(
            "click",
            () => modal.remove()
        );
}


// ============================================================
// MENU DE OPÇÕES DA BATERIA
// ============================================================

function abrirMenuBateria(
    bateria,
    botao
) {

    const menuAntigo =
        document.querySelector(
            ".battery-options-menu"
        );


    if (menuAntigo) {
        menuAntigo.remove();
    }


    const rect =
        botao.getBoundingClientRect();


    const menu =
        document.createElement(
            "div"
        );


    menu.className =
        "battery-options-menu";


    menu.innerHTML = `

        <button data-option="edit">
            ✎ Editar
        </button>

        <button data-option="delete">
            🗑 Excluir
        </button>

    `;


    menu.style.top =
        `${rect.bottom + 6}px`;


    menu.style.left =
        `${rect.left - 105}px`;


    document.body.appendChild(
        menu
    );


    menu
        .querySelector(
            '[data-option="edit"]'
        )
        .addEventListener(
            "click",
            () => {

                menu.remove();

                mostrarFormularioBateria(
                    bateria
                );
            }
        );


    menu
        .querySelector(
            '[data-option="delete"]'
        )
        .addEventListener(
            "click",
            async () => {

                menu.remove();


                const nome =
                    [
                        bateria.brand,
                        bateria.model
                    ]
                        .filter(Boolean)
                        .join(" ")
                    ||
                    "esta bateria";


                const confirmar =
                    confirm(
                        `Deseja excluir "${nome}"?`
                    );


                if (!confirmar) {
                    return;
                }


                try {

                    await remove(
                        ref(
                            database,
                            `baterias/${bateria.id}`
                        )
                    );


                    baterias =
                        baterias.filter(
                            item =>
                                item.id !==
                                bateria.id
                        );


                    if (
                        telaAtual ===
                        "estoque"
                    ) {

                        renderizarTelaEstoque();

                    } else {

                        renderizarTelaBaterias();
                    }


                } catch (error) {

                    console.error(
                        "Erro ao excluir bateria:",
                        error
                    );


                    alert(
                        "Não foi possível excluir a bateria."
                    );
                }
            }
        );


    setTimeout(
        () => {

            function fecharMenu(evento) {

                if (
                    !menu.contains(
                        evento.target
                    ) &&
                    evento.target !== botao
                ) {

                    menu.remove();

                    document.removeEventListener(
                        "click",
                        fecharMenu
                    );
                }
            }


            document.addEventListener(
                "click",
                fecharMenu
            );

        },
        0
    );
}


// ============================================================
// AÇÕES DOS CARDS DE BATERIAS
// ============================================================

screenContent.addEventListener(
    "click",
    evento => {

        const botao =
            evento.target.closest(
                ".icon-button"
            );


        if (!botao) {
            return;
        }


        const id =
            botao.dataset.id;


        const bateria =
            baterias.find(
                item =>
                    String(item.id) ===
                    String(id)
            );


        if (!bateria) {
            return;
        }


        const acao =
            botao.dataset.action;


        if (acao === "view") {

            visualizarBateria(
                bateria
            );
        }


        if (acao === "menu") {

            abrirMenuBateria(
                bateria,
                botao
            );
        }
    }
);


// ============================================================
// ============================================================
// TELA DE ESTOQUE
// ============================================================
// ============================================================

function abrirTelaEstoque() {

    renderizarTelaEstoque();
}


// ============================================================
// RENDERIZAR TELA DE ESTOQUE
// ============================================================

function renderizarTelaEstoque(
    busca = "",
    filtroEstoque = "Todos",
    filtroAmperagem = "Todas"
) {

    const buscaNormalizada =
        busca
            .trim()
            .toLowerCase();


    // --------------------------------------------------------
    // AMPERAGENS DISPONÍVEIS
    // --------------------------------------------------------

    const amperagens = [
        ...new Set(
            baterias
                .map(
                    bateria =>
                        bateria.amperage
                )
                .filter(
                    amperagem =>
                        amperagem !== null &&
                        amperagem !== undefined &&
                        String(amperagem).trim() !== ""
                )
        )
    ];


    amperagens.sort(
        (a, b) => {

            const aNumero =
                parseFloat(
                    String(a).replace(
                        /[^0-9.]/g,
                        ""
                    )
                ) || 0;


            const bNumero =
                parseFloat(
                    String(b).replace(
                        /[^0-9.]/g,
                        ""
                    )
                ) || 0;


            if (aNumero !== bNumero) {
                return aNumero - bNumero;
            }


            return String(a).localeCompare(
                String(b),
                "pt-BR",
                {
                    numeric: true
                }
            );
        }
    );


    // --------------------------------------------------------
    // FILTRAR BATERIAS
    // --------------------------------------------------------

    const bateriasFiltradas =
        baterias.filter(
            bateria => {

                const texto =
                    [
                        bateria.brand,
                        bateria.model,
                        bateria.code,
                        bateria.amperage
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                // Pesquisa

                if (
                    buscaNormalizada &&
                    !texto.includes(
                        buscaNormalizada
                    )
                ) {
                    return false;
                }


                // Filtro de amperagem

                if (
                    filtroAmperagem !== "Todas" &&
                    String(
                        bateria.amperage || ""
                    ) !==
                    String(
                        filtroAmperagem
                    )
                ) {
                    return false;
                }


                const estoque =
                    Number(
                        bateria.stock || 0
                    );


                // Estoque baixo

                if (
                    filtroEstoque === "Baixo" &&
                    !(
                        estoque > 0 &&
                        estoque <= 3
                    )
                ) {
                    return false;
                }


                // Sem estoque

                if (
                    filtroEstoque ===
                    "Sem estoque" &&
                    estoque !== 0
                ) {
                    return false;
                }


                return true;
            }
        );


    // --------------------------------------------------------
    // RESUMOS
    // --------------------------------------------------------

    const totalProdutos =
        baterias.length;


    const totalUnidades =
        baterias.reduce(
            (total, bateria) =>
                total +
                Number(
                    bateria.stock || 0
                ),
            0
        );


    const estoqueBaixo =
        baterias.filter(
            bateria => {

                const estoque =
                    Number(
                        bateria.stock || 0
                    );

                return (
                    estoque > 0 &&
                    estoque <= 3
                );
            }
        ).length;


    const semEstoque =
        baterias.filter(
            bateria =>
                Number(
                    bateria.stock || 0
                ) === 0
        ).length;


    // --------------------------------------------------------
    // HTML
    // --------------------------------------------------------

    screenContent.innerHTML = `

        <div class="stock-screen">


            <!-- CABEÇALHO -->

            <div class="stock-page-header">

                <div>

                    <h2>
                        Estoque
                    </h2>

                    <p>
                        Acompanhe as baterias disponíveis
                        no estoque.
                    </p>

                </div>

            </div>


            <!-- RESUMO -->

            <div class="stock-summary-grid">


                <div class="stock-summary-card">

                    <div class="stock-summary-icon">
                        ▣
                    </div>

                    <div>

                        <span>
                            Produtos no catálogo
                        </span>

                        <strong>
                            ${totalProdutos}
                        </strong>

                    </div>

                </div>


                <div class="stock-summary-card">

                    <div class="stock-summary-icon">
                        🔋
                    </div>

                    <div>

                        <span>
                            Unidades em estoque
                        </span>

                        <strong>
                            ${totalUnidades}
                        </strong>

                    </div>

                </div>


                <div class="stock-summary-card">

                    <div class="stock-summary-icon">
                        ⚠
                    </div>

                    <div>

                        <span>
                            Estoque baixo
                        </span>

                        <strong>
                            ${estoqueBaixo}
                        </strong>

                    </div>

                </div>


                <div class="stock-summary-card">

                    <div class="stock-summary-icon">
                        −
                    </div>

                    <div>

                        <span>
                            Sem estoque
                        </span>

                        <strong>
                            ${semEstoque}
                        </strong>

                    </div>

                </div>


            </div>


            <!-- FILTROS -->

            <div class="stock-filters">


                <div class="stock-search-box">

                    <span>
                        ⌕
                    </span>


                    <input
                        id="estoque-busca"
                        type="text"
                        placeholder="Pesquisar por marca, modelo, código ou amperagem..."
                        value="${escapeHtml(busca)}"
                    >


                    ${
                        busca
                            ? `
                                <button
                                    id="estoque-limpar-busca"
                                    type="button"
                                >
                                    ×
                                </button>
                            `
                            : ""
                    }

                </div>


                <select
                    id="estoque-filtro-amperagem"
                    class="stock-select"
                >

                    <option value="Todas">
                        Todas as amperagens
                    </option>


                    ${
                        amperagens
                            .map(
                                amperagem => `
                                    <option
                                        value="${escapeHtml(
                                            amperagem
                                        )}"
                                        ${
                                            String(
                                                amperagem
                                            ) ===
                                            String(
                                                filtroAmperagem
                                            )
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${formatAmperage(
                                            amperagem
                                        )}
                                    </option>
                                `
                            )
                            .join("")
                    }

                </select>


                <select
                    id="estoque-filtro-situacao"
                    class="stock-select"
                >

                    <option
                        value="Todos"
                        ${
                            filtroEstoque === "Todos"
                                ? "selected"
                                : ""
                        }
                    >
                        Todos
                    </option>

                    <option
                        value="Baixo"
                        ${
                            filtroEstoque === "Baixo"
                                ? "selected"
                                : ""
                        }
                    >
                        Estoque baixo
                    </option>

                    <option
                        value="Sem estoque"
                        ${
                            filtroEstoque ===
                            "Sem estoque"
                                ? "selected"
                                : ""
                        }
                    >
                        Sem estoque
                    </option>

                </select>


            </div>


            <!-- LISTA -->

            <div class="stock-list">


                ${
                    bateriasFiltradas.length === 0

                        ? `
                            <div class="stock-empty">

                                <div class="stock-empty-icon">
                                    ${
                                        busca ||
                                        filtroEstoque !==
                                            "Todos" ||
                                        filtroAmperagem !==
                                            "Todas"
                                            ? "⌕"
                                            : "▤"
                                    }
                                </div>


                                <h3>

                                    ${
                                        busca ||
                                        filtroEstoque !==
                                            "Todos" ||
                                        filtroAmperagem !==
                                            "Todas"
                                            ? "Nenhuma bateria encontrada."
                                            : "Nenhuma bateria disponível no catálogo."
                                    }

                                </h3>


                                <p>

                                    ${
                                        busca ||
                                        filtroEstoque !==
                                            "Todos" ||
                                        filtroAmperagem !==
                                            "Todas"
                                            ? "Tente alterar os filtros de pesquisa."
                                            : "As baterias cadastradas no catálogo aparecerão aqui."
                                    }

                                </p>


                                ${
                                    busca ||
                                    filtroEstoque !==
                                        "Todos" ||
                                    filtroAmperagem !==
                                        "Todas"
                                        ? `
                                            <button
                                                id="limpar-filtros-estoque"
                                                class="secondary-button"
                                                type="button"
                                            >
                                                Limpar filtros
                                            </button>
                                        `
                                        : ""
                                }

                            </div>
                        `

                        : bateriasFiltradas
                            .map(
                                bateria =>
                                    criarCardEstoque(
                                        bateria
                                    )
                            )
                            .join("")
                }

            </div>


        </div>

    `;


    // --------------------------------------------------------
    // PESQUISA
    // --------------------------------------------------------

    const campoBusca =
        document.getElementById(
            "estoque-busca"
        );


    if (campoBusca) {

        campoBusca.addEventListener(
            "input",
            evento => {

                const amperagem =
                    document.getElementById(
                        "estoque-filtro-amperagem"
                    ).value;


                const situacao =
                    document.getElementById(
                        "estoque-filtro-situacao"
                    ).value;


                renderizarTelaEstoque(
                    evento.target.value,
                    situacao,
                    amperagem
                );
            }
        );
    }


    // --------------------------------------------------------
    // FILTRO AMPERAGEM
    // --------------------------------------------------------

    const filtroAmperagemElemento =
        document.getElementById(
            "estoque-filtro-amperagem"
        );


    if (filtroAmperagemElemento) {

        filtroAmperagemElemento.addEventListener(
            "change",
            evento => {

                const buscaAtual =
                    document.getElementById(
                        "estoque-busca"
                    ).value;


                const situacao =
                    document.getElementById(
                        "estoque-filtro-situacao"
                    ).value;


                renderizarTelaEstoque(
                    buscaAtual,
                    situacao,
                    evento.target.value
                );
            }
        );
    }


    // --------------------------------------------------------
    // FILTRO ESTOQUE
    // --------------------------------------------------------

    const filtroSituacao =
        document.getElementById(
            "estoque-filtro-situacao"
        );


    if (filtroSituacao) {

        filtroSituacao.addEventListener(
            "change",
            evento => {

                const buscaAtual =
                    document.getElementById(
                        "estoque-busca"
                    ).value;


                const amperagemAtual =
                    document.getElementById(
                        "estoque-filtro-amperagem"
                    ).value;


                renderizarTelaEstoque(
                    buscaAtual,
                    evento.target.value,
                    amperagemAtual
                );
            }
        );
    }


    // --------------------------------------------------------
    // LIMPAR BUSCA
    // --------------------------------------------------------

    const limparBusca =
        document.getElementById(
            "estoque-limpar-busca"
        );


    if (limparBusca) {

        limparBusca.addEventListener(
            "click",
            () => {

                const situacao =
                    document.getElementById(
                        "estoque-filtro-situacao"
                    ).value;


                const amperagem =
                    document.getElementById(
                        "estoque-filtro-amperagem"
                    ).value;


                renderizarTelaEstoque(
                    "",
                    situacao,
                    amperagem
                );
            }
        );
    }


    // --------------------------------------------------------
    // LIMPAR TODOS OS FILTROS
    // --------------------------------------------------------

    const limparFiltros =
        document.getElementById(
            "limpar-filtros-estoque"
        );


    if (limparFiltros) {

        limparFiltros.addEventListener(
            "click",
            () => {

                renderizarTelaEstoque();
            }
        );
    }
}


// ============================================================
// CARD DO ESTOQUE
// ============================================================

function criarCardEstoque(bateria) {

    const estoque =
        Number(
            bateria.stock || 0
        );


    const semEstoque =
        estoque === 0;


    const estoqueBaixo =
        estoque > 0 &&
        estoque <= 3;


    const nome =
        [
            bateria.brand,
            bateria.model
        ]
            .filter(Boolean)
            .join(" ")
        ||
        "Sem marca";


    const detalhes = [];


    if (bateria.amperage) {

        detalhes.push(
            formatAmperage(
                bateria.amperage
            )
        );
    }


    if (
        bateria.code &&
        String(
            bateria.code
        ).trim()
    ) {

        detalhes.push(
            `Código: ${escapeHtml(
                bateria.code
            )}`
        );
    }


    if (
        bateria.warranty &&
        String(
            bateria.warranty
        ).trim()
    ) {

        detalhes.push(
            `Garantia: ${escapeHtml(
                bateria.warranty
            )}`
        );
    }


    let statusTexto;

    let statusClasse;


    if (semEstoque) {

        statusTexto =
            "Sem estoque";

        statusClasse =
            "stock-card-danger";

    } else if (estoqueBaixo) {

        statusTexto =
            "Baixo";

        statusClasse =
            "stock-card-warning";

    } else {

        statusTexto =
            "Disponível";

        statusClasse =
            "stock-card-ok";
    }


    return `

        <div class="stock-battery-card">


            <!-- ÍCONE -->

            <div
                class="stock-battery-icon
                    ${statusClasse}"
            >
                🔋
            </div>


            <!-- INFORMAÇÕES -->

            <div class="stock-battery-info">

                <h3>
                    ${escapeHtml(nome)}
                </h3>


                <p>
                    ${detalhes.join(" • ")}
                </p>

            </div>


            <!-- PREÇO -->

            <div class="stock-battery-price">

                <span>
                    Preço
                </span>

                <strong>
                    ${
                        bateria.price !== null &&
                        bateria.price !== undefined &&
                        bateria.price !== ""
                            ? formatMoney(
                                bateria.price
                            )
                            : "Não informado"
                    }
                </strong>

            </div>


            <!-- CONTROLE DE ESTOQUE -->

            <div class="stock-quantity-control">


                <button
                    class="stock-quantity-button"
                    type="button"
                    title="Diminuir estoque"
                    data-stock-action="decrease"
                    data-id="${escapeHtml(
                        bateria.id
                    )}"
                    ${
                        estoque <= 0
                            ? "disabled"
                            : ""
                    }
                >
                    −
                </button>


                <div
                    class="stock-quantity
                        ${
                            semEstoque
                                ? "quantity-danger"
                                : estoqueBaixo
                                    ? "quantity-warning"
                                    : "quantity-ok"
                        }"
                >
                    ${estoque}
                </div>


                <button
                    class="stock-quantity-button"
                    type="button"
                    title="Aumentar estoque"
                    data-stock-action="increase"
                    data-id="${escapeHtml(
                        bateria.id
                    )}"
                >
                    +
                </button>


            </div>


            <!-- STATUS -->

            <div
                class="stock-status-label
                    ${
                        semEstoque
                            ? "status-danger"
                            : estoqueBaixo
                                ? "status-warning"
                                : "status-ok"
                    }"
            >

                ${
                    semEstoque
                        ? "Sem estoque"
                        : estoqueBaixo
                            ? "Baixo"
                            : "Disponível"
                }

            </div>


            <!-- EDITAR -->

            <button
                class="stock-icon-button"
                type="button"
                title="Editar"
                data-stock-action="edit"
                data-id="${escapeHtml(
                    bateria.id
                )}"
            >
                ✎
            </button>


            <!-- EXCLUIR -->

            <button
                class="stock-icon-button delete"
                type="button"
                title="Excluir"
                data-stock-action="delete"
                data-id="${escapeHtml(
                    bateria.id
                )}"
            >
                🗑
            </button>


        </div>

    `;
}


// ============================================================
// ALTERAR QUANTIDADE DO ESTOQUE
// ============================================================

async function alterarEstoque(
    bateria,
    quantidade
) {

    const estoqueAtual =
        Number(
            bateria.stock || 0
        );


    const novoEstoque =
        estoqueAtual +
        quantidade;


    if (novoEstoque < 0) {
        return;
    }


    try {

        await update(
            ref(
                database,
                `baterias/${bateria.id}`
            ),
            {
                stock: novoEstoque
            }
        );


        bateria.stock =
            novoEstoque;


        renderizarTelaEstoque();


    } catch (error) {

        console.error(
            "Erro ao atualizar estoque:",
            error
        );


        alert(
            "Não foi possível atualizar o estoque."
        );
    }
}


// ============================================================
// AÇÕES DOS CARDS DO ESTOQUE
// ============================================================

screenContent.addEventListener(
    "click",
    evento => {

        const botao =
            evento.target.closest(
                "[data-stock-action]"
            );


        if (!botao) {
            return;
        }


        const id =
            botao.dataset.id;


        const acao =
            botao.dataset.stockAction;


        const bateria =
            baterias.find(
                item =>
                    String(item.id) ===
                    String(id)
            );


        if (!bateria) {
            return;
        }


        // ----------------------------------------------------
        // DIMINUIR
        // ----------------------------------------------------

        if (
            acao === "decrease"
        ) {

            alterarEstoque(
                bateria,
                -1
            );

            return;
        }


        // ----------------------------------------------------
        // AUMENTAR
        // ----------------------------------------------------

        if (
            acao === "increase"
        ) {

            alterarEstoque(
                bateria,
                1
            );

            return;
        }


        // ----------------------------------------------------
        // EDITAR
        // ----------------------------------------------------

        if (
            acao === "edit"
        ) {

            mostrarFormularioBateria(
                bateria
            );

            return;
        }


        // ----------------------------------------------------
        // EXCLUIR
        // ----------------------------------------------------

        if (
            acao === "delete"
        ) {

            const nome =
                [
                    bateria.brand,
                    bateria.model
                ]
                    .filter(Boolean)
                    .join(" ")
                ||
                "esta bateria";


            const confirmar =
                confirm(
                    `Deseja excluir "${nome}"?`
                );


            if (!confirmar) {
                return;
            }


            excluirBateriaDoEstoque(
                bateria
            );
        }
    }
);


// ============================================================
// EXCLUIR BATERIA DO ESTOQUE
// ============================================================

async function excluirBateriaDoEstoque(
    bateria
) {

    try {

        await remove(
            ref(
                database,
                `baterias/${bateria.id}`
            )
        );


        baterias =
            baterias.filter(
                item =>
                    item.id !==
                    bateria.id
            );


        renderizarTelaEstoque();


    } catch (error) {

        console.error(
            "Erro ao excluir bateria:",
            error
        );


        alert(
            "Não foi possível excluir a bateria."
        );
    }
}


// ============================================================
// ATUALIZAR
// ============================================================

document
    .getElementById(
        "refresh-button"
    )
    .addEventListener(
        "click",
        async () => {

            const botao =
                document.getElementById(
                    "refresh-button"
                );


            botao.textContent =
                "↻ Carregando...";


            await carregarDados();


            if (
                telaAtual ===
                "baterias"
            ) {

                renderizarTelaBaterias();

            } else if (
                telaAtual ===
                "estoque"
            ) {

                renderizarTelaEstoque();
            }


            botao.textContent =
                "↻ Atualizar";
        }
    );

// ============================================================
// ============================================================
// TELA DE VEÍCULOS
// ============================================================
// ============================================================

function abrirTelaVeiculos() {

    renderizarTelaVeiculos();
}


// ============================================================
// RENDERIZAR TELA DE VEÍCULOS
// ============================================================

function renderizarTelaVeiculos(
    busca = ""
) {

    const buscaNormalizada =
        busca
            .trim()
            .toLowerCase();


    const veiculosFiltrados =
        veiculos.filter(
            veiculo => {

                const texto =
                    [
                        veiculo.brand,
                        veiculo.model,
                        veiculo.year,
                        veiculo.amperage
                    ]
                        .filter(
                            valor =>
                                valor !== null &&
                                valor !== undefined
                        )
                        .join(" ")
                        .toLowerCase();


                return (
                    buscaNormalizada === "" ||
                    texto.includes(
                        buscaNormalizada
                    )
                );
            }
        );


    screenContent.innerHTML = `

        <div class="vehicles-screen">


            <!-- CABEÇALHO -->

            <div class="vehicles-header">

                <div>

                    <h2>
                        Veículos
                    </h2>

                    <p>
                        Descubra qual bateria é indicada
                        para cada veículo.
                    </p>

                </div>


                <button
                    id="novo-veiculo-button"
                    class="primary-button"
                    type="button"
                >

                    <span>
                        ＋
                    </span>

                    Adicionar veículo

                </button>

            </div>


            <!-- PESQUISA -->

            <div class="vehicles-filters">

                <div class="vehicles-search-box">

                    <span>
                        ⌕
                    </span>


                    <input
                        id="busca-veiculo"
                        type="text"
                        placeholder="Pesquisar por marca, modelo, ano ou amperagem..."
                        value="${escapeHtml(busca)}"
                    >


                    ${
                        busca
                            ? `
                                <button
                                    id="limpar-busca-veiculo"
                                    type="button"
                                    class="clear-search"
                                >
                                    ×
                                </button>
                            `
                            : ""
                    }

                </div>


                <div class="vehicles-count">

                    <span>
                        ⓘ
                    </span>

                    ${veiculos.length}
                    ${
                        veiculos.length === 1
                            ? "veículo"
                            : "veículos"
                    }

                </div>

            </div>


            <!-- CONTEÚDO -->

            <div class="vehicles-content">


                <!-- LISTA -->

                <div class="vehicles-list-container">

                    <div class="vehicles-list-header">

                        <h3>
                            Selecione o veículo
                        </h3>

                    </div>


                    <div
                        class="vehicles-list"
                        id="vehicles-list"
                    >

                        ${
                            veiculosFiltrados.length === 0
                                ? criarEstadoVazioVeiculos(
                                    busca
                                )
                                : veiculosFiltrados
                                    .map(
                                        veiculo =>
                                            criarItemVeiculo(
                                                veiculo
                                            )
                                    )
                                    .join("")
                        }

                    </div>

                </div>


                <!-- DETALHES -->

                <div
                    class="vehicle-details-container"
                    id="vehicle-details"
                >

                    ${criarDetalhesVeiculo()}

                </div>

            </div>

        </div>

    `;


    // --------------------------------------------------------
    // PESQUISA
    // --------------------------------------------------------

    const campoBusca =
        document.getElementById(
            "busca-veiculo"
        );


    if (campoBusca) {

        campoBusca.addEventListener(
            "input",
            evento => {

                renderizarTelaVeiculos(
                    evento.target.value
                );

            }
        );
    }


    // --------------------------------------------------------
    // LIMPAR PESQUISA
    // --------------------------------------------------------

    const limparBusca =
        document.getElementById(
            "limpar-busca-veiculo"
        );


    if (limparBusca) {

        limparBusca.addEventListener(
            "click",
            () => {

                renderizarTelaVeiculos();

            }
        );
    }


    // --------------------------------------------------------
    // NOVO VEÍCULO
    // --------------------------------------------------------

    const novoVeiculo =
        document.getElementById(
            "novo-veiculo-button"
        );


    if (novoVeiculo) {

        novoVeiculo.addEventListener(
            "click",
            () => {

                mostrarFormularioVeiculo();

            }
        );
    }


    // --------------------------------------------------------
    // CLIQUES NOS VEÍCULOS
    // --------------------------------------------------------

    const lista =
        document.getElementById(
            "vehicles-list"
        );


    if (lista) {

        lista.addEventListener(
            "click",
            evento => {

                const item =
                    evento.target.closest(
                        "[data-vehicle-id]"
                    );


                if (!item) {
                    return;
                }


                const id =
                    item.dataset.vehicleId;


                const veiculo =
                    veiculos.find(
                        item =>
                            String(item.id) ===
                            String(id)
                    );


                if (!veiculo) {
                    return;
                }


                if (
                    evento.target.closest(
                        "[data-vehicle-action='edit']"
                    )
                ) {

                    mostrarFormularioVeiculo(
                        veiculo
                    );

                    return;
                }


                if (
                    evento.target.closest(
                        "[data-vehicle-action='delete']"
                    )
                ) {

                    excluirVeiculo(
                        veiculo
                    );

                    return;
                }


                mostrarDetalhesVeiculo(
                    veiculo
                );
            }
        );
    }
}


// ============================================================
// ITEM DA LISTA DE VEÍCULOS
// ============================================================

function criarItemVeiculo(
    veiculo
) {

    const selecionado =
        window.veiculoSelecionadoId ===
        veiculo.id;


    const amperagem =
        formatarAmperagemVeiculo(
            veiculo.amperage
        );


    const ano =
        veiculo.year &&
        String(
            veiculo.year
        ).trim()
            ? `Ano ${escapeHtml(
                veiculo.year
            )}`
            : "Ano não informado";


    return `

        <div
            class="vehicle-list-item
                ${selecionado
                    ? "vehicle-selected"
                    : ""
                }"
            data-vehicle-id="${escapeHtml(
                veiculo.id
            )}"
        >


            <div class="vehicle-icon">

                🚗

            </div>


            <div class="vehicle-info">

                <h3>
                    ${escapeHtml(
                        veiculo.brand
                    )}
                    ${escapeHtml(
                        veiculo.model
                    )}
                </h3>


                <p>
                    ${ano}
                </p>

            </div>


            <div class="vehicle-amperage">

                ${escapeHtml(
                    amperagem
                )}

            </div>


            <button
                class="vehicle-action-button"
                type="button"
                title="Editar"
                data-vehicle-action="edit"
            >
                ✎
            </button>


            <button
                class="vehicle-action-button vehicle-delete"
                type="button"
                title="Excluir"
                data-vehicle-action="delete"
            >
                🗑
            </button>


        </div>

    `;
}


// ============================================================
// FORMATAR AMPERAGEM DO VEÍCULO
// ============================================================

function formatarAmperagemVeiculo(
    amperagem
) {

    if (
        amperagem === null ||
        amperagem === undefined ||
        String(amperagem).trim() === ""
    ) {

        return "Não informado";
    }


    const texto =
        String(amperagem)
            .trim();


    const numero =
        Number(texto);


    if (
        !Number.isNaN(numero)
    ) {

        return `${numero.toFixed(0)} Ah`;
    }


    return texto;
}


// ============================================================
// ESTADO VAZIO DE VEÍCULOS
// ============================================================

function criarEstadoVazioVeiculos(
    busca
) {

    const pesquisando =
        String(busca || "")
            .trim() !== "";


    return `

        <div class="vehicle-empty">

            <div class="vehicle-empty-icon">

                ${
                    pesquisando
                        ? "⌕"
                        : "🚗"
                }

            </div>


            <h3>

                ${
                    pesquisando
                        ? "Veículo não encontrado"
                        : "Nenhum veículo cadastrado"
                }

            </h3>


            <p>

                ${
                    pesquisando
                        ? "Esse veículo ainda não está cadastrado."
                        : "Adicione um veículo para começar."
                }

            </p>


            <button
                id="empty-add-vehicle"
                class="primary-button"
                type="button"
            >

                ＋
                Adicionar veículo

            </button>

        </div>

    `;
}


// ============================================================
// DETALHES DO VEÍCULO
// ============================================================

function criarDetalhesVeiculo() {

    const veiculo =
        veiculos.find(
            item =>
                String(item.id) ===
                String(
                    window.veiculoSelecionadoId
                )
        );


    if (!veiculo) {

        return `

            <div class="vehicle-details-empty">

                <div class="vehicle-details-empty-icon">
                    🚗
                </div>


                <h3>
                    Selecione um veículo
                </h3>


                <p>
                    Escolha um veículo na lista
                    para descobrir a amperagem indicada.
                </p>

            </div>

        `;
    }


    return montarDetalhesVeiculo(
        veiculo
    );
}


// ============================================================
// MONTAR DETALHES
// ============================================================

function montarDetalhesVeiculo(
    veiculo
) {

    const ano =
        veiculo.year &&
        String(
            veiculo.year
        ).trim()
            ? `Ano ${escapeHtml(
                veiculo.year
            )}`
            : "Ano não informado";


    const amperagem =
        formatarAmperagemVeiculo(
            veiculo.amperage
        );


    return `

        <div class="vehicle-details">

            <div class="vehicle-details-header">

                <div class="vehicle-details-icon">

                    🚗

                </div>


                <div>

                    <h3>

                        ${escapeHtml(
                            veiculo.brand
                        )}
                        ${escapeHtml(
                            veiculo.model
                        )}

                    </h3>


                    <p>
                        ${ano}
                    </p>

                </div>

            </div>


            <div class="vehicle-detail-title">

                Bateria indicada

            </div>


            <div class="recommended-battery">

                <div class="recommended-battery-icon">

                    🔋

                </div>


                <strong>

                    ${escapeHtml(
                        amperagem
                    )}

                </strong>


                <span>
                    amperagem recomendada
                </span>

            </div>


            ${
                veiculo.notes &&
                String(
                    veiculo.notes
                ).trim()
                    ? `

                        <div class="vehicle-note">

                            <span>
                                📝
                            </span>

                            <div>

                                <small>
                                    Observações
                                </small>

                                <p>
                                    ${escapeHtml(
                                        veiculo.notes
                                    )}
                                </p>

                            </div>

                        </div>

                    `
                    : ""
            }

        </div>

    `;
}


// ============================================================
// MOSTRAR DETALHES DO VEÍCULO
// ============================================================

function mostrarDetalhesVeiculo(
    veiculo
) {

    window.veiculoSelecionadoId =
        veiculo.id;


    renderizarTelaVeiculos(
        document.getElementById(
            "busca-veiculo"
        )?.value || ""
    );
}


// ============================================================
// FORMULÁRIO DE VEÍCULO
// ============================================================

function mostrarFormularioVeiculo(
    veiculoEditar = null
) {

    const editando =
        veiculoEditar !== null;


    screenContent.insertAdjacentHTML(
        "beforeend",
        `

        <div
            class="modal-overlay"
            id="veiculo-modal"
        >

            <div class="vehicle-modal">

                <div class="modal-header">

                    <div>

                        <h2>

                            ${
                                editando
                                    ? "Editar veículo"
                                    : "Adicionar veículo"
                            }

                        </h2>


                        <p>

                            ${
                                editando
                                    ? "Altere os dados do veículo."
                                    : "Cadastre um novo veículo."
                            }

                        </p>

                    </div>


                    <button
                        class="modal-close"
                        id="fechar-modal-veiculo"
                        type="button"
                    >
                        ×
                    </button>

                </div>


                <form id="form-veiculo">

                    <div class="form-grid">


                        <div class="form-group">

                            <label>
                                Marca
                            </label>

                            <input
                                id="veiculo-marca"
                                type="text"
                                value="${
                                    editando
                                        ? escapeHtml(
                                            veiculoEditar.brand
                                        )
                                        : ""
                                }"
                                placeholder="Ex.: Volkswagen"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Modelo
                            </label>

                            <input
                                id="veiculo-modelo"
                                type="text"
                                value="${
                                    editando
                                        ? escapeHtml(
                                            veiculoEditar.model
                                        )
                                        : ""
                                }"
                                placeholder="Ex.: Gol"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Ano
                            </label>

                            <input
                                id="veiculo-ano"
                                type="text"
                                inputmode="numeric"
                                value="${
                                    editando
                                        ? escapeHtml(
                                            veiculoEditar.year
                                        )
                                        : ""
                                }"
                                placeholder="Ex.: 2020"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Amperagem
                            </label>

                            <input
                                id="veiculo-amperagem"
                                type="text"
                                value="${
                                    editando
                                        ? escapeHtml(
                                            veiculoEditar.amperage
                                        )
                                        : ""
                                }"
                                placeholder="Ex.: 60"
                            >

                        </div>


                        <div
                            class="form-group form-group-full"
                        >

                            <label>
                                Observações
                            </label>

                            <textarea
                                id="veiculo-observacoes"
                                placeholder="Observações sobre o veículo..."
                            >${
                                editando
                                    ? escapeHtml(
                                        veiculoEditar.notes
                                    )
                                    : ""
                            }</textarea>

                        </div>


                    </div>


                    <div class="modal-actions">

                        <button
                            type="button"
                            class="secondary-button"
                            id="cancelar-veiculo"
                        >
                            Cancelar
                        </button>


                        <button
                            type="submit"
                            class="primary-button"
                        >

                            ${
                                editando
                                    ? "Salvar alterações"
                                    : "Adicionar veículo"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>

        `
    );


    const modal =
        document.getElementById(
            "veiculo-modal"
        );


    const fechar =
        () => modal.remove();


    document
        .getElementById(
            "fechar-modal-veiculo"
        )
        .addEventListener(
            "click",
            fechar
        );


    document
        .getElementById(
            "cancelar-veiculo"
        )
        .addEventListener(
            "click",
            fechar
        );


    document
        .getElementById(
            "form-veiculo"
        )
        .addEventListener(
            "submit",
            async evento => {

                evento.preventDefault();


                const marca =
                    document
                        .getElementById(
                            "veiculo-marca"
                        )
                        .value
                        .trim();


                const modelo =
                    document
                        .getElementById(
                            "veiculo-modelo"
                        )
                        .value
                        .trim();


                const ano =
                    document
                        .getElementById(
                            "veiculo-ano"
                        )
                        .value
                        .trim();


                const amperagemTexto =
                    document
                        .getElementById(
                            "veiculo-amperagem"
                        )
                        .value
                        .trim();


                const observacoes =
                    document
                        .getElementById(
                            "veiculo-observacoes"
                        )
                        .value
                        .trim();


                if (
                    !marca ||
                    !modelo ||
                    !amperagemTexto
                ) {

                    alert(
                        "Preencha marca, modelo e amperagem."
                    );

                    return;
                }


                const amperagem =
                    Number(
                        amperagemTexto
                            .replace(",", ".")
                    );


                if (
                    Number.isNaN(
                        amperagem
                    )
                ) {

                    alert(
                        "Digite uma amperagem válida."
                    );

                    return;
                }


                const dados = {

                    brand:
                        marca,

                    model:
                        modelo,

                    year:
                        ano || null,

                    amperage:
                        amperagem,

                    notes:
                        observacoes || null

                };


                try {

                    if (!editando) {

                        const id =
                            Date.now().toString();


                        await set(
                            ref(
                                database,
                                `veiculos/${id}`
                            ),
                            dados
                        );


                        veiculos.push({

                            id,

                            ...dados

                        });


                        window.veiculoSelecionadoId =
                            id;

                    } else {

                        await update(
                            ref(
                                database,
                                `veiculos/${veiculoEditar.id}`
                            ),
                            dados
                        );


                        const index =
                            veiculos.findIndex(
                                veiculo =>
                                    veiculo.id ===
                                    veiculoEditar.id
                            );


                        if (index !== -1) {

                            veiculos[index] = {

                                ...veiculos[index],

                                ...dados

                            };

                        }


                        window.veiculoSelecionadoId =
                            veiculoEditar.id;
                    }


                    modal.remove();


                    renderizarTelaVeiculos();


                } catch (error) {

                    console.error(
                        "Erro ao salvar veículo:",
                        error
                    );


                    alert(
                        "Não foi possível salvar o veículo."
                    );
                }
            }
        );
}


// ============================================================
// EXCLUIR VEÍCULO
// ============================================================

async function excluirVeiculo(
    veiculo
) {

    const nome =
        [
            veiculo.brand,
            veiculo.model
        ]
            .filter(Boolean)
            .join(" ")
        ||
        "este veículo";


    const confirmar =
        confirm(
            `Deseja excluir "${nome}"?`
        );


    if (!confirmar) {
        return;
    }


    try {

        await remove(
            ref(
                database,
                `veiculos/${veiculo.id}`
            )
        );


        veiculos =
            veiculos.filter(
                item =>
                    item.id !==
                    veiculo.id
            );


        if (
            window.veiculoSelecionadoId ===
            veiculo.id
        ) {

            window.veiculoSelecionadoId =
                null;
        }


        renderizarTelaVeiculos();


    } catch (error) {

        console.error(
            "Erro ao excluir veículo:",
            error
        );


        alert(
            "Não foi possível excluir o veículo."
        );
    }
}


// ============================================================
// BOTÃO DO ESTADO VAZIO
// ============================================================

screenContent.addEventListener(
    "click",
    evento => {

        const botao =
            evento.target.closest(
                "#empty-add-vehicle"
            );


        if (!botao) {
            return;
        }


        mostrarFormularioVeiculo();
    }
);

// ============================================================
// ============================================================
// TELA DE VENDAS
// ============================================================
// ============================================================

let vendaBateriaSelecionada = null;
let vendaFormaPagamento = "Pix";
let vendaFiltroMarca = "";
let vendaFiltroAmperagem = "";


function abrirTelaVendas() {

    vendaBateriaSelecionada = null;
    vendaFormaPagamento = "Pix";
    vendaFiltroMarca = "";
    vendaFiltroAmperagem = "";

    renderizarTelaVendas();
}


// ============================================================
// LISTAS DISPONÍVEIS (SÓ COM ESTOQUE)
// ============================================================

function listarMarcasDisponiveis() {

    return [
        ...new Set(
            baterias
                .map(bateria => bateria.brand)
                .filter(Boolean)
        )
    ].sort((a, b) => a.localeCompare(b, "pt-BR"));
}


function listarAmperagensDisponiveis() {

    return [
        ...new Set(
            baterias
                .map(bateria => bateria.amperage)
                .filter(Boolean)
        )
    ].sort((a, b) =>
        String(a).localeCompare(String(b), "pt-BR", { numeric: true })
    );
}


// ============================================================
// RENDERIZAR TELA DE VENDAS
// ============================================================

function renderizarTelaVendas() {

    const marcas = listarMarcasDisponiveis();
    const amperagens = listarAmperagensDisponiveis();
    const hoje = new Date();
    const dataHoje = formatarDataInput(hoje);

    screenContent.innerHTML = `

        <div class="sales-screen">

            <div class="section-card">

                <h2>1. Selecionar bateria</h2>

                <div class="form-grid" style="margin-top: 14px;">

                    <div class="form-group">

                        <label>Marca</label>

                        <select id="venda-select-marca">

                            <option value="">Selecione a marca</option>

                            ${marcas
                                .map(marca => `
                                    <option
                                        value="${escapeHtml(marca)}"
                                        ${marca === vendaFiltroMarca ? "selected" : ""}
                                    >
                                        ${escapeHtml(marca)}
                                    </option>
                                `)
                                .join("")}

                        </select>

                    </div>

                    <div class="form-group">

                        <label>Amperagem</label>

                        <select id="venda-select-amperagem">

                            <option value="">Selecione a amperagem</option>

                            ${amperagens
                                .map(amperagem => `
                                    <option
                                        value="${escapeHtml(amperagem)}"
                                        ${
                                            String(amperagem) === String(vendaFiltroAmperagem)
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${formatAmperage(amperagem)}
                                    </option>
                                `)
                                .join("")}

                        </select>

                    </div>

                </div>

                <div
                    id="venda-resultados-bateria"
                    class="sales-battery-results"
                ></div>

            </div>


            <div class="section-card">

                <h2>2. Dados da venda</h2>

                <div class="form-grid" style="margin-top: 14px;">

                    <div class="form-group">
                        <label>Modelo</label>
                        <input id="venda-modelo" type="text">
                    </div>

                    <div class="form-group">
                        <label>Preço</label>
                        <input id="venda-preco" type="text" inputmode="decimal">
                    </div>

                    <div class="form-group">
                        <label>Garantia</label>
                        <input id="venda-garantia" type="text">
                    </div>

                    <div class="form-group">
                        <label>Código</label>
                        <input id="venda-codigo" type="text">
                    </div>

                    <div class="form-group">
                        <label>Cliente</label>
                        <input id="venda-cliente" type="text" placeholder="Opcional">
                    </div>

                    <div class="form-group">
                        <label>Veículo</label>
                        <input id="venda-veiculo" type="text" placeholder="Opcional">
                    </div>

                </div>

            </div>


            <div class="section-card">

                <h2>3. Pagamento</h2>

                <div class="form-grid" style="margin-top: 14px;">

                    <div class="form-group">

                        <label>Forma de pagamento</label>

                        <select id="venda-pagamento">
                            <option value="Dinheiro">Dinheiro</option>
                            <option value="Pix" selected>Pix</option>
                            <option value="Débito">Cartão de débito</option>
                            <option value="Crédito">Cartão de crédito</option>
                        </select>

                    </div>

                    <div class="form-group">
                        <label>Desconto (R$)</label>
                        <input id="venda-desconto" type="text" inputmode="decimal" placeholder="Opcional">
                    </div>

                </div>

                <div
                    id="venda-parcelamento"
                    class="form-grid"
                    style="margin-top: 14px; display: none;"
                >

                    <div class="form-group">
                        <label>Parcelas</label>
                        <input id="venda-parcelas" type="text" inputmode="numeric" placeholder="Ex.: 3">
                    </div>

                    <div class="form-group">
                        <label>Juros (%)</label>
                        <input id="venda-juros" type="text" inputmode="decimal" placeholder="Opcional">
                    </div>

                </div>

                <div class="sales-total-box">

                    <span>Total da venda</span>

                    <strong id="venda-total">R$ 0,00</strong>

                </div>

            </div>


            <div class="sales-actions">

                <button id="venda-cancelar" class="secondary-button" type="button">
                    Cancelar
                </button>

                <button id="venda-finalizar" class="primary-button" type="button">
                    Finalizar venda
                </button>

            </div>

        </div>

    `;


    renderizarResultadosVenda();
    atualizarTotalVenda();


    document
        .getElementById("venda-select-marca")
        .addEventListener("change", evento => {

            vendaFiltroMarca = evento.target.value;

            renderizarResultadosVenda();
        });


    document
        .getElementById("venda-select-amperagem")
        .addEventListener("change", evento => {

            vendaFiltroAmperagem = evento.target.value;

            renderizarResultadosVenda();
        });


    document
        .getElementById("venda-preco")
        .addEventListener("input", atualizarTotalVenda);


    document
        .getElementById("venda-desconto")
        .addEventListener("input", atualizarTotalVenda);


    document
        .getElementById("venda-juros")
        .addEventListener("input", atualizarTotalVenda);


    document
        .getElementById("venda-pagamento")
        .addEventListener("change", evento => {

            vendaFormaPagamento = evento.target.value;

            document.getElementById("venda-parcelamento").style.display =
                vendaFormaPagamento === "Crédito" ? "grid" : "none";

            atualizarTotalVenda();
        });


    document
        .getElementById("venda-cancelar")
        .addEventListener("click", () => {

            abrirTelaVendas();
        });


    document
        .getElementById("venda-finalizar")
        .addEventListener("click", finalizarVenda);
}


// ============================================================
// RESULTADOS FILTRADOS POR MARCA / AMPERAGEM
// ============================================================

function renderizarResultadosVenda() {

    const disponiveis = baterias;


    const filtradas =
        disponiveis.filter(bateria => {

            const correspondeMarca =
                !vendaFiltroMarca ||
                bateria.brand === vendaFiltroMarca;

            const correspondeAmperagem =
                !vendaFiltroAmperagem ||
                String(bateria.amperage) === String(vendaFiltroAmperagem);

            return correspondeMarca && correspondeAmperagem;
        });


    const container =
        document.getElementById("venda-resultados-bateria");

    if (!container) {
        return;
    }


    // Se marca e amperagem escolhidas resultam em uma única bateria,
    // preenche os campos automaticamente.

    if (
        vendaFiltroMarca &&
        vendaFiltroAmperagem &&
        filtradas.length === 1
    ) {

        selecionarBateriaVenda(filtradas[0]);

        container.innerHTML = "";

        return;
    }


    if (!vendaFiltroMarca && !vendaFiltroAmperagem) {

        container.innerHTML = "";

        return;
    }


    if (filtradas.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                Nenhuma bateria disponível com esses filtros.
            </p>
        `;

        return;
    }


    // Mais de uma bateria bate com o filtro (ex.: mesma marca e
    // amperagem, códigos diferentes) — deixa a pessoa escolher.

    container.innerHTML = `
        <p class="empty-message" style="margin-bottom: 8px;">
            Mais de uma bateria encontrada, selecione uma:
        </p>
        ${filtradas
            .map(bateria => {

                const nome =
                    [bateria.brand, bateria.model]
                        .filter(Boolean)
                        .join(" ")
                    || "Sem marca";

                const selecionada =
                    vendaBateriaSelecionada &&
                    vendaBateriaSelecionada.id === bateria.id;

                return `
                    <div
                        class="sales-battery-item ${
                            selecionada ? "sales-battery-selected" : ""
                        }"
                        data-id="${escapeHtml(bateria.id)}"
                    >
                        <span>${escapeHtml(nome)}</span>
                        <span>${formatAmperage(bateria.amperage)}</span>
                        <span>${
                            bateria.code
                                ? `Código: ${escapeHtml(bateria.code)}`
                                : ""
                        }</span>
                        <span>${bateria.stock} un.</span>
                    </div>
                `;
            })
            .join("")}
    `;


    container
        .querySelectorAll("[data-id]")
        .forEach(item => {

            item.addEventListener("click", () => {

                const bateria =
                    baterias.find(
                        b => String(b.id) === item.dataset.id
                    );

                if (bateria) {
                    selecionarBateriaVenda(bateria);
                }
            });
        });
}


// ============================================================
// SELECIONAR BATERIA PARA VENDA
// ============================================================

function selecionarBateriaVenda(bateria) {

    vendaBateriaSelecionada = bateria;

    document.getElementById("venda-modelo").value =
        bateria.model || "";

    document.getElementById("venda-preco").value =
        bateria.price != null
            ? String(bateria.price).replace(".", ",")
            : "";

    document.getElementById("venda-garantia").value =
        bateria.warranty || "";

    document.getElementById("venda-codigo").value =
        bateria.code || "";

    atualizarTotalVenda();
}


// ============================================================
// CALCULAR TOTAL DA VENDA
// ============================================================

function atualizarTotalVenda() {

    const preco =
        Number(
            (document.getElementById("venda-preco")?.value || "0")
                .replace(/\./g, "")
                .replace(",", ".")
        ) || 0;

    const desconto =
        Number(
            (document.getElementById("venda-desconto")?.value || "0")
                .replace(/\./g, "")
                .replace(",", ".")
        ) || 0;

    const juros =
        Number(
            (document.getElementById("venda-juros")?.value || "0")
                .replace(",", ".")
        ) || 0;

    let total = preco - desconto;

    if (vendaFormaPagamento === "Crédito" && juros > 0) {
        total += total * (juros / 100);
    }

    if (total < 0) {
        total = 0;
    }

    const totalElemento =
        document.getElementById("venda-total");

    if (totalElemento) {
        totalElemento.textContent = formatMoney(total);
    }
}


// ============================================================
// FINALIZAR VENDA
// ============================================================

async function finalizarVenda() {

    if (!vendaBateriaSelecionada) {

        alert("Selecione uma bateria para registrar a venda.");

        return;
    }

        if (Number(vendaBateriaSelecionada.stock || 0) <= 0) {

        alert("Essa bateria está sem estoque disponível para venda.");

        return;
    }

    const dataVenda =
        document.getElementById("venda-data").value;

    if (!dataVenda) {
        alert("Informe a data da venda.");
        return;
    }

    const cliente =
        document.getElementById("venda-cliente").value.trim();

    const veiculo =
        document.getElementById("venda-veiculo").value.trim();

    const pagamento =
        document.getElementById("venda-pagamento").value;

    const parcelasTexto =
        document.getElementById("venda-parcelas")?.value.trim() || "";

    const preco =
        Number(
            document.getElementById("venda-preco").value
                .replace(/\./g, "")
                .replace(",", ".")
        ) || 0;

    const desconto =
        Number(
            (document.getElementById("venda-desconto").value || "0")
                .replace(/\./g, "")
                .replace(",", ".")
        ) || 0;

    const juros =
        Number(
            (document.getElementById("venda-juros")?.value || "0")
                .replace(",", ".")
        ) || 0;

    const parcelas =
        parcelasTexto ? Number(parcelasTexto) : null;

    let total = preco - desconto;

    if (pagamento === "Crédito" && juros > 0) {
        total += total * (juros / 100);
    }

    if (total < 0) {
        total = 0;
    }

    const venda = {

        date: (() => {
            const [ano, mes, dia] = dataVenda.split("-").map(Number);
            return new Date(ano, mes - 1, dia, 12, 0, 0).toISOString();
        })(),

        batteryId: vendaBateriaSelecionada.id,

        brand: vendaBateriaSelecionada.brand || null,
        model: vendaBateriaSelecionada.model || null,
        amperage: vendaBateriaSelecionada.amperage || null,
        price: preco,
        warranty: vendaBateriaSelecionada.warranty || null,
        code: vendaBateriaSelecionada.code || null,

        customer: cliente || null,
        vehicle: veiculo || null,

        paymentMethod: pagamento,
        discount: desconto,
        installments: parcelas,
        interest: juros,
        total: total
    };


    try {

        const id = Date.now().toString();

        await set(ref(database, `vendas/${id}`), venda);

        vendas.unshift({ id, ...venda });


        const novoEstoque =
            Number(vendaBateriaSelecionada.stock || 0) - 1;

        await update(
            ref(database, `baterias/${vendaBateriaSelecionada.id}`),
            { stock: novoEstoque }
        );

        vendaBateriaSelecionada.stock = novoEstoque;


        alert("Venda registrada com sucesso!");

        abrirTelaVendas();


    } catch (error) {

        console.error("Erro ao registrar venda:", error);

        alert("Não foi possível registrar a venda.");
    }
}

// ============================================================
// ============================================================
// TELA DE HISTÓRICO DE VENDAS
// ============================================================
// ============================================================
 
let historicoDataInicio = "";
let historicoDataFim = "";
 
 
function abrirTelaHistorico() {
 
    renderizarTelaHistorico();
}
 
 
// ============================================================
// FORMATAR DATA DA VENDA
// ============================================================
 
function formatarDataVenda(dataIso) {
 
    const data = new Date(dataIso);
 
    if (Number.isNaN(data.getTime())) {
        return "Data inválida";
    }
 
    return data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}
 
 
function formatarDataInput(data) {
 
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
 
    return `${ano}-${mes}-${dia}`;
}
 
 
// ============================================================
// RENDERIZAR TELA DE HISTÓRICO
// ============================================================
 
function renderizarTelaHistorico(
    busca = "",
    filtroPagamento = "Todas"
) {
 
    const buscaNormalizada =
        busca.trim().toLowerCase();
 
 
    const vendasFiltradas =
        vendas.filter(venda => {
 
            const dataVenda = new Date(venda.date);
 
            if (historicoDataInicio) {
 
                const inicio = new Date(historicoDataInicio + "T00:00:00");
 
                if (dataVenda < inicio) {
                    return false;
                }
            }
 
            if (historicoDataFim) {
 
                const fim = new Date(historicoDataFim + "T23:59:59");
 
                if (dataVenda > fim) {
                    return false;
                }
            }
 
            const texto =
                [
                    venda.brand,
                    venda.model,
                    venda.code,
                    venda.customer,
                    venda.vehicle
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
 
            const correspondeBusca =
                buscaNormalizada === "" ||
                texto.includes(buscaNormalizada);
 
            const correspondePagamento =
                filtroPagamento === "Todas" ||
                venda.paymentMethod === filtroPagamento;
 
            return correspondeBusca && correspondePagamento;
        });
 
 
    const totalVendas =
        vendasFiltradas.length;
 
    const totalValor =
        vendasFiltradas.reduce(
            (total, venda) => total + Number(venda.total || 0),
            0
        );
 
    const ticketMedio =
        totalVendas > 0 ? totalValor / totalVendas : 0;
 
 
    screenContent.innerHTML = `
 
        <div class="history-screen">
 
            <div class="stock-summary-grid" style="grid-template-columns: repeat(3, 1fr);">
 
                <div class="stock-summary-card">
                    <div class="stock-summary-icon">▤</div>
                    <div>
                        <span>Total de vendas</span>
                        <strong>${totalVendas}</strong>
                    </div>
                </div>
 
                <div class="stock-summary-card">
                    <div class="stock-summary-icon">R$</div>
                    <div>
                        <span>Valor total</span>
                        <strong>${formatMoney(totalValor)}</strong>
                    </div>
                </div>
 
                <div class="stock-summary-card">
                    <div class="stock-summary-icon">⌀</div>
                    <div>
                        <span>Ticket médio</span>
                        <strong>${formatMoney(ticketMedio)}</strong>
                    </div>
                </div>
 
            </div>
 
 
            <div class="history-date-filter">
 
                <input
                    id="historico-data-inicio"
                    type="date"
                    value="${historicoDataInicio}"
                >
 
                <span>até</span>
 
                <input
                    id="historico-data-fim"
                    type="date"
                    value="${historicoDataFim}"
                >
 
                <button id="historico-hoje" type="button" class="secondary-button">
                    Hoje
                </button>
 
                <button id="historico-7dias" type="button" class="secondary-button">
                    7 dias
                </button>
 
                <button id="historico-mes" type="button" class="secondary-button">
                    Este mês
                </button>
 
                <button id="historico-limpar-datas" type="button" class="secondary-button">
                    Limpar período
                </button>
 
            </div>
 
 
            <div class="stock-filters">
 
                <div class="stock-search-box">
 
                    <span>⌕</span>
 
                    <input
                        id="historico-busca"
                        type="text"
                        placeholder="Pesquisar por cliente, veículo, marca, modelo ou código..."
                        value="${escapeHtml(busca)}"
                    >
 
                    ${
                        busca
                            ? `<button id="historico-limpar-busca" type="button">×</button>`
                            : ""
                    }
 
                </div>
 
                <select id="historico-filtro-pagamento" class="stock-select">
 
                    <option value="Todas" ${filtroPagamento === "Todas" ? "selected" : ""}>
                        Todas as formas
                    </option>
 
                    <option value="Dinheiro" ${filtroPagamento === "Dinheiro" ? "selected" : ""}>
                        Dinheiro
                    </option>
 
                    <option value="Pix" ${filtroPagamento === "Pix" ? "selected" : ""}>
                        Pix
                    </option>
 
                    <option value="Débito" ${filtroPagamento === "Débito" ? "selected" : ""}>
                        Cartão de débito
                    </option>
 
                    <option value="Crédito" ${filtroPagamento === "Crédito" ? "selected" : ""}>
                        Cartão de crédito
                    </option>
 
                </select>
 
            </div>
 
 
            <div class="history-list">
 
                ${
                    vendasFiltradas.length === 0
                        ? `
                            <div class="stock-empty">
                                <div class="stock-empty-icon">◷</div>
                                <h3>Nenhuma venda encontrada.</h3>
                                <p>Tente alterar os filtros de pesquisa.</p>
                            </div>
                        `
                        : vendasFiltradas
                            .map(venda => criarLinhaHistorico(venda))
                            .join("")
                }
 
            </div>
 
        </div>
 
    `;
 
 
    const campoBusca =
        document.getElementById("historico-busca");
 
    campoBusca.addEventListener("input", evento => {
 
        const pagamento =
            document.getElementById("historico-filtro-pagamento").value;
 
        renderizarTelaHistorico(evento.target.value, pagamento);
    });
 
 
    document
        .getElementById("historico-filtro-pagamento")
        .addEventListener("change", evento => {
 
            const buscaAtual =
                document.getElementById("historico-busca").value;
 
            renderizarTelaHistorico(buscaAtual, evento.target.value);
        });
 
 
    const limparBusca =
        document.getElementById("historico-limpar-busca");
 
    if (limparBusca) {
 
        limparBusca.addEventListener("click", () => {
 
            renderizarTelaHistorico(
                "",
                document.getElementById("historico-filtro-pagamento").value
            );
        });
    }
 
 
    document
        .getElementById("historico-data-inicio")
        .addEventListener("change", evento => {
 
            historicoDataInicio = evento.target.value;
 
            renderizarTelaHistorico(
                document.getElementById("historico-busca").value,
                document.getElementById("historico-filtro-pagamento").value
            );
        });
 
 
    document
        .getElementById("historico-data-fim")
        .addEventListener("change", evento => {
 
            historicoDataFim = evento.target.value;
 
            renderizarTelaHistorico(
                document.getElementById("historico-busca").value,
                document.getElementById("historico-filtro-pagamento").value
            );
        });
 
 
    document
        .getElementById("historico-hoje")
        .addEventListener("click", () => {
 
            const hoje = formatarDataInput(new Date());
 
            historicoDataInicio = hoje;
            historicoDataFim = hoje;
 
            renderizarTelaHistorico(busca, filtroPagamento);
        });
 
 
    document
        .getElementById("historico-7dias")
        .addEventListener("click", () => {
 
            const hoje = new Date();
            const seteDiasAtras = new Date();
 
            seteDiasAtras.setDate(hoje.getDate() - 6);
 
            historicoDataInicio = formatarDataInput(seteDiasAtras);
            historicoDataFim = formatarDataInput(hoje);
 
            renderizarTelaHistorico(busca, filtroPagamento);
        });
 
 
    document
        .getElementById("historico-mes")
        .addEventListener("click", () => {
 
            const hoje = new Date();
            const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
 
            historicoDataInicio = formatarDataInput(inicioMes);
            historicoDataFim = formatarDataInput(hoje);
 
            renderizarTelaHistorico(busca, filtroPagamento);
        });
 
 
    document
        .getElementById("historico-limpar-datas")
        .addEventListener("click", () => {
 
            historicoDataInicio = "";
            historicoDataFim = "";
 
            renderizarTelaHistorico(busca, filtroPagamento);
        });
 
 
    document
        .querySelectorAll("[data-historico-action]")
        .forEach(botao => {
 
            botao.addEventListener("click", () => {
 
                const venda =
                    vendas.find(v => v.id === botao.dataset.id);
 
                if (!venda) {
                    return;
                }
 
                const acao = botao.dataset.historicoAction;
 
                if (acao === "delete") {
                    excluirVenda(venda);
                }
 
                if (acao === "detalhes") {
                    mostrarDetalhesVenda(venda);
                }
 
                if (acao === "editar") {
                    mostrarFormularioEditarVenda(venda);
                }
            });
        });
}
 
 
// ============================================================
// LINHA DO HISTÓRICO
// ============================================================
 
function criarLinhaHistorico(venda) {
 
    const nome =
        [venda.brand, venda.model]
            .filter(Boolean)
            .join(" ")
        || venda.code
        || "Bateria";
 
    return `
 
        <div class="history-row">
 
            <div class="history-row-main">
 
                <strong>${escapeHtml(nome)}</strong>
 
                <small>${formatarDataVenda(venda.date)}</small>
 
            </div>
 
            <div class="history-row-info">
 
                ${
                    venda.customer
                        ? `<span>Cliente: ${escapeHtml(venda.customer)}</span>`
                        : ""
                }
 
                ${
                    venda.vehicle
                        ? `<span>Veículo: ${escapeHtml(venda.vehicle)}</span>`
                        : ""
                }
 
                <span>${escapeHtml(venda.paymentMethod || "Não informado")}</span>
 
            </div>
 
            <div class="history-row-total">
                ${formatMoney(venda.total)}
            </div>
 
            <button
                class="stock-icon-button"
                type="button"
                title="Ver detalhes"
                data-historico-action="detalhes"
                data-id="${escapeHtml(venda.id)}"
            >
                ◉
            </button>
 
            <button
                class="stock-icon-button"
                type="button"
                title="Editar"
                data-historico-action="editar"
                data-id="${escapeHtml(venda.id)}"
            >
                ✎
            </button>
 
            <button
                class="stock-icon-button delete"
                type="button"
                title="Excluir venda"
                data-historico-action="delete"
                data-id="${escapeHtml(venda.id)}"
            >
                🗑
            </button>
 
        </div>
 
    `;
}
 
 
// ============================================================
// EXCLUIR VENDA
// ============================================================
 
async function excluirVenda(venda) {
 
    const confirmar =
        confirm(
            "Deseja excluir essa venda? " +
            "A bateria será devolvida ao estoque."
        );
 
    if (!confirmar) {
        return;
    }
 
    try {
 
        await remove(ref(database, `vendas/${venda.id}`));
 
        if (venda.batteryId) {
 
            const bateria =
                baterias.find(b => b.id === venda.batteryId);
 
            if (bateria) {
 
                const novoEstoque =
                    Number(bateria.stock || 0) + 1;
 
                await update(
                    ref(database, `baterias/${venda.batteryId}`),
                    { stock: novoEstoque }
                );
 
                bateria.stock = novoEstoque;
            }
        }
 
        vendas = vendas.filter(v => v.id !== venda.id);
 
        renderizarTelaHistorico();
 
    } catch (error) {
 
        console.error("Erro ao excluir venda:", error);
 
        alert("Não foi possível excluir a venda.");
    }
}
 
// ============================================================
// DETALHES DA VENDA
// ============================================================

function mostrarDetalhesVenda(venda) {

    const nome =
        [venda.brand, venda.model]
            .filter(Boolean)
            .join(" ")
        || venda.code
        || "Bateria";

    screenContent.insertAdjacentHTML(
        "beforeend",
        `

        <div class="modal-overlay" id="detalhes-venda-modal">

            <div class="battery-modal">

                <div class="modal-header">

                    <div>
                        <h2>${escapeHtml(nome)}</h2>
                        <p>Detalhes da venda</p>
                    </div>

                    <button class="modal-close" id="fechar-detalhes-venda">
                        ×
                    </button>

                </div>

                <div class="details-grid">

                    <div class="detail-item">
                        <span>Data</span>
                        <strong>${formatarDataVenda(venda.date)}</strong>
                    </div>

                    <div class="detail-item">
                        <span>Marca</span>
                        <strong>${escapeHtml(venda.brand) || "Não informado"}</strong>
                    </div>

                    <div class="detail-item">
                        <span>Modelo</span>
                        <strong>${escapeHtml(venda.model) || "Não informado"}</strong>
                    </div>

                    <div class="detail-item">
                        <span>Amperagem</span>
                        <strong>${
                            venda.amperage
                                ? formatAmperage(venda.amperage)
                                : "Não informado"
                        }</strong>
                    </div>

                    <div class="detail-item">
                        <span>Código</span>
                        <strong>${escapeHtml(venda.code) || "Não informado"}</strong>
                    </div>

                    <div class="detail-item">
                        <span>Garantia</span>
                        <strong>${escapeHtml(venda.warranty) || "Não informado"}</strong>
                    </div>

                    <div class="detail-item">
                        <span>Cliente</span>
                        <strong>${escapeHtml(venda.customer) || "Não informado"}</strong>
                    </div>

                    <div class="detail-item">
                        <span>Veículo</span>
                        <strong>${escapeHtml(venda.vehicle) || "Não informado"}</strong>
                    </div>

                    <div class="detail-item">
                        <span>Pagamento</span>
                        <strong>${escapeHtml(venda.paymentMethod) || "Não informado"}</strong>
                    </div>

                    ${
                        venda.installments
                            ? `
                                <div class="detail-item">
                                    <span>Parcelas</span>
                                    <strong>${venda.installments}x</strong>
                                </div>
                            `
                            : ""
                    }

                    ${
                        venda.interest > 0
                            ? `
                                <div class="detail-item">
                                    <span>Juros</span>
                                    <strong>${venda.interest}%</strong>
                                </div>
                            `
                            : ""
                    }

                    <div class="detail-item">
                        <span>Preço</span>
                        <strong>${
                            venda.price != null
                                ? formatMoney(venda.price)
                                : "Não informado"
                        }</strong>
                    </div>

                    <div class="detail-item">
                        <span>Desconto</span>
                        <strong>${formatMoney(venda.discount || 0)}</strong>
                    </div>

                    <div class="detail-item detail-full">
                        <span>TOTAL</span>
                        <strong style="color: #16803C; font-size: 18px;">
                            ${formatMoney(venda.total)}
                        </strong>
                    </div>

                </div>

                <div class="modal-actions">
                    <button class="secondary-button" id="fechar-detalhes-venda-botao">
                        Fechar
                    </button>
                </div>

            </div>

        </div>

        `
    );

    const modal =
        document.getElementById("detalhes-venda-modal");

    const fechar = () => modal.remove();

    document
        .getElementById("fechar-detalhes-venda")
        .addEventListener("click", fechar);

    document
        .getElementById("fechar-detalhes-venda-botao")
        .addEventListener("click", fechar);
}


// ============================================================
// EDITAR VENDA
// ============================================================

function mostrarFormularioEditarVenda(venda) {

    screenContent.insertAdjacentHTML(
        "beforeend",
        `

        <div class="modal-overlay" id="editar-venda-modal">

            <div class="battery-modal">

                <div class="modal-header">

                    <div>
                        <h2>Editar venda</h2>
                        <p>Altere os dados da venda.</p>
                    </div>

                    <button class="modal-close" id="fechar-editar-venda">
                        ×
                    </button>

                </div>

                <form id="form-editar-venda">

                    <div class="form-grid">

                        <div class="form-group">
                            <label>Cliente</label>
                            <input
                                id="editar-venda-cliente"
                                type="text"
                                value="${escapeHtml(venda.customer) || ""}"
                            >
                        </div>

                        <div class="form-group">
                            <label>Veículo</label>
                            <input
                                id="editar-venda-veiculo"
                                type="text"
                                value="${escapeHtml(venda.vehicle) || ""}"
                            >
                        </div>

                        <div class="form-group">

                            <label>Forma de pagamento</label>

                            <select id="editar-venda-pagamento">
                                <option value="Dinheiro" ${venda.paymentMethod === "Dinheiro" ? "selected" : ""}>
                                    Dinheiro
                                </option>
                                <option value="Pix" ${venda.paymentMethod === "Pix" ? "selected" : ""}>
                                    Pix
                                </option>
                                <option value="Débito" ${venda.paymentMethod === "Débito" ? "selected" : ""}>
                                    Cartão de débito
                                </option>
                                <option value="Crédito" ${venda.paymentMethod === "Crédito" ? "selected" : ""}>
                                    Cartão de crédito
                                </option>
                            </select>

                        </div>

                        <div class="form-group">
                            <label>Desconto (R$)</label>
                            <input
                                id="editar-venda-desconto"
                                type="text"
                                inputmode="decimal"
                                value="${String(venda.discount || 0).replace(".", ",")}"
                            >
                        </div>

                    </div>

                    <div class="modal-actions">

                        <button type="button" class="secondary-button" id="cancelar-editar-venda">
                            Cancelar
                        </button>

                        <button type="submit" class="primary-button">
                            Salvar alterações
                        </button>

                    </div>

                </form>

            </div>

        </div>

        `
    );

    const modal =
        document.getElementById("editar-venda-modal");

    const fechar = () => modal.remove();

    document
        .getElementById("fechar-editar-venda")
        .addEventListener("click", fechar);

    document
        .getElementById("cancelar-editar-venda")
        .addEventListener("click", fechar);

    document
        .getElementById("form-editar-venda")
        .addEventListener("submit", async evento => {

            evento.preventDefault();

            const cliente =
                document.getElementById("editar-venda-cliente").value.trim();

            const veiculo =
                document.getElementById("editar-venda-veiculo").value.trim();

            const pagamento =
                document.getElementById("editar-venda-pagamento").value;

            const desconto =
                Number(
                    document.getElementById("editar-venda-desconto").value
                        .replace(/\./g, "")
                        .replace(",", ".")
                ) || 0;

            const preco = Number(venda.price || 0);

            const total = Math.max(preco - desconto, 0);

            const dados = {
                customer: cliente || null,
                vehicle: veiculo || null,
                paymentMethod: pagamento,
                discount: desconto,
                total: total
            };

            try {

                await update(ref(database, `vendas/${venda.id}`), dados);

                const index = vendas.findIndex(v => v.id === venda.id);

                if (index !== -1) {
                    vendas[index] = { ...vendas[index], ...dados };
                }

                modal.remove();

                renderizarTelaHistorico();

            } catch (error) {

                console.error("Erro ao atualizar venda:", error);

                alert("Não foi possível atualizar a venda.");
            }
        });
}



// ============================================================
// ============================================================
// TELA DE RELATÓRIOS
// ============================================================
// ============================================================
 
let relatorioDataInicio = "";
let relatorioDataFim = "";
 
 
function abrirTelaRelatorios() {
 
    renderizarTelaRelatorios();
}
 
 
// ============================================================
// FORMATAR DATA (SOMENTE DIA)
// ============================================================
 
function formatarDataSomente(dataIso) {
 
    const data = new Date(dataIso);
 
    if (Number.isNaN(data.getTime())) {
        return "Data inválida";
    }
 
    return data.toLocaleDateString("pt-BR");
}
 
 
// ============================================================
// FILTRAR VENDAS DO PERÍODO
// ============================================================
 
function filtrarVendasRelatorio() {
 
    return vendas.filter(venda => {
 
        const dataVenda = new Date(venda.date);
 
        if (relatorioDataInicio) {
 
            const inicio = new Date(relatorioDataInicio + "T00:00:00");
 
            if (dataVenda < inicio) {
                return false;
            }
        }
 
        if (relatorioDataFim) {
 
            const fim = new Date(relatorioDataFim + "T23:59:59");
 
            if (dataVenda > fim) {
                return false;
            }
        }
 
        return true;
    });
}
 
 
// ============================================================
// CONTAGEM POR CAMPO
// ============================================================
 
function contarPorCampoRelatorio(vendasFiltradas, extrator) {
 
    const contagem = {};
 
    vendasFiltradas.forEach(venda => {
 
        const valor = extrator(venda);
 
        if (!valor) {
            return;
        }
 
        contagem[valor] = (contagem[valor] || 0) + 1;
    });
 
    return contagem;
}
 
 
function ordenarContagemRelatorio(contagem) {
 
    return Object.entries(contagem)
        .sort((a, b) => b[1] - a[1]);
}
 
 
// ============================================================
// RENDERIZAR TELA DE RELATÓRIOS
// ============================================================
 
function renderizarTelaRelatorios() {
 
    const vendasFiltradas =
        filtrarVendasRelatorio();
 
 
    const totalFaturamento =
        vendasFiltradas.reduce(
            (total, venda) => total + Number(venda.total || 0),
            0
        );
 
    const totalVendas =
        vendasFiltradas.length;
 
    const ticketMedio =
        totalVendas > 0 ? totalFaturamento / totalVendas : 0;
 
    const totalDesconto =
        vendasFiltradas.reduce(
            (total, venda) => total + Number(venda.discount || 0),
            0
        );
 
    const totalJuros =
        vendasFiltradas.reduce(
            (total, venda) => total + Number(venda.interest || 0),
            0
        );
 
 
    const marcas =
        ordenarContagemRelatorio(
            contarPorCampoRelatorio(vendasFiltradas, v => v.brand)
        );
 
    const amperagens =
        ordenarContagemRelatorio(
            contarPorCampoRelatorio(vendasFiltradas, v => formatAmperage(v.amperage))
        );
 
    const modelos =
        ordenarContagemRelatorio(
            contarPorCampoRelatorio(vendasFiltradas, v => v.model)
        );
 
    const pagamentos =
        ordenarContagemRelatorio(
            contarPorCampoRelatorio(vendasFiltradas, v => v.paymentMethod)
        );
 
    const veiculos_venda =
        ordenarContagemRelatorio(
            contarPorCampoRelatorio(vendasFiltradas, v => v.vehicle)
        );
 
 
    const vendasPorDia = {};
 
    vendasFiltradas.forEach(venda => {
 
        const dia = formatarDataSomente(venda.date);
 
        vendasPorDia[dia] =
            (vendasPorDia[dia] || 0) + Number(venda.total || 0);
    });
 
    const diasOrdenados =
        Object.entries(vendasPorDia).slice(-10);
 
    const maiorValorDia =
        diasOrdenados.length > 0
            ? Math.max(...diasOrdenados.map(item => item[1]))
            : 0;
 
 
    screenContent.innerHTML = `
 
        <div class="reports-screen">
 
            <div class="history-date-filter">
 
                <input
                    id="relatorio-data-inicio"
                    type="date"
                    value="${relatorioDataInicio}"
                >
 
                <span>até</span>
 
                <input
                    id="relatorio-data-fim"
                    type="date"
                    value="${relatorioDataFim}"
                >
 
                <button id="relatorio-hoje" type="button" class="secondary-button">
                    Hoje
                </button>
 
                <button id="relatorio-7dias" type="button" class="secondary-button">
                    7 dias
                </button>
 
                <button id="relatorio-mes" type="button" class="secondary-button">
                    Este mês
                </button>
 
                <button id="relatorio-ano" type="button" class="secondary-button">
                    Este ano
                </button>
 
                <button id="relatorio-limpar" type="button" class="secondary-button">
                    Limpar período
                </button>
 
            </div>
 
 
            <div class="stock-summary-grid" style="grid-template-columns: repeat(5, 1fr);">
 
                <div class="stock-summary-card">
                    <div class="stock-summary-icon">R$</div>
                    <div>
                        <span>Faturamento</span>
                        <strong>${formatMoney(totalFaturamento)}</strong>
                    </div>
                </div>
 
                <div class="stock-summary-card">
                    <div class="stock-summary-icon">▤</div>
                    <div>
                        <span>Vendas</span>
                        <strong>${totalVendas}</strong>
                    </div>
                </div>
 
                <div class="stock-summary-card">
                    <div class="stock-summary-icon">⌀</div>
                    <div>
                        <span>Ticket médio</span>
                        <strong>${formatMoney(ticketMedio)}</strong>
                    </div>
                </div>
 
                <div class="stock-summary-card">
                    <div class="stock-summary-icon">%</div>
                    <div>
                        <span>Descontos</span>
                        <strong>${formatMoney(totalDesconto)}</strong>
                    </div>
                </div>
 
                <div class="stock-summary-card">
                    <div class="stock-summary-icon">+</div>
                    <div>
                        <span>Juros</span>
                        <strong>${formatMoney(totalJuros)}</strong>
                    </div>
                </div>
 
            </div>
 
 
            <div class="section-card">
 
                <div class="section-header">
                    <div>
                        <h2>Vendas por dia</h2>
                        <p>Faturamento diário no período selecionado</p>
                    </div>
                </div>
 
                ${
                    diasOrdenados.length === 0
                        ? `<p class="empty-message">Nenhuma venda no período selecionado.</p>`
                        : diasOrdenados
                            .map(([dia, valor]) => criarLinhaProgresso(
                                dia,
                                valor,
                                maiorValorDia,
                                formatMoney(valor)
                            ))
                            .join("")
                }
 
            </div>
 
 
            <div class="reports-columns">
 
                <div class="section-card">
 
                    <div class="section-header">
                        <div>
                            <h2>Marcas mais vendidas</h2>
                        </div>
                    </div>
 
                    ${criarRankingRelatorio(marcas)}
 
                </div>
 
                <div class="section-card">
 
                    <div class="section-header">
                        <div>
                            <h2>Amperagens mais vendidas</h2>
                        </div>
                    </div>
 
                    ${criarRankingRelatorio(amperagens)}
 
                </div>
 
                <div class="section-card">
 
                    <div class="section-header">
                        <div>
                            <h2>Modelos mais vendidos</h2>
                        </div>
                    </div>
 
                    ${criarRankingRelatorio(modelos)}
 
                </div>
 
            </div>
 
 
            <div class="section-card">
 
                <div class="section-header">
                    <div>
                        <h2>Formas de pagamento</h2>
                    </div>
                </div>
 
                ${
                    pagamentos.length === 0
                        ? `<p class="empty-message">Nenhuma venda disponível.</p>`
                        : pagamentos
                            .map(([metodo, quantidade]) => {
 
                                const percentual =
                                    totalVendas > 0
                                        ? (quantidade / totalVendas) * 100
                                        : 0;
 
                                return criarLinhaProgresso(
                                    metodo,
                                    quantidade,
                                    Math.max(...pagamentos.map(p => p[1])),
                                    `${quantidade} venda(s) · ${percentual.toFixed(0)}%`
                                );
                            })
                            .join("")
                }
 
            </div>
 
 
            <div class="section-card">
 
                <div class="section-header">
                    <div>
                        <h2>Veículos informados nas vendas</h2>
                    </div>
                </div>
 
                ${
                    veiculos_venda.length === 0
                        ? `<p class="empty-message">Nenhum veículo foi informado nas vendas.</p>`
                        : veiculos_venda
                            .slice(0, 8)
                            .map(([veiculo, quantidade]) => `
                                <div class="stock-row">
                                    <div>
                                        <strong>${escapeHtml(veiculo)}</strong>
                                    </div>
                                    <span>${quantidade} venda(s)</span>
                                </div>
                            `)
                            .join("")
                }
 
            </div>
 
 
            <div class="section-card">
 
                <div class="section-header">
                    <div>
                        <h2>Insights do período</h2>
                    </div>
                </div>
 
                ${criarInsightsRelatorio(
                    totalVendas,
                    marcas,
                    amperagens,
                    pagamentos,
                    totalDesconto,
                    totalJuros
                )}
 
            </div>
 
        </div>
 
    `;
 
 
    document
        .getElementById("relatorio-data-inicio")
        .addEventListener("change", evento => {
 
            relatorioDataInicio = evento.target.value;
 
            renderizarTelaRelatorios();
        });
 
 
    document
        .getElementById("relatorio-data-fim")
        .addEventListener("change", evento => {
 
            relatorioDataFim = evento.target.value;
 
            renderizarTelaRelatorios();
        });
 
 
    document
        .getElementById("relatorio-hoje")
        .addEventListener("click", () => {
 
            const hoje = formatarDataInput(new Date());
 
            relatorioDataInicio = hoje;
            relatorioDataFim = hoje;
 
            renderizarTelaRelatorios();
        });
 
 
    document
        .getElementById("relatorio-7dias")
        .addEventListener("click", () => {
 
            const hoje = new Date();
            const seteDiasAtras = new Date();
 
            seteDiasAtras.setDate(hoje.getDate() - 6);
 
            relatorioDataInicio = formatarDataInput(seteDiasAtras);
            relatorioDataFim = formatarDataInput(hoje);
 
            renderizarTelaRelatorios();
        });
 
 
    document
        .getElementById("relatorio-mes")
        .addEventListener("click", () => {
 
            const hoje = new Date();
            const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
 
            relatorioDataInicio = formatarDataInput(inicioMes);
            relatorioDataFim = formatarDataInput(hoje);
 
            renderizarTelaRelatorios();
        });
 
 
    document
        .getElementById("relatorio-ano")
        .addEventListener("click", () => {
 
            const hoje = new Date();
            const inicioAno = new Date(hoje.getFullYear(), 0, 1);
 
            relatorioDataInicio = formatarDataInput(inicioAno);
            relatorioDataFim = formatarDataInput(hoje);
 
            renderizarTelaRelatorios();
        });
 
 
    document
        .getElementById("relatorio-limpar")
        .addEventListener("click", () => {
 
            relatorioDataInicio = "";
            relatorioDataFim = "";
 
            renderizarTelaRelatorios();
        });
}
 
 
// ============================================================
// LINHA DE PROGRESSO (BARRA)
// ============================================================
 
function criarLinhaProgresso(label, valor, maiorValor, textoDireita) {
 
    const percentual =
        maiorValor > 0 ? (valor / maiorValor) * 100 : 0;
 
    return `
        <div class="report-progress-row">
 
            <div class="report-progress-labels">
                <strong>${escapeHtml(label)}</strong>
                <span>${escapeHtml(textoDireita)}</span>
            </div>
 
            <div class="report-progress-bar">
                <div class="report-progress-fill" style="width: ${percentual}%;"></div>
            </div>
 
        </div>
    `;
}
 
 
// ============================================================
// RANKING (TOP 5)
// ============================================================
 
function criarRankingRelatorio(entradas) {
 
    if (entradas.length === 0) {
 
        return `<p class="empty-message">Nenhum dado disponível.</p>`;
    }
 
    return entradas
        .slice(0, 5)
        .map(([nome, quantidade], indice) => `
            <div class="report-ranking-row">
 
                <div class="report-ranking-position">
                    ${indice + 1}
                </div>
 
                <span class="report-ranking-name">${escapeHtml(nome)}</span>
 
                <span class="report-ranking-count">
                    ${quantidade} venda${quantidade === 1 ? "" : "s"}
                </span>
 
            </div>
        `)
        .join("");
}
 
 
// ============================================================
// INSIGHTS
// ============================================================
 
function criarInsightsRelatorio(
    totalVendas,
    marcas,
    amperagens,
    pagamentos,
    totalDesconto,
    totalJuros
) {
 
    const insights = [];
 
    if (totalVendas === 0) {
 
        insights.push(
            "Ainda não existem vendas suficientes para gerar insights."
        );
 
    } else {
 
        insights.push(
            `Foram realizadas ${totalVendas} venda${totalVendas === 1 ? "" : "s"} no período.`
        );
 
        if (marcas.length > 0) {
 
            insights.push(
                `A marca mais vendida foi ${marcas[0][0]}, com ${marcas[0][1]} venda${marcas[0][1] === 1 ? "" : "s"}.`
            );
        }
 
        if (amperagens.length > 0) {
 
            insights.push(
                `A amperagem mais procurada foi ${amperagens[0][0]}.`
            );
        }
 
        if (pagamentos.length > 0) {
 
            insights.push(
                `A forma de pagamento mais utilizada foi ${pagamentos[0][0]}.`
            );
        }
 
        if (totalDesconto > 0) {
 
            insights.push(
                `Foram concedidos ${formatMoney(totalDesconto)} em descontos.`
            );
        }
 
        if (totalJuros > 0) {
 
            insights.push(
                `As vendas registraram ${formatMoney(totalJuros)} em juros.`
            );
        }
    }
 
    return insights
        .map(texto => `
            <div class="report-insight-row">
                <span>✓</span>
                <p>${escapeHtml(texto)}</p>
            </div>
        `)
        .join("");
}

 
// ============================================================
// ============================================================
// TELA FINANCEIRO
// ============================================================
// ============================================================
 
let financeiroPeriodo = "Este mês";
let financeiroSecao = "Resumo";
let financeiroBusca = "";
 
 
function abrirTelaFinanceiro() {
 
    renderizarTelaFinanceiro();
}
 
 
// ============================================================
// LIMITES DO PERÍODO
// ============================================================
 
function obterLimitesFinanceiro() {
 
    const agora = new Date();
 
    if (financeiroPeriodo === "Hoje") {
 
        const inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
        const fim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59);
 
        return { inicio, fim };
    }
 
    if (financeiroPeriodo === "Últimos 7 dias") {
 
        const inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
        inicio.setDate(inicio.getDate() - 6);
 
        const fim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59);
 
        return { inicio, fim };
    }
 
    if (financeiroPeriodo === "Este mês") {
 
        const inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
        const fim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59);
 
        return { inicio, fim };
    }
 
    if (financeiroPeriodo === "Mês anterior") {
 
        const inicio = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
        const fim = new Date(agora.getFullYear(), agora.getMonth(), 0, 23, 59, 59);
 
        return { inicio, fim };
    }
 
    // "Todos"
    return { inicio: null, fim: null };
}
 
 
function estaNoPeriodoFinanceiro(dataIso, limites) {
 
    const data = new Date(dataIso);
 
    if (limites.inicio && data < limites.inicio) {
        return false;
    }
 
    if (limites.fim && data > limites.fim) {
        return false;
    }
 
    return true;
}
 
 
// ============================================================
// RENDERIZAR TELA FINANCEIRO
// ============================================================
 
function renderizarTelaFinanceiro() {
 
    const limites =
        obterLimitesFinanceiro();
 
    const vendasPeriodo =
        vendas.filter(v => estaNoPeriodoFinanceiro(v.date, limites));
 
    const despesasPeriodo =
        despesas.filter(d => estaNoPeriodoFinanceiro(d.date, limites));
 
    const comprasPeriodo =
        compras.filter(c => estaNoPeriodoFinanceiro(c.date, limites));
 
 
    const entradas =
        vendasPeriodo.reduce((total, v) => total + Number(v.total || 0), 0);
 
    const saidasDespesas =
        despesasPeriodo.reduce((total, d) => total + Number(d.value || 0), 0);
 
    const saidasCompras =
        comprasPeriodo.reduce((total, c) => total + Number(c.value || 0), 0);
 
    const saidas =
        saidasDespesas + saidasCompras;
 
    const saldo =
        entradas - saidas;
 
    const margem =
        entradas > 0 ? (saldo / entradas) * 100 : 0;
 
 
    const periodos =
        ["Hoje", "Últimos 7 dias", "Este mês", "Mês anterior", "Todos"];
 
    const secoes =
        ["Resumo", "Despesas", "Compras"];
 
 
    screenContent.innerHTML = `
 
        <div class="financial-screen">
 
            <div class="financial-actions-row">
 
                <div class="financial-period-chips">
 
                    ${periodos
                        .map(periodo => `
                            <button
                                type="button"
                                class="chip ${periodo === financeiroPeriodo ? "chip-active" : ""}"
                                data-financeiro-periodo="${escapeHtml(periodo)}"
                            >
                                ${escapeHtml(periodo)}
                            </button>
                        `)
                        .join("")}
 
                </div>
 
                <div class="financial-buttons">
 
                    <button id="financeiro-nova-despesa" class="primary-button" type="button">
                        − Nova despesa
                    </button>
 
                    <button id="financeiro-nova-compra" class="secondary-button" type="button">
                        🛒 Nova compra
                    </button>
 
                </div>
 
            </div>
 
 
            <div class="financial-section-chips">
 
                ${secoes
                    .map(secao => `
                        <button
                            type="button"
                            class="chip ${secao === financeiroSecao ? "chip-active" : ""}"
                            data-financeiro-secao="${escapeHtml(secao)}"
                        >
                            ${escapeHtml(secao)}
                        </button>
                    `)
                    .join("")}
 
            </div>
 
 
            <div id="financeiro-conteudo"></div>
 
        </div>
 
    `;
 
 
    document
        .querySelectorAll("[data-financeiro-periodo]")
        .forEach(botao => {
 
            botao.addEventListener("click", () => {
 
                financeiroPeriodo = botao.dataset.financeiroPeriodo;
 
                renderizarTelaFinanceiro();
            });
        });
 
 
    document
        .querySelectorAll("[data-financeiro-secao]")
        .forEach(botao => {
 
            botao.addEventListener("click", () => {
 
                financeiroSecao = botao.dataset.financeiroSecao;
                financeiroBusca = "";
 
                renderizarTelaFinanceiro();
            });
        });
 
 
    document
        .getElementById("financeiro-nova-despesa")
        .addEventListener("click", () => {
 
            mostrarFormularioDespesa();
        });
 
 
    document
        .getElementById("financeiro-nova-compra")
        .addEventListener("click", () => {
 
            mostrarFormularioCompra();
        });
 
 
    if (financeiroSecao === "Resumo") {
 
        renderizarResumoFinanceiro(
            entradas, saidas, saldo, margem,
            vendasPeriodo, despesasPeriodo, comprasPeriodo
        );
 
    } else if (financeiroSecao === "Despesas") {
 
        renderizarListaDespesas(despesasPeriodo);
 
    } else if (financeiroSecao === "Compras") {
 
        renderizarListaCompras(comprasPeriodo);
    }
}
 
 
// ============================================================
// RESUMO
// ============================================================
 
function renderizarResumoFinanceiro(
    entradas, saidas, saldo, margem,
    vendasPeriodo, despesasPeriodo, comprasPeriodo
) {
 
    const container =
        document.getElementById("financeiro-conteudo");
 
    container.innerHTML = `
 
        <div class="stock-summary-grid" style="grid-template-columns: repeat(4, 1fr); margin-top: 18px;">
 
            <div class="stock-summary-card">
                <div class="stock-summary-icon">↑</div>
                <div>
                    <span>Entradas</span>
                    <strong>${formatMoney(entradas)}</strong>
                </div>
            </div>
 
            <div class="stock-summary-card">
                <div class="stock-summary-icon">↓</div>
                <div>
                    <span>Saídas</span>
                    <strong>${formatMoney(saidas)}</strong>
                </div>
            </div>
 
            <div class="stock-summary-card">
                <div class="stock-summary-icon">R$</div>
                <div>
                    <span>Saldo</span>
                    <strong>${formatMoney(saldo)}</strong>
                </div>
            </div>
 
            <div class="stock-summary-card">
                <div class="stock-summary-icon">%</div>
                <div>
                    <span>Margem</span>
                    <strong>${margem.toFixed(1).replace(".", ",")}%</strong>
                </div>
            </div>
 
        </div>
 
 
        <div class="bottom-grid" style="margin-top: 20px;">
 
            <div class="section-card">
 
                <div class="section-header">
                    <div><h2>Últimas vendas</h2></div>
                </div>
 
                ${
                    vendasPeriodo.length === 0
                        ? `<p class="empty-message">Nenhuma venda no período.</p>`
                        : vendasPeriodo
                            .slice(0, 5)
                            .map(venda => `
                                <div class="stock-row">
                                    <div>
                                        <strong>${escapeHtml([venda.brand, venda.model].filter(Boolean).join(" ")) || "Bateria"}</strong>
                                        <small>${formatarDataSomente(venda.date)}</small>
                                    </div>
                                    <span style="color: #16803C; font-weight: 700;">
                                        + ${formatMoney(venda.total)}
                                    </span>
                                </div>
                            `)
                            .join("")
                }
 
            </div>
 
            <div class="section-card">
 
                <div class="section-header">
                    <div><h2>Últimas despesas</h2></div>
                </div>
 
                ${
                    despesasPeriodo.length === 0
                        ? `<p class="empty-message">Nenhuma despesa no período.</p>`
                        : despesasPeriodo
                            .slice(0, 5)
                            .map(despesa => `
                                <div class="stock-row">
                                    <div>
                                        <strong>${escapeHtml(despesa.description)}</strong>
                                        <small>${escapeHtml(despesa.category)} · ${formatarDataSomente(despesa.date)}</small>
                                    </div>
                                    <span style="color: #C0392B; font-weight: 700;">
                                        - ${formatMoney(despesa.value)}
                                    </span>
                                </div>
                            `)
                            .join("")
                }
 
            </div>
 
        </div>
 
 
        <div class="section-card" style="margin-top: 20px;">
 
            <div class="section-header">
                <div><h2>Resumo das compras</h2></div>
            </div>
 
            ${
                comprasPeriodo.length === 0
                    ? `<p class="empty-message">Nenhuma compra registrada no período.</p>`
                    : comprasPeriodo
                        .slice(0, 5)
                        .map(compra => `
                            <div class="stock-row">
                                <div>
                                    <strong>${escapeHtml(compra.supplier)}</strong>
                                    <small>Qtd: ${compra.quantity || 0} · ${escapeHtml(compra.paymentMethod)} · ${formatarDataSomente(compra.date)}</small>
                                </div>
                                <span style="font-weight: 700;">
                                    ${formatMoney(compra.value)}
                                </span>
                            </div>
                        `)
                        .join("")
            }
 
        </div>
 
    `;
}
 
 
// ============================================================
// LISTA DE DESPESAS
// ============================================================
 
function renderizarListaDespesas(despesasPeriodo) {
 
    const buscaNormalizada =
        financeiroBusca.trim().toLowerCase();
 
    const filtradas =
        despesasPeriodo.filter(despesa => {
 
            const texto =
                [despesa.description, despesa.category, despesa.supplier, despesa.notes]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
 
            return buscaNormalizada === "" || texto.includes(buscaNormalizada);
        });
 
    const container =
        document.getElementById("financeiro-conteudo");
 
    container.innerHTML = `
 
        <div class="stock-search-box" style="margin-top: 18px; max-width: 420px;">
            <span>⌕</span>
            <input
                id="financeiro-busca-despesa"
                type="text"
                placeholder="Pesquisar despesa, fornecedor ou categoria..."
                value="${escapeHtml(financeiroBusca)}"
            >
        </div>
 
        <div class="history-list" style="margin-top: 16px;">
 
            ${
                filtradas.length === 0
                    ? `
                        <div class="stock-empty">
                            <div class="stock-empty-icon">▤</div>
                            <h3>Nenhuma despesa encontrada.</h3>
                            <p>Os registros aparecerão aqui.</p>
                        </div>
                    `
                    : filtradas
                        .map(despesa => `
                            <div class="history-row" style="grid-template-columns: minmax(160px, 1fr) minmax(200px, 1fr) 110px;">
                                <div class="history-row-main">
                                    <strong>${escapeHtml(despesa.description)}</strong>
                                    <small>${formatarDataSomente(despesa.date)}</small>
                                </div>
                                <div class="history-row-info">
                                    <span>${escapeHtml(despesa.category)}</span>
                                    ${despesa.supplier ? `<span>${escapeHtml(despesa.supplier)}</span>` : ""}
                                </div>
                                <div class="history-row-total" style="color: #C0392B;">
                                    - ${formatMoney(despesa.value)}
                                </div>
                            </div>
                        `)
                        .join("")
            }
 
        </div>
 
    `;
 
    document
        .getElementById("financeiro-busca-despesa")
        .addEventListener("input", evento => {
 
            financeiroBusca = evento.target.value;
 
            renderizarListaDespesas(despesasPeriodo);
        });
}
 
 
// ============================================================
// LISTA DE COMPRAS
// ============================================================
 
function renderizarListaCompras(comprasPeriodo) {
 
    const buscaNormalizada =
        financeiroBusca.trim().toLowerCase();
 
    const filtradas =
        comprasPeriodo.filter(compra => {
 
            const texto =
                [compra.supplier, compra.paymentMethod, compra.notes]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
 
            return buscaNormalizada === "" || texto.includes(buscaNormalizada);
        });
 
    const container =
        document.getElementById("financeiro-conteudo");
 
    container.innerHTML = `
 
        <div class="stock-search-box" style="margin-top: 18px; max-width: 420px;">
            <span>⌕</span>
            <input
                id="financeiro-busca-compra"
                type="text"
                placeholder="Pesquisar fornecedor ou forma de pagamento..."
                value="${escapeHtml(financeiroBusca)}"
            >
        </div>
 
        <div class="history-list" style="margin-top: 16px;">
 
            ${
                filtradas.length === 0
                    ? `
                        <div class="stock-empty">
                            <div class="stock-empty-icon">🛒</div>
                            <h3>Nenhuma compra encontrada.</h3>
                            <p>Os registros aparecerão aqui.</p>
                        </div>
                    `
                    : filtradas
                        .map(compra => `
                            <div class="history-row" style="grid-template-columns: minmax(160px, 1fr) minmax(200px, 1fr) 110px;">
                                <div class="history-row-main">
                                    <strong>${escapeHtml(compra.supplier)}</strong>
                                    <small>${formatarDataSomente(compra.date)}</small>
                                </div>
                                <div class="history-row-info">
                                    <span>Quantidade: ${compra.quantity || 0}</span>
                                    <span>${escapeHtml(compra.paymentMethod)}</span>
                                </div>
                                <div class="history-row-total">
                                    ${formatMoney(compra.value)}
                                </div>
                            </div>
                        `)
                        .join("")
            }
 
        </div>
 
    `;
 
    document
        .getElementById("financeiro-busca-compra")
        .addEventListener("input", evento => {
 
            financeiroBusca = evento.target.value;
 
            renderizarListaCompras(comprasPeriodo);
        });
}
 
 
// ============================================================
// FORMULÁRIO DE DESPESA
// ============================================================
 
function mostrarFormularioDespesa() {
 
    screenContent.insertAdjacentHTML(
        "beforeend",
        `
 
        <div class="modal-overlay" id="despesa-modal">
 
            <div class="battery-modal">
 
                <div class="modal-header">
                    <div>
                        <h2>Nova despesa</h2>
                        <p>Registre uma saída financeira.</p>
                    </div>
                    <button class="modal-close" id="fechar-modal-despesa">×</button>
                </div>
 
                <form id="form-despesa">
 
                    <div class="form-grid">
 
                        <div class="form-group form-group-full">
                            <label>Descrição</label>
                            <input id="despesa-descricao" type="text" placeholder="Ex.: Conta de energia">
                        </div>
 
                        <div class="form-group">
                            <label>Valor</label>
                            <input id="despesa-valor" type="text" inputmode="decimal" placeholder="Ex.: 250,00">
                        </div>
 
                        <div class="form-group">
 
                            <label>Categoria</label>
 
                            <select id="despesa-categoria">
                                <option value="Despesa">Despesa</option>
                                <option value="Aluguel">Aluguel</option>
                                <option value="Energia">Energia</option>
                                <option value="Internet">Internet</option>
                                <option value="Frete">Frete</option>
                                <option value="Funcionários">Funcionários</option>
                                <option value="Impostos">Impostos</option>
                                <option value="Manutenção">Manutenção</option>
                                <option value="Outros">Outros</option>
                            </select>
 
                        </div>
 
                        <div class="form-group form-group-full">
                            <label>Fornecedor / empresa</label>
                            <input id="despesa-fornecedor" type="text" placeholder="Opcional">
                        </div>
 
                        <div class="form-group form-group-full">
                            <label>Observação</label>
                            <textarea id="despesa-observacoes" placeholder="Opcional"></textarea>
                        </div>
 
                    </div>
 
                    <div class="modal-actions">
                        <button type="button" class="secondary-button" id="cancelar-despesa">Cancelar</button>
                        <button type="submit" class="primary-button">Registrar</button>
                    </div>
 
                </form>
 
            </div>
 
        </div>
 
        `
    );
 
    const modal =
        document.getElementById("despesa-modal");
 
    const fechar = () => modal.remove();
 
    document.getElementById("fechar-modal-despesa").addEventListener("click", fechar);
    document.getElementById("cancelar-despesa").addEventListener("click", fechar);
 
    document
        .getElementById("form-despesa")
        .addEventListener("submit", async evento => {
 
            evento.preventDefault();
 
            const descricao =
                document.getElementById("despesa-descricao").value.trim();
 
            const valor =
                Number(
                    document.getElementById("despesa-valor").value
                        .replace(/\./g, "")
                        .replace(",", ".")
                );
 
            if (!descricao || !valor || valor <= 0) {
 
                alert("Informe uma descrição e um valor válido.");
 
                return;
            }
 
            const despesa = {
                description: descricao,
                value: valor,
                category: document.getElementById("despesa-categoria").value,
                supplier: document.getElementById("despesa-fornecedor").value.trim() || null,
                date: new Date().toISOString(),
                notes: document.getElementById("despesa-observacoes").value.trim() || null
            };
 
            try {
 
                const id = Date.now().toString();
 
                await set(ref(database, `despesas/${id}`), despesa);
 
                despesas.unshift({ id, ...despesa });
 
                modal.remove();
 
                renderizarTelaFinanceiro();
 
            } catch (error) {
 
                console.error("Erro ao registrar despesa:", error);
 
                alert("Não foi possível registrar a despesa.");
            }
        });
}
 
 
// ============================================================
// FORMULÁRIO DE COMPRA
// ============================================================
 
function mostrarFormularioCompra() {
 
    screenContent.insertAdjacentHTML(
        "beforeend",
        `
 
        <div class="modal-overlay" id="compra-modal">
 
            <div class="battery-modal">
 
                <div class="modal-header">
                    <div>
                        <h2>Nova compra</h2>
                        <p>Registre uma compra com fornecedor.</p>
                    </div>
                    <button class="modal-close" id="fechar-modal-compra">×</button>
                </div>
 
                <form id="form-compra">
 
                    <div class="form-grid">
 
                        <div class="form-group form-group-full">
                            <label>Fornecedor</label>
                            <input id="compra-fornecedor" type="text" placeholder="Ex.: Moura">
                        </div>
 
                        <div class="form-group">
                            <label>Quantidade</label>
                            <input id="compra-quantidade" type="text" inputmode="numeric" placeholder="Ex.: 10">
                        </div>
 
                        <div class="form-group">
                            <label>Valor total</label>
                            <input id="compra-valor" type="text" inputmode="decimal" placeholder="Ex.: 3200,00">
                        </div>
 
                        <div class="form-group form-group-full">
 
                            <label>Forma de pagamento</label>
 
                            <select id="compra-pagamento">
                                <option value="Pix">Pix</option>
                                <option value="Dinheiro">Dinheiro</option>
                                <option value="Cartão de débito">Cartão de débito</option>
                                <option value="Cartão de crédito">Cartão de crédito</option>
                                <option value="Boleto">Boleto</option>
                                <option value="Transferência">Transferência</option>
                            </select>
 
                        </div>
 
                        <div class="form-group form-group-full">
                            <label>Observação</label>
                            <textarea id="compra-observacoes" placeholder="Opcional"></textarea>
                        </div>
 
                    </div>
 
                    <div class="modal-actions">
                        <button type="button" class="secondary-button" id="cancelar-compra">Cancelar</button>
                        <button type="submit" class="primary-button">Registrar</button>
                    </div>
 
                </form>
 
            </div>
 
        </div>
 
        `
    );
 
    const modal =
        document.getElementById("compra-modal");
 
    const fechar = () => modal.remove();
 
    document.getElementById("fechar-modal-compra").addEventListener("click", fechar);
    document.getElementById("cancelar-compra").addEventListener("click", fechar);
 
    document
        .getElementById("form-compra")
        .addEventListener("submit", async evento => {
 
            evento.preventDefault();
 
            const fornecedor =
                document.getElementById("compra-fornecedor").value.trim();
 
            const quantidade =
                Number(document.getElementById("compra-quantidade").value.trim());
 
            const valor =
                Number(
                    document.getElementById("compra-valor").value
                        .replace(/\./g, "")
                        .replace(",", ".")
                );
 
            if (!fornecedor || !quantidade || quantidade <= 0 || !valor || valor <= 0) {
 
                alert("Informe fornecedor, quantidade e valor válidos.");
 
                return;
            }
 
            const compra = {
                supplier: fornecedor,
                quantity: quantidade,
                value: valor,
                paymentMethod: document.getElementById("compra-pagamento").value,
                date: new Date().toISOString(),
                notes: document.getElementById("compra-observacoes").value.trim() || null
            };
 
            try {
 
                const id = Date.now().toString();
 
                await set(ref(database, `compras/${id}`), compra);
 
                compras.unshift({ id, ...compra });
 
                modal.remove();
 
                renderizarTelaFinanceiro();
 
            } catch (error) {
 
                console.error("Erro ao registrar compra:", error);
 
                alert("Não foi possível registrar a compra.");
            }
        });
}
 
 
// ============================================================
// INICIALIZAÇÃO
// ============================================================
 
async function iniciar() {
 
    await carregarDados();
}
 
 
iniciar();
