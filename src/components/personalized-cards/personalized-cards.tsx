import { Component, h, Prop, Watch } from '@stencil/core';

@Component({
  tag: 'personalized-cards',
  styleUrl: 'personalized-cards.scss',
  shadow: true
})

export class Cards {
  @Prop() showReadingTime: boolean = false;  
  @Prop({ mutable: true, reflect: true }) specialty: string = '';
  @Prop() lorem: string = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s.'
  @Prop() cover: string = 'https://www.pfizerpro.se/sites/default/files/herobanner_nya%20startsidan_0_0_0.jpg'

  @Prop() items: Array<any> = [{
    title: 'Card 1', overlay: 'Card 1 overlay', specialty: 'Anatomic/Clinical Pathology', content: this.lorem, image: this.cover
  }, {
    title: 'Card 2', overlay: 'Card 2 overlay', specialty: 'Anatomic/Clinical Pathology', content: this.lorem, image: this.cover
  }, {
    title: 'Card 3', overlay: 'Card 3 overlay', specialty: 'Anatomic/Clinical Pathology', content: this.lorem, image: this.cover
  }, {
    title: 'Card 4', overlay: 'Card 4 overlay', specialty: 'Anatomic/Clinical Pathology', content: this.lorem, image: this.cover
  }, {
    title: 'Card 5', overlay: 'Card 5 overlay', specialty: 'Anatomic/Clinical Pathology', content: this.lorem, image: this.cover
  }, {
    title: 'Card 6', overlay: 'Card 6 overlay', content: this.lorem, image: this.cover
  }, {
    title: 'Card 7', overlay: 'Card 7 overlay', content: this.lorem, image: this.cover
  }, {
    title: 'Card 8', overlay: 'Card 8 overlay', content: this.lorem, image: this.cover
  }, {
    title: 'Card 9', overlay: 'Card 9 overlay', content: this.lorem, image: this.cover
  }, {
    title: 'Card 10', overlay: 'Card 10 overlay', content: this.lorem, image: this.cover
  }]

  @Prop() itemsFiltered: Array<any> = [];

  async componentWillLoad() {
    this.itemsFiltered = this.items;
  }

  @Watch('specialty')
  filterCards(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      if (newValue == '') {
        return this.itemsFiltered = this.items;
      }
      this.itemsFiltered = this.items.filter(item => {
        return item.specialty == newValue;
      });
    }
  }

  render() {
    return (
      <div class="personalized-cards">
        <h2>Welcome to demo for Personalized cards</h2>
        <p>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s.
        </p>
        {this.itemsFiltered.map((item) =>
          <div class="personalized-cards-wrapper">
            <nextgen-card>
              <h2 slot="title">{item.title}</h2>
              <nextgen-image
                slot="media"
                alt={item.title}
                img-retina={item.image}
                img-src={item.image}
                mobile-img-retina={item.image}
                mobile-img-src={item.image}
              ></nextgen-image>
              <p slot="body"> {item.content} </p>
              <nextgen-button target="_blank" href="https://www.google.com" link-title="View More" slot="footer">Explore</nextgen-button>
            </nextgen-card>
          </div>
        )}
      </div>
    );
  }
}
