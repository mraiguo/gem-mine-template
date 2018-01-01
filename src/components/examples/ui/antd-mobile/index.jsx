import React, { Component } from 'react';
import { List, DatePicker, Button, InputItem, Toast } from 'antd-mobile';
import { createForm } from 'rc-form';

class Cmp extends Component {
  onSubmit = () => {
    this.props.form.validateFields({ force: true }, error => {
      if (!error) {
        const data = this.props.form.getFieldsValue();
        data.date = parseInt(data.date.getTime() / 1000, 10);
        Toast.success(JSON.stringify(data));
      } else {
        Toast.fail('数据不完整', 3);
      }
    });
  };
  render() {
    const { getFieldProps, getFieldError } = this.props.form;

    return (
      <form>
        <List>
          <InputItem
            {...getFieldProps('nickname', { rules: [{ required: true }] })}
            error={!!getFieldError('nickname')}
            clear
            placeholder="请输入姓名"
          >
            姓名
          </InputItem>
          <InputItem
            {...getFieldProps('mobile', { rules: [{ required: true }] })}
            error={!!getFieldError('mobile')}
            type="phone"
            placeholder="输入手机号"
            clear
          >
            手机号
          </InputItem>

          <DatePicker
            mode="date"
            {...getFieldProps('date', {
              rules: [{ required: true, message: '请选择日期' }]
            })}
          >
            <List.Item arrow="horizontal">生日</List.Item>
          </DatePicker>

          <List.Item>
            <Button type="primary" onClick={this.onSubmit}>
              提交
            </Button>
          </List.Item>
        </List>
      </form>
    );
  }
}
export default createForm()(Cmp);
