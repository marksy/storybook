import { start } from '@storybook/core/client';
import { ClientStoryApi, Loadable } from '@storybook/addons';

import './globals';
import { renderMain as render, setFetchStoryHtml } from './render';
import { StoryFnServerReturnType, IStorybookSection, ConfigureOptionsArgs } from './types';

const framework = 'server';

interface ClientApi extends ClientStoryApi<StoryFnServerReturnType> {
  setAddon(addon: any): void;
  configure(loader: Loadable, module: NodeModule): void;
  getStorybook(): IStorybookSection[];
  clearDecorators(): void;
  forceReRender(): void;
  raw: () => any; // todo add type
}

const api = start(render);

export const storiesOf: ClientApi['storiesOf'] = (kind, m) => {
  return (api.clientApi.storiesOf(kind, m) as ReturnType<ClientApi['storiesOf']>).addParameters({
    framework,
  });
};

const setRenderFetchAndConfigure: ClientApi['configure'] = (...args) => {
  // if (args.fetchStoryHtml) {
  //   setFetchStoryHtml(args.fetchStoryHtml);
  // }
  api.configure(framework, ...args);
};

export const configure: ClientApi['configure'] = setRenderFetchAndConfigure;
export const {
  addDecorator,
  addParameters,
  clearDecorators,
  setAddon,
  forceReRender,
  getStorybook,
  raw,
} = api.clientApi;
