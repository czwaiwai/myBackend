/**
 * Created by Administrator on 2018/5/3 0003.
 */

_.templateSettings = {
	evaluate    : /<@([\s\S]+?)@>/g,
	interpolate : /<@=([\s\S]+?)@>/g,
	escape      : /<@-([\s\S]+?)@>/g
};