import store from "../store.js";

export default {
    name: 'Home',

    setup() {
        const status = {
            andamento: "Em andamento",
            aguardando: "Aguardando",
            finalizado: "Finalizado"
        }

        let modalAgendamento;

        return {store, status, modalAgendamento}
    },
    data() {
        return {
            agendamentoDescricao: '',
            modalTitle: ''
        }
    },
    methods: {
        lerAgendamentos: function () {
            axios.post('api/agendamento/ler_agendamentos.php')
                .then(function (response) {
                    store.isAgendamentosFirstLoad = false;
                    store.agendamentos = response.data;
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        atualizarStatus: function (item) {
            axios.put('api/agendamento/atualizar_status.php', {
                id: item.id,
                status: item.status
            })
                .then(function (response) {
                    if (response.data !== 0) {
                        item.status = response.data;
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        abrirModal: function (item, action) {
            if (item) {
                store.agendamentoAtual = item;
            }
            store.action = action;

            switch (action) {
                case 'create':
                    this.modalTitle = "Adicionar agendamento"
                    break;
                case 'edit':
                    this.modalTitle = "Editar agendamento"
                    break;
            }

            this.modalAgendamento.show();
        },
        criarAgendamento: function () {
            let textoInput= this.agendamentoDescricao;
            let vue = this;

            axios.post('api/agendamento/criar_agendamento.php', {
                texto: textoInput
            })
                .then(function (response) {
                    if (response.data !== 0) {
                        vue.lerAgendamentos();

                        vue.modalAgendamento.hide();
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        atualizarAgendamento: function () {
            let item = store.agendamentoAtual;
            let textoInput= this.agendamentoDescricao;
            let vue = this;

            axios.put('api/agendamento/atualizar_agendamento.php', {
                id: item.id,
                texto: textoInput
            })
                .then(function (response) {
                    if (response.data === 1) {
                        for (let x of store.agendamentos) {
                            if (x.id === item.id) {
                                x.texto = textoInput;
                                break;
                            }
                        }

                        vue.modalAgendamento.hide();
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        apagarAgendamento: function (id) {
            axios.delete('api/agendamento/deletar.php', {
                data: {
                    id: id
                }
            })
                .then(function (response) {
                    if (response.data !== 0) {
                        for (let x of store.agendamentos) {
                            if (x.id === id) {
                                store.agendamentos = store.agendamentos.filter(x => {
                                   return x.id !== id;
                                });
                                break;
                            }
                        }
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        agendamentoHandler: function () {
            switch (store.action) {
                case 'create':
                    this.criarAgendamento();
                    break;
                case 'edit':
                    this.atualizarAgendamento();
                    break;
                default:
                    break;
            }
        }
    },
    created() {
        if (store.isAgendamentosFirstLoad) {
            this.lerAgendamentos();
        }
    },
    mounted() {
        this.modalAgendamento = new bootstrap.Modal(document.getElementById("agendamento-modal"))
    },

    template: `
      <main role="main" class="container extra-bottom">
      <h1 class="mt-5">Agenda</h1>
      <div class="container">
        <!-- Button trigger modal -->
        <div style="text-align: right;">
          <button type="button" class="btn btn-outline-info btn-sm" @click="abrirModal(null, 'create')">Adicionar
            agendamento
          </button>
        </div>
        <div class="modal fade" id="agendamento-modal" tabindex="-1" aria-labelledby="Label" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="Label">{{ modalTitle }}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div class="input-group mb-3">
                  <span class="input-group-text" id="agendamento-form-display">Agendamento</span>
                  <input type="text" class="form-control" placeholder="Descrição"
                         v-model="agendamentoDescricao">
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                <button id="submit-task" type="button" class="btn btn-primary" @click="agendamentoHandler()">Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Tabela agendamentos -->
      <div class="container table-responsive">
        <table class="table">
          <thead>
          <tr>
            <th class="task-id">#</th>
            <th class="task">Cliente</th>
            <th class="task">Funcionário</th>
            <th class="task">Descrição</th>
            <th class="status">Status</th>
            <th class="update">Editar</th>
            <th class="update">Remover</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in store.agendamentos">
            <td>{{ item.id }}</td>
            <td>{{ item.cliente }}</td>
            <td>{{ item.funcionario }}</td>
            <td>{{ item.texto }}</td>
            <td>
              <button type="button" class="btn btn-sm state" @click="atualizarStatus(item)"
                      :class="{'btn-outline-warning': item.status == status.andamento,
                         'btn-outline-secondary': item.status == status.aguardando,
                         'btn-outline-success': item.status == status.finalizado}">
                {{ item.status }}
              </button>
            </td>
            <td>
              <button type="button" class="btn btn-outline-info btn-sm" @click="abrirModal(item, 'edit')">
                <i class="fa fa-pen fa-1"></i>
              </button>
            </td>
            <td>
              <button type="button" class="btn btn-outline-secondary btn-sm remove"
                      @click="apagarAgendamento(item.id)"><i class="fa fa-trash fa-1"></i>
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      </main>
    `,
};