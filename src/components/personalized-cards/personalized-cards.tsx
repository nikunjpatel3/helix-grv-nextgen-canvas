import { Component, h, Prop, Watch } from '@stencil/core';

@Component({
  tag: 'personalized-cards',
  styleUrl: 'personalized-cards.scss',
  shadow: true
})

export class Cards {
  @Prop({ mutable: true, reflect: true }) public specialty: 'Always Visible' | 'Anatomic/Clinical Pathology' = 'Always Visible';
  @Prop() public title: string = '';
  @Prop() public content: string = '';

  async componentWillLoad() {
  }

  @Watch('specialty')
  filterCards(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      
    }
  }

  render() {
    return (
      <div class="personalized-cards">
          <div class="personalized-cards-wrapper">
            <nextgen-card>
              <h2 slot="title">{this.title}</h2>
              <p slot="body"> {this.content} </p>
            </nextgen-card>
          </div>
      </div>
    );
  }
}
