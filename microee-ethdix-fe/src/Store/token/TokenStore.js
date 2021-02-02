import { action } from 'mobx';
import { HttpWrapper } from 'reack-lang';

export class TokenStore {

    // 查询token列表
    @action defaultTokenList(done) {
        HttpWrapper.create()({
            method: 'get',
            url: '/token/default-token-list',
        }).then(function (res) {
            done(res.data);
        });
    }

}

export default new TokenStore();